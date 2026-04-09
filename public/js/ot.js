$(document).ready(function() {
    function getMockDoctors() {
        return [
            { id: 1, firstName: 'Ahmed', lastName: 'Khan', department: 'Surgery', specialization: 'General Surgeon', status: 'ACTIVE' },
            { id: 2, firstName: 'Fatima', lastName: 'Noor', department: 'Surgery', specialization: 'Cardiac Surgeon', status: 'ACTIVE' },
            { id: 3, firstName: 'Hassan', lastName: 'Ali', department: 'Orthopedics', specialization: 'Orthopedic Surgeon', status: 'ACTIVE' },
            { id: 4, firstName: 'Ayesha', lastName: 'Siddiqui', department: 'Gynecology', specialization: 'Gynecologist', status: 'ACTIVE' },
            { id: 5, firstName: 'Usman', lastName: 'Malik', department: 'Neurosurgery', specialization: 'Neurosurgeon', status: 'ACTIVE' },
            { id: 6, firstName: 'Sana', lastName: 'Rehman', department: 'Urology', specialization: 'Urologist', status: 'ACTIVE' },
            { id: 7, firstName: 'Bilal', lastName: 'Mirza', department: 'ENT', specialization: 'ENT Surgeon', status: 'ACTIVE' },
            { id: 8, firstName: 'Zainab', lastName: 'Shah', department: 'Ophthalmology', specialization: 'Ophthalmic Surgeon', status: 'ACTIVE' },
            { id: 9, firstName: 'Tariq', lastName: 'Mehmood', department: 'Anesthesiology', specialization: 'Anesthesiologist', status: 'ACTIVE' },
            { id: 10, firstName: 'Rabia', lastName: 'Iqbal', department: 'Plastic Surgery', specialization: 'Plastic Surgeon', status: 'ACTIVE' }
        ];
    }

    var operations = [];
    var doctors = [];
    var otCharges = [];
    var hospitalInfo = { currency: 'PKR' };
    var opdVisits = [];
    var erVisits = [];
    var ipdAdmissions = [];
    var activeTab = 'scheduling';

    // ── OT Scheduling table state ────────────────────────────────────────────
    var otSchCurrentPage = 1;
    var otSchPerPageVal  = 10;
    var otSchFiltered    = null;

    // ── OT Pre-Op Checklist table state ──────────────────────────────────────
    var otPreCurrentPage = 1;
    var otPrePerPageVal  = 10;
    var otPreFiltered    = null;

    // ── OT Intra-Op table state ───────────────────────────────────────────────
    var otIoCurrentPage = 1;
    var otIoPerPageVal  = 10;
    var otIoFiltered    = null;

    // ── OT Post-Op table state ────────────────────────────────────────────────
    var otPoCurrentPage = 1;
    var otPoPerPageVal  = 10;
    var otPoFiltered    = null;

    var registrationStep = 'source-select';
    var admissionSource = null;
    var selectedPatientMRN = null;
    var resolvedPatient = null;
    var mrnSearching = false;

    var phoneSearch = '';
    var phoneSearchResults = null;
    var phoneSearching = false;

    var patientForm = { name: '', age: '', gender: 'Male', cnic: '', contactType: 'SELF', guardianName: '', guardianCnic: '', relationshipToPatient: '' };
    var surgeryForm = {
        procedure: '', surgeryType: 'Elective', priority: 'Elective',
        surgeon: '', anaesthetist: '', anaesthetistFee: '',
        surgeonFee: '0', theater: 'OT-1', surgeryDate: '', startTime: '',
        estimatedDuration: '2', anesthesiaType: 'General Anesthesia (GA)',
        diagnosis: '', specialInstructions: ''
    };
    var selectedOptionalCharges = [];
    var validationErrors = [];
    var selectedOperation = null;

    var relationshipOptions = ['Father', 'Mother', 'Son', 'Daughter', 'Husband', 'Wife', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Legal Guardian', 'Other'];

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    }

    function esc(str) {
        if (!str) return '';
        return $('<div>').text(str).html();
    }

    function statusBadge(status) {
        if (status === 'Scheduled') return '<span class="badge badge-info">' + esc(status).toUpperCase() + '</span>';
        if (status === 'In Progress') return '<span class="badge badge-warning" style="animation:pulse 2s infinite">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Completed') return '<span class="badge badge-success">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Cancelled') return '<span class="badge badge-danger">' + esc(status).toUpperCase() + '</span>';
        return '<span class="badge badge-outline">' + esc(status || 'N/A').toUpperCase() + '</span>';
    }

    function priorityBadge(priority) {
        if (priority === 'Emergency') return '<span class="badge" style="background:var(--color-destructive);color:#fff;font-size:10px">EMERGENCY</span>';
        if (priority === 'Urgent') return '<span class="badge" style="background:#F97316;color:#fff;font-size:10px">URGENT</span>';
        return '<span class="badge badge-outline" style="color:#16A34A;border-color:#16A34A;font-size:10px">ELECTIVE</span>';
    }

    function paymentBadge(status) {
        if (status === 'Paid') return '<span class="badge badge-outline" style="color:var(--color-success);border-color:rgba(16,185,129,0.3);font-size:10px">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Pending') return '<span class="badge badge-outline" style="color:var(--color-warning);border-color:rgba(245,158,11,0.3);font-size:10px">' + esc(status).toUpperCase() + '</span>';
        return '<span class="badge badge-outline" style="color:var(--color-destructive);border-color:rgba(239,68,68,0.3);font-size:10px">' + esc(status || 'N/A').toUpperCase() + '</span>';
    }

    function safeGet(url) {
        return $.get(url).then(
            function(data) { return data; },
            function() { return null; }
        );
    }

    function loadAllData() {
        $.when(
            safeGet('/api/ot/operations'),
            safeGet('/api/doctors'),
            safeGet('/api/config/hospital-charges/module/OT'),
            safeGet('/api/config/hospital-info'),
            safeGet('/api/opd/visits'),
            safeGet('/api/emergency/visits'),
            safeGet('/api/ipd/admissions')
        ).done(function(r1, r2, r3, r4, r5, r6, r7) {
            operations = r1 || [];
            doctors = (r2 || []).filter(function(d) { return d.status === 'ACTIVE'; });
            if (doctors.length === 0) doctors = getMockDoctors();
            otCharges = r3 || [];
            if (r4) hospitalInfo = $.extend(hospitalInfo, r4);
            opdVisits = r5 || [];
            erVisits = r6 || [];
            ipdAdmissions = r7 || [];
            renderAll();
        });
    }

    function renderAll() {
        renderSchedulingTab();
        renderChecklistTab();
        renderIntraOpTab();
        renderPostOpTab();
        lucide.createIcons();
    }

    $('.module-tab').on('click', function() {
        var tab = $(this).data('tab');
        activeTab = tab;
        $('.module-tab').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').hide();
        $('#tab-' + tab).show();

        if (tab === 'scheduling') {
            $('#otHeaderActions').show();
        } else {
            $('#otHeaderActions').hide();
        }
        if (tab === 'checklist') renderChecklistTab();
        if (tab === 'intraop') renderIntraOpTab();
        if (tab === 'postop') renderPostOpTab();
        lucide.createIcons();
    });

    function renderSchedulingTab() {
        var scheduledCount = operations.filter(function(o) { return o.status === 'Scheduled'; }).length;
        var today = new Date().toDateString();
        var completedToday = operations.filter(function(o) {
            return o.status === 'Completed' && o.surgeryDate && new Date(o.surgeryDate).toDateString() === today;
        }).length;
        var inProgressCount = operations.filter(function(o) { return o.status === 'In Progress'; }).length;

        $('#statTotalSurgeries').text(operations.length);
        $('#statScheduled').text(scheduledCount);
        $('#statCompletedToday').text(completedToday);
        $('#statInProgress').text(inProgressCount);

        otSchPopulateFilterOptions();

        var search = ($('#otSchSearch').val() || '').toLowerCase();
        var source = otSchFiltered !== null ? otSchFiltered : operations;
        var filtered = source.filter(function(op) {
            return !search ||
                (op.patientName && op.patientName.toLowerCase().indexOf(search) > -1) ||
                (op.operationId && op.operationId.toLowerCase().indexOf(search) > -1) ||
                (op.mrn && op.mrn.toLowerCase().indexOf(search) > -1) ||
                (op.procedure && op.procedure.toLowerCase().indexOf(search) > -1);
        });
        _otSchRenderPagination(filtered);
    }

    function otSchPopulateFilterOptions() {
        var surgeonWrap = document.getElementById('otSchCsSurgeon');
        if (surgeonWrap && surgeonWrap.setOptions) {
            var surgeonNames = ['All Surgeons'];
            operations.forEach(function(op) {
                if (op.surgeon && surgeonNames.indexOf(op.surgeon) < 0) surgeonNames.push(op.surgeon);
            });
            surgeonWrap.setOptions(surgeonNames);
        }
    }

    function _otSchRenderPagination(source) {
        /* Sort: most recently booked (createdAt) first */
        var sorted = source.slice().sort(function(a, b) {
            return new Date(b.createdAt || b.surgeryDate || 0) - new Date(a.createdAt || a.surgeryDate || 0);
        });
        var total    = sorted.length;
        var totalPgs = Math.max(1, Math.ceil(total / otSchPerPageVal));
        if (otSchCurrentPage > totalPgs) otSchCurrentPage = totalPgs;
        var start = (otSchCurrentPage - 1) * otSchPerPageVal;
        var page  = sorted.slice(start, start + otSchPerPageVal);

        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="11"><div class="empty-state"><i data-lucide="syringe"></i><p>No surgeries found</p><p class="empty-sub">Book a new surgery to get started</p>' +
                '<button class="btn-primary btn-sm" id="btnBookFromEmpty" style="margin-top:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Book New Surgery</button>' +
                '</div></td></tr>';
        } else {
            page.forEach(function(op) {
                var shortId = op.operationId ? op.operationId.replace(op.mrn + '-', '') : '';

                /* Created Date & Time cell (when the booking record was created) */
                var dtCell = '';
                if (op.createdAt) {
                    var cd = new Date(op.createdAt);
                    var dateStr = cd.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'});
                    var timeStr = cd.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
                    dtCell = '<div style="display:flex;flex-direction:column;line-height:1.4">' +
                        '<span style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(dateStr) + '</span>' +
                        '<span style="font-size:11px;color:var(--color-muted-foreground)">' + esc(timeStr) + '</span>' +
                        '</div>';
                } else {
                    dtCell = '<span style="font-size:11px;color:var(--color-muted-foreground)">—</span>';
                }

                html += '<tr class="ot-row" data-op-id="' + esc(op.operationId) + '" style="cursor:pointer">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(op.mrn) + '</td>' +
                    '<td style="font-size:12px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(shortId) + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:8px"><div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(op.patientName) + '</div><span style="font-weight:500;font-size:14px">' + esc(op.patientName) + '</span></div></td>' +
                    '<td style="font-size:12px;font-weight:500">' + esc(op.procedure) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(op.surgeon) + '</td>' +
                    '<td><span class="badge badge-outline" style="background:rgba(241,245,249,1);font-size:10px">' + esc(op.theater) + '</span></td>' +
                    '<td>' + priorityBadge(op.priority) + '</td>' +
                    '<td>' + statusBadge(op.status) + '</td>' +
                    '<td>' + paymentBadge(op.paymentStatus) + '</td>' +
                    '<td>' + dtCell + '</td>' +
                    '<td class="text-center" onclick="event.stopPropagation()">' +
                        '<div class="dropdown-actions">' +
                            '<button class="btn-ghost btn-icon dropdown-toggle-btn"><i data-lucide="more-horizontal"></i></button>' +
                            '<div class="dropdown-menu-custom">' +
                                '<button class="ot-view-btn" data-op-id="' + esc(op.operationId) + '"><i data-lucide="eye"></i> View Details</button>' +
                                '<button><i data-lucide="printer"></i> Print</button>' +
                            '</div>' +
                        '</div>' +
                    '</td>' +
                    '</tr>';
            });
        }
        $('#otTableBody').html(html);

        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + otSchPerPageVal, total);
        $('#otSchTableInfo').text('Showing ' + from + '–' + to + ' of ' + total + ' surgeries');

        var numsHtml = '';
        var maxBtns = 5;
        var half = Math.floor(maxBtns / 2);
        var pStart = Math.max(1, otSchCurrentPage - half);
        var pEnd   = Math.min(totalPgs, pStart + maxBtns - 1);
        if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
        for (var p = pStart; p <= pEnd; p++) {
            numsHtml += '<button class="opd-page-num' + (p === otSchCurrentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        $('#otSchPageNums').html(numsHtml);
        $('#otSchPrevPage').prop('disabled', otSchCurrentPage <= 1);
        $('#otSchNextPage').prop('disabled', otSchCurrentPage >= totalPgs);

        lucide.createIcons();
    }

    $('#otSchSearch').on('input', function() { otSchCurrentPage = 1; renderSchedulingTab(); });

    $(document).on('click', '#otSchPageNums .opd-page-num', function() {
        otSchCurrentPage = parseInt($(this).data('page'));
        renderSchedulingTab();
    });
    $(document).on('click', '#otSchPrevPage', function() {
        if (otSchCurrentPage > 1) { otSchCurrentPage--; renderSchedulingTab(); }
    });
    $(document).on('click', '#otSchNextPage', function() {
        otSchCurrentPage++; renderSchedulingTab();
    });

    $(document).on('click', '.ot-row', function() {
        var opId = $(this).data('op-id');
        var op = operations.find(function(o) { return o.operationId === opId; });
        if (op) openDetailSheet(op);
    });

    $(document).on('click', '.ot-view-btn', function(e) {
        e.stopPropagation();
        var opId = $(this).data('op-id');
        var op = operations.find(function(o) { return o.operationId === opId; });
        if (op) openDetailSheet(op);
    });

    $(document).on('click', '.dropdown-toggle-btn', function(e) {
        e.stopPropagation();
        var parent = $(this).closest('.dropdown-actions');
        var wasOpen = parent.hasClass('open');
        $('.dropdown-actions').removeClass('open');
        if (!wasOpen) parent.addClass('open');
    });
    $(document).on('click', function() { $('.dropdown-actions').removeClass('open'); });

    $(document).on('click', '#btnBookFromEmpty', function() { openBooking(); });

    var _otDetailPatient = null;

    function openDetailSheet(op) {
        selectedOperation = op;

        var currency   = (hospitalInfo && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';
        var surgeonFee = Number(op.surgeonFee       || 0);
        var anaFee     = Number(op.anaesthetistFee  || 0);
        var netTotal   = surgeonFee + anaFee;
        var payStatus  = op.paymentStatus || '-';

        var surgDate   = op.surgeryDate ? new Date(op.surgeryDate) : null;
        var surgDateStr = surgDate
            ? surgDate.toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit', year:'numeric'})
              + (op.startTime ? ', ' + op.startTime : '')
            : '-';

        var statusColor = op.status === 'Scheduled'  ? '#3B82F6'
                        : op.status === 'Completed'  ? '#16A34A'
                        : op.status === 'In Progress'? '#EAB308'
                        : op.status === 'Cancelled'  ? '#EF4444' : '#6B7280';
        var opStatusBadge = '<span style="background:' + statusColor + ';color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(op.status || 'Scheduled') + '</span>';

        var payBadge = '';
        if (payStatus === 'Paid')         payBadge = '<span style="background:#16A34A;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">Paid</span>';
        else if (payStatus === 'Pending') payBadge = '<span style="background:#EAB308;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">Pending</span>';
        else                              payBadge = '<span style="background:#6B7280;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(payStatus) + '</span>';

        function _buildBody(patient) {
            var patientName = patient ? (patient.name  || op.patientName) : op.patientName;
            var cnic        = patient ? (patient.cnic  || '-') : (op.cnic  || '-');
            var phone       = patient ? (patient.phone || '-') : (op.phone || '-');
            var age         = patient ? (patient.age   || op.age   || '-') : (op.age   || '-');
            var gender      = patient ? (patient.gender|| op.gender|| '-') : (op.gender|| '-');
            var ageGend     = (age !== '-' || gender !== '-') ? age + ' / ' + gender : '-';

            return (
                /* ── PATIENT INFORMATION ── */
                '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px;margin-bottom:20px">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                        '<i data-lucide="user" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                        '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">Patient Information</span>' +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">' +
                        '<div>' +
                            '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">Full Name</div>' +
                            '<div style="font-size:14px;color:var(--color-foreground)">' + esc(patientName) + '</div>' +
                        '</div>' +
                        '<div>' +
                            '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">Assigned MRN</div>' +
                            '<div><span style="font-size:12px;font-family:monospace;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:3px 10px;border-radius:4px">' + esc(op.mrn || '-') + '</span></div>' +
                        '</div>' +
                        '<div>' +
                            '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">National ID / CNIC</div>' +
                            '<div style="font-size:13px;color:var(--color-foreground)">' + esc(cnic) + '</div>' +
                        '</div>' +
                        '<div>' +
                            '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">Mobile Number</div>' +
                            '<div style="font-size:13px;color:var(--color-foreground)">' + esc(phone) + '</div>' +
                        '</div>' +
                        '<div>' +
                            '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">Age &amp; Gender</div>' +
                            '<div style="font-size:13px;color:var(--color-foreground)">' + esc(ageGend) + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                /* ── OT DETAILS + FINANCIAL DETAILS ── */
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +

                    /* Left — OT Details */
                    '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px">' +
                        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                            '<i data-lucide="stethoscope" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                            '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">OT Details</span>' +
                        '</div>' +
                        '<table style="width:100%;font-size:13px;border-collapse:collapse">' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Operation ID</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px;color:var(--color-foreground)">' + esc(op.operationId || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Procedure</td><td style="padding:8px 0;text-align:right;font-weight:500;color:var(--color-foreground);max-width:140px;word-break:break-word">' + esc(op.procedure || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Surgery Type</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(op.surgeryType || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Surgeon</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(op.surgeon || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Anaesthetist</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(op.anaesthetist || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Anesthesia Type</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(op.anesthesiaType || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Theater</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(op.theater || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Surgery Date</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px;color:var(--color-foreground)">' + esc(surgDateStr) + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Est. Duration</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(op.estimatedDuration ? op.estimatedDuration + ' hrs' : '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Source</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(op.admissionSource || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Status</td><td style="padding:8px 0;text-align:right">' + opStatusBadge + '</td></tr>' +
                        '</table>' +
                    '</div>' +

                    /* Right — Financial Details */
                    '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px">' +
                        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                            '<i data-lucide="wallet" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                            '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">Financial Details</span>' +
                        '</div>' +
                        '<table style="width:100%;font-size:13px;border-collapse:collapse">' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Payment Status</td><td style="padding:8px 0;text-align:right">' + payBadge + '</td></tr>' +
                            '<tr><td colspan="2" style="padding:0"><hr style="margin:8px 0;border-color:var(--color-border)"></td></tr>' +
                            (surgeonFee > 0 ? '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Surgeon Fee</td><td style="padding:8px 0;text-align:right;font-weight:500;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + surgeonFee.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' : '') +
                            (anaFee     > 0 ? '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Anaesthetist Fee</td><td style="padding:8px 0;text-align:right;font-weight:500;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + anaFee.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' : '') +
                            '<tr><td colspan="2" style="padding:0"><hr style="margin:8px 0;border-color:var(--color-border)"></td></tr>' +
                            '<tr><td style="padding:8px 0;font-weight:700;font-size:13px;text-transform:uppercase;color:var(--color-foreground)">Net Total</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:18px;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + netTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' +
                        '</table>' +
                    '</div>' +
                '</div>'
            );
        }

        /* Render immediately, then refresh once patient data arrives */
        $('#otDetailSheetBody').html(_buildBody(null));
        $('#otDetailSheetFooter').html(
            '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
                '<button class="btn-outline" data-bs-dismiss="offcanvas">CLOSE</button>' +
                '<button class="btn-primary" id="btnOtAdmPrint" style="display:flex;align-items:center;gap:6px">' +
                    '<i data-lucide="printer" style="width:16px;height:16px"></i> PRINT' +
                '</button>' +
            '</div>'
        );
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('otDetailSheet')).show();

        _otDetailPatient = null;
        $.get('/api/patients/' + encodeURIComponent(op.mrn)).done(function(patient) {
            if (patient) {
                _otDetailPatient = patient;
                $('#otDetailSheetBody').html(_buildBody(patient));
                lucide.createIcons();
            }
        });

        $(document).off('click.otAdmPrint').on('click.otAdmPrint', '#btnOtAdmPrint', function() {
            printOtRegistrationSlip(op, _otDetailPatient);
        });
    }

    $('#btnBookNewSurgery').on('click', function() { openBooking(); });

    function openBooking() {
        resetRegistration();
        renderBookingSheet();
        new bootstrap.Offcanvas(document.getElementById('otBookingSheet')).show();
    }

    function resetRegistration() {
        registrationStep = 'source-select';
        admissionSource = null;
        selectedPatientMRN = null;
        resolvedPatient = null;
        mrnSearching = false;
        phoneSearch = '';
        phoneSearchResults = null;
        phoneSearching = false;
        patientForm = { name: '', age: '', gender: 'Male', cnic: '', contactType: 'SELF', guardianName: '', guardianCnic: '', relationshipToPatient: '' };
        surgeryForm = {
            procedure: '', surgeryType: 'Elective', priority: 'Elective',
            surgeon: '', anaesthetist: '', anaesthetistFee: '',
            surgeonFee: '0', theater: 'OT-1', surgeryDate: '', startTime: '',
            estimatedDuration: '2', anesthesiaType: 'General Anesthesia (GA)',
            diagnosis: '', specialInstructions: ''
        };
        selectedOptionalCharges = [];
        validationErrors = [];
    }

    function renderValidationErrors() {
        if (validationErrors.length === 0) return '';
        var html = '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px;margin-bottom:16px">';
        validationErrors.forEach(function(err) {
            html += '<p style="font-size:12px;color:var(--color-destructive);display:flex;align-items:center;gap:6px;margin:0 0 4px"><i data-lucide="alert-triangle" style="width:14px;height:14px;flex-shrink:0"></i> ' + esc(err) + '</p>';
        });
        html += '</div>';
        return html;
    }

    function renderBookingSheet() {
        var titleMap = {
            'source-select': 'Book New Surgery',
            'mrn-lookup': 'Select Patient',
            'phone-search': 'Phone Search',
            'phone-results': 'Search Results',
            'new-patient': 'New Patient Details',
            'surgery-details': 'Surgery Details'
        };
        $('#otBookingSheetTitle').html('<i data-lucide="syringe"></i> ' + titleMap[registrationStep]);

        var body = '';
        var footer = '';

        if (registrationStep !== 'source-select') {
            body += '<div style="margin-bottom:16px"><button class="btn-ghost btn-sm" id="btnOtBack"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button></div>';
        }

        if (registrationStep === 'source-select') {
            body += '<div style="background:rgba(127,255,212,0.05);border:1px solid rgba(127,255,212,0.2);padding:16px;border-radius:8px;margin-bottom:24px">' +
                '<p style="font-size:14px;font-weight:600;color:var(--midnight-blue);margin:0 0 4px">Select Admission Source</p>' +
                '<p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Choose how the patient is arriving for surgery</p>' +
            '</div>';

            body += '<div style="display:flex;flex-direction:column;gap:12px">' +
                '<button class="ot-source-btn source-opd" data-source="Outpatient"><div class="ot-source-icon"><i data-lucide="stethoscope"></i></div><div><p style="font-size:14px;font-weight:700;margin:0">Outpatient (OPD)</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Patient from OPD</p></div></button>' +
                '<button class="ot-source-btn source-er" data-source="Emergency"><div class="ot-source-icon"><i data-lucide="ambulance"></i></div><div><p style="font-size:14px;font-weight:700;margin:0">Emergency (ER)</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Patient from Emergency</p></div></button>' +
                '<button class="ot-source-btn source-ipd" data-source="IPD"><div class="ot-source-icon"><i data-lucide="bed-double"></i></div><div><p style="font-size:14px;font-weight:700;margin:0">Inpatient (IPD)</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Already admitted patient</p></div></button>' +
                '<button class="ot-source-btn source-direct" data-source="Direct OT"><div class="ot-source-icon"><i data-lucide="syringe"></i></div><div><p style="font-size:14px;font-weight:700;margin:0">Direct OT</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Direct surgery booking</p></div></button>' +
            '</div>';

            footer = '<div style="display:flex;justify-content:flex-end;width:100%"><button class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button></div>';

        } else if (registrationStep === 'mrn-lookup') {
            var sourceLabel = getSourceLabel();
            body += '<div style="background:#EFF6FF;border:1px solid #DBEAFE;padding:16px;border-radius:8px;margin-bottom:24px">' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><i data-lucide="search" style="width:16px;height:16px;color:#2563EB"></i><p style="font-size:14px;font-weight:600;color:#1E40AF;margin:0">Select Patient from ' + sourceLabel + '</p></div>' +
                '<p style="font-size:12px;color:#2563EB;margin:0">Select a patient from ' + sourceLabel + ' ' + (admissionSource === 'IPD' ? 'admissions' : 'visits') + ' to proceed with surgery booking.</p>' +
            '</div>';

            body += renderValidationErrors();

            var sourceVisits = getSourceVisits();
            var uniqueVisits = getUniqueMrnVisits(sourceVisits);

            /* ── Searchable Patient Picker (always-open panel) ── */
            var patientsJson = JSON.stringify(uniqueVisits.map(function(v){ return {mrn: v.mrn, name: v.patientName}; }));
            body += '<div class="form-group">' +
                '<label>SELECT PATIENT (MRN) <span style="color:#ef4444">*</span></label>' +
                '<div id="otMrnDropdown" style="' +
                    'background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;' +
                    'box-shadow:0 4px 18px rgba(0,0,0,0.10);overflow:hidden' +
                '">' +
                    '<div style="padding:10px 14px;border-bottom:1px solid #f1f5f9">' +
                        '<input type="text" id="otMrnSearchInput" autocomplete="off" placeholder="Search..."' +
                            ' style="width:100%;border:none;outline:none;font-size:13px;' +
                                   'color:#1e293b;background:transparent;padding:0;caret-color:#1e293b">' +
                    '</div>' +
                    '<div id="otMrnList" style="max-height:220px;overflow-y:auto">' +
                        (function() {
                            var h = '';
                            if (uniqueVisits.length === 0) {
                                h = '<div style="padding:16px;font-size:13px;color:#94a3b8;text-align:center">No patients found</div>';
                            } else {
                                uniqueVisits.forEach(function(v) {
                                    h += '<div class="ot-mrn-opt" data-mrn="' + esc(v.mrn) + '"' +
                                        ' style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #f8fafc">' +
                                        '<div style="font-size:13px;font-weight:600;color:#1e293b">' + esc(v.patientName) + '</div>' +
                                        '<div style="font-size:11px;color:#64748b;font-family:monospace;margin-top:1px">' + esc(v.mrn) + '</div>' +
                                        '</div>';
                                });
                            }
                            return h;
                        })() +
                    '</div>' +
                '</div>' +
                '<input type="hidden" id="otMrnSelect" value="">' +
            '</div>' +
            '<script>window._otPatList = ' + patientsJson + ';<\/script>';

            footer = '<div style="display:flex;justify-content:space-between;width:100%">' +
                '<button class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>' +
            '</div>';

        } else if (registrationStep === 'phone-search') {
            body += renderValidationErrors();
            body += '<div style="background:#F0FDF4;border:1px solid #DCFCE7;padding:16px;border-radius:8px;margin-bottom:24px">' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><i data-lucide="phone" style="width:16px;height:16px;color:#16A34A"></i><p style="font-size:14px;font-weight:600;color:#166534;margin:0">Phone-First Registration</p></div>' +
                '<p style="font-size:12px;color:#16A34A;margin:0">Enter the patient\'s phone number to check for existing records.</p>' +
            '</div>';

            body += '<div class="form-group"><label>MOBILE NUMBER <span style="color:var(--color-destructive)">*</span></label>' +
                '<input type="text" class="form-control" id="otPhoneSearchInput" placeholder="Enter phone number" value="' + esc(phoneSearch) + '">' +
            '</div>';

            footer = '<div style="display:flex;justify-content:space-between;width:100%">' +
                '<button class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>' +
                '<button class="btn-primary" id="btnOtPhoneSearch">Search</button>' +
            '</div>';

        } else if (registrationStep === 'phone-results' && phoneSearchResults) {
            body += '<div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--color-muted-foreground);margin-bottom:24px"><i data-lucide="phone" style="width:16px;height:16px"></i> Results for: <span style="font-family:monospace;font-weight:600;color:var(--color-foreground)">' + esc(phoneSearchResults.phone) + '</span></div>';

            if (phoneSearchResults.self.length === 0 && phoneSearchResults.guardian.length === 0) {
                body += '<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:32px 0"><i data-lucide="users" style="width:48px;height:48px;color:var(--color-muted-foreground);opacity:0.3"></i><div style="text-align:center"><p style="font-size:14px;font-weight:500;color:var(--color-muted-foreground)">No patients found</p><p style="font-size:12px;color:var(--color-muted-foreground);opacity:0.7">No records match this phone number</p></div></div>';
            } else {
                if (phoneSearchResults.self.length > 0) {
                    body += '<div style="margin-bottom:24px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">As Self</h4>';
                    phoneSearchResults.self.forEach(function(p) {
                        body += renderPatientResult(p, 'SELF');
                    });
                    body += '</div>';
                }
                if (phoneSearchResults.guardian.length > 0) {
                    body += '<div><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">As Guardian</h4>';
                    phoneSearchResults.guardian.forEach(function(p) {
                        body += renderPatientResult(p, 'GUARDIAN');
                    });
                    body += '</div>';
                }
            }

            footer = '<div style="display:flex;justify-content:space-between;width:100%">' +
                '<button class="btn-outline" id="btnOtBackToPhone"><i data-lucide="arrow-left"></i> Back</button>' +
                '<button class="btn-primary" id="btnOtNewPatient"><i data-lucide="user-plus"></i> Register New Patient</button>' +
            '</div>';

        } else if (registrationStep === 'new-patient') {
            body += renderValidationErrors();
            body += '<div style="margin-bottom:24px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px">Patient Information</h4>' +
                '<div class="form-grid" style="gap:16px">' +
                    '<div class="form-group"><label>FULL NAME <span style="color:var(--color-destructive)">*</span></label><input type="text" class="form-control" id="otPatName" placeholder="Patient Name" value="' + esc(patientForm.name) + '"></div>' +
                    '<div class="form-grid form-grid-2">' +
                        '<div class="form-group"><label>AGE (YEARS) <span style="color:var(--color-destructive)">*</span></label><input type="number" class="form-control" id="otPatAge" placeholder="YY" value="' + esc(patientForm.age) + '"></div>' +
                        '<div class="form-group"><label>GENDER <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="otPatGender"><option value="Male"' + (patientForm.gender === 'Male' ? ' selected' : '') + '>Male</option><option value="Female"' + (patientForm.gender === 'Female' ? ' selected' : '') + '>Female</option><option value="Other"' + (patientForm.gender === 'Other' ? ' selected' : '') + '>Other</option></select></div>' +
                    '</div>' +
                    '<div class="form-group"><label>CNIC / NATIONAL ID</label><input type="text" class="form-control" id="otPatCnic" placeholder="XXXXX-XXXXXXX-X" value="' + esc(patientForm.cnic) + '"></div>' +
                '</div></div>';

            body += '<div style="height:1px;background:var(--color-border);margin-bottom:24px"></div>';

            body += '<div style="margin-bottom:24px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px">Contact Type</h4>' +
                '<div style="display:flex;gap:16px;margin-bottom:16px">' +
                    '<label class="contact-type-option' + (patientForm.contactType === 'SELF' ? ' active' : '') + '"><input type="radio" name="otContactType" value="SELF"' + (patientForm.contactType === 'SELF' ? ' checked' : '') + ' style="accent-color:var(--aquamint)"> <div><p style="font-size:14px;font-weight:500;margin:0">Self</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Patient owns this phone</p></div></label>' +
                    '<label class="contact-type-option' + (patientForm.contactType === 'GUARDIAN' ? ' active' : '') + '"><input type="radio" name="otContactType" value="GUARDIAN"' + (patientForm.contactType === 'GUARDIAN' ? ' checked' : '') + ' style="accent-color:var(--aquamint)"> <div><p style="font-size:14px;font-weight:500;margin:0">Guardian</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Phone belongs to guardian</p></div></label>' +
                '</div>';

            if (patientForm.contactType === 'GUARDIAN') {
                body += '<div class="form-grid" style="gap:16px">' +
                    '<div class="form-group"><label>GUARDIAN NAME</label><input type="text" class="form-control" id="otGuardianName" placeholder="Guardian Name" value="' + esc(patientForm.guardianName) + '"></div>' +
                    '<div class="form-group"><label>GUARDIAN CNIC</label><input type="text" class="form-control" id="otGuardianCnic" placeholder="XXXXX-XXXXXXX-X" value="' + esc(patientForm.guardianCnic) + '"></div>' +
                    '<div class="form-group"><label>RELATIONSHIP</label><select class="form-select" id="otRelationship"><option value="">-- Select Relationship --</option>';
                relationshipOptions.forEach(function(r) {
                    body += '<option value="' + r + '"' + (patientForm.relationshipToPatient === r ? ' selected' : '') + '>' + r + '</option>';
                });
                body += '</select></div></div>';
            }
            body += '</div>';

            footer = '<div style="display:flex;justify-content:space-between;width:100%">' +
                '<button class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>' +
                '<button class="btn-primary" id="btnOtSavePatient">Save & Continue</button>' +
            '</div>';

        } else if (registrationStep === 'surgery-details') {
            body += renderValidationErrors();

            var patName = getSelectedPatientName();
            body += '<div style="background:rgba(127,255,212,0.05);border:1px solid rgba(127,255,212,0.2);padding:16px;border-radius:8px;margin-bottom:24px">' +
                '<p style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--aquamint);margin:0 0 4px">SELECTED PATIENT</p>' +
                '<p style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin:0">' + esc(patName) + '</p>' +
                '<p style="font-size:12px;font-family:monospace;color:var(--color-muted-foreground);margin:0">' + esc(selectedPatientMRN) + '</p>';
            if (resolvedPatient) {
                body += '<p style="font-size:12px;color:var(--color-muted-foreground);margin:4px 0 0">' + (resolvedPatient.age || '-') + 'Y / ' + (resolvedPatient.gender || '-') + ' · ' + esc(resolvedPatient.phone || '-') + '</p>';
            }
            body += '</div>';

            body += '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;display:flex;align-items:center;gap:8px"><i data-lucide="activity" style="width:16px;height:16px"></i> Surgery Details</h4>' +
                '<div class="form-grid" style="gap:16px">' +
                    '<div class="form-group"><label>PROCEDURE NAME <span style="color:var(--color-destructive)">*</span></label><input type="text" class="form-control" id="otProcedure" placeholder="e.g. Laparoscopic Appendectomy" value="' + esc(surgeryForm.procedure) + '"></div>' +
                    '<div class="form-grid form-grid-2">' +
                        '<div class="form-group"><label>SURGERY TYPE</label><select class="form-select" id="otSurgeryType"><option value="Elective"' + (surgeryForm.surgeryType === 'Elective' ? ' selected' : '') + '>Elective</option><option value="Emergency"' + (surgeryForm.surgeryType === 'Emergency' ? ' selected' : '') + '>Emergency</option><option value="Urgent"' + (surgeryForm.surgeryType === 'Urgent' ? ' selected' : '') + '>Urgent</option></select></div>' +
                        '<div class="form-group"><label>PRIORITY</label><select class="form-select" id="otPriority"><option value="Elective"' + (surgeryForm.priority === 'Elective' ? ' selected' : '') + '>Elective</option><option value="Urgent"' + (surgeryForm.priority === 'Urgent' ? ' selected' : '') + '>Urgent</option><option value="Emergency"' + (surgeryForm.priority === 'Emergency' ? ' selected' : '') + '>Emergency</option></select></div>' +
                    '</div>' +
                    '<div class="form-group"><label>ANESTHESIA TYPE</label><select class="form-select" id="otAnesthesiaType"><option value="General Anesthesia (GA)"' + (surgeryForm.anesthesiaType === 'General Anesthesia (GA)' ? ' selected' : '') + '>General Anesthesia (GA)</option><option value="Local Anesthesia"' + (surgeryForm.anesthesiaType === 'Local Anesthesia' ? ' selected' : '') + '>Local Anesthesia</option><option value="Spinal/Epidural"' + (surgeryForm.anesthesiaType === 'Spinal/Epidural' ? ' selected' : '') + '>Spinal/Epidural</option></select></div>' +
                '</div>' +
            '</div>';

            body += '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;display:flex;align-items:center;gap:8px"><i data-lucide="users" style="width:16px;height:16px"></i> Surgical Team</h4>' +
                '<div class="form-grid" style="gap:16px">' +
                    '<div class="form-group"><label>PRIMARY SURGEON <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="otSurgeon"><option value="">-- Select Surgeon --</option>';
            doctors.forEach(function(d) {
                var fullName = d.firstName + ' ' + d.lastName;
                body += '<option value="' + esc(fullName) + '"' + (surgeryForm.surgeon === fullName ? ' selected' : '') + '>' + esc(fullName) + ' - ' + esc(d.specialization) + ' (' + esc(d.department) + ')</option>';
            });
            body += '</select></div>';

            if (surgeryForm.surgeonFee !== '0' && surgeryForm.surgeonFee) {
                body += '<div style="background:rgba(245,246,250,0.5);padding:12px;border-radius:8px;display:flex;align-items:center;justify-content:space-between">' +
                    '<span style="font-size:12px;color:var(--color-muted-foreground)">Surgeon Fee (from config)</span>' +
                    '<span style="font-size:14px;font-family:monospace;font-weight:600">' + hospitalInfo.currency + ' ' + Number(surgeryForm.surgeonFee).toLocaleString() + '</span>' +
                '</div>';
            }

            body += '<div class="form-group"><label>ANAESTHETIST</label><input type="text" class="form-control" id="otAnaesthetist" placeholder="Dr. Name" value="' + esc(surgeryForm.anaesthetist) + '"></div>' +
                '<div class="form-group"><label>ANAESTHETIST FEE</label><input type="number" class="form-control" id="otAnaesthetistFee" placeholder="0" value="' + esc(surgeryForm.anaesthetistFee) + '"></div>' +
            '</div></div>';

            body += '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;display:flex;align-items:center;gap:8px"><i data-lucide="clock" style="width:16px;height:16px"></i> Scheduling</h4>' +
                '<div class="form-grid" style="gap:16px">' +
                    '<div class="form-group"><label>THEATER <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="otTheater"><option value="OT-1"' + (surgeryForm.theater === 'OT-1' ? ' selected' : '') + '>OT-1 (General)</option><option value="OT-2"' + (surgeryForm.theater === 'OT-2' ? ' selected' : '') + '>OT-2 (Cardiac)</option><option value="OT-3"' + (surgeryForm.theater === 'OT-3' ? ' selected' : '') + '>OT-3 (Ortho)</option></select></div>' +
                    '<div class="form-grid form-grid-2">' +
                        '<div class="form-group"><label>SURGERY DATE</label><input type="date" class="form-control" id="otSurgeryDate" value="' + esc(surgeryForm.surgeryDate) + '"></div>' +
                        '<div class="form-group"><label>START TIME</label><input type="time" class="form-control" id="otStartTime" value="' + esc(surgeryForm.startTime) + '"></div>' +
                    '</div>' +
                    '<div class="form-group"><label>ESTIMATED DURATION (hours)</label>' +
                        '<div style="display:flex;gap:8px">';
            [1, 2, 3, 4].forEach(function(h) {
                body += '<button class="ot-duration-btn' + (surgeryForm.estimatedDuration === h.toString() ? ' active' : '') + '" data-duration="' + h + '">' + h + ' hr</button>';
            });
            body += '</div></div></div></div>';

            footer = '<div style="display:flex;gap:12px;width:100%">' +
                '<button class="btn-outline" style="flex:1" data-bs-dismiss="offcanvas">Cancel</button>' +
                '<button class="btn-primary" style="flex:1" id="btnOtContinueCharges">Continue to Charges</button>' +
            '</div>';
        }

        $('#otBookingSheetBody').html(body);
        $('#otBookingSheetFooter').html(footer);
        lucide.createIcons();
        bindBookingEvents();
    }

    function renderPatientResult(patient, contactType) {
        var badgeBg = contactType === 'SELF' ? 'background:#EFF6FF;color:#1D4ED8;border-color:#BFDBFE' : 'background:#FFF7ED;color:#C2410C;border-color:#FED7AA';
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--color-border);border-radius:8px;margin-bottom:8px;transition:background 0.15s" class="ot-patient-result" data-mrn="' + esc(patient.mrn) + '">' +
            '<div style="display:flex;align-items:center;gap:12px">' +
                '<div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(patient.name) + '</div>' +
                '<div>' +
                    '<p style="font-size:14px;font-weight:500;margin:0">' + esc(patient.name) + '</p>' +
                    '<p style="font-size:12px;color:var(--color-muted-foreground);margin:0"><span style="font-family:monospace">' + esc(patient.mrn) + '</span> · ' + (patient.age || '-') + 'Y / ' + (patient.gender || '-') + '</p>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
                '<span class="badge badge-outline" style="font-size:10px;' + badgeBg + '">' + contactType + '</span>' +
                '<button class="btn-outline btn-sm ot-select-patient-btn" data-mrn="' + esc(patient.mrn) + '" style="height:28px;font-size:12px">Select</button>' +
            '</div>' +
        '</div>';
    }

    function bindBookingEvents() {
        $(document).off('click.otSource').on('click.otSource', '.ot-source-btn', function() {
            var source = $(this).data('source');
            handleSourceSelect(source);
        });

        /* ── Searchable patient picker (always-open panel) ── */
        $(document).off('input.otMrnSearch').on('input.otMrnSearch', '#otMrnSearchInput', function() {
            var q = $(this).val().toLowerCase().trim();
            var list = window._otPatList || [];
            var filtered = q ? list.filter(function(p) {
                return p.name.toLowerCase().indexOf(q) > -1 || p.mrn.toLowerCase().indexOf(q) > -1;
            }) : list;
            var h = '';
            if (filtered.length === 0) {
                h = '<div style="padding:16px;font-size:13px;color:#94a3b8;text-align:center">No patients found</div>';
            } else {
                filtered.forEach(function(p) {
                    h += '<div class="ot-mrn-opt" data-mrn="' + esc(p.mrn) + '"' +
                        ' style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #f8fafc">' +
                        '<div style="font-size:13px;font-weight:600;color:#1e293b">' + esc(p.name) + '</div>' +
                        '<div style="font-size:11px;color:#64748b;font-family:monospace;margin-top:1px">' + esc(p.mrn) + '</div>' +
                        '</div>';
                });
            }
            $('#otMrnList').html(h);
        });

        $(document).off('click.otMrnOpt').on('click.otMrnOpt', '.ot-mrn-opt', function() {
            var mrn = $(this).data('mrn');
            $('#otMrnSelect').val(mrn);
            handleMrnSelect(mrn);
        });

        $(document).off('mouseover.otMrnOpt').on('mouseover.otMrnOpt', '.ot-mrn-opt', function() {
            $(this).css('background', '#f0f9ff');
        }).off('mouseout.otMrnOpt').on('mouseout.otMrnOpt', '.ot-mrn-opt', function() {
            $(this).css('background', '');
        });

        $(document).off('click.otBack').on('click.otBack', '#btnOtBack', function() {
            handleBack();
        });

        $(document).off('click.otPhoneSearch').on('click.otPhoneSearch', '#btnOtPhoneSearch', function() {
            saveFormValues();
            handlePhoneSearch();
        });

        $(document).off('keydown.otPhoneEnter').on('keydown.otPhoneEnter', '#otPhoneSearchInput', function(e) {
            if (e.key === 'Enter') {
                saveFormValues();
                handlePhoneSearch();
            }
        });

        $(document).off('click.otBackToPhone').on('click.otBackToPhone', '#btnOtBackToPhone', function() {
            registrationStep = 'phone-search';
            renderBookingSheet();
        });

        $(document).off('click.otSelectPatient').on('click.otSelectPatient', '.ot-select-patient-btn', function(e) {
            e.stopPropagation();
            var mrn = $(this).data('mrn');
            handleSelectPatientFromResults(mrn);
        });

        $(document).off('click.otNewPatient').on('click.otNewPatient', '#btnOtNewPatient', function() {
            handleNewPatientClick();
        });

        $(document).off('change.otContactType').on('change.otContactType', 'input[name="otContactType"]', function() {
            saveFormValues();
            patientForm.contactType = $(this).val();
            renderBookingSheet();
        });

        $(document).off('click.otSavePatient').on('click.otSavePatient', '#btnOtSavePatient', function() {
            saveFormValues();
            handlePatientFormSubmit();
        });

        $(document).off('change.otSurgeon').on('change.otSurgeon', '#otSurgeon', function() {
            saveFormValues();
            handleSurgeonChange($(this).val());
        });

        $(document).off('click.otDuration').on('click.otDuration', '.ot-duration-btn', function() {
            saveFormValues();
            surgeryForm.estimatedDuration = $(this).data('duration').toString();
            renderBookingSheet();
        });

        $(document).off('click.otContinueCharges').on('click.otContinueCharges', '#btnOtContinueCharges', function() {
            saveFormValues();
            handleSurgeryDetailsSubmit();
        });
    }

    function saveFormValues() {
        if (registrationStep === 'phone-search') {
            phoneSearch = $('#otPhoneSearchInput').val() || '';
        }
        if (registrationStep === 'new-patient') {
            patientForm.name = $('#otPatName').val() || '';
            patientForm.age = $('#otPatAge').val() || '';
            patientForm.gender = $('#otPatGender').val() || 'Male';
            patientForm.cnic = $('#otPatCnic').val() || '';
            if (patientForm.contactType === 'GUARDIAN') {
                patientForm.guardianName = $('#otGuardianName').val() || '';
                patientForm.guardianCnic = $('#otGuardianCnic').val() || '';
                patientForm.relationshipToPatient = $('#otRelationship').val() || '';
            }
        }
        if (registrationStep === 'surgery-details') {
            surgeryForm.procedure = $('#otProcedure').val() || '';
            surgeryForm.surgeryType = $('#otSurgeryType').val() || 'Elective';
            surgeryForm.priority = $('#otPriority').val() || 'Elective';
            surgeryForm.anesthesiaType = $('#otAnesthesiaType').val() || 'General Anesthesia (GA)';
            surgeryForm.surgeon = $('#otSurgeon').val() || '';
            surgeryForm.anaesthetist = $('#otAnaesthetist').val() || '';
            surgeryForm.anaesthetistFee = $('#otAnaesthetistFee').val() || '';
            surgeryForm.theater = $('#otTheater').val() || 'OT-1';
            surgeryForm.surgeryDate = $('#otSurgeryDate').val() || '';
            surgeryForm.startTime = $('#otStartTime').val() || '';
        }
    }

    function handleSourceSelect(source) {
        admissionSource = source;
        validationErrors = [];
        if (source === 'Direct OT') {
            registrationStep = 'phone-search';
        } else {
            registrationStep = 'mrn-lookup';
        }
        renderBookingSheet();
    }

    function handleBack() {
        if (registrationStep === 'mrn-lookup' || registrationStep === 'phone-search') {
            registrationStep = 'source-select';
        } else if (registrationStep === 'phone-results') {
            registrationStep = 'phone-search';
        } else if (registrationStep === 'new-patient') {
            registrationStep = 'phone-results';
        } else if (registrationStep === 'surgery-details') {
            if (admissionSource === 'Direct OT') {
                if (phoneSearchResults) {
                    registrationStep = 'phone-results';
                } else {
                    registrationStep = 'phone-search';
                }
            } else {
                registrationStep = 'mrn-lookup';
            }
        }
        validationErrors = [];
        renderBookingSheet();
    }

    function getSourceLabel() {
        if (admissionSource === 'Outpatient') return 'OPD';
        if (admissionSource === 'Emergency') return 'ER';
        if (admissionSource === 'IPD') return 'IPD';
        return '';
    }

    function getSourceVisits() {
        if (admissionSource === 'Outpatient') return opdVisits;
        if (admissionSource === 'Emergency') return erVisits;
        if (admissionSource === 'IPD') return ipdAdmissions;
        return [];
    }

    function getUniqueMrnVisits(visitsList) {
        var seen = {};
        return visitsList.filter(function(v) {
            if (seen[v.mrn]) return false;
            seen[v.mrn] = true;
            return true;
        });
    }

    function handleMrnSelect(mrn) {
        if (!mrn) return;
        validationErrors = [];
        mrnSearching = true;
        $.get('/api/patients/' + encodeURIComponent(mrn))
            .done(function(patient) {
                resolvedPatient = patient;
                selectedPatientMRN = patient.mrn;
                registrationStep = 'surgery-details';
                mrnSearching = false;
                renderBookingSheet();
            })
            .fail(function(xhr) {
                validationErrors = [xhr.responseJSON?.message || 'Patient not found with this MRN'];
                mrnSearching = false;
                renderBookingSheet();
            });
    }

    function handlePhoneSearch() {
        phoneSearch = $('#otPhoneSearchInput').val() || phoneSearch;
        if (!phoneSearch.trim()) {
            validationErrors = ['Please enter a phone number'];
            renderBookingSheet();
            return;
        }
        validationErrors = [];
        phoneSearching = true;
        $.get('/api/patients/search-phone/' + encodeURIComponent(phoneSearch.trim()))
            .done(function(results) {
                phoneSearchResults = results;
                registrationStep = 'phone-results';
                phoneSearching = false;
                renderBookingSheet();
            })
            .fail(function(xhr) {
                validationErrors = [xhr.responseJSON?.message || 'Failed to search'];
                phoneSearching = false;
                renderBookingSheet();
            });
    }

    function handleSelectPatientFromResults(mrn) {
        var all = [];
        if (phoneSearchResults) {
            all = all.concat(phoneSearchResults.self || []).concat(phoneSearchResults.guardian || []);
        }
        var found = all.find(function(p) { return p.mrn === mrn; });
        if (found) {
            selectedPatientMRN = found.mrn;
            resolvedPatient = found;
            validationErrors = [];
            registrationStep = 'surgery-details';
            renderBookingSheet();
        }
    }

    function handleNewPatientClick() {
        var hasSelf = phoneSearchResults?.hasSelf ?? false;
        patientForm.contactType = hasSelf ? 'GUARDIAN' : 'SELF';
        validationErrors = [];
        registrationStep = 'new-patient';
        renderBookingSheet();
    }

    function handlePatientFormSubmit() {
        var errors = [];
        if (!patientForm.name.trim()) errors.push("Patient Name is required");
        if (!patientForm.age.trim() || isNaN(Number(patientForm.age)) || Number(patientForm.age) <= 0) errors.push("Valid Age is required");
        if (!patientForm.gender) errors.push("Gender is required");
        if (patientForm.contactType === 'SELF' && phoneSearchResults && phoneSearchResults.hasSelf) {
            errors.push("A SELF contact already exists for this phone number. Please choose GUARDIAN.");
        }
        if (errors.length > 0) {
            validationErrors = errors;
            renderBookingSheet();
            return;
        }
        validationErrors = [];

        var payload = {
            name: patientForm.name,
            age: Number(patientForm.age),
            gender: patientForm.gender,
            phone: phoneSearch.trim(),
            cnic: patientForm.cnic,
            contactType: patientForm.contactType
        };
        if (patientForm.contactType === 'GUARDIAN') {
            payload.guardianName = patientForm.guardianName;
            payload.guardianPhone = phoneSearch.trim();
            payload.guardianCnic = patientForm.guardianCnic;
            payload.relationshipToPatient = patientForm.relationshipToPatient;
        }

        $.ajax({
            url: '/api/patients',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(newPatient) {
                selectedPatientMRN = newPatient.mrn;
                resolvedPatient = newPatient;
                registrationStep = 'surgery-details';
                renderBookingSheet();
            },
            error: function(xhr) {
                validationErrors = [xhr.responseJSON?.message || 'Failed to create patient'];
                renderBookingSheet();
            }
        });
    }

    function handleSurgeonChange(val) {
        surgeryForm.surgeon = val;
        var doctor = doctors.find(function(d) { return (d.firstName + ' ' + d.lastName) === val; });
        if (doctor) {
            $.get('/api/config/doctor-fee/' + doctor.id + '/OT')
                .done(function(config) {
                    surgeryForm.surgeonFee = config && config.fee ? config.fee.toString() : '0';
                    renderBookingSheet();
                })
                .fail(function() {
                    surgeryForm.surgeonFee = '0';
                    renderBookingSheet();
                });
        }
    }

    function handleSurgeryDetailsSubmit() {
        var errors = [];
        if (!surgeryForm.procedure) errors.push("Procedure is required");
        if (!surgeryForm.surgeon) errors.push("Surgeon is required");
        if (!surgeryForm.theater) errors.push("Theater is required");
        if (errors.length > 0) {
            validationErrors = errors;
            renderBookingSheet();
            return;
        }
        validationErrors = [];

        var bookingOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('otBookingSheet'));
        if (bookingOffcanvas) bookingOffcanvas.hide();

        renderChargesSheet();
        new bootstrap.Offcanvas(document.getElementById('otChargesSheet')).show();
    }

    function getSelectedPatientName() {
        if (resolvedPatient) return resolvedPatient.name;
        if (!selectedPatientMRN) return 'NEW PATIENT';
        if (phoneSearchResults) {
            var all = [].concat(phoneSearchResults.self || []).concat(phoneSearchResults.guardian || []);
            var found = all.find(function(p) { return p.mrn === selectedPatientMRN; });
            if (found) return found.name;
        }
        return patientForm.name || 'NEW PATIENT';
    }

    function renderChargesSheet() {
        var patName = getSelectedPatientName();
        var body = '';

        body += '<div style="background:rgba(127,255,212,0.05);border:1px solid rgba(127,255,212,0.2);padding:16px;border-radius:8px;margin-bottom:24px">' +
            '<p style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--aquamint);margin:0 0 4px">PATIENT</p>' +
            '<p style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin:0">' + esc(patName) + '</p>' +
            '<p style="font-size:12px;font-family:monospace;color:var(--color-muted-foreground);margin:0">' + esc(selectedPatientMRN) + '</p>' +
            '<p style="font-size:12px;color:var(--color-muted-foreground);margin:4px 0 0">Procedure: ' + esc(surgeryForm.procedure) + '</p>' +
        '</div>';

        body += '<div style="margin-bottom:24px">' +
            '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Surgeon Fee</h4>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(245,246,250,0.5);border-radius:8px">' +
                '<span style="font-size:14px">' + esc(surgeryForm.surgeon) + '</span>' +
                '<span style="font-size:14px;font-family:monospace;font-weight:600">' + hospitalInfo.currency + ' ' + Number(surgeryForm.surgeonFee).toLocaleString() + '</span>' +
            '</div>' +
        '</div>';

        if (surgeryForm.anaesthetistFee && Number(surgeryForm.anaesthetistFee) > 0) {
            body += '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Anaesthetist Fee</h4>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(245,246,250,0.5);border-radius:8px">' +
                    '<span style="font-size:14px">' + esc(surgeryForm.anaesthetist || 'Anaesthetist') + '</span>' +
                    '<span style="font-size:14px;font-family:monospace;font-weight:600">' + hospitalInfo.currency + ' ' + Number(surgeryForm.anaesthetistFee).toLocaleString() + '</span>' +
                '</div>' +
            '</div>';
        }

        var mandatoryCharges = otCharges.filter(function(c) { return c.isMandatory; });
        if (mandatoryCharges.length > 0) {
            body += '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Mandatory Charges</h4>';
            mandatoryCharges.forEach(function(charge) {
                body += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(245,246,250,0.3);border-radius:8px;margin-bottom:8px">' +
                    '<span style="font-size:14px">' + esc(charge.name) + '</span>' +
                    '<span style="font-size:14px;font-family:monospace">' + hospitalInfo.currency + ' ' + charge.amount.toLocaleString() + '</span>' +
                '</div>';
            });
            body += '</div>';
        }

        var optionalCharges = otCharges.filter(function(c) { return !c.isMandatory; });
        if (optionalCharges.length > 0) {
            body += '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Optional Charges</h4>';
            optionalCharges.forEach(function(charge) {
                var checked = selectedOptionalCharges.indexOf(charge.id) > -1;
                body += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--color-border);border-radius:8px;margin-bottom:8px">' +
                    '<div style="display:flex;align-items:center;gap:8px">' +
                        '<input type="checkbox" class="form-check-input ot-optional-charge" data-charge-id="' + esc(charge.id) + '"' + (checked ? ' checked' : '') + ' style="accent-color:var(--aquamint)">' +
                        '<span style="font-size:14px">' + esc(charge.name) + '</span>' +
                    '</div>' +
                    '<span style="font-size:14px;font-family:monospace">' + hospitalInfo.currency + ' ' + charge.amount.toLocaleString() + '</span>' +
                '</div>';
            });
            body += '</div>';
        }

        var total = calculateTotal();
        body += '<div style="border-top:1px solid var(--color-border);padding-top:16px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px;background:rgba(0,51,102,0.1);border-radius:8px">' +
                '<span style="font-size:14px;font-weight:700;color:var(--midnight-blue)">TOTAL PAYABLE</span>' +
                '<span style="font-size:18px;font-family:monospace;font-weight:700;color:var(--midnight-blue)">' + hospitalInfo.currency + ' ' + total.toLocaleString() + '</span>' +
            '</div>' +
        '</div>';

        var footer = '<div style="display:flex;gap:12px;width:100%">' +
            '<button class="btn-outline" style="flex:1" id="btnOtChargesBack">Back</button>' +
            '<button class="btn-primary" style="flex:1" id="btnOtConfirmBooking">Confirm & Book Surgery</button>' +
        '</div>';

        $('#otChargesSheetBody').html(body);
        $('#otChargesSheetFooter').html(footer);
        lucide.createIcons();

        $(document).off('change.otOptCharge').on('change.otOptCharge', '.ot-optional-charge', function() {
            var chargeId = $(this).data('charge-id');
            if ($(this).is(':checked')) {
                if (selectedOptionalCharges.indexOf(chargeId) === -1) selectedOptionalCharges.push(chargeId);
            } else {
                selectedOptionalCharges = selectedOptionalCharges.filter(function(id) { return id !== chargeId; });
            }
            var total = calculateTotal();
            $('#otChargesSheetBody').find('[style*="TOTAL PAYABLE"]').parent().find('span:last').text(hospitalInfo.currency + ' ' + total.toLocaleString());
            renderChargesSheet();
        });

        $(document).off('click.otChargesBack').on('click.otChargesBack', '#btnOtChargesBack', function() {
            var chargesOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('otChargesSheet'));
            if (chargesOffcanvas) chargesOffcanvas.hide();
            renderBookingSheet();
            new bootstrap.Offcanvas(document.getElementById('otBookingSheet')).show();
        });

        $(document).off('click.otConfirmBooking').on('click.otConfirmBooking', '#btnOtConfirmBooking', function() {
            handleFinalizeBooking();
        });
    }

    function calculateTotal() {
        var total = Number(surgeryForm.surgeonFee) + Number(surgeryForm.anaesthetistFee || 0);
        otCharges.filter(function(c) { return c.isMandatory; }).forEach(function(c) { total += c.amount; });
        otCharges.filter(function(c) { return selectedOptionalCharges.indexOf(c.id) > -1; }).forEach(function(c) { total += c.amount; });
        return total;
    }

    function handleFinalizeBooking() {
        var payload = {
            mrn: selectedPatientMRN,
            procedure: surgeryForm.procedure,
            surgeryType: surgeryForm.surgeryType,
            priority: surgeryForm.priority,
            surgeon: surgeryForm.surgeon,
            anaesthetist: surgeryForm.anaesthetist,
            anaesthetistFee: surgeryForm.anaesthetistFee ? Number(surgeryForm.anaesthetistFee) : undefined,
            theater: surgeryForm.theater,
            surgeryDate: surgeryForm.surgeryDate || undefined,
            startTime: surgeryForm.startTime || undefined,
            estimatedDuration: surgeryForm.estimatedDuration,
            admissionSource: admissionSource,
            chargeIds: selectedOptionalCharges
        };

        $.ajax({
            url: '/api/ot/operations',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function() {
                var chargesOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('otChargesSheet'));
                if (chargesOffcanvas) chargesOffcanvas.hide();
                resetRegistration();
                loadAllData();
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed to book surgery');
            }
        });
    }

    // ===== POST-OPERATIVE NOTES =====
    var selectedPostOpId = null;
    var postOpState = {};
    var postOpAutoSaveTimer = null;
    var otPostopFormSections = [];
    var otCustomPostopData = {};

    function defaultPostOpNotes() {
        return {
            postopLocation: 'Recovery Room / PACU',
            // Section 1: PACU / Aldrete
            aldreteActivity: 2, aldreteRespiration: 2, aldreteCirculation: 2, aldreteConsciousness: 2, aldreteOxygen: 2,
            recoveryVitals: [], // { time, bp, hr, rr, temp, spo2, painScore }
            painScore: 0, painLocation: '',
            analgesicsGiven: [], // { drug, dose, time, effectiveness }
            nauseaPresent: false, nauseaSeverity: '', antiemeticsGiven: '',
            // Section 2: Daily Progress Notes
            podNotes: [], // { date, pod, patientStatus, painControl, woundStatus: [], drainOutput, urineOutput, bowelMovement, bowelTime, ambulation, dietTolerated, labsReviewed: [], labValues, plan }
            // Section 3: Complications
            compNone: true, compBleeding: false, compInfection: false, compWoundDehiscence: false, compDVTPE: false, compPneumonia: false, compUrinaryRetention: false, compIleus: false, compAKI: false, compOther: false, compOtherText: '', compManagement: '',
            // Section 4: Discharge Planning
            expectedDischargeDate: '',
            dischargeCriteriaPainControlled: false, dischargeCriteriaToleratingDiet: false, dischargeCriteriaAmbulating: false, dischargeCriteriaWoundHealing: false, dischargeCriteriaDrainsRemoved: false, dischargeCriteriaAfebrile: false, dischargeCriteriaEducationDone: false,
            followUpDate: '', followUpDoctor: '', stitchRemovalDate: ''
        };
    }

    function postOpLocationColor(loc) {
        if (!loc) return '#3B82F6';
        if (loc.indexOf('ICU') > -1) return '#EF4444';
        if (loc.indexOf('Recovery') > -1 || loc.indexOf('PACU') > -1) return '#7C3AED';
        if (loc.indexOf('HDU') > -1) return '#F97316';
        if (loc.indexOf('Discharged') > -1) return '#10B981';
        return '#3B82F6';
    }

    function otPoGetBaseOps() {
        return operations.filter(function(op) {
            return op.status === 'Completed' || op.status === 'Discharged';
        });
    }

    function otPoPopulateFilterOptions() {
        var locWrap = document.getElementById('otPoCsLocation');
        if (locWrap && locWrap.setOptions) {
            var locs = ['All Locations'];
            otPoGetBaseOps().forEach(function(op) {
                var l = op.postopLocation || (postOpState[op.operationId] && postOpState[op.operationId].postopLocation) || 'Recovery Room / PACU';
                if (locs.indexOf(l) < 0) locs.push(l);
            });
            locWrap.setOptions(locs);
        }
    }

    function renderPostOpTab() {
        otPoPopulateFilterOptions();
        var search   = ($('#postOpSearch').val() || '').toLowerCase();
        var relevant = otPoGetBaseOps();
        var base     = otPoFiltered !== null ? otPoFiltered : relevant;
        var filtered = base.filter(function(op) {
            if (!search) return true;
            return (op.patientName || '').toLowerCase().indexOf(search) > -1 ||
                (op.procedure || '').toLowerCase().indexOf(search) > -1 ||
                (op.postopLocation || '').toLowerCase().indexOf(search) > -1 ||
                (op.operationId || '').toLowerCase().indexOf(search) > -1;
        });

        // Stat tiles always calculated from full relevant set
        var pacuCount  = relevant.filter(function(o) { return (o.postopLocation || 'Recovery Room / PACU').indexOf('Recovery') > -1 || (o.postopLocation || '').indexOf('PACU') > -1; }).length;
        var icuCount   = relevant.filter(function(o) { return (o.postopLocation || '').indexOf('ICU') > -1; }).length;
        var wardCount  = relevant.filter(function(o) { return (o.postopLocation || '').indexOf('Ward') > -1 || (o.postopLocation || '').indexOf('HDU') > -1; }).length;
        var readyCount = relevant.filter(function(o) {
            var rec = postOpState[o.operationId];
            if (!rec) return false;
            var criteria = [rec.dischargeCriteriaPainControlled, rec.dischargeCriteriaToleratingDiet, rec.dischargeCriteriaAmbulating, rec.dischargeCriteriaWoundHealing, rec.dischargeCriteriaAfebrile, rec.dischargeCriteriaEducationDone];
            return criteria.filter(Boolean).length >= 5 && o.status !== 'Discharged';
        }).length;

        $('#postOpStatPACU').text(pacuCount);
        $('#postOpStatICU').text(icuCount);
        $('#postOpStatWard').text(wardCount);
        $('#postOpStatReady').text(readyCount);

        _otPoRenderPagination(filtered);
    }

    function _otPoRenderPagination(source) {
        var total    = source.length;
        var totalPgs = Math.max(1, Math.ceil(total / otPoPerPageVal));
        if (otPoCurrentPage > totalPgs) otPoCurrentPage = totalPgs;
        var start = (otPoCurrentPage - 1) * otPoPerPageVal;
        var page  = source.slice(start, start + otPoPerPageVal);

        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="8"><div class="empty-state"><i data-lucide="bed-double"></i><p>No post-op patients</p><p class="empty-sub">Completed surgeries appear here after surgery is marked complete</p></div></td></tr>';
        } else {
            page.forEach(function(op) {
                var rec  = postOpState[op.operationId] || {};
                var loc  = op.postopLocation || rec.postopLocation || 'Recovery Room / PACU';
                var locColor = postOpLocationColor(loc);
                var rec2 = postOpState[op.operationId] || defaultPostOpNotes();
                var hasComp = !rec2.compNone && (rec2.compBleeding || rec2.compInfection || rec2.compWoundDehiscence || rec2.compDVTPE || rec2.compPneumonia || rec2.compUrinaryRetention || rec2.compIleus || rec2.compAKI || rec2.compOther);
                var aldreteTotal = (parseInt(rec2.aldreteActivity) || 0) + (parseInt(rec2.aldreteRespiration) || 0) + (parseInt(rec2.aldreteCirculation) || 0) + (parseInt(rec2.aldreteConsciousness) || 0) + (parseInt(rec2.aldreteOxygen) || 0);
                var postStatus = op.status === 'Discharged' ? '<span class="badge" style="background:rgba(16,185,129,0.1);color:#10B981;border:1px solid rgba(16,185,129,0.3)">Discharged</span>' :
                    (aldreteTotal >= 9 ? '<span class="badge" style="background:rgba(16,185,129,0.1);color:#10B981;border:1px solid rgba(16,185,129,0.3)">PACU Ready ('+aldreteTotal+'/10)</span>' :
                    '<span class="badge" style="background:rgba(239,68,68,0.1);color:#EF4444;border:1px solid rgba(239,68,68,0.3)">In Recovery ('+aldreteTotal+'/10)</span>');
                var completedTime = op.patientOutTime || '-';
                html += '<tr class="clickable-row postop-row" data-op-id="' + esc(op.operationId) + '">' +
                    '<td style="font-size:11px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(op.operationId) + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:8px"><div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(op.patientName) + '</div><div><span style="font-weight:500;font-size:14px">' + esc(op.patientName) + '</span><div style="font-size:11px;color:var(--color-muted-foreground)">' + (op.age ? op.age + 'y ' : '') + esc(op.gender || '') + '</div></div></div></td>' +
                    '<td style="font-size:13px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(op.procedure) + '">' + esc(op.procedure) + '</td>' +
                    '<td style="font-size:12px">' + esc(completedTime) + '</td>' +
                    '<td><span class="badge" style="background:' + locColor + '1a;color:' + locColor + ';border:1px solid ' + locColor + '33;font-size:11px">' + esc(loc) + '</span></td>' +
                    '<td>' + postStatus + '</td>' +
                    '<td>' + (hasComp ? '<span class="badge" style="background:rgba(239,68,68,0.1);color:#EF4444;font-size:10px">Yes</span>' : '<span class="badge" style="background:rgba(16,185,129,0.1);color:#10B981;font-size:10px">None</span>') + '</td>' +
                    '<td class="text-center"><button class="btn-primary btn-sm postop-open-btn" data-op-id="' + esc(op.operationId) + '" style="font-size:11px;padding:5px 10px"><i data-lucide="edit" style="width:12px;height:12px"></i> Notes</button></td>' +
                '</tr>';
            });
        }
        $('#postOpTableBody').html(html);

        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + otPoPerPageVal, total);
        $('#otPoTableInfo').text('Showing ' + from + '–' + to + ' of ' + total + ' records');

        var numsHtml = '';
        var maxBtns = 5, half = Math.floor(maxBtns / 2);
        var pStart = Math.max(1, otPoCurrentPage - half);
        var pEnd   = Math.min(totalPgs, pStart + maxBtns - 1);
        if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
        for (var p = pStart; p <= pEnd; p++) {
            numsHtml += '<button class="opd-page-num' + (p === otPoCurrentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        $('#otPoPageNums').html(numsHtml);
        $('#otPoPrevPage').prop('disabled', otPoCurrentPage <= 1);
        $('#otPoNextPage').prop('disabled', otPoCurrentPage >= totalPgs);

        lucide.createIcons();
    }

    $('#postOpSearch').on('input', function() { otPoCurrentPage = 1; renderPostOpTab(); });

    $(document).on('click', '#otPoPageNums .opd-page-num', function() {
        otPoCurrentPage = parseInt($(this).data('page')); renderPostOpTab();
    });
    $(document).on('click', '#otPoPrevPage', function() {
        if (otPoCurrentPage > 1) { otPoCurrentPage--; renderPostOpTab(); }
    });
    $(document).on('click', '#otPoNextPage', function() {
        otPoCurrentPage++; renderPostOpTab();
    });

    $(document).on('click', '.postop-row', function(e) {
        if ($(e.target).closest('.postop-open-btn').length) return;
        var opId = $(this).data('op-id');
        if (opId) openPostOpRecord(opId);
    });
    $(document).on('click', '.postop-open-btn', function(e) {
        e.stopPropagation();
        var opId = $(this).data('op-id');
        if (opId) openPostOpRecord(opId);
    });

    function loadOtPostopFormSections() {
        return $.get('/api/ot/postop-form-sections').done(function(sections) {
            otPostopFormSections = sections || [];
        }).fail(function() { otPostopFormSections = []; });
    }

    function renderOtPostopCustomSectionContent(sec) {
        var data = otCustomPostopData[sec.key] || {};
        var fields = sec.fields || [];
        var html = '';
        if (!fields.length) {
            return '<p style="font-size:13px;color:var(--color-muted-foreground)">No fields configured for this section.</p>';
        }
        fields.forEach(function(f) {
            var fid = 'pocust_' + sec.key + '_' + f.name;
            var val = data[f.name] !== undefined ? data[f.name] : (f.defaultValue || '');
            var input = '';
            if (f.type === 'text' || f.type === 'email' || f.type === 'number' || f.type === 'date' || f.type === 'time') {
                input = '<input type="' + f.type + '" class="form-control" id="' + fid + '" value="' + esc(val) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>';
            } else if (f.type === 'textarea') {
                input = '<textarea class="form-control" id="' + fid + '" rows="3"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>' + esc(val) + '</textarea>';
            } else if (f.type === 'dropdown') {
                var opts = (f.options || []).map(function(o) { return '<option value="' + esc(o) + '"' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('');
                input = '<select class="form-select" id="' + fid + '">' + opts + '</select>';
            } else if (f.type === 'multi-select') {
                input = (f.options || []).map(function(o) {
                    var chk = Array.isArray(val) ? val.indexOf(o) >= 0 : false;
                    return '<div class="form-check"><input class="form-check-input" type="checkbox" id="' + fid + '_' + o.replace(/\s/g,'_') + '" value="' + esc(o) + '"' + (chk ? ' checked' : '') + ' data-ms-group-po="' + fid + '"> <label class="form-check-label" for="' + fid + '_' + o.replace(/\s/g,'_') + '">' + esc(o) + '</label></div>';
                }).join('');
            } else if (f.type === 'radio') {
                input = (f.options || []).map(function(o) {
                    return '<div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="' + fid + '" id="' + fid + '_' + o.replace(/\s/g,'_') + '" value="' + esc(o) + '"' + (val === o ? ' checked' : '') + '> <label class="form-check-label" for="' + fid + '_' + o.replace(/\s/g,'_') + '">' + esc(o) + '</label></div>';
                }).join('');
            } else if (f.type === 'checkbox') {
                var chkd = val === true || val === 'true' || val === 1 || val === '1';
                input = '<div class="form-check"><input class="form-check-input" type="checkbox" id="' + fid + '"' + (chkd ? ' checked' : '') + '> <label class="form-check-label" for="' + fid + '">' + esc(f.label) + '</label></div>';
            } else if (f.type === 'password') {
                input = '<input type="password" class="form-control" id="' + fid + '" value="' + esc(val) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>';
            }
            if (f.type !== 'checkbox') {
                html += '<div class="mb-3"><label class="form-label" style="font-size:12px;font-weight:600">' + esc(f.label) + (f.required ? ' <span style="color:#EF4444">*</span>' : '') + '</label>' + input + '</div>';
            } else {
                html += '<div class="mb-3">' + input + '</div>';
            }
        });
        return html;
    }

    function saveOtPostopCustomFormValues() {
        if (!selectedPostOpId) return;
        var customData = {};
        otPostopFormSections.filter(function(s) { return !s.isDefault && s.isEnabled; }).forEach(function(sec) {
            var sectionData = {};
            (sec.fields || []).forEach(function(f) {
                var fid = 'pocust_' + sec.key + '_' + f.name;
                var el = document.getElementById(fid);
                if (f.type === 'multi-select') {
                    var checked = [];
                    document.querySelectorAll('[data-ms-group-po="' + fid + '"]:checked').forEach(function(cb) { checked.push(cb.value); });
                    sectionData[f.name] = checked;
                } else if (f.type === 'checkbox') {
                    sectionData[f.name] = el ? el.checked : false;
                } else if (el) {
                    sectionData[f.name] = el.value;
                }
            });
            customData[sec.key] = sectionData;
        });
        if (Object.keys(customData).length > 0) {
            otCustomPostopData = Object.assign({}, otCustomPostopData, customData);
            $.ajax({
                url: '/api/ot/operations/' + encodeURIComponent(selectedPostOpId) + '/custom-postop-data',
                method: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify({ customPostopData: otCustomPostopData })
            });
        }
    }

    function openPostOpRecord(operationId) {
        var op = operations.find(function(o) { return o.operationId === operationId; });
        if (!op) return;
        selectedPostOpId = operationId;
        if (!postOpState[operationId]) postOpState[operationId] = defaultPostOpNotes();

        var p1 = $.get('/api/ot/postop/' + encodeURIComponent(operationId));
        var p2 = loadOtPostopFormSections();
        $.when(p1, p2).always(function(r1) {
            var res = Array.isArray(r1) ? r1[0] : (r1 || {});
            if (res && res.postopNotes && Object.keys(res.postopNotes).length > 0) {
                postOpState[operationId] = $.extend(defaultPostOpNotes(), res.postopNotes);
            }
            if (res && res.postopLocation) { postOpState[operationId].postopLocation = res.postopLocation; op.postopLocation = res.postopLocation; }
            if (res && res.expectedDischargeDate) postOpState[operationId].expectedDischargeDate = res.expectedDischargeDate;
            if (res && res.customPostopData) otCustomPostopData = res.customPostopData;
            renderPostOpSheet(op);
            new bootstrap.Offcanvas(document.getElementById('otPostOpSheet')).show();
            startPostOpAutoSave();
        });
    }

    function startPostOpAutoSave() {
        if (postOpAutoSaveTimer) clearInterval(postOpAutoSaveTimer);
        postOpAutoSaveTimer = setInterval(function() {
            if (selectedPostOpId) savePostOpRecord(false, false);
        }, 30000);
        document.getElementById('otPostOpSheet').addEventListener('hidden.bs.offcanvas', function() {
            if (postOpAutoSaveTimer) { clearInterval(postOpAutoSaveTimer); postOpAutoSaveTimer = null; }
            selectedPostOpId = null;
        }, { once: true });
    }

    function savePostOpRecord(showFeedback, discharge) {
        if (!selectedPostOpId) return;
        saveOtPostopCustomFormValues();
        var rec = postOpState[selectedPostOpId] || defaultPostOpNotes();
        var url = discharge ? '/api/ot/postop/' + encodeURIComponent(selectedPostOpId) + '/discharge' : '/api/ot/postop/' + encodeURIComponent(selectedPostOpId);
        var payload = { postopNotes: rec, postopLocation: rec.postopLocation, expectedDischargeDate: rec.expectedDischargeDate || null };
        $.ajax({ url: url, method: 'POST', contentType: 'application/json', data: JSON.stringify(payload) }).done(function() {
            var op = operations.find(function(o) { return o.operationId === selectedPostOpId; });
            if (op) {
                op.postopLocation = rec.postopLocation;
                if (discharge) op.status = 'Discharged';
            }
            renderPostOpTab();
            if (showFeedback && !discharge) {
                var btn  = $('#btnSavePostOp');
                var orig = btn.html();
                btn.html('<i data-lucide="check" style="width:14px;height:14px"></i> Saved!');
                lucide.createIcons();
                setTimeout(function() { btn.html(orig); lucide.createIcons(); }, 2000);
            }
        });
    }

    function renderPostOpSheet(op) {
        function isSectionEnabled_po(key) {
            if (!otPostopFormSections.length) return true;
            var sec = otPostopFormSections.find(function(s) { return s.key === key; });
            return sec ? sec.isEnabled : true;
        }

        var rec = postOpState[op.operationId] || defaultPostOpNotes();
        var loc = rec.postopLocation || 'Recovery Room / PACU';
        var locColor = postOpLocationColor(loc);
        var aldreteTotal = (parseInt(rec.aldreteActivity) || 0) + (parseInt(rec.aldreteRespiration) || 0) + (parseInt(rec.aldreteCirculation) || 0) + (parseInt(rec.aldreteConsciousness) || 0) + (parseInt(rec.aldreteOxygen) || 0);
        var aldreteReady = aldreteTotal >= 9;

        // Calculate POD
        var surgeryDate = op.surgeryDate ? new Date(op.surgeryDate) : new Date();
        var podDays = Math.floor((Date.now() - surgeryDate.getTime()) / 86400000);

        // Discharge criteria count
        var dischargeCriteria = [
            { key: 'dischargeCriteriaPainControlled', label: 'Pain controlled on oral medications' },
            { key: 'dischargeCriteriaToleratingDiet', label: 'Tolerating diet' },
            { key: 'dischargeCriteriaAmbulating', label: 'Ambulating adequately' },
            { key: 'dischargeCriteriaWoundHealing', label: 'Wound healing well' },
            { key: 'dischargeCriteriaDrainsRemoved', label: 'Drains removed (if applicable)' },
            { key: 'dischargeCriteriaAfebrile', label: 'Afebrile >24 hours' },
            { key: 'dischargeCriteriaEducationDone', label: 'Patient/family education done' },
        ];
        var criteriaMet = dischargeCriteria.filter(function(c) { return rec[c.key]; }).length;
        var discharged = op.status === 'Discharged';

        $('#postOpLocationBadge').text(loc).css({ background: locColor + '1a', color: locColor });

        var html = '<div style="display:grid;grid-template-columns:1fr 300px;height:100%;min-height:0">';
        html += '<div style="overflow-y:auto;padding:24px;border-right:1px solid var(--color-border)">';

        // Patient header
        html += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="display:flex;align-items:center;gap:16px">' +
                '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff;font-size:16px;font-weight:700">' + getInitials(op.patientName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
                        '<h3 style="font-size:16px;font-weight:600;margin:0">' + esc(op.patientName) + '</h3>' +
                        '<span class="badge badge-outline" style="font-size:10px">' + esc(op.mrn) + '</span>' +
                        '<span class="badge" style="background:' + locColor + '1a;color:' + locColor + ';font-size:10px">' + esc(loc) + '</span>' +
                    '</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:6px">' +
                        '<span style="font-size:12px"><strong>Procedure:</strong> ' + esc(op.procedure) + '</span>' +
                        '<span style="font-size:12px"><strong>Surgery Date:</strong> ' + (op.surgeryDate ? new Date(op.surgeryDate).toLocaleDateString() : '-') + '</span>' +
                        '<span style="font-size:12px"><strong>POD:</strong> ' + (podDays >= 0 ? 'POD-' + podDays : 'Day of surgery') + '</span>' +
                        '<span style="font-size:12px"><strong>Surgeon:</strong> ' + esc(op.surgeon || '-') + '</span>' +
                    '</div>' +
                '</div>' +
            '</div></div>';

        // Location selector
        if (isSectionEnabled_po('current_location')) html += poSection('Current Location', 'map-pin',
            '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:0">' +
            ['Recovery Room / PACU','ICU','HDU','Ward','Discharged'].map(function(l) {
                var c = postOpLocationColor(l);
                var active = loc === l;
                return '<button class="po-location-btn" data-location="' + l + '" style="padding:8px 14px;border-radius:8px;border:1px solid ' + (active ? c : 'var(--color-border)') + ';background:' + (active ? c + '1a' : 'var(--color-card)') + ';color:' + (active ? c : 'var(--color-foreground)') + ';font-size:12px;font-weight:' + (active ? '700' : '500') + ';cursor:pointer">' + l + '</button>';
            }).join('') +
            '</div>'
        );

        // Section 1: Aldrete Score
        var aldreteOpts = {
            aldreteActivity: [
                { val: 2, label: 'Able to move 4 extremities voluntarily' },
                { val: 1, label: 'Able to move 2 extremities voluntarily' },
                { val: 0, label: 'Unable to move extremities' }
            ],
            aldreteRespiration: [
                { val: 2, label: 'Breathes deeply, coughs freely' },
                { val: 1, label: 'Dyspnea or shallow breathing' },
                { val: 0, label: 'Apneic' }
            ],
            aldreteCirculation: [
                { val: 2, label: 'BP ±20% of pre-anesthetic level' },
                { val: 1, label: 'BP ±20–50% of pre-anesthetic level' },
                { val: 0, label: 'BP ±50% of pre-anesthetic level' }
            ],
            aldreteConsciousness: [
                { val: 2, label: 'Fully awake' },
                { val: 1, label: 'Arousable on calling' },
                { val: 0, label: 'Not responding' }
            ],
            aldreteOxygen: [
                { val: 2, label: 'SPO₂ >92% on room air' },
                { val: 1, label: 'Needs O₂ to maintain SPO₂ >90%' },
                { val: 0, label: 'SPO₂ <90% even with supplemental O₂' }
            ]
        };
        var aldreteLabels = { aldreteActivity: 'Activity', aldreteRespiration: 'Respiration', aldreteCirculation: 'Circulation', aldreteConsciousness: 'Consciousness', aldreteOxygen: 'Oxygen Saturation' };

        var aldreteHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        Object.keys(aldreteOpts).forEach(function(key) {
            aldreteHtml += '<div>' + poFormGroup(aldreteLabels[key] + ' (0-2)', '<select class="form-select pofield" data-key="' + key + '" id="po_' + key + '">' +
                aldreteOpts[key].map(function(o) { return '<option value="' + o.val + '"' + (parseInt(rec[key]) === o.val ? ' selected' : '') + '>' + o.val + ' — ' + o.label + '</option>'; }).join('') +
            '</select>') + '</div>';
        });
        aldreteHtml += '</div>';
        aldreteHtml += '<div style="display:flex;align-items:center;gap:16px;padding:14px;border-radius:10px;background:' + (aldreteReady ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') + ';border:1px solid ' + (aldreteReady ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') + '">' +
            '<div style="text-align:center;min-width:60px"><p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Aldrete Score</p><p style="font-size:32px;font-weight:800;margin:0;color:' + (aldreteReady ? '#10B981' : '#EF4444') + '">' + aldreteTotal + '<span style="font-size:14px;font-weight:400">/10</span></p></div>' +
            '<div><p style="font-size:13px;font-weight:600;margin:0;color:' + (aldreteReady ? '#10B981' : '#EF4444') + '">' + (aldreteReady ? '✓ Ready for PACU discharge' : '⚠ Score <9 — Continue monitoring') + '</p><p style="font-size:11px;color:var(--color-muted-foreground);margin:2px 0 0">Score ≥9 required for discharge from recovery room</p></div>' +
        '</div>';

        if (isSectionEnabled_po('pacu_assessment')) html += poSection('Section 1: Immediate Post-Op Assessment (PACU / Recovery)', 'activity', aldreteHtml);

        // Recovery Vitals
        if (isSectionEnabled_po('recovery_vitals')) html += poSection('Recovery Vitals (Every 15 Minutes)', 'heart-pulse',
            '<div style="overflow-x:auto;margin-bottom:12px"><table class="data-table" style="font-size:11px"><thead><tr><th>Time</th><th>BP</th><th>HR</th><th>RR</th><th>Temp</th><th>SPO2</th><th>Pain</th><th style="width:30px"></th></tr></thead><tbody id="recoveryVitalsBody">' +
            (rec.recoveryVitals.length === 0 ? '<tr><td colspan="8" style="text-align:center;color:var(--color-muted-foreground);padding:12px">No vitals recorded yet</td></tr>' :
                rec.recoveryVitals.map(function(v, i) {
                    var painColor = parseInt(v.painScore) >= 7 ? '#EF4444' : parseInt(v.painScore) >= 4 ? '#F97316' : '#10B981';
                    return '<tr><td style="font-weight:500">' + esc(v.time) + '</td><td>' + esc(v.bp) + '</td><td>' + esc(v.hr) + '</td><td>' + esc(v.rr) + '</td><td>' + esc(v.temp) + '</td><td>' + esc(v.spo2) + '</td>' +
                        '<td><span style="font-weight:700;color:' + painColor + '">' + esc(v.painScore) + '/10</span></td>' +
                        '<td><button class="btn-ghost po-remove-vital" data-idx="' + i + '"><i data-lucide="trash-2" style="width:12px;height:12px;color:var(--color-destructive)"></i></button></td></tr>';
                }).join('')) +
            '</tbody></table></div>' +
            '<div style="background:var(--color-muted);border-radius:8px;padding:12px">' +
                '<p style="font-size:11px;font-weight:600;margin-bottom:8px">Add Reading</p>' +
                '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;align-items:end">' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">Time</label><input type="time" class="form-control" id="newPoVitTime" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">BP</label><input type="text" class="form-control" id="newPoVitBP" placeholder="120/80" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">HR</label><input type="text" class="form-control" id="newPoVitHR" placeholder="72" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">RR</label><input type="text" class="form-control" id="newPoVitRR" placeholder="16" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">Temp</label><input type="text" class="form-control" id="newPoVitTemp" placeholder="37.0" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">SPO2</label><input type="text" class="form-control" id="newPoVitSPO2" placeholder="98" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">Pain(0-10)</label><input type="number" class="form-control" id="newPoVitPain" placeholder="0" min="0" max="10" style="font-size:11px;padding:4px 6px"></div>' +
                    '<button class="btn-primary btn-sm" id="btnAddPoVital" style="font-size:11px;padding:5px 8px;height:32px">Add</button>' +
                '</div>' +
            '</div>'
        );

        // Pain & Nausea
        var painScore = parseInt(rec.painScore) || 0;
        var painColors = ['#10B981','#10B981','#16A34A','#84CC16','#EAB308','#EAB308','#F97316','#F97316','#EF4444','#EF4444','#DC2626'];
        if (isSectionEnabled_po('pain_nausea')) html += poSection('Pain Assessment & Nausea/Vomiting', 'thermometer',
            '<div style="margin-bottom:16px">' +
                '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Pain Score (0–10)</p>' +
                '<div style="display:flex;gap:6px;margin-bottom:8px">' +
                [0,1,2,3,4,5,6,7,8,9,10].map(function(n) {
                    var c = painColors[n];
                    var active = painScore === n;
                    return '<button class="po-pain-btn" data-pain="' + n + '" style="width:36px;height:36px;border-radius:8px;border:2px solid ' + (active ? c : 'var(--color-border)') + ';background:' + (active ? c : 'var(--color-card)') + ';color:' + (active ? '#fff' : 'var(--color-foreground)') + ';font-weight:' + (active ? '700' : '500') + ';font-size:13px;cursor:pointer">' + n + '</button>';
                }).join('') +
                '</div>' +
                '<p style="font-size:11px;color:var(--color-muted-foreground);margin:0">' +
                    (painScore <= 3 ? 'Mild pain — Adequate control' : painScore <= 6 ? 'Moderate pain — Consider additional analgesia' : 'Severe pain — Urgent pain management required') +
                '</p>' +
            '</div>' +
            poFormGroup('Pain location', '<input type="text" class="form-control pofield" data-key="painLocation" id="po_painLocation" value="' + esc(rec.painLocation) + '" placeholder="e.g. Surgical site, abdomen">') +
            '<p style="font-size:12px;font-weight:600;margin:12px 0 8px">Analgesics Given</p>' +
            poMedTable(rec.analgesicsGiven, 'po_addAnalgesic') +
            '<div style="margin-top:12px">' +
                poChk('nauseaPresent', 'nauseaPresent', 'Nausea / Vomiting present', rec.nauseaPresent) +
            '</div>' +
            (rec.nauseaPresent ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">' +
                poFormGroup('Severity', '<select class="form-select pofield" data-key="nauseaSeverity" id="po_nauseaSeverity">' + ['Mild','Moderate','Severe'].map(function(s){return '<option value="'+s+'"'+(rec.nauseaSeverity===s?' selected':'')+'>'+s+'</option>';}).join('') + '</select>') +
                poFormGroup('Anti-emetics given', '<input type="text" class="form-control pofield" data-key="antiemeticsGiven" id="po_antiemeticsGiven" value="' + esc(rec.antiemeticsGiven) + '" placeholder="e.g. Ondansetron 4mg IV">') +
            '</div>' : '')
        );

        // Section 2: Daily Progress Notes
        var latestPod = rec.podNotes.length > 0 ? rec.podNotes[rec.podNotes.length - 1] : null;
        if (isSectionEnabled_po('pod_progress')) html += poSection('Section 2: Post-Op Day Progress Notes', 'clipboard-list',
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
                '<p style="font-size:12px;font-weight:600;margin:0">' + rec.podNotes.length + ' progress note(s) recorded</p>' +
                '<button class="btn-primary btn-sm" id="btnAddPODNote" style="font-size:11px"><i data-lucide="plus" style="width:12px;height:12px"></i> Add Today\'s Note (POD-' + podDays + ')</button>' +
            '</div>' +
            (rec.podNotes.length === 0 ? '<div style="text-align:center;padding:24px;color:var(--color-muted-foreground);font-size:12px">No progress notes added yet. Click "Add Today\'s Note" to begin.</div>' :
                '<div style="display:flex;flex-direction:column;gap:12px">' +
                rec.podNotes.map(function(note, idx) {
                    var woundBadges = (note.woundStatus || []).map(function(w) {
                        var wc = w === 'Clean and dry' ? '#10B981' : w === 'Signs of infection' || w === 'Dehiscence' ? '#EF4444' : '#F97316';
                        return '<span class="badge" style="background:' + wc + '1a;color:' + wc + ';font-size:9px">' + w + '</span>';
                    }).join(' ');
                    return '<div style="border:1px solid var(--color-border);border-radius:10px;padding:14px">' +
                        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
                            '<div style="display:flex;align-items:center;gap:8px"><span class="badge badge-outline" style="font-size:11px;font-weight:700">POD-' + (note.pod || idx) + '</span><span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(note.date || '') + '</span></div>' +
                            '<button class="btn-ghost po-remove-pod" data-idx="' + idx + '" style="font-size:10px;padding:2px 6px"><i data-lucide="trash-2" style="width:11px;height:11px"></i></button>' +
                        '</div>' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">' +
                            '<div><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">Status</p><span class="badge" style="background:' + (note.patientStatus==='Improving'?'rgba(16,185,129,0.1);color:#10B981':note.patientStatus==='Deteriorating'?'rgba(239,68,68,0.1);color:#EF4444':'rgba(59,130,246,0.1);color:#3B82F6') + '">' + esc(note.patientStatus || 'Stable') + '</span></div>' +
                            '<div><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">Pain Control</p><span class="badge" style="background:' + (note.painControl==='Adequate'?'rgba(16,185,129,0.1);color:#10B981':'rgba(239,68,68,0.1);color:#EF4444') + '">' + esc(note.painControl || 'Adequate') + '</span></div>' +
                            '<div><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">Diet</p><span style="font-size:11px">' + esc(note.dietTolerated ? 'Tolerated' : 'Not tolerated') + '</span></div>' +
                        '</div>' +
                        (woundBadges ? '<div style="margin-bottom:6px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 3px">Wound</p>' + woundBadges + '</div>' : '') +
                        (note.plan ? '<div style="background:var(--color-muted);border-radius:6px;padding:8px;margin-top:6px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 2px">Plan</p><p style="font-size:12px;margin:0">' + esc(note.plan) + '</p></div>' : '') +
                    '</div>';
                }).join('') +
                '</div>')
        );

        // POD Note entry form (inline - shown when btnAddPODNote clicked)
        html += '<div id="podNoteForm" style="display:none;background:var(--color-card);border:1px solid var(--midnight-blue);border-radius:12px;padding:20px;margin-bottom:16px">' +
            '<h4 style="font-size:14px;font-weight:600;margin-bottom:16px">New Progress Note — POD-' + podDays + '</h4>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">' +
                '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:4px">Patient Status</label>' +
                    '<select class="form-select" id="podPatientStatus">' + ['Improving','Stable','Deteriorating'].map(function(s){return '<option value="'+s+'">'+s+'</option>';}).join('') + '</select></div>' +
                '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:4px">Pain Control</label>' +
                    '<select class="form-select" id="podPainControl">' + ['Adequate','Inadequate'].map(function(s){return '<option value="'+s+'">'+s+'</option>';}).join('') + '</select></div>' +
                '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:4px">Drain Output (ml)</label>' +
                    '<input type="number" class="form-control" id="podDrainOutput" placeholder="0"></div>' +
            '</div>' +
            '<p style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin-bottom:8px">Wound Status</p>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">' +
            ['Clean and dry','Serous discharge','Bloody discharge','Signs of infection','Dehiscence'].map(function(w, i) {
                return '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;padding:6px;border:1px solid var(--color-border);border-radius:6px"><input type="checkbox" class="pod-wound-chk" value="' + w + '" style="width:12px;height:12px"> ' + w + '</label>';
            }).join('') +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
                '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:4px">Urine Output (ml)</label><input type="number" class="form-control" id="podUrineOutput" placeholder="0"></div>' +
                '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:4px">Ambulation</label><input type="text" class="form-control" id="podAmbulation" placeholder="e.g. Walking with assistance"></div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
                '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:4px">Diet Tolerated</label><select class="form-select" id="podDietTolerated"><option value="1">Yes</option><option value="0">No</option></select></div>' +
                '<div><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:4px">Bowel Movement</label><select class="form-select" id="podBowelMovement"><option value="0">Not yet</option><option value="1">Yes — bowel open</option></select></div>' +
            '</div>' +
            '<div style="margin-bottom:12px"><label style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;display:block;margin-bottom:4px">Plan for today</label><textarea class="form-control" id="podPlan" rows="3" placeholder="Diet advancement, activity, drain removal plans, medication changes, discharge planning..."></textarea></div>' +
            '<div style="display:flex;gap:8px"><button class="btn-primary btn-sm" id="btnSavePODNote"><i data-lucide="check" style="width:12px;height:12px"></i> Save Note</button><button class="btn-outline btn-sm" id="btnCancelPODNote">Cancel</button></div>' +
        '</div>';

        // Section 3: Complications
        if (isSectionEnabled_po('complications')) html += poSection('Section 3: Post-Op Complications', 'alert-circle',
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">' +
                poChkSmall('poCompNone', 'compNone', 'None', rec.compNone) +
                poChkSmall('poCompBleeding', 'compBleeding', 'Bleeding', rec.compBleeding) +
                poChkSmall('poCompInfection', 'compInfection', 'Infection', rec.compInfection) +
                poChkSmall('poCompDehiscence', 'compWoundDehiscence', 'Wound dehiscence', rec.compWoundDehiscence) +
                poChkSmall('poCompDVT', 'compDVTPE', 'DVT / PE', rec.compDVTPE) +
                poChkSmall('poCompPneumonia', 'compPneumonia', 'Pneumonia', rec.compPneumonia) +
                poChkSmall('poCompUrinary', 'compUrinaryRetention', 'Urinary retention', rec.compUrinaryRetention) +
                poChkSmall('poCompIleus', 'compIleus', 'Ileus', rec.compIleus) +
                poChkSmall('poCompAKI', 'compAKI', 'Acute kidney injury', rec.compAKI) +
                poChkSmall('poCompOther', 'compOther', 'Other', rec.compOther) +
            '</div>' +
            (!rec.compNone ? poFormGroup('Complication management', '<textarea class="form-control pofield" data-key="compManagement" id="po_compManagement" rows="3" placeholder="Describe management plan for complications...">' + esc(rec.compManagement) + '</textarea>') : '')
        );

        // Section 4: Discharge Planning
        if (isSectionEnabled_po('discharge_planning')) html += poSection('Section 4: Discharge Planning', 'log-out',
            poFormGroup('Expected discharge date', '<input type="date" class="form-control pofield" data-key="expectedDischargeDate" id="po_expectedDischargeDate" value="' + esc(rec.expectedDischargeDate) + '">') +
            '<p style="font-size:12px;font-weight:600;margin:12px 0 8px">Discharge Criteria</p>' +
            '<div style="background:var(--color-muted);border-radius:10px;padding:14px;margin-bottom:16px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
                    '<p style="font-size:12px;font-weight:600;margin:0">' + criteriaMet + ' / ' + dischargeCriteria.length + ' criteria met</p>' +
                    '<span style="font-size:11px;font-weight:600;color:' + (criteriaMet >= 6 ? '#10B981' : '#F97316') + '">' + (criteriaMet >= 6 ? 'Ready for discharge' : 'Not yet ready') + '</span>' +
                '</div>' +
                '<div style="background:var(--color-border);border-radius:4px;height:6px;margin-bottom:12px"><div style="background:' + (criteriaMet >= 6 ? '#10B981' : '#F97316') + ';height:6px;border-radius:4px;width:' + Math.round((criteriaMet / dischargeCriteria.length) * 100) + '%"></div></div>' +
                dischargeCriteria.map(function(c) { return poChk('dc_' + c.key, c.key, c.label, rec[c.key]); }).join('') +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' +
                poFormGroup('Follow-up date', '<input type="date" class="form-control pofield" data-key="followUpDate" id="po_followUpDate" value="' + esc(rec.followUpDate) + '">') +
                poFormGroup('Follow-up doctor', '<select class="form-select pofield" data-key="followUpDoctor" id="po_followUpDoctor"><option value="">-- Select --</option>' + doctors.map(function(d){var n='Dr. '+d.firstName+' '+d.lastName;return '<option value="'+n+'"'+(rec.followUpDoctor===n?' selected':'')+'>'+n+'</option>';}).join('') + '</select>') +
                poFormGroup('Stitch removal date', '<input type="date" class="form-control pofield" data-key="stitchRemovalDate" id="po_stitchRemovalDate" value="' + esc(rec.stitchRemovalDate) + '">') +
            '</div>'
        );

        // Custom post-op sections
        otPostopFormSections.filter(function(s) { return !s.isDefault && s.isEnabled; }).forEach(function(sec) {
            html += poSection(esc(sec.label), 'layout-panel-left', renderOtPostopCustomSectionContent(sec));
        });

        html += '</div>';

        // Right sidebar
        html += '<div style="display:flex;flex-direction:column;overflow:hidden">';
        html += '<div style="padding:16px;overflow-y:auto;flex:1">';

        // Aldrete summary
        html += '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:10px">Aldrete Score</h3>';
        html += '<div style="background:' + (aldreteReady ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)') + ';border:1px solid ' + (aldreteReady ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') + ';border-radius:10px;padding:12px;margin-bottom:16px;text-align:center">' +
            '<p style="font-size:32px;font-weight:800;margin:0;color:' + (aldreteReady ? '#10B981' : '#EF4444') + '">' + aldreteTotal + '<span style="font-size:14px;font-weight:400">/10</span></p>' +
            '<p style="font-size:11px;margin:2px 0 0;color:' + (aldreteReady ? '#10B981' : '#EF4444') + ';font-weight:600">' + (aldreteReady ? 'PACU Ready' : 'Continue Monitoring') + '</p>' +
        '</div>';

        // Pain
        html += '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:10px">Pain Score</h3>';
        var pc = painColors[painScore] || '#10B981';
        html += '<div style="background:' + pc + '1a;border:1px solid ' + pc + '33;border-radius:10px;padding:12px;margin-bottom:16px;text-align:center">' +
            '<p style="font-size:32px;font-weight:800;margin:0;color:' + pc + '">' + (rec.painScore || 0) + '<span style="font-size:14px;font-weight:400">/10</span></p>' +
            '<p style="font-size:11px;margin:2px 0 0;color:' + pc + '">' + (painScore <= 3 ? 'Mild' : painScore <= 6 ? 'Moderate' : 'Severe') + '</p>' +
        '</div>';

        // Discharge criteria
        html += '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:10px">Discharge Criteria</h3>';
        html += '<div style="margin-bottom:16px">';
        dischargeCriteria.forEach(function(c) {
            html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px"><span style="color:' + (rec[c.key] ? '#10B981' : '#CBD5E1') + ';font-size:14px">' + (rec[c.key] ? '✓' : '○') + '</span><span style="font-size:11px;color:' + (rec[c.key] ? 'var(--color-foreground)' : 'var(--color-muted-foreground)') + '">' + c.label + '</span></div>';
        });
        html += '<div style="background:var(--color-border);border-radius:4px;height:6px;margin-top:8px"><div style="background:' + (criteriaMet >= 6 ? '#10B981' : '#F97316') + ';height:6px;border-radius:4px;width:' + Math.round((criteriaMet / dischargeCriteria.length) * 100) + '%"></div></div>';
        html += '<p style="font-size:11px;text-align:right;margin:4px 0 0;color:var(--color-muted-foreground)">' + criteriaMet + '/' + dischargeCriteria.length + '</p>';
        html += '</div>';

        // Latest vitals
        if (rec.recoveryVitals.length > 0) {
            var last = rec.recoveryVitals[rec.recoveryVitals.length - 1];
            html += '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:10px">Latest Vitals</h3>';
            html += '<div style="background:var(--color-muted);border-radius:8px;padding:10px;margin-bottom:16px;font-size:12px">';
            html += '<p style="font-size:10px;color:var(--color-muted-foreground);margin-bottom:6px">at ' + esc(last.time) + '</p>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' +
                '<span>BP: <strong>' + esc(last.bp) + '</strong></span><span>HR: <strong>' + esc(last.hr) + '</strong></span>' +
                '<span>SPO2: <strong>' + esc(last.spo2) + '%</strong></span><span>Temp: <strong>' + esc(last.temp) + '</strong></span>' +
                '</div></div>';
        }

        html += '</div>';
        html += '<div style="padding:16px;border-top:1px solid var(--color-border);display:flex;flex-direction:column;gap:10px">';
        if (discharged) {
            /* Locked — show read-only badge + print only */
            html += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;' +
                'background:#f0fdf4;border:1.5px solid var(--aqua-mint);border-radius:10px;padding:12px 16px">' +
                '<i data-lucide="lock" style="width:16px;height:16px;color:#10b981"></i>' +
                '<span style="font-size:13px;font-weight:600;color:#166534">Patient Discharged — Read Only</span>' +
                '</div>';
            html += '<button class="btn-outline btn-sm" id="btnPrintPostOp" style="width:100%"><i data-lucide="printer" style="width:14px;height:14px"></i> Print Post-Op Note</button>';
        } else {
            /* All fields optional — button always active (aqua-mint) */
            html += '<button class="btn-outline btn-sm" id="btnSavePostOp" style="width:100%"><i data-lucide="save" style="width:14px;height:14px"></i> Save Note</button>';
            html += '<button class="btn-outline btn-sm" id="btnPrintPostOp" style="width:100%"><i data-lucide="printer" style="width:14px;height:14px"></i> Print Post-Op Note</button>';
            html += '<button class="btn-primary" id="btnDischargePatient"' +
                ' style="width:100%;background:var(--aqua-mint);color:var(--midnight-blue);border-color:var(--aqua-mint);font-weight:700">' +
                '<i data-lucide="log-out" style="width:14px;height:14px"></i> Discharge Patient</button>';
        }
        html += '</div></div>';

        html += '</div>';
        $('#otPostOpSheetBody').html(html);
        lucide.createIcons();
        bindPostOpEvents(op, podDays, dischargeCriteria);

        /* ── Lock post-op sheet if patient already discharged ── */
        if (discharged) {
            var $poLeft = $('#otPostOpSheetBody').find('div[style*="overflow-y:auto"]').first();
            $poLeft.find('input, select, textarea, button').prop('disabled', true);
            $poLeft.find('label').css('cursor', 'default');
            $poLeft.css('opacity', '0.85');
            $poLeft.prepend(
                '<div style="display:flex;align-items:center;gap:10px;' +
                    'background:#f0fdf4;border:1.5px solid #10b981;border-radius:10px;' +
                    'padding:12px 16px;margin-bottom:20px">' +
                    '<i data-lucide="lock" style="width:18px;height:18px;color:#10b981"></i>' +
                    '<div>' +
                        '<div style="font-size:13px;font-weight:700;color:#166534">Patient Discharged &amp; Record Locked</div>' +
                        '<div style="font-size:12px;color:#16a34a">This post-operative record is read-only and cannot be modified.</div>' +
                    '</div>' +
                '</div>'
            );
            lucide.createIcons();
        }
    }

    function poSection(title, icon, content) {
        return '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--color-border);background:var(--color-muted);border-radius:12px 12px 0 0">' +
                '<i data-lucide="' + icon + '" style="width:16px;height:16px;color:var(--midnight-blue)"></i>' +
                '<h4 style="font-size:13px;font-weight:600;margin:0">' + title + '</h4>' +
            '</div><div style="padding:16px 20px">' + content + '</div></div>';
    }

    function poFormGroup(label, input) {
        return '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase;display:block;margin-bottom:4px">' + label + '</label>' + input + '</div>';
    }

    function poChk(id, key, label, checked) {
        return '<div style="margin-bottom:8px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">' +
            '<input type="checkbox" class="pofield pochk" data-key="' + key + '" id="po_' + id + '"' + (checked ? ' checked' : '') + ' style="width:15px;height:15px;accent-color:var(--midnight-blue)">' +
            (checked ? '<i data-lucide="check-circle" style="width:15px;height:15px;color:#10B981"></i>' : '<i data-lucide="circle" style="width:15px;height:15px;color:var(--color-border)"></i>') +
            '<span>' + label + '</span></label></div>';
    }

    function poChkSmall(id, key, label, checked) {
        return '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;padding:6px;border:1px solid '+(checked?'var(--midnight-blue)':'var(--color-border)')+';border-radius:6px;background:'+(checked?'rgba(6,7,64,0.04)':'var(--color-card)')+'">' +
            '<input type="checkbox" class="pofield pochk" data-key="' + key + '" id="po_' + id + '"' + (checked ? ' checked' : '') + ' style="width:13px;height:13px;accent-color:var(--midnight-blue)">' +
            (checked ? '<i data-lucide="check-circle" style="width:12px;height:12px;color:#10B981"></i>' : '<i data-lucide="circle" style="width:12px;height:12px;color:var(--color-border)"></i>') +
            '<span' + (checked ? ';font-weight:600' : '') + '>' + label + '</span></label>';
    }

    function poMedTable(meds, btnId) {
        var html = '<div style="overflow-x:auto;margin-bottom:6px"><table class="data-table" style="font-size:11px"><thead><tr><th>Drug</th><th>Dose</th><th>Time</th><th>Effectiveness</th><th style="width:30px"></th></tr></thead><tbody>';
        if (meds.length === 0) { html += '<tr><td colspan="5" style="text-align:center;color:var(--color-muted-foreground);padding:10px">None given</td></tr>'; }
        meds.forEach(function(m, i) {
            html += '<tr>' +
                '<td><input type="text" class="form-control po-med-field" data-idx="' + i + '" data-field="drug" value="' + esc(m.drug) + '" placeholder="Drug name" style="font-size:11px;min-width:90px"></td>' +
                '<td><input type="text" class="form-control po-med-field" data-idx="' + i + '" data-field="dose" value="' + esc(m.dose) + '" placeholder="Dose" style="font-size:11px;width:70px"></td>' +
                '<td><input type="time" class="form-control po-med-field" data-idx="' + i + '" data-field="time" value="' + esc(m.time) + '" style="font-size:11px;width:80px"></td>' +
                '<td><select class="form-select po-med-field" data-idx="' + i + '" data-field="effectiveness" style="font-size:11px;min-width:90px">' + ['Good','Partial','None'].map(function(e){return '<option value="'+e+'"'+(m.effectiveness===e?' selected':'')+'>'+e+'</option>';}).join('') + '</select></td>' +
                '<td><button class="btn-ghost po-remove-med" data-idx="' + i + '"><i data-lucide="trash-2" style="width:12px;height:12px;color:var(--color-destructive)"></i></button></td></tr>';
        });
        html += '</tbody></table></div><button class="btn-outline btn-sm" id="' + btnId + '" style="font-size:11px"><i data-lucide="plus" style="width:12px;height:12px"></i> Add Analgesic</button>';
        return html;
    }

    function bindPostOpEvents(op, podDays, dischargeCriteria) {
        $(document).off('change.postop').on('change.postop', '.pofield', function() {
            if (!selectedPostOpId) return;
            var key = $(this).data('key');
            if (!key) return;
            var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
            var rec = postOpState[selectedPostOpId];
            rec[key] = val;
            if (key === 'postopLocation') {
                var op2 = operations.find(function(o) { return o.operationId === selectedPostOpId; });
                if (op2) op2.postopLocation = val;
            }
            var reRenderKeys = ['nauseaPresent', 'compNone', 'compBleeding', 'compInfection', 'compWoundDehiscence', 'compDVTPE', 'compPneumonia', 'compUrinaryRetention', 'compIleus', 'compAKI', 'compOther',
                'dischargeCriteriaPainControlled', 'dischargeCriteriaToleratingDiet', 'dischargeCriteriaAmbulating', 'dischargeCriteriaWoundHealing', 'dischargeCriteriaDrainsRemoved', 'dischargeCriteriaAfebrile', 'dischargeCriteriaEducationDone',
                'aldreteActivity', 'aldreteRespiration', 'aldreteCirculation', 'aldreteConsciousness', 'aldreteOxygen'];
            if (reRenderKeys.indexOf(key) > -1) renderPostOpSheet(op);
        });

        $(document).off('input.postopText').on('input.postopText', '.pofield:not(:checkbox)', function() {
            if (!selectedPostOpId) return;
            var key = $(this).data('key');
            if (!key || $(this).is('select')) return;
            postOpState[selectedPostOpId][key] = $(this).val();
        });

        $(document).off('click.poLocation').on('click.poLocation', '.po-location-btn', function() {
            if (!selectedPostOpId) return;
            var loc = $(this).data('location');
            postOpState[selectedPostOpId].postopLocation = loc;
            var op2 = operations.find(function(o) { return o.operationId === selectedPostOpId; });
            if (op2) op2.postopLocation = loc;
            renderPostOpSheet(op);
        });

        $(document).off('click.poPain').on('click.poPain', '.po-pain-btn', function() {
            if (!selectedPostOpId) return;
            postOpState[selectedPostOpId].painScore = parseInt($(this).data('pain'));
            renderPostOpSheet(op);
        });

        $('#btnAddPoVital').off('click').on('click', function() {
            if (!selectedPostOpId) return;
            var rec = postOpState[selectedPostOpId];
            var t = $('#newPoVitTime').val() || new Date().toTimeString().slice(0,5);
            rec.recoveryVitals.push({ time: t, bp: $('#newPoVitBP').val(), hr: $('#newPoVitHR').val(), rr: $('#newPoVitRR').val(), temp: $('#newPoVitTemp').val(), spo2: $('#newPoVitSPO2').val(), painScore: $('#newPoVitPain').val() || '0' });
            renderPostOpSheet(op);
        });

        $(document).off('click.poRemVital').on('click.poRemVital', '.po-remove-vital', function() {
            if (!selectedPostOpId) return;
            postOpState[selectedPostOpId].recoveryVitals.splice($(this).data('idx'), 1);
            renderPostOpSheet(op);
        });

        $('#po_addAnalgesic').off('click').on('click', function() {
            if (!selectedPostOpId) return;
            postOpState[selectedPostOpId].analgesicsGiven.push({ drug: '', dose: '', time: '', effectiveness: 'Good' });
            renderPostOpSheet(op);
        });

        $(document).off('input.poMed change.poMed').on('input.poMed change.poMed', '.po-med-field', function() {
            if (!selectedPostOpId) return;
            var idx = $(this).data('idx'); var field = $(this).data('field');
            postOpState[selectedPostOpId].analgesicsGiven[idx][field] = $(this).val();
        });

        $(document).off('click.poRemMed').on('click.poRemMed', '.po-remove-med', function() {
            if (!selectedPostOpId) return;
            postOpState[selectedPostOpId].analgesicsGiven.splice($(this).data('idx'), 1);
            renderPostOpSheet(op);
        });

        $('#btnAddPODNote').off('click').on('click', function() { $('#podNoteForm').slideDown(200); });
        $('#btnCancelPODNote').off('click').on('click', function() { $('#podNoteForm').slideUp(200); });

        $('#btnSavePODNote').off('click').on('click', function() {
            if (!selectedPostOpId) return;
            var woundStatus = [];
            $('.pod-wound-chk:checked').each(function() { woundStatus.push($(this).val()); });
            postOpState[selectedPostOpId].podNotes.push({
                date: new Date().toLocaleDateString(),
                pod: podDays,
                patientStatus: $('#podPatientStatus').val(),
                painControl: $('#podPainControl').val(),
                woundStatus: woundStatus,
                drainOutput: $('#podDrainOutput').val(),
                urineOutput: $('#podUrineOutput').val(),
                ambulation: $('#podAmbulation').val(),
                dietTolerated: $('#podDietTolerated').val() === '1',
                bowelMovement: $('#podBowelMovement').val() === '1',
                plan: $('#podPlan').val()
            });
            renderPostOpSheet(op);
        });

        $(document).off('click.poRemPod').on('click.poRemPod', '.po-remove-pod', function() {
            if (!selectedPostOpId) return;
            postOpState[selectedPostOpId].podNotes.splice($(this).data('idx'), 1);
            renderPostOpSheet(op);
        });

        $('#btnSavePostOp').off('click').on('click', function() { savePostOpRecord(true, false); });
        $('#btnPrintPostOp').off('click').on('click', function() { printPostOpNotes(); });
        $('#btnDischargePatient').off('click').on('click', function() {
            _showPostOpDischargeConfirm(op, dischargeCriteria);
        });
    }

    var $pendingPostOpDischargeBtn = null;

    function _showPostOpDischargeConfirm(op, dischargeCriteria) {
        var opId     = selectedPostOpId;
        var rec      = postOpState[opId] || {};
        var critMet  = (dischargeCriteria || []).filter(function(c) { return rec[c.key]; }).length;
        var total    = (dischargeCriteria || []).length;
        var location = rec.postopLocation || 'Discharged';

        $('#postOpDischargeConfirmModal').remove();

        var criteriaHtml = '';
        (dischargeCriteria || []).forEach(function(c) {
            var met = !!rec[c.key];
            criteriaHtml +=
                '<div style="display:flex;align-items:center;gap:8px;font-size:12px;padding:4px 0">' +
                '<span style="color:' + (met ? '#10b981' : '#94a3b8') + ';font-size:16px;line-height:1">' + (met ? '✓' : '○') + '</span>' +
                '<span style="color:' + (met ? '#166534' : '#64748b') + '">' + esc(c.label) + '</span>' +
                '</div>';
        });

        var modal =
            '<div class="modal fade" id="postOpDischargeConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:460px">' +
            '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
                '<div class="modal-header" style="background:var(--midnight-blue);color:#fff;border:none;padding:16px 20px">' +
                    '<div style="display:flex;align-items:center;gap:10px">' +
                        '<i data-lucide="log-out" style="width:20px;height:20px;color:var(--aqua-mint)"></i>' +
                        '<h5 class="modal-title" style="margin:0;font-size:16px;font-weight:600">Discharge Patient</h5>' +
                    '</div>' +
                    '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>' +
                '</div>' +
                '<div class="modal-body" style="padding:20px">' +
                    '<div style="display:flex;align-items:center;gap:14px;padding:14px;background:#f8fafc;border-radius:10px;margin-bottom:16px">' +
                        '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff">' + getInitials(op ? op.patientName : '') + '</div>' +
                        '<div>' +
                            '<div style="font-weight:600;font-size:15px">' + esc(op ? op.patientName : '') + '</div>' +
                            '<div style="font-size:12px;color:#64748b;font-family:monospace">' + esc(opId) + '</div>' +
                            '<div style="font-size:12px;color:#64748b;margin-top:2px">Discharge to: <strong>' + esc(location) + '</strong></div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:8px">' +
                        '<div style="font-size:12px;font-weight:600;color:#1e40af;margin-bottom:8px">' +
                            'Discharge Criteria — <span style="color:' + (critMet === total ? '#10b981' : '#f59e0b') + '">' + critMet + '/' + total + ' met</span>' +
                        '</div>' +
                        criteriaHtml +
                    '</div>' +
                    '<p style="font-size:12px;color:#64748b;margin:10px 0 0">This will mark the patient as <strong>Discharged</strong> and lock the post-operative record.</p>' +
                '</div>' +
                '<div class="modal-footer" style="border:none;padding:12px 20px;gap:8px">' +
                    '<button class="btn-outline" data-bs-dismiss="modal" style="min-width:90px">Cancel</button>' +
                    '<button class="btn-primary" id="btnPostOpDischargeConfirm"' +
                        ' style="min-width:180px;background:var(--aqua-mint);color:var(--midnight-blue);border-color:var(--aqua-mint);font-weight:700">' +
                        '<i data-lucide="log-out" style="width:14px;height:14px"></i> Confirm &amp; Discharge' +
                    '</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(modal);
        lucide.createIcons();

        var $modal  = $('#postOpDischargeConfirmModal');
        var bsModal = new bootstrap.Modal($modal[0]);
        bsModal.show();

        $modal[0].addEventListener('hidden.bs.modal', function() {
            if ($pendingPostOpDischargeBtn) {
                $pendingPostOpDischargeBtn = null;
                _doPostOpDischarge(op, location);
            }
            $modal.remove();
        }, { once: true });

        $('#btnPostOpDischargeConfirm').off('click').on('click', function() {
            $pendingPostOpDischargeBtn = true;
            bsModal.hide();
        });
    }

    function _doPostOpDischarge(op, location) {
        var opId = selectedPostOpId;
        saveOtPostopCustomFormValues();
        var rec     = postOpState[opId] || {};
        var payload = { postopNotes: rec, postopLocation: rec.postopLocation, expectedDischargeDate: rec.expectedDischargeDate || null };

        $.ajax({
            url: '/api/ot/postop/' + encodeURIComponent(opId) + '/discharge',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload)
        }).done(function() {
            if (op) op.status = 'Discharged';
            renderPostOpTab();
            _showPostOpDischargeSuccess(op, location);
        }).fail(function() {
            HMS.toast('Failed to discharge patient. Please try again.', 'error');
        });
    }

    function _showPostOpDischargeSuccess(op, location) {
        $('#postOpDischargeSuccessModal').remove();

        var modal =
            '<div class="modal fade" id="postOpDischargeSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:400px">' +
            '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
                '<div style="background:linear-gradient(135deg,var(--midnight-blue) 0%,#1e3a8a 100%);padding:28px 24px;text-align:center">' +
                    '<div style="width:60px;height:60px;background:rgba(127,255,212,0.15);border:2px solid var(--aqua-mint);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">' +
                        '<i data-lucide="log-out" style="width:30px;height:30px;color:var(--aqua-mint)"></i>' +
                    '</div>' +
                    '<h4 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 4px">Patient Discharged!</h4>' +
                    '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0">' + esc(op ? op.patientName : '') + '</p>' +
                '</div>' +
                '<div style="padding:20px 24px;text-align:center">' +
                    '<div style="display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 18px;font-size:13px;color:#166534;margin-bottom:8px">' +
                        '<i data-lucide="map-pin" style="width:15px;height:15px"></i>' +
                        '<span>Discharged to <strong>' + esc(location) + '</strong></span>' +
                    '</div>' +
                    '<p style="font-size:12px;color:#64748b;margin:8px 0 0">The post-operative record has been saved and locked.</p>' +
                '</div>' +
                '<div style="padding:0 20px 20px;text-align:center">' +
                    '<button class="btn-primary" id="btnPostOpDischargeSuccessClose" style="width:100%">Close</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(modal);
        lucide.createIcons();
        var bsModal = new bootstrap.Modal(document.getElementById('postOpDischargeSuccessModal'));
        bsModal.show();

        $('#btnPostOpDischargeSuccessClose').off('click').on('click', function() { bsModal.hide(); });

        document.getElementById('postOpDischargeSuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#postOpDischargeSuccessModal').remove();
            var oc = bootstrap.Offcanvas.getInstance(document.getElementById('otPostOpSheet'));
            if (oc) oc.hide();
        }, { once: true });
    }

    // ===== INTRA-OPERATIVE RECORD =====
    var selectedIntraOpId = null;
    var intraOpState = {};
    var intraOpAutoSaveTimer = null;
    var intraOpLiveTimerInterval = null;

    function defaultIntraOp() {
        return {
            currentPhase: 'Pre-Induction',
            whoSignIn: { patientIdentityConfirmed: false, siteMarkedConfirmed: false, consentConfirmed: false, anesthesiaSafetyCheckComplete: false },
            whoTimeOut: { teamMembersIntroduced: false, identitySiteConfirmedByTeam: false, criticalEventsReviewed: false, antibioticProphylaxisGiven: false, imagingDisplayed: false, timeOutCompletedAt: '', confirmedBy: '' },
            inductionStartTime: '', inductionTechnique: 'Standard',
            inductionMedications: [],
            airwayType: 'ETT', ettSize: '7.5', cuffPressure: '',
            inductionComplicationsNone: true, inductionDifficultIntubation: false, inductionAttempts: '', inductionHypotension: false, inductionBradycardia: false, inductionOther: false, inductionOtherText: '',
            sevoflurane: false, sevoConc: '', isoflurane: false, isoConc: '', desflurane: false, desConc: '', propofol: false, propofolRate: '', maintenanceOther: false, maintenanceOtherText: '',
            muscleRelaxants: [], analgesics: [],
            vitalsLog: [], criticalEvents: [],
            crystalloids: [], colloids: [], bloodProducts: [],
            urineOutput: '', bloodLoss: '',
            anesthesiaStartTime: '', incisionTime: '', procedureStartTime: '', procedureEndTime: '', closureStartTime: '', finalSutureTime: '', anesthesiaEndTime: '', patientOutTime: '',
            patientPosition: 'Supine', pressurePointsPadded: false,
            intraOpFindings: '', postOpDiagnosis: '', procedureDescription: '',
            specimens: [], implants: [],
            drainRedivac: false, drainPigtail: false, drainTTube: false, drainOther: false, drainOtherText: '', drainLocation: '', drainSize: '',
            catUrinary: false, catCentralLine: false, catArterialLine: false, catNgTube: false, catOther: false, catOtherText: '',
            instrumentBefore: '', instrumentAfter: '', instrumentMatch: true,
            spongeBefore: '', spongeAfter: '', spongeMatch: true,
            needleBefore: '', needleAfter: '', needleMatch: true, allCountsCorrect: false,
            compNone: true, compExcessiveBleeding: false, compOrganInjury: false, compVascularInjury: false, compNerveInjury: false, compUnexpectedFindings: false, compOther: false, compOtherText: '', compDescription: '',
            assistantSurgeons: '', scrubNurse: '', circulatingNurse: '', anesthesiaTechnician: '', otherStaff: '',
            postOpDestination: 'Recovery Room / PACU',
            postOpVitals15: false, postOpVitals30: false, postOpDrainOutput: false, postOpUrineOutput: false, postOpNeuro: false, postOpOtherMonitor: false, postOpOtherMonitorText: '',
            postOpMedications: [], activityOrders: 'Bed rest', dietOrders: 'NPO',
            drainManagement: '', woundCare: '', specialInstructions: '',
            whoSignOut: { procedureRecorded: false, countsCorrect: false, specimensLabeled: false, equipmentIssuesAddressed: false, keyConcernsReviewed: false, signOutCompletedAt: '', confirmedBy: '' }
        };
    }

    function formatDuration(startTimeStr) {
        if (!startTimeStr) return '-';
        var start = new Date(startTimeStr);
        if (isNaN(start.getTime())) return '-';
        var diff = Math.floor((Date.now() - start.getTime()) / 1000);
        var h = Math.floor(diff / 3600);
        var m = Math.floor((diff % 3600) / 60);
        var s = diff % 60;
        return (h > 0 ? h + 'h ' : '') + m + 'm ' + s + 's';
    }

    function formatHHMMSS(startTimeStr) {
        if (!startTimeStr) return '00:00:00';
        var diff = Math.floor((Date.now() - new Date(startTimeStr).getTime()) / 1000);
        if (diff < 0) diff = 0;
        var h = String(Math.floor(diff / 3600)).padStart(2, '0');
        var m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        var s = String(diff % 60).padStart(2, '0');
        return h + ':' + m + ':' + s;
    }

    function getPhaseBadge(phase) {
        var colors = { 'Pre-Induction': '#64748B', 'Induction': '#7C3AED', 'Maintenance': '#3B82F6', 'Incision': '#EF4444', 'Closure': '#F97316', 'Recovery': '#10B981', 'Completed': '#16A34A' };
        var c = colors[phase] || '#64748B';
        return '<span class="badge" style="background:' + c + '1a;color:' + c + ';border:1px solid ' + c + '33;font-size:10px;font-weight:600">' + esc(phase || 'Pre-Induction') + '</span>';
    }

    function otIoGetBaseOps() {
        /* Keep all records — Completed surgeries must never disappear from the
           Intra-Op tab regardless of how much time has passed since surgery date */
        var today = new Date().toDateString();
        return operations.filter(function(op) {
            return op.status === 'In Progress' ||
                   op.status === 'Scheduled'   ||
                   op.status === 'Completed';   // always keep completed, not just today's
        });
    }

    function otIoPopulateFilterOptions() {
        var surgeonWrap = document.getElementById('otIoCsSurgeon');
        if (surgeonWrap && surgeonWrap.setOptions) {
            var surgeons = ['All Surgeons'];
            otIoGetBaseOps().forEach(function(op) {
                if (op.surgeon && surgeons.indexOf(op.surgeon) < 0) surgeons.push(op.surgeon);
            });
            surgeonWrap.setOptions(surgeons);
        }
        var theaterWrap = document.getElementById('otIoCsTheater');
        if (theaterWrap && theaterWrap.setOptions) {
            var theaters = ['All OTs'];
            otIoGetBaseOps().forEach(function(op) {
                if (op.theater && theaters.indexOf(op.theater) < 0) theaters.push(op.theater);
            });
            theaterWrap.setOptions(theaters);
        }
    }

    function renderIntraOpTab() {
        otIoPopulateFilterOptions();
        var search = ($('#intraOpSearch').val() || '').toLowerCase();
        var today  = new Date().toDateString();
        var base   = otIoFiltered !== null ? otIoFiltered : otIoGetBaseOps();
        var filtered = base.filter(function(op) {
            return !search ||
                (op.patientName || '').toLowerCase().indexOf(search) > -1 ||
                (op.procedure || '').toLowerCase().indexOf(search) > -1 ||
                (op.surgeon || '').toLowerCase().indexOf(search) > -1 ||
                (op.operationId || '').toLowerCase().indexOf(search) > -1;
        });

        var activeCount    = operations.filter(function(o) { return o.status === 'In Progress'; }).length;
        var scheduledCount = operations.filter(function(o) { return o.status === 'Scheduled' && o.surgeryDate && new Date(o.surgeryDate).toDateString() === today; }).length;
        var completedCount = operations.filter(function(o) { return o.status === 'Completed' && o.surgeryDate && new Date(o.surgeryDate).toDateString() === today; }).length;

        $('#intraOpStatActive').text(activeCount);
        $('#intraOpStatScheduled').text(scheduledCount);
        $('#intraOpStatCompleted').text(completedCount);
        $('#intraOpStatAvgDuration').text(completedCount > 0 ? Math.round(120 / Math.max(1, completedCount)) + 'h' : '-');

        _otIoRenderPagination(filtered);

        if (!intraOpLiveTimerInterval) {
            intraOpLiveTimerInterval = setInterval(function() {
                $('.live-duration').each(function() {
                    var start = $(this).data('start');
                    if (start) $(this).text(formatDuration(start));
                });
                if (selectedIntraOpId) {
                    var op = operations.find(function(o) { return o.operationId === selectedIntraOpId; });
                    var st = op && (op.anesthesiaStartTime || (intraOpState[selectedIntraOpId] && intraOpState[selectedIntraOpId].anesthesiaStartTime));
                    if (st) { $('#intraOpLiveTimer').show().text(formatHHMMSS(st)); }
                }
            }, 1000);
        }
    }

    function _otIoRenderPagination(source) {
        var total    = source.length;
        var totalPgs = Math.max(1, Math.ceil(total / otIoPerPageVal));
        if (otIoCurrentPage > totalPgs) otIoCurrentPage = totalPgs;
        var start = (otIoCurrentPage - 1) * otIoPerPageVal;
        var page  = source.slice(start, start + otIoPerPageVal);

        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="10"><div class="empty-state"><i data-lucide="syringe"></i><p>No surgeries found</p><p class="empty-sub">Active and today\'s scheduled surgeries appear here</p></div></td></tr>';
        } else {
            page.forEach(function(op) {
                var rec = intraOpState[op.operationId] || {};
                var phase = op.currentPhase || rec.currentPhase || 'Pre-Induction';
                var startTime = op.anesthesiaStartTime || rec.anesthesiaStartTime || null;
                var durationDisplay = startTime ? '<span class="live-duration" data-start="' + esc(startTime) + '">' + formatDuration(startTime) + '</span>' : '<span style="color:var(--color-muted-foreground)">Not started</span>';
                var startedDisplay = startTime ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (op.startTime || '-');
                html += '<tr class="clickable-row intraop-row" data-op-id="' + esc(op.operationId) + '">' +
                    '<td style="font-size:11px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(op.operationId) + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:8px"><div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(op.patientName) + '</div><div><span style="font-weight:500;font-size:14px">' + esc(op.patientName) + '</span><div style="font-size:11px;color:var(--color-muted-foreground)">' + (op.age ? op.age + 'y ' : '') + esc(op.gender || '') + '</div></div></div></td>' +
                    '<td style="font-size:13px;font-weight:500;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(op.procedure) + '">' + esc(op.procedure) + '</td>' +
                    '<td><span class="badge badge-outline" style="font-size:11px">' + esc(op.theater || '-') + '</span></td>' +
                    '<td style="font-size:12px">' + startedDisplay + '</td>' +
                    '<td style="font-size:12px;font-family:monospace;font-weight:500;color:#7C3AED">' + durationDisplay + '</td>' +
                    '<td>' + getPhaseBadge(phase) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(op.surgeon || '-') + '</td>' +
                    '<td>' + statusBadge(op.status) + '</td>' +
                    '<td class="text-center"><button class="btn-primary btn-sm intraop-open-btn" data-op-id="' + esc(op.operationId) + '" style="font-size:11px;padding:5px 10px"><i data-lucide="edit" style="width:12px;height:12px"></i> ' + (op.status === 'In Progress' ? 'Update' : 'View/Start') + '</button></td>' +
                '</tr>';
            });
        }
        $('#intraOpTableBody').html(html);

        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + otIoPerPageVal, total);
        $('#otIoTableInfo').text('Showing ' + from + '–' + to + ' of ' + total + ' records');

        var numsHtml = '';
        var maxBtns = 5, half = Math.floor(maxBtns / 2);
        var pStart = Math.max(1, otIoCurrentPage - half);
        var pEnd   = Math.min(totalPgs, pStart + maxBtns - 1);
        if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
        for (var p = pStart; p <= pEnd; p++) {
            numsHtml += '<button class="opd-page-num' + (p === otIoCurrentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        $('#otIoPageNums').html(numsHtml);
        $('#otIoPrevPage').prop('disabled', otIoCurrentPage <= 1);
        $('#otIoNextPage').prop('disabled', otIoCurrentPage >= totalPgs);

        lucide.createIcons();
    }

    $('#intraOpSearch').on('input', function() { otIoCurrentPage = 1; renderIntraOpTab(); });

    $(document).on('click', '#otIoPageNums .opd-page-num', function() {
        otIoCurrentPage = parseInt($(this).data('page')); renderIntraOpTab();
    });
    $(document).on('click', '#otIoPrevPage', function() {
        if (otIoCurrentPage > 1) { otIoCurrentPage--; renderIntraOpTab(); }
    });
    $(document).on('click', '#otIoNextPage', function() {
        otIoCurrentPage++; renderIntraOpTab();
    });

    $(document).on('click', '.intraop-row', function(e) {
        if ($(e.target).closest('.intraop-open-btn').length) return;
        var opId = $(this).data('op-id');
        if (opId) openIntraOpRecord(opId);
    });
    $(document).on('click', '.intraop-open-btn', function(e) {
        e.stopPropagation();
        var opId = $(this).data('op-id');
        if (opId) openIntraOpRecord(opId);
    });

    function openIntraOpRecord(operationId) {
        var op = operations.find(function(o) { return o.operationId === operationId; });
        if (!op) return;
        selectedIntraOpId = operationId;
        if (!intraOpState[operationId]) intraOpState[operationId] = defaultIntraOp();

        var p1 = $.get('/api/ot/intraop/' + encodeURIComponent(operationId));
        var p2 = $.get('/api/ot/intraop-form-sections');
        $.when(p1, p2).done(function(r1, r2) {
            var res = r1[0];
            if (res.intraopRecord && Object.keys(res.intraopRecord).length > 0) {
                intraOpState[operationId] = $.extend(defaultIntraOp(), res.intraopRecord);
            }
            if (res.currentPhase) intraOpState[operationId].currentPhase = res.currentPhase;
            if (res.anesthesiaStartTime) intraOpState[operationId].anesthesiaStartTime = res.anesthesiaStartTime;
            if (res.customIntraopData) otCustomIntraopData = res.customIntraopData;
            otIntraopFormSections = r2[0] || [];
            renderIntraOpSheet(op);
            new bootstrap.Offcanvas(document.getElementById('otIntraOpSheet')).show();
            startIntraOpAutoSave();
        }).fail(function() {
            renderIntraOpSheet(op);
            new bootstrap.Offcanvas(document.getElementById('otIntraOpSheet')).show();
            startIntraOpAutoSave();
        });
    }

    function startIntraOpAutoSave() {
        if (intraOpAutoSaveTimer) clearInterval(intraOpAutoSaveTimer);
        intraOpAutoSaveTimer = setInterval(function() {
            if (selectedIntraOpId) saveIntraOpRecord(false, false);
        }, 30000);
        document.getElementById('otIntraOpSheet').addEventListener('hidden.bs.offcanvas', function() {
            if (intraOpAutoSaveTimer) { clearInterval(intraOpAutoSaveTimer); intraOpAutoSaveTimer = null; }
            selectedIntraOpId = null;
            $('#intraOpLiveTimer').hide();
        }, { once: true });
    }

    function saveIntraOpRecord(showFeedback, complete) {
        if (!selectedIntraOpId) return;
        saveOtIntraopCustomFormValues();
        var rec = intraOpState[selectedIntraOpId] || defaultIntraOp();
        var payload = {
            intraopRecord: rec,
            currentPhase: rec.currentPhase || 'Pre-Induction',
            anesthesiaStartTime: rec.anesthesiaStartTime || null,
            status: 'In Progress'
        };

        var url = complete ? '/api/ot/intraop/' + encodeURIComponent(selectedIntraOpId) + '/complete' : '/api/ot/intraop/' + encodeURIComponent(selectedIntraOpId);
        $.ajax({ url: url, method: 'POST', contentType: 'application/json', data: JSON.stringify(payload) }).done(function() {
            var op = operations.find(function(o) { return o.operationId === selectedIntraOpId; });
            if (op) {
                op.currentPhase = rec.currentPhase;
                op.anesthesiaStartTime = rec.anesthesiaStartTime;
                if (complete) op.status = 'Completed';
            }
            renderIntraOpTab();
            if (showFeedback && !complete) {
                var btn = $('#btnSaveIntraOp');
                var orig = btn.html();
                btn.text('Saved!');
                setTimeout(function() { btn.html(orig); lucide.createIcons(); }, 2000);
            }
        });
    }

    function renderOtIntraopCustomSectionContent(sec) {
        var data = otCustomIntraopData[sec.key] || {};
        var fields = sec.fields || [];
        var html = '';
        if (!fields.length) {
            return '<p style="font-size:13px;color:var(--color-muted-foreground)">No fields configured for this section.</p>';
        }
        fields.forEach(function(f) {
            var fid = 'iocust_' + sec.key + '_' + f.name;
            var val = data[f.name] !== undefined ? data[f.name] : (f.defaultValue || '');
            var input = '';
            if (f.type === 'text' || f.type === 'email' || f.type === 'number' || f.type === 'date' || f.type === 'time') {
                input = '<input type="' + f.type + '" class="form-control" id="' + fid + '" value="' + esc(val) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>';
            } else if (f.type === 'textarea') {
                input = '<textarea class="form-control" id="' + fid + '" rows="3"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>' + esc(val) + '</textarea>';
            } else if (f.type === 'dropdown') {
                var opts = (f.options || []).map(function(o) { return '<option value="' + esc(o) + '"' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('');
                input = '<select class="form-select" id="' + fid + '">' + opts + '</select>';
            } else if (f.type === 'multi-select') {
                input = (f.options || []).map(function(o) {
                    var chk = Array.isArray(val) ? val.indexOf(o) >= 0 : false;
                    return '<div class="form-check"><input class="form-check-input" type="checkbox" id="' + fid + '_' + o.replace(/\s/g,'_') + '" value="' + esc(o) + '"' + (chk ? ' checked' : '') + ' data-ms-group-io="' + fid + '"> <label class="form-check-label" for="' + fid + '_' + o.replace(/\s/g,'_') + '">' + esc(o) + '</label></div>';
                }).join('');
            } else if (f.type === 'radio') {
                input = (f.options || []).map(function(o) {
                    return '<div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="' + fid + '" id="' + fid + '_' + o.replace(/\s/g,'_') + '" value="' + esc(o) + '"' + (val === o ? ' checked' : '') + '> <label class="form-check-label" for="' + fid + '_' + o.replace(/\s/g,'_') + '">' + esc(o) + '</label></div>';
                }).join('');
            } else if (f.type === 'checkbox') {
                var chkd = val === true || val === 'true' || val === 1 || val === '1';
                input = '<div class="form-check"><input class="form-check-input" type="checkbox" id="' + fid + '"' + (chkd ? ' checked' : '') + '> <label class="form-check-label" for="' + fid + '">' + esc(f.label) + '</label></div>';
            } else if (f.type === 'password') {
                input = '<input type="password" class="form-control" id="' + fid + '" value="' + esc(val) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>';
            }
            if (f.type !== 'checkbox') {
                html += '<div class="mb-3"><label class="form-label" style="font-size:12px;font-weight:600">' + esc(f.label) + (f.required ? ' <span style="color:#EF4444">*</span>' : '') + '</label>' + input + '</div>';
            } else {
                html += '<div class="mb-3">' + input + '</div>';
            }
        });
        return html;
    }

    function saveOtIntraopCustomFormValues() {
        if (!selectedIntraOpId) return;
        var customData = {};
        otIntraopFormSections.filter(function(s) { return !s.isDefault && s.isEnabled; }).forEach(function(sec) {
            var sectionData = {};
            (sec.fields || []).forEach(function(f) {
                var fid = 'iocust_' + sec.key + '_' + f.name;
                var el = document.getElementById(fid);
                if (f.type === 'multi-select') {
                    var checked = [];
                    document.querySelectorAll('[data-ms-group-io="' + fid + '"]:checked').forEach(function(cb) { checked.push(cb.value); });
                    sectionData[f.name] = checked;
                } else if (f.type === 'checkbox') {
                    sectionData[f.name] = el ? el.checked : false;
                } else if (el) {
                    sectionData[f.name] = el.value;
                }
            });
            customData[sec.key] = sectionData;
        });
        if (Object.keys(customData).length > 0) {
            otCustomIntraopData = Object.assign({}, otCustomIntraopData, customData);
            $.ajax({
                url: '/api/ot/operations/' + encodeURIComponent(selectedIntraOpId) + '/custom-intraop-data',
                method: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify({ customIntraopData: otCustomIntraopData })
            });
        }
    }

    function renderIntraOpSheet(op) {
        var rec = intraOpState[op.operationId] || defaultIntraOp();
        var phase = rec.currentPhase || 'Pre-Induction';
        var phases = ['Pre-Induction','Induction','Maintenance','Incision','Closure','Recovery'];
        var phaseColors = { 'Pre-Induction':'#64748B','Induction':'#7C3AED','Maintenance':'#3B82F6','Incision':'#EF4444','Closure':'#F97316','Recovery':'#10B981' };

        function isSectionEnabled_io(key) {
            if (!otIntraopFormSections.length) return true;
            var sec = otIntraopFormSections.find(function(s) { return s.key === key; });
            return !sec || sec.isEnabled;
        }

        $('#intraOpLivePhase').text(phase).css({ background: (phaseColors[phase] || '#64748B') + '1a', color: phaseColors[phase] || '#64748B' });

        var anesthesiaStart = rec.anesthesiaStartTime;
        if (anesthesiaStart) { $('#intraOpLiveTimer').show(); } else { $('#intraOpLiveTimer').hide(); }

        var totalAnesthesiaTime = (rec.anesthesiaStartTime && rec.anesthesiaEndTime) ? Math.round((new Date(rec.anesthesiaEndTime) - new Date(rec.anesthesiaStartTime)) / 60000) + ' min' : 'In progress';
        var totalSurgeryTime = (rec.incisionTime && rec.finalSutureTime) ? Math.round((new Date(rec.finalSutureTime) - new Date(rec.incisionTime)) / 60000) + ' min' : '-';
        var bloodLossNum = parseInt(rec.bloodLoss) || 0;
        var crystVol = rec.crystalloids.reduce(function(a, c) { return a + (parseInt(c.volume) || 0); }, 0);
        var collVol = rec.colloids.reduce(function(a, c) { return a + (parseInt(c.volume) || 0); }, 0);
        var urineVol = parseInt(rec.urineOutput) || 0;
        var totalIn = crystVol + collVol;
        var totalOut = bloodLossNum + urineVol;
        var fluidBalance = totalIn - totalOut;

        var html = '<div style="display:grid;grid-template-columns:1fr 320px;height:100%;min-height:0">';
        html += '<div style="overflow-y:auto;padding:24px;border-right:1px solid var(--color-border)">';

        html += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="display:flex;align-items:center;gap:16px">' +
                '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff;font-size:16px;font-weight:700">' + getInitials(op.patientName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
                        '<h3 style="font-size:16px;font-weight:600;margin:0">' + esc(op.patientName) + '</h3>' +
                        '<span class="badge badge-outline" style="font-size:10px">' + esc(op.mrn) + '</span>' +
                        getPhaseBadge(phase) +
                    '</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:6px">' +
                        '<span style="font-size:12px"><strong>Procedure:</strong> ' + esc(op.procedure) + '</span>' +
                        '<span style="font-size:12px"><strong>OT:</strong> ' + esc(op.theater || '-') + '</span>' +
                        '<span style="font-size:12px"><strong>Surgeon:</strong> ' + esc(op.surgeon || '-') + '</span>' +
                        '<span style="font-size:12px"><strong>Anesthesiologist:</strong> ' + esc(op.anaesthetist || '-') + '</span>' +
                    '</div>' +
                '</div>' +
            '</div></div>';

        if (isSectionEnabled_io('who_signin')) html += ioSection('WHO Safety Checklist — Sign In (Before Anesthesia)', 'shield-check',
            '<div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:12px;margin-bottom:0">' +
            ioChk('whoPatientId', 'whoSignIn_patientIdentityConfirmed', 'Patient identity confirmed', rec.whoSignIn.patientIdentityConfirmed) +
            ioChk('whoSiteMarked', 'whoSignIn_siteMarkedConfirmed', 'Surgical site marked/confirmed', rec.whoSignIn.siteMarkedConfirmed) +
            ioChk('whoConsent', 'whoSignIn_consentConfirmed', 'Consent confirmed', rec.whoSignIn.consentConfirmed) +
            ioChk('whoAneCheck', 'whoSignIn_anesthesiaSafetyCheckComplete', 'Anesthesia safety check complete', rec.whoSignIn.anesthesiaSafetyCheckComplete) +
            '</div>'
        );

        if (isSectionEnabled_io('who_timeout')) html += ioSection('WHO Safety Checklist — Time Out (Before Skin Incision)', 'users',
            '<div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px;margin-bottom:12px">' +
            '<p style="font-size:11px;font-weight:700;color:#EF4444;text-transform:uppercase;margin-bottom:8px">CRITICAL — Entire Team Required</p>' +
            ioChk('toTeamIntro', 'whoTimeOut_teamMembersIntroduced', 'All team members introduced', rec.whoTimeOut.teamMembersIntroduced) +
            ioChk('toIdentity', 'whoTimeOut_identitySiteConfirmedByTeam', 'Patient identity, site, procedure confirmed by entire team', rec.whoTimeOut.identitySiteConfirmedByTeam) +
            ioChk('toCritical', 'whoTimeOut_criticalEventsReviewed', 'Anticipated critical events reviewed (surgeon, anesthesia, nursing)', rec.whoTimeOut.criticalEventsReviewed) +
            ioChk('toAntibiotic', 'whoTimeOut_antibioticProphylaxisGiven', 'Antibiotic prophylaxis given within last 60 minutes', rec.whoTimeOut.antibioticProphylaxisGiven) +
            ioChk('toImaging', 'whoTimeOut_imagingDisplayed', 'Essential imaging displayed', rec.whoTimeOut.imagingDisplayed) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
                ioFormGroup('Time Out completed at', '<input type="time" class="form-control iofield" data-key="whoTimeOut_timeOutCompletedAt" id="io_whoTimeOut_timeOutCompletedAt" value="' + esc(rec.whoTimeOut.timeOutCompletedAt) + '">') +
                ioFormGroup('Confirmed by', '<select class="form-select iofield" data-key="whoTimeOut_confirmedBy" id="io_whoTimeOut_confirmedBy">' + '<option value="">-- Select --</option>' + doctors.map(function(d){ var n='Dr. '+d.firstName+' '+d.lastName; return '<option value="'+n+'"'+(rec.whoTimeOut.confirmedBy===n?' selected':'')+'>'+n+'</option>'; }).join('') + '</select>') +
            '</div>'
        );

        if (isSectionEnabled_io('anesthesia_induction')) html += ioSection('Section 1A: Anesthesia — Induction', 'syringe',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">' +
                ioFormGroup('Induction started', '<input type="time" class="form-control iofield" data-key="inductionStartTime" id="io_inductionStartTime" value="' + esc(rec.inductionStartTime) + '">') +
                ioFormGroup('Induction technique', '<select class="form-select iofield" data-key="inductionTechnique" id="io_inductionTechnique">' + ['Rapid sequence','Standard','Awake intubation','Other'].map(function(t){return '<option value="'+t+'"'+(rec.inductionTechnique===t?' selected':'')+'>'+t+'</option>';}).join('') + '</select>') +
                ioFormGroup('Airway type', '<select class="form-select iofield" data-key="airwayType" id="io_airwayType">' + ['ETT','LMA','Face mask','Other'].map(function(t){return '<option value="'+t+'"'+(rec.airwayType===t?' selected':'')+'>'+t+'</option>';}).join('') + '</select>') +
                (rec.airwayType === 'ETT' ? ioFormGroup('ETT Size', '<select class="form-select iofield" data-key="ettSize" id="io_ettSize">' + ['6.0','6.5','7.0','7.5','8.0','8.5'].map(function(s){return '<option value="'+s+'"'+(rec.ettSize===s?' selected':'')+'>'+s+'</option>';}).join('') + '</select>') + ioFormGroup('Cuff Pressure (cmH₂O)', '<input type="number" class="form-control iofield" data-key="cuffPressure" id="io_cuffPressure" value="' + esc(rec.cuffPressure) + '" placeholder="20-25">') : '') +
            '</div>' +
            '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Induction Complications</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">' +
                ioChkSmall('indCompNone', 'inductionComplicationsNone', 'None', rec.inductionComplicationsNone) +
                ioChkSmall('indCompDiff', 'inductionDifficultIntubation', 'Difficult intubation', rec.inductionDifficultIntubation) +
                ioChkSmall('indCompHypo', 'inductionHypotension', 'Hypotension', rec.inductionHypotension) +
                ioChkSmall('indCompBrady', 'inductionBradycardia', 'Bradycardia', rec.inductionBradycardia) +
                ioChkSmall('indCompOther', 'inductionOther', 'Other', rec.inductionOther) +
            '</div>' +
            (rec.inductionDifficultIntubation ? ioFormGroup('Number of attempts', '<input type="number" class="form-control iofield" data-key="inductionAttempts" id="io_inductionAttempts" value="' + esc(rec.inductionAttempts) + '" placeholder="e.g. 2" style="width:100px">') : '') +
            (rec.inductionOther ? ioFormGroup('Other details', '<input type="text" class="form-control iofield" data-key="inductionOtherText" id="io_inductionOtherText" value="' + esc(rec.inductionOtherText) + '">') : '') +
            '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Induction Medications</p>' +
            ioMedTable('inductionMedications', rec.inductionMedications, 'io_addIndMed')
        );

        if (isSectionEnabled_io('anesthesia_maintenance')) html += ioSection('Section 1B: Anesthesia — Maintenance', 'activity',
            '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Anesthetic Agents</p>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">' +
                ioAgentRow('sevoflurane', 'Sevoflurane', 'sevoConc', '%', rec) +
                ioAgentRow('isoflurane', 'Isoflurane', 'isoConc', '%', rec) +
                ioAgentRow('desflurane', 'Desflurane', 'desConc', '%', rec) +
                ioAgentRow('propofol', 'Propofol infusion', 'propofolRate', 'ml/hr', rec) +
            '</div>' +
            ioChkSmall('maintOther', 'maintenanceOther', 'Other agent', rec.maintenanceOther) +
            (rec.maintenanceOther ? ioFormGroup('Other agent details', '<input type="text" class="form-control iofield" data-key="maintenanceOtherText" id="io_maintenanceOtherText" value="' + esc(rec.maintenanceOtherText) + '">') : '') +
            '<p style="font-size:12px;font-weight:600;margin:12px 0 8px">Muscle Relaxants</p>' +
            ioMedTable('muscleRelaxants', rec.muscleRelaxants, 'io_addMuscle') +
            '<p style="font-size:12px;font-weight:600;margin:12px 0 8px">Analgesics</p>' +
            ioMedTable('analgesics', rec.analgesics, 'io_addAnalgesic')
        );

        if (isSectionEnabled_io('vitals_monitoring')) html += ioSection('Section 1C: Monitoring — Vitals Log', 'heart-pulse',
            '<div style="overflow-x:auto;margin-bottom:12px"><table class="data-table" style="font-size:11px"><thead><tr><th>Time</th><th>HR</th><th>BP</th><th>SPO2</th><th>ETCO2</th><th>Temp</th><th>RR</th><th style="width:40px"></th></tr></thead><tbody id="vitalsLogBody">' +
            (rec.vitalsLog.length === 0 ? '<tr><td colspan="8" style="text-align:center;padding:16px;color:var(--color-muted-foreground);font-size:12px">No vitals recorded yet — add a reading below</td></tr>' :
                rec.vitalsLog.map(function(v, i) {
                    return '<tr><td style="font-weight:500">' + esc(v.time) + '</td><td>' + esc(v.hr) + '</td><td>' + esc(v.bp) + '</td><td>' + esc(v.spo2) + '</td><td>' + esc(v.etco2) + '</td><td>' + esc(v.temp) + '</td><td>' + esc(v.rr) + '</td>' +
                        '<td><button class="btn-ghost io-remove-vital" data-idx="' + i + '"><i data-lucide="trash-2" style="width:12px;height:12px;color:var(--color-destructive)"></i></button></td></tr>';
                }).join('')) +
            '</tbody></table></div>' +
            '<div style="background:var(--color-muted);border-radius:8px;padding:12px">' +
                '<p style="font-size:11px;font-weight:600;margin-bottom:8px">Add Reading</p>' +
                '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;align-items:end">' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">Time</label><input type="time" class="form-control" id="newVitTime" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">HR</label><input type="text" class="form-control" id="newVitHR" placeholder="72" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">BP</label><input type="text" class="form-control" id="newVitBP" placeholder="120/80" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">SPO2</label><input type="text" class="form-control" id="newVitSPO2" placeholder="98" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">ETCO2</label><input type="text" class="form-control" id="newVitETCO2" placeholder="35" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">Temp</label><input type="text" class="form-control" id="newVitTemp" placeholder="37.0" style="font-size:11px;padding:4px 6px"></div>' +
                    '<div><label style="font-size:10px;color:var(--color-muted-foreground)">RR</label><input type="text" class="form-control" id="newVitRR" placeholder="14" style="font-size:11px;padding:4px 6px"></div>' +
                    '<button class="btn-primary btn-sm" id="btnAddVital" style="font-size:11px;padding:5px 8px;height:32px">Add</button>' +
                '</div>' +
            '</div>'
        );

        if (isSectionEnabled_io('fluids_blood')) html += ioSection('Section 1D: Fluids & Blood Products', 'droplets',
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">' +
                '<div>' +
                    '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Crystalloids</p>' +
                    ioFluidTable('crystalloids', rec.crystalloids, ['Normal Saline','Ringer\'s Lactate','D5W','D5 1/2 NS'], 'io_addCryst') +
                '</div>' +
                '<div>' +
                    '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Colloids</p>' +
                    ioFluidTable('colloids', rec.colloids, ['Dextran','Gelatin','Albumin'], 'io_addColl') +
                '</div>' +
                '<div>' +
                    '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Blood Products</p>' +
                    ioBloodTable('bloodProducts', rec.bloodProducts, 'io_addBlood') +
                '</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' +
                ioFormGroup('Urine output (ml)', '<input type="number" class="form-control iofield" data-key="urineOutput" id="io_urineOutput" value="' + esc(rec.urineOutput) + '" placeholder="0">') +
                ioFormGroup('Blood loss (ml)', '<div><input type="number" class="form-control iofield' + (bloodLossNum >= 500 ? ' border-red-500' : '') + '" data-key="bloodLoss" id="io_bloodLoss" value="' + esc(rec.bloodLoss) + '" placeholder="0">' + (bloodLossNum >= 500 ? '<p style="font-size:10px;color:#EF4444;margin-top:2px">⚠ Significant blood loss!</p>' : '') + '</div>') +
                ioFormGroup('Fluid balance (auto)', '<div class="form-control" style="background:var(--color-muted);font-weight:600;' + (fluidBalance < 0 ? 'color:#EF4444' : 'color:#10B981') + '">' + (fluidBalance >= 0 ? '+' : '') + fluidBalance + ' ml</div>') +
            '</div>'
        );

        if (isSectionEnabled_io('surgery_timeline')) html += ioSection('Section 2A: Surgery Timeline', 'clock',
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">' +
                ioFormGroup('Anesthesia start', '<input type="time" class="form-control iofield" data-key="anesthesiaStartTime" id="io_anesthesiaStartTime" value="' + esc(rec.anesthesiaStartTime ? new Date(rec.anesthesiaStartTime).toTimeString().slice(0,5) : '') + '">') +
                ioFormGroup('Incision time', '<input type="time" class="form-control iofield" data-key="incisionTime" id="io_incisionTime" value="' + esc(rec.incisionTime) + '">') +
                ioFormGroup('Procedure start', '<input type="time" class="form-control iofield" data-key="procedureStartTime" id="io_procedureStartTime" value="' + esc(rec.procedureStartTime) + '">') +
                ioFormGroup('Procedure end', '<input type="time" class="form-control iofield" data-key="procedureEndTime" id="io_procedureEndTime" value="' + esc(rec.procedureEndTime) + '">') +
                ioFormGroup('Closure start', '<input type="time" class="form-control iofield" data-key="closureStartTime" id="io_closureStartTime" value="' + esc(rec.closureStartTime) + '">') +
                ioFormGroup('Final suture', '<input type="time" class="form-control iofield" data-key="finalSutureTime" id="io_finalSutureTime" value="' + esc(rec.finalSutureTime) + '">') +
                ioFormGroup('Anesthesia end', '<input type="time" class="form-control iofield" data-key="anesthesiaEndTime" id="io_anesthesiaEndTime" value="' + esc(rec.anesthesiaEndTime) + '">') +
                ioFormGroup('Patient out of OT', '<input type="time" class="form-control iofield" data-key="patientOutTime" id="io_patientOutTime" value="' + esc(rec.patientOutTime) + '">') +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">' +
                '<div style="background:var(--color-muted);border-radius:8px;padding:10px"><p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Total Anesthesia Time</p><p style="font-size:20px;font-weight:700;margin:0;color:var(--midnight-blue)">' + totalAnesthesiaTime + '</p></div>' +
                '<div style="background:var(--color-muted);border-radius:8px;padding:10px"><p style="font-size:11px;color:var(--color-muted-foreground);margin:0">Total Surgery Time</p><p style="font-size:20px;font-weight:700;margin:0;color:var(--midnight-blue)">' + totalSurgeryTime + '</p></div>' +
            '</div>'
        );

        if (isSectionEnabled_io('position_findings')) html += ioSection('Section 2B: Position & Surgical Findings', 'user',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">' +
                ioFormGroup('Patient position', '<select class="form-select iofield" data-key="patientPosition" id="io_patientPosition">' + ['Supine','Prone','Lateral (Right)','Lateral (Left)','Lithotomy','Trendelenburg','Other'].map(function(p){return '<option value="'+p+'"'+(rec.patientPosition===p?' selected':'')+'>'+p+'</option>';}).join('') + '</select>') +
                '<div>' + ioChk('ppPadded', 'pressurePointsPadded', 'Pressure points padded', rec.pressurePointsPadded) + '</div>' +
            '</div>' +
            ioFormGroup('Pre-operative diagnosis', '<div class="form-control" style="background:var(--color-muted)">' + esc(op.procedure || '-') + '</div>') +
            ioFormGroup('Intra-operative findings', '<textarea class="form-control iofield" data-key="intraOpFindings" id="io_intraOpFindings" rows="4" placeholder="Describe findings in detail...">' + esc(rec.intraOpFindings) + '</textarea>') +
            ioFormGroup('Post-operative diagnosis', '<input type="text" class="form-control iofield" data-key="postOpDiagnosis" id="io_postOpDiagnosis" value="' + esc(rec.postOpDiagnosis) + '" placeholder="e.g. Confirmed acute appendicitis">')
        );

        if (isSectionEnabled_io('procedure_specimens')) html += ioSection('Section 2C: Procedure & Specimens', 'file-text',
            ioFormGroup('Detailed procedure description', '<textarea class="form-control iofield" data-key="procedureDescription" id="io_procedureDescription" rows="5" placeholder="Step-by-step account of procedure performed, techniques used, modifications...">' + esc(rec.procedureDescription) + '</textarea>') +
            '<p style="font-size:12px;font-weight:600;margin:12px 0 8px">Specimens Sent</p>' +
            ioSpecimenTable('specimens', rec.specimens, 'io_addSpecimen') +
            '<p style="font-size:12px;font-weight:600;margin:12px 0 8px">Implants Used</p>' +
            ioImplantTable('implants', rec.implants, 'io_addImplant')
        );

        if (isSectionEnabled_io('drains_catheters')) html += ioSection('Section 2D: Drains & Catheters', 'git-branch',
            '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Drains Placed</p>' +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">' +
                ioChkSmall('drRedivac', 'drainRedivac', 'Redivac drain', rec.drainRedivac) +
                ioChkSmall('drPigtail', 'drainPigtail', 'Pigtail drain', rec.drainPigtail) +
                ioChkSmall('drTTube', 'drainTTube', 'T-tube', rec.drainTTube) +
                ioChkSmall('drOther', 'drainOther', 'Other drain', rec.drainOther) +
            '</div>' +
            (rec.drainRedivac || rec.drainPigtail || rec.drainTTube || rec.drainOther ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">' + ioFormGroup('Location', '<input type="text" class="form-control iofield" data-key="drainLocation" id="io_drainLocation" value="' + esc(rec.drainLocation) + '" placeholder="e.g. RIF">') + ioFormGroup('Size (Fr)', '<input type="text" class="form-control iofield" data-key="drainSize" id="io_drainSize" value="' + esc(rec.drainSize) + '" placeholder="e.g. 20 Fr">') + '</div>' : '') +
            '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Catheters</p>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
                ioChkSmall('catUrinary', 'catUrinary', 'Urinary catheter', rec.catUrinary) +
                ioChkSmall('catCLine', 'catCentralLine', 'Central line', rec.catCentralLine) +
                ioChkSmall('catALine', 'catArterialLine', 'Arterial line', rec.catArterialLine) +
                ioChkSmall('catNG', 'catNgTube', 'NG tube', rec.catNgTube) +
                ioChkSmall('catOther', 'catOther', 'Other', rec.catOther) +
            '</div>' +
            (rec.catOther ? ioFormGroup('Other catheter details', '<input type="text" class="form-control iofield" data-key="catOtherText" id="io_catOtherText" value="' + esc(rec.catOtherText) + '">') : '')
        );

        var allMatch = rec.instrumentMatch && rec.spongeMatch && rec.needleMatch;
        if (isSectionEnabled_io('surgical_counts')) html += ioSection('Section 2E: Surgical Counts (Critical Safety)', 'calculator',
            '<table class="data-table" style="margin-bottom:12px"><thead><tr><th>Item</th><th>Before Surgery</th><th>After Surgery</th><th>Match</th></tr></thead><tbody>' +
            ioCountRow('instrument', 'Instruments', rec.instrumentBefore, rec.instrumentAfter, rec.instrumentMatch) +
            ioCountRow('sponge', 'Sponges', rec.spongeBefore, rec.spongeAfter, rec.spongeMatch) +
            ioCountRow('needle', 'Needles', rec.needleBefore, rec.needleAfter, rec.needleMatch) +
            '</tbody></table>' +
            (allMatch ? '<div style="display:flex;align-items:center;gap:10px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px"><i data-lucide="check-circle" style="width:20px;height:20px;color:#10B981"></i><span style="font-size:13px;font-weight:600;color:#10B981">All counts correct ✓</span>' + ioChk('allCountsCorrect', 'allCountsCorrect', 'Confirm all counts correct', rec.allCountsCorrect) + '</div>' :
                '<div style="display:flex;align-items:center;gap:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px"><i data-lucide="alert-triangle" style="width:20px;height:20px;color:#EF4444"></i><span style="font-size:13px;font-weight:600;color:#EF4444">COUNT MISMATCH — X-Ray Required!</span></div>')
        );

        if (isSectionEnabled_io('complications')) html += ioSection('Section 2F: Complications', 'alert-circle',
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">' +
                ioChkSmall('compNone', 'compNone', 'None', rec.compNone) +
                ioChkSmall('compBleeding', 'compExcessiveBleeding', 'Excessive bleeding', rec.compExcessiveBleeding) +
                ioChkSmall('compOrgan', 'compOrganInjury', 'Organ injury', rec.compOrganInjury) +
                ioChkSmall('compVasc', 'compVascularInjury', 'Vascular injury', rec.compVascularInjury) +
                ioChkSmall('compNerve', 'compNerveInjury', 'Nerve injury', rec.compNerveInjury) +
                ioChkSmall('compUnexpected', 'compUnexpectedFindings', 'Unexpected findings', rec.compUnexpectedFindings) +
                ioChkSmall('compOther', 'compOther', 'Other', rec.compOther) +
            '</div>' +
            (!rec.compNone ? ioFormGroup('Description', '<textarea class="form-control iofield" data-key="compDescription" id="io_compDescription" rows="3" placeholder="Describe complications and interventions">' + esc(rec.compDescription) + '</textarea>') : '')
        );

        if (isSectionEnabled_io('surgical_team')) html += ioSection('Section 3: Surgical Team', 'users',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
                ioFormGroup('Primary Surgeon', '<div class="form-control" style="background:var(--color-muted)">' + esc(op.surgeon || '-') + '</div>') +
                ioFormGroup('Anesthesiologist', '<div class="form-control" style="background:var(--color-muted)">' + esc(op.anaesthetist || '-') + '</div>') +
                ioFormGroup('Assistant Surgeon(s)', '<input type="text" class="form-control iofield" data-key="assistantSurgeons" id="io_assistantSurgeons" value="' + esc(rec.assistantSurgeons) + '" placeholder="Names separated by comma">') +
                ioFormGroup('Scrub Nurse', '<input type="text" class="form-control iofield" data-key="scrubNurse" id="io_scrubNurse" value="' + esc(rec.scrubNurse) + '" placeholder="Full name">') +
                ioFormGroup('Circulating Nurse', '<input type="text" class="form-control iofield" data-key="circulatingNurse" id="io_circulatingNurse" value="' + esc(rec.circulatingNurse) + '" placeholder="Full name">') +
                ioFormGroup('Anesthesia Technician', '<input type="text" class="form-control iofield" data-key="anesthesiaTechnician" id="io_anesthesiaTechnician" value="' + esc(rec.anesthesiaTechnician) + '" placeholder="Full name">') +
                ioFormGroup('Other staff present', '<input type="text" class="form-control iofield" data-key="otherStaff" id="io_otherStaff" value="' + esc(rec.otherStaff) + '" placeholder="e.g. Radiographer, Sales rep">') +
            '</div>'
        );

        if (isSectionEnabled_io('postop_instructions')) html += ioSection('Section 4: Post-Operative Instructions', 'bed-double',
            '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Post-Op Destination</p>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">' +
            ['Recovery Room / PACU','ICU','Ward','HDU'].map(function(d) {
                return '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;padding:8px 12px;border:1px solid '+(rec.postOpDestination===d?'var(--midnight-blue)':'var(--color-border)')+';border-radius:8px;background:'+(rec.postOpDestination===d?'rgba(6,7,64,0.05)':'var(--color-card)')+'">' +
                    '<input type="radio" name="postOpDest" class="iofield" data-key="postOpDestination" value="'+d+'"'+(rec.postOpDestination===d?' checked':'')+' style="accent-color:var(--midnight-blue)"> '+d+'</label>';
            }).join('') + '</div>' +
            '<p style="font-size:12px;font-weight:600;margin-bottom:8px">Monitoring Required</p>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:16px">' +
                ioChkSmall('pvitals15', 'postOpVitals15', 'Vitals every 15 mins', rec.postOpVitals15) +
                ioChkSmall('pvitals30', 'postOpVitals30', 'Vitals every 30 mins', rec.postOpVitals30) +
                ioChkSmall('pDrainOut', 'postOpDrainOutput', 'Drain output monitoring', rec.postOpDrainOutput) +
                ioChkSmall('pUrineOut', 'postOpUrineOutput', 'Urine output monitoring', rec.postOpUrineOutput) +
                ioChkSmall('pNeuro', 'postOpNeuro', 'Neurological observations', rec.postOpNeuro) +
                ioChkSmall('pOtherMon', 'postOpOtherMonitor', 'Other', rec.postOpOtherMonitor) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
                ioFormGroup('Activity orders', '<select class="form-select iofield" data-key="activityOrders" id="io_activityOrders">' + ['Bed rest','Head end elevated','Sitting allowed after 2 hours','Sitting allowed after 4 hours','Ambulation allowed after 4 hours','Ambulation allowed after 6 hours'].map(function(a){return '<option value="'+a+'"'+(rec.activityOrders===a?' selected':'')+'>'+a+'</option>';}).join('') + '</select>') +
                ioFormGroup('Diet orders', '<select class="form-select iofield" data-key="dietOrders" id="io_dietOrders">' + ['NPO','Clear liquids','Full liquids','Soft diet','Regular diet'].map(function(d){return '<option value="'+d+'"'+(rec.dietOrders===d?' selected':'')+'>'+d+'</option>';}).join('') + '</select>') +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
                ioFormGroup('Drain management', '<textarea class="form-control iofield" data-key="drainManagement" id="io_drainManagement" rows="2" placeholder="e.g. Remove drain when output < 30 ml/day">' + esc(rec.drainManagement) + '</textarea>') +
                ioFormGroup('Wound care', '<textarea class="form-control iofield" data-key="woundCare" id="io_woundCare" rows="2" placeholder="e.g. Daily dressing, remove sutures on day 7">' + esc(rec.woundCare) + '</textarea>') +
            '</div>' +
            ioFormGroup('Special instructions', '<textarea class="form-control iofield" data-key="specialInstructions" id="io_specialInstructions" rows="3" placeholder="Any additional instructions for recovery team">' + esc(rec.specialInstructions) + '</textarea>')
        );

        if (isSectionEnabled_io('who_signout')) html += ioSection('WHO Safety Checklist — Sign Out (Before Patient Leaves OT)', 'log-out',
            '<div style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:12px;margin-bottom:12px">' +
            ioChk('soRecorded', 'whoSignOut_procedureRecorded', 'Procedure recorded correctly', rec.whoSignOut.procedureRecorded) +
            ioChk('soCounts', 'whoSignOut_countsCorrect', 'Instrument, sponge, and needle counts correct', rec.whoSignOut.countsCorrect) +
            ioChk('soSpecimens', 'whoSignOut_specimensLabeled', 'Specimens labeled correctly (name on container)', rec.whoSignOut.specimensLabeled) +
            ioChk('soEquipment', 'whoSignOut_equipmentIssuesAddressed', 'Equipment problems addressed (if any)', rec.whoSignOut.equipmentIssuesAddressed) +
            ioChk('soKeyConcerns', 'whoSignOut_keyConcernsReviewed', 'Key concerns for recovery/post-operative management reviewed', rec.whoSignOut.keyConcernsReviewed) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
                ioFormGroup('Sign Out completed at', '<input type="time" class="form-control iofield" data-key="whoSignOut_signOutCompletedAt" id="io_whoSignOut_signOutCompletedAt" value="' + esc(rec.whoSignOut.signOutCompletedAt) + '">') +
                ioFormGroup('Confirmed by', '<select class="form-select iofield" data-key="whoSignOut_confirmedBy" id="io_whoSignOut_confirmedBy"><option value="">-- Select --</option>' + doctors.map(function(d){ var n='Dr. '+d.firstName+' '+d.lastName; return '<option value="'+n+'"'+(rec.whoSignOut.confirmedBy===n?' selected':'')+'>'+n+'</option>'; }).join('') + '</select>') +
            '</div>'
        );

        // Custom intra-op sections
        otIntraopFormSections.filter(function(s) { return !s.isDefault && s.isEnabled; }).forEach(function(sec) {
            html += ioSection(esc(sec.label), 'layout-panel-left', renderOtIntraopCustomSectionContent(sec));
        });

        html += '</div>';

        html += '<div style="display:flex;flex-direction:column;overflow:hidden">';
        html += '<div style="padding:16px;border-bottom:1px solid var(--color-border);overflow-y:auto;flex:1">';
        html += '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px">Current Phase</h3>';
        html += '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px">';
        phases.forEach(function(p) {
            var c = phaseColors[p] || '#64748B';
            var active = phase === p;
            html += '<button class="io-phase-btn" data-phase="' + p + '" style="padding:8px 12px;border-radius:8px;border:1px solid ' + (active ? c : 'var(--color-border)') + ';background:' + (active ? c + '1a' : 'var(--color-card)') + ';color:' + (active ? c : 'var(--color-foreground)') + ';font-size:12px;font-weight:' + (active ? '700' : '500') + ';cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px">' +
                (active ? '<i data-lucide="circle" style="width:8px;height:8px;fill:' + c + ';color:' + c + '"></i>' : '<i data-lucide="circle" style="width:8px;height:8px;color:var(--color-border)"></i>') +
                p + '</button>';
        });
        html += '</div>';

        html += '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px">Live Stats</h3>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px">';
        html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">Blood Loss</p><p style="font-size:18px;font-weight:700;margin:0;color:' + (bloodLossNum >= 500 ? '#EF4444' : 'var(--midnight-blue)') + '">' + (rec.bloodLoss || '0') + '<span style="font-size:10px;font-weight:400"> ml</span></p></div>';
        html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">Urine Output</p><p style="font-size:18px;font-weight:700;margin:0;color:var(--midnight-blue)">' + (rec.urineOutput || '0') + '<span style="font-size:10px;font-weight:400"> ml</span></p></div>';
        html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">Total In</p><p style="font-size:18px;font-weight:700;margin:0;color:#10B981">' + totalIn + '<span style="font-size:10px;font-weight:400"> ml</span></p></div>';
        html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">Fluid Balance</p><p style="font-size:18px;font-weight:700;margin:0;color:' + (fluidBalance < 0 ? '#EF4444' : '#10B981') + '">' + (fluidBalance >= 0 ? '+' : '') + fluidBalance + '<span style="font-size:10px;font-weight:400"> ml</span></p></div>';
        html += '</div>';

        html += '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px">Vitals (' + rec.vitalsLog.length + ' readings)</h3>';
        if (rec.vitalsLog.length > 0) {
            var last = rec.vitalsLog[rec.vitalsLog.length - 1];
            html += '<div style="background:var(--color-muted);border-radius:8px;padding:10px;margin-bottom:12px;font-size:12px">' +
                '<p style="font-weight:600;margin-bottom:4px">Last reading at ' + esc(last.time) + '</p>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' +
                '<span>HR: <strong>' + esc(last.hr) + '</strong></span><span>BP: <strong>' + esc(last.bp) + '</strong></span>' +
                '<span>SPO2: <strong>' + esc(last.spo2) + '%</strong></span><span>ETCO2: <strong>' + esc(last.etco2) + '</strong></span>' +
                '</div></div>';
        }

        var isIoLocked = op.status === 'Completed';

        html += '</div>';
        html += '<div style="padding:16px;border-top:1px solid var(--color-border);display:flex;flex-direction:column;gap:10px">';
        if (isIoLocked) {
            html += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;' +
                'background:#f0fdf4;border:1.5px solid var(--aqua-mint);border-radius:10px;padding:12px 16px">' +
                '<i data-lucide="lock" style="width:16px;height:16px;color:#10b981"></i>' +
                '<span style="font-size:13px;font-weight:600;color:#166534">Surgery Completed — Read Only</span>' +
                '</div>';
            html += '<button class="btn-outline btn-sm" id="btnPrintAneChart" style="width:100%"><i data-lucide="printer" style="width:14px;height:14px"></i> Print Anesthesia Chart</button>';
            html += '<button class="btn-outline btn-sm" id="btnPrintOpNote" style="width:100%"><i data-lucide="file-text" style="width:14px;height:14px"></i> Print Operative Note</button>';
        } else {
            html += '<button class="btn-outline btn-sm" id="btnSaveIntraOp" style="width:100%"><i data-lucide="save" style="width:14px;height:14px"></i> Save Progress</button>';
            html += '<button class="btn-outline btn-sm" id="btnPrintAneChart" style="width:100%"><i data-lucide="printer" style="width:14px;height:14px"></i> Print Anesthesia Chart</button>';
            html += '<button class="btn-outline btn-sm" id="btnPrintOpNote" style="width:100%"><i data-lucide="file-text" style="width:14px;height:14px"></i> Print Operative Note</button>';
            html += '<button class="btn-primary" id="btnCompleteIntraOp" style="width:100%;background:var(--aqua-mint);color:var(--midnight-blue);border-color:var(--aqua-mint);font-weight:700"><i data-lucide="check-circle" style="width:14px;height:14px"></i> Complete Surgery &amp; Transfer to Recovery</button>';
        }
        html += '</div></div>';

        html += '</div>';

        $('#otIntraOpSheetBody').html(html);
        lucide.createIcons();
        bindIntraOpEvents(op);

        /* ── Lock intra-op sheet if surgery already completed ── */
        if (isIoLocked) {
            var $ioLeft = $('#otIntraOpSheetBody').find('div[style*="overflow-y:auto"]').first();
            $ioLeft.find('input, select, textarea, button').prop('disabled', true);
            $ioLeft.find('label').css('cursor', 'default');
            $ioLeft.css('opacity', '0.85');
            $ioLeft.prepend(
                '<div style="display:flex;align-items:center;gap:10px;' +
                    'background:#f0fdf4;border:1.5px solid #10b981;border-radius:10px;' +
                    'padding:12px 16px;margin-bottom:20px">' +
                    '<i data-lucide="lock" style="width:18px;height:18px;color:#10b981"></i>' +
                    '<div>' +
                        '<div style="font-size:13px;font-weight:700;color:#166534">Surgery Completed &amp; Locked</div>' +
                        '<div style="font-size:12px;color:#16a34a">This intra-operative record is read-only and cannot be modified.</div>' +
                    '</div>' +
                '</div>'
            );
            lucide.createIcons();
        }
    }

    function ioSection(title, icon, content) {
        return '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--color-border);background:var(--color-muted);border-radius:12px 12px 0 0">' +
                '<i data-lucide="' + icon + '" style="width:16px;height:16px;color:var(--midnight-blue)"></i>' +
                '<h4 style="font-size:13px;font-weight:600;margin:0">' + title + '</h4>' +
            '</div><div style="padding:16px 20px">' + content + '</div></div>';
    }

    function ioChk(id, key, label, checked) {
        return '<div style="margin-bottom:8px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">' +
            '<input type="checkbox" class="iofield iochk" data-key="' + key + '" id="' + id + '"' + (checked ? ' checked' : '') + ' style="width:15px;height:15px;accent-color:var(--midnight-blue)">' +
            (checked ? '<i data-lucide="check-circle" style="width:15px;height:15px;color:#10B981"></i>' : '<i data-lucide="circle" style="width:15px;height:15px;color:var(--color-border)"></i>') +
            '<span>' + label + '</span></label></div>';
    }

    function ioChkSmall(id, key, label, checked) {
        return '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;padding:6px 0;border-bottom:1px solid var(--color-border)">' +
            '<input type="checkbox" class="iofield iochk" data-key="' + key + '" id="' + id + '"' + (checked ? ' checked' : '') + ' style="width:13px;height:13px;accent-color:var(--midnight-blue)">' +
            (checked ? '<i data-lucide="check-circle" style="width:12px;height:12px;color:#10B981"></i>' : '<i data-lucide="circle" style="width:12px;height:12px;color:var(--color-border)"></i>') +
            '<span' + (checked ? '' : ' style="color:var(--color-muted-foreground)"') + '>' + label + '</span></label>';
    }

    function ioFormGroup(label, input) {
        return '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase;display:block;margin-bottom:4px">' + label + '</label>' + input + '</div>';
    }

    function ioAgentRow(key, label, concKey, unit, rec) {
        return '<div style="border:1px solid var(--color-border);border-radius:8px;padding:8px">' +
            '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;font-weight:500;margin-bottom:6px">' +
            '<input type="checkbox" class="iofield iochk" data-key="' + key + '" id="io_' + key + '"' + (rec[key] ? ' checked' : '') + ' style="width:13px;height:13px;accent-color:var(--midnight-blue)"> ' + label + '</label>' +
            (rec[key] ? '<input type="text" class="form-control iofield" data-key="' + concKey + '" id="io_' + concKey + '" value="' + esc(rec[concKey]) + '" placeholder="e.g. 2.0" style="font-size:11px;padding:4px 6px"> <span style="font-size:10px;color:var(--color-muted-foreground)">' + unit + '</span>' : '') +
        '</div>';
    }

    function ioMedTable(stateKey, meds, btnId) {
        var html = '<div style="overflow-x:auto;margin-bottom:8px"><table class="data-table" style="font-size:11px"><thead><tr><th>Drug</th><th>Dose</th><th>Route</th><th>Time</th><th style="width:30px"></th></tr></thead><tbody>';
        if (meds.length === 0) { html += '<tr><td colspan="5" style="text-align:center;color:var(--color-muted-foreground);padding:10px">None added</td></tr>'; }
        meds.forEach(function(m, i) {
            html += '<tr><td><input type="text" class="form-control io-med-field" data-list="' + stateKey + '" data-idx="' + i + '" data-field="drug" value="' + esc(m.drug) + '" placeholder="Drug name" style="font-size:11px;min-width:100px"></td>' +
                '<td><input type="text" class="form-control io-med-field" data-list="' + stateKey + '" data-idx="' + i + '" data-field="dose" value="' + esc(m.dose) + '" placeholder="Dose" style="font-size:11px;width:70px"></td>' +
                '<td><select class="form-select io-med-field" data-list="' + stateKey + '" data-idx="' + i + '" data-field="route" style="font-size:11px;min-width:70px"><option value="IV"'+(m.route==='IV'?' selected':'')+'>IV</option><option value="IM"'+(m.route==='IM'?' selected':'')+'>IM</option><option value="SC"'+(m.route==='SC'?' selected':'')+'>SC</option></select></td>' +
                '<td><input type="time" class="form-control io-med-field" data-list="' + stateKey + '" data-idx="' + i + '" data-field="time" value="' + esc(m.time) + '" style="font-size:11px;width:80px"></td>' +
                '<td><button class="btn-ghost io-remove-med" data-list="' + stateKey + '" data-idx="' + i + '"><i data-lucide="trash-2" style="width:12px;height:12px;color:var(--color-destructive)"></i></button></td></tr>';
        });
        html += '</tbody></table></div><button class="btn-outline btn-sm io-add-med" data-list="' + stateKey + '" id="' + btnId + '" style="font-size:11px"><i data-lucide="plus" style="width:12px;height:12px"></i> Add Medication</button>';
        return html;
    }

    function ioFluidTable(stateKey, fluids, typeOptions, btnId) {
        var html = '<div style="margin-bottom:6px">';
        if (fluids.length === 0) { html += '<p style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:6px">None added</p>'; }
        fluids.forEach(function(f, i) {
            html += '<div style="display:flex;gap:4px;margin-bottom:4px">' +
                '<select class="form-select io-fluid-field" data-list="' + stateKey + '" data-idx="' + i + '" data-field="type" style="font-size:11px;flex:2">' + typeOptions.map(function(t){return '<option value="'+t+'"'+(f.type===t?' selected':'')+'>'+t+'</option>';}).join('') + '</select>' +
                '<input type="number" class="form-control io-fluid-field" data-list="' + stateKey + '" data-idx="' + i + '" data-field="volume" value="' + esc(f.volume) + '" placeholder="mL" style="font-size:11px;width:70px">' +
                '<button class="btn-ghost io-remove-fluid" data-list="' + stateKey + '" data-idx="' + i + '" style="padding:4px"><i data-lucide="trash-2" style="width:11px;height:11px;color:var(--color-destructive)"></i></button>' +
            '</div>';
        });
        html += '<button class="btn-outline btn-sm io-add-fluid" data-list="' + stateKey + '" id="' + btnId + '" style="font-size:10px;width:100%"><i data-lucide="plus" style="width:10px;height:10px"></i> Add</button></div>';
        return html;
    }

    function ioBloodTable(stateKey, items, btnId) {
        var html = '<div style="margin-bottom:6px">';
        if (items.length === 0) { html += '<p style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:6px">None given</p>'; }
        items.forEach(function(b, i) {
            html += '<div style="display:flex;gap:4px;margin-bottom:4px">' +
                '<select class="form-select io-fluid-field" data-list="' + stateKey + '" data-idx="' + i + '" data-field="type" style="font-size:11px;flex:2">' + ['PRBC','FFP','Platelets','Cryoprecipitate'].map(function(t){return '<option value="'+t+'"'+(b.type===t?' selected':'')+'>'+t+'</option>';}).join('') + '</select>' +
                '<input type="number" class="form-control io-fluid-field" data-list="' + stateKey + '" data-idx="' + i + '" data-field="units" value="' + esc(b.units) + '" placeholder="Units" style="font-size:11px;width:70px">' +
                '<button class="btn-ghost io-remove-fluid" data-list="' + stateKey + '" data-idx="' + i + '" style="padding:4px"><i data-lucide="trash-2" style="width:11px;height:11px;color:var(--color-destructive)"></i></button>' +
            '</div>';
        });
        html += '<button class="btn-outline btn-sm io-add-blood" id="' + btnId + '" style="font-size:10px;width:100%"><i data-lucide="plus" style="width:10px;height:10px"></i> Add</button></div>';
        return html;
    }

    function ioSpecimenTable(stateKey, specimens, btnId) {
        var html = '<div style="overflow-x:auto;margin-bottom:6px"><table class="data-table" style="font-size:11px"><thead><tr><th>Specimen type</th><th>Sent for</th><th>Time</th><th style="width:30px"></th></tr></thead><tbody>';
        if (specimens.length === 0) { html += '<tr><td colspan="4" style="text-align:center;color:var(--color-muted-foreground);padding:10px">No specimens</td></tr>'; }
        specimens.forEach(function(s, i) {
            html += '<tr><td><input type="text" class="form-control io-spec-field" data-idx="' + i + '" data-field="type" value="' + esc(s.type) + '" placeholder="e.g. Appendix" style="font-size:11px;min-width:100px"></td>' +
                '<td><select class="form-select io-spec-field" data-idx="' + i + '" data-field="sentFor" style="font-size:11px">' + ['Histopathology','Frozen section','Culture & Sensitivity'].map(function(t){return '<option value="'+t+'"'+(s.sentFor===t?' selected':'')+'>'+t+'</option>';}).join('') + '</select></td>' +
                '<td><input type="time" class="form-control io-spec-field" data-idx="' + i + '" data-field="time" value="' + esc(s.time) + '" style="font-size:11px;width:80px"></td>' +
                '<td><button class="btn-ghost io-remove-spec" data-idx="' + i + '"><i data-lucide="trash-2" style="width:12px;height:12px;color:var(--color-destructive)"></i></button></td></tr>';
        });
        html += '</tbody></table></div><button class="btn-outline btn-sm" id="' + btnId + '" style="font-size:11px"><i data-lucide="plus" style="width:12px;height:12px"></i> Add Specimen</button>';
        return html;
    }

    function ioImplantTable(stateKey, implants, btnId) {
        var html = '<div style="overflow-x:auto;margin-bottom:6px"><table class="data-table" style="font-size:11px"><thead><tr><th>Implant name</th><th>Serial #</th><th>Batch #</th><th style="width:30px"></th></tr></thead><tbody>';
        if (implants.length === 0) { html += '<tr><td colspan="4" style="text-align:center;color:var(--color-muted-foreground);padding:10px">No implants</td></tr>'; }
        implants.forEach(function(imp, i) {
            html += '<tr><td><input type="text" class="form-control io-impl-field" data-idx="' + i + '" data-field="name" value="' + esc(imp.name) + '" style="font-size:11px"></td>' +
                '<td><input type="text" class="form-control io-impl-field" data-idx="' + i + '" data-field="serial" value="' + esc(imp.serial) + '" style="font-size:11px;width:100px"></td>' +
                '<td><input type="text" class="form-control io-impl-field" data-idx="' + i + '" data-field="batch" value="' + esc(imp.batch) + '" style="font-size:11px;width:100px"></td>' +
                '<td><button class="btn-ghost io-remove-impl" data-idx="' + i + '"><i data-lucide="trash-2" style="width:12px;height:12px;color:var(--color-destructive)"></i></button></td></tr>';
        });
        html += '</tbody></table></div><button class="btn-outline btn-sm" id="' + btnId + '" style="font-size:11px"><i data-lucide="plus" style="width:12px;height:12px"></i> Add Implant</button>';
        return html;
    }

    function ioCountRow(prefix, label, before, after, match) {
        return '<tr>' +
            '<td style="font-weight:500;font-size:13px">' + label + '</td>' +
            '<td><input type="number" class="form-control iofield" data-key="' + prefix + 'Before" id="io_' + prefix + 'Before" value="' + esc(before) + '" placeholder="0" style="width:80px;font-size:12px"></td>' +
            '<td><input type="number" class="form-control iofield" data-key="' + prefix + 'After" id="io_' + prefix + 'After" value="' + esc(after) + '" placeholder="0" style="width:80px;font-size:12px"></td>' +
            '<td>' + (match ? '<span style="color:#10B981;font-size:20px;font-weight:700">✓</span>' : '<span style="color:#EF4444;font-size:20px;font-weight:700">✗</span>') + '</td>' +
        '</tr>';
    }

    function bindIntraOpEvents(op) {
        $(document).off('change.intraop').on('change.intraop', '.iofield', function() {
            if (!selectedIntraOpId) return;
            /* Block edits on completed/locked records */
            var _ioOp = operations.find(function(o) { return o.operationId === selectedIntraOpId; });
            if (_ioOp && _ioOp.status === 'Completed') return;
            var key = $(this).data('key');
            if (!key) return;
            var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
            var rec = intraOpState[selectedIntraOpId];
            if (key.indexOf('_') > -1) {
                var parts = key.split('_');
                var obj = parts[0]; var field = parts.slice(1).join('_');
                if (!rec[obj]) rec[obj] = {};
                rec[obj][field] = val;
            } else {
                rec[key] = val;
            }
            if (key === 'anesthesiaStartTime' && val) {
                var now = new Date();
                var parts2 = val.split(':');
                now.setHours(parseInt(parts2[0]), parseInt(parts2[1]), 0, 0);
                rec.anesthesiaStartTime = now.toISOString();
                if (op) { op.anesthesiaStartTime = rec.anesthesiaStartTime; }
                $('#intraOpLiveTimer').show();
            }
            if (key === 'instrumentBefore' || key === 'instrumentAfter') rec.instrumentMatch = (rec.instrumentBefore === rec.instrumentAfter && rec.instrumentBefore !== '');
            if (key === 'spongeBefore' || key === 'spongeAfter') rec.spongeMatch = (rec.spongeBefore === rec.spongeAfter && rec.spongeBefore !== '');
            if (key === 'needleBefore' || key === 'needleAfter') rec.needleMatch = (rec.needleBefore === rec.needleAfter && rec.needleBefore !== '');
            if (key.indexOf('who') > -1 || key.indexOf('Count') > -1 || key === 'compNone' || key === 'anesthesiaStartTime' || key === 'anesthesiaEndTime' || key === 'incisionTime' || key === 'finalSutureTime' || key === 'bloodLoss' || key === 'urineOutput' || key === 'airwayType' || key === 'inductionDifficultIntubation' || key === 'inductionOther' || key === 'sevoflurane' || key === 'isoflurane' || key === 'desflurane' || key === 'propofol' || key === 'maintenanceOther' || key === 'drainRedivac' || key === 'drainPigtail' || key === 'drainTTube' || key === 'drainOther' || key === 'catOther' || key === 'postOpDestination') {
                renderIntraOpSheet(op);
            }
        });

        $(document).off('input.intraopText').on('input.intraopText', '.iofield:not(:checkbox)', function() {
            if (!selectedIntraOpId) return;
            var key = $(this).data('key');
            if (!key || $(this).is('select')) return;
            var val = $(this).val();
            var rec = intraOpState[selectedIntraOpId];
            if (key.indexOf('_') > -1) {
                var parts = key.split('_');
                if (!rec[parts[0]]) rec[parts[0]] = {};
                rec[parts[0]][parts.slice(1).join('_')] = val;
            } else {
                rec[key] = val;
            }
        });

        $(document).off('click.ioPhase').on('click.ioPhase', '.io-phase-btn', function() {
            if (!selectedIntraOpId) return;
            var phase = $(this).data('phase');
            intraOpState[selectedIntraOpId].currentPhase = phase;
            var op2 = operations.find(function(o) { return o.operationId === selectedIntraOpId; });
            if (op2) op2.currentPhase = phase;
            renderIntraOpSheet(op);
        });

        $('#btnAddVital').off('click').on('click', function() {
            if (!selectedIntraOpId) return;
            var rec = intraOpState[selectedIntraOpId];
            var t = $('#newVitTime').val() || new Date().toTimeString().slice(0,5);
            rec.vitalsLog.push({ time: t, hr: $('#newVitHR').val(), bp: $('#newVitBP').val(), spo2: $('#newVitSPO2').val(), etco2: $('#newVitETCO2').val(), temp: $('#newVitTemp').val(), rr: $('#newVitRR').val() });
            renderIntraOpSheet(op);
        });

        $(document).off('click.ioRemVital').on('click.ioRemVital', '.io-remove-vital', function() {
            if (!selectedIntraOpId) return;
            intraOpState[selectedIntraOpId].vitalsLog.splice($(this).data('idx'), 1);
            renderIntraOpSheet(op);
        });

        $(document).off('click.ioAddMed').on('click.ioAddMed', '.io-add-med', function() {
            if (!selectedIntraOpId) return;
            var list = $(this).data('list');
            if (!intraOpState[selectedIntraOpId][list]) intraOpState[selectedIntraOpId][list] = [];
            intraOpState[selectedIntraOpId][list].push({ drug: '', dose: '', route: 'IV', time: '' });
            renderIntraOpSheet(op);
        });

        $(document).off('input.ioMedField change.ioMedField').on('input.ioMedField change.ioMedField', '.io-med-field', function() {
            if (!selectedIntraOpId) return;
            var list = $(this).data('list'); var idx = $(this).data('idx'); var field = $(this).data('field');
            intraOpState[selectedIntraOpId][list][idx][field] = $(this).val();
        });

        $(document).off('click.ioRemMed').on('click.ioRemMed', '.io-remove-med', function() {
            if (!selectedIntraOpId) return;
            var list = $(this).data('list');
            intraOpState[selectedIntraOpId][list].splice($(this).data('idx'), 1);
            renderIntraOpSheet(op);
        });

        $(document).off('click.ioAddFluid').on('click.ioAddFluid', '.io-add-fluid', function() {
            if (!selectedIntraOpId) return;
            var list = $(this).data('list');
            if (!intraOpState[selectedIntraOpId][list]) intraOpState[selectedIntraOpId][list] = [];
            intraOpState[selectedIntraOpId][list].push({ type: '', volume: '' });
            renderIntraOpSheet(op);
        });

        $('#io_addBlood').off('click').on('click', function() {
            if (!selectedIntraOpId) return;
            intraOpState[selectedIntraOpId].bloodProducts.push({ type: 'PRBC', units: '' });
            renderIntraOpSheet(op);
        });

        $(document).off('input.ioFluid change.ioFluid').on('input.ioFluid change.ioFluid', '.io-fluid-field', function() {
            if (!selectedIntraOpId) return;
            var list = $(this).data('list'); var idx = $(this).data('idx'); var field = $(this).data('field');
            if (list) intraOpState[selectedIntraOpId][list][idx][field] = $(this).val();
        });

        $(document).off('click.ioRemFluid').on('click.ioRemFluid', '.io-remove-fluid', function() {
            if (!selectedIntraOpId) return;
            var list = $(this).data('list');
            if (list) intraOpState[selectedIntraOpId][list].splice($(this).data('idx'), 1);
            renderIntraOpSheet(op);
        });

        $('#io_addSpecimen').off('click').on('click', function() {
            if (!selectedIntraOpId) return;
            intraOpState[selectedIntraOpId].specimens.push({ type: '', sentFor: 'Histopathology', time: '' });
            renderIntraOpSheet(op);
        });

        $(document).off('input.ioSpec change.ioSpec').on('input.ioSpec change.ioSpec', '.io-spec-field', function() {
            if (!selectedIntraOpId) return;
            var idx = $(this).data('idx'); var field = $(this).data('field');
            intraOpState[selectedIntraOpId].specimens[idx][field] = $(this).val();
        });

        $(document).off('click.ioRemSpec').on('click.ioRemSpec', '.io-remove-spec', function() {
            if (!selectedIntraOpId) return;
            intraOpState[selectedIntraOpId].specimens.splice($(this).data('idx'), 1);
            renderIntraOpSheet(op);
        });

        $('#io_addImplant').off('click').on('click', function() {
            if (!selectedIntraOpId) return;
            intraOpState[selectedIntraOpId].implants.push({ name: '', serial: '', batch: '' });
            renderIntraOpSheet(op);
        });

        $(document).off('input.ioImpl').on('input.ioImpl', '.io-impl-field', function() {
            if (!selectedIntraOpId) return;
            var idx = $(this).data('idx'); var field = $(this).data('field');
            intraOpState[selectedIntraOpId].implants[idx][field] = $(this).val();
        });

        $(document).off('click.ioRemImpl').on('click.ioRemImpl', '.io-remove-impl', function() {
            if (!selectedIntraOpId) return;
            intraOpState[selectedIntraOpId].implants.splice($(this).data('idx'), 1);
            renderIntraOpSheet(op);
        });

        $('#btnSaveIntraOp').off('click').on('click', function() { saveIntraOpRecord(true, false); });
        $('#btnPrintAneChart').off('click').on('click', function() { printIntraOpRecord('anesthesia'); });
        $('#btnPrintOpNote').off('click').on('click',  function() { printIntraOpRecord('operative'); });
        $('#btnCompleteIntraOp').off('click').on('click', function() {
            _showIntraOpCompleteConfirm();
        });
    }

    var $pendingIntraOpCompleteBtn = null;

    function _showIntraOpCompleteConfirm() {
        var opId      = selectedIntraOpId;
        var op        = operations.find(function(o) { return o.operationId === opId; });
        var rec       = intraOpState[opId] || {};
        var dest      = rec.postOpDestination || 'Recovery';
        var phase     = rec.currentPhase || 'Pre-Induction';

        $('#intraOpCompleteConfirmModal').remove();

        var modal =
            '<div class="modal fade" id="intraOpCompleteConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:460px">' +
            '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
                '<div class="modal-header" style="background:var(--midnight-blue);color:#fff;border:none;padding:16px 20px">' +
                    '<div style="display:flex;align-items:center;gap:10px">' +
                        '<i data-lucide="check-circle" style="width:20px;height:20px;color:var(--aqua-mint)"></i>' +
                        '<h5 class="modal-title" style="margin:0;font-size:16px;font-weight:600">Complete Surgery &amp; Transfer to Recovery</h5>' +
                    '</div>' +
                    '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>' +
                '</div>' +
                '<div class="modal-body" style="padding:20px">' +
                    /* Patient card */
                    '<div style="display:flex;align-items:center;gap:14px;padding:14px;background:#f8fafc;border-radius:10px;margin-bottom:16px">' +
                        '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff">' + getInitials(op ? op.patientName : '') + '</div>' +
                        '<div>' +
                            '<div style="font-weight:600;font-size:15px">' + esc(op ? op.patientName : '') + '</div>' +
                            '<div style="font-size:12px;color:#64748b;font-family:monospace">' + esc(opId) + '</div>' +
                            '<div style="font-size:12px;color:#64748b;margin-top:2px">Procedure: <strong>' + esc(op ? op.procedure : '') + '</strong></div>' +
                        '</div>' +
                    '</div>' +
                    /* Summary */
                    '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:8px">' +
                        '<div style="font-size:12px;color:#1e40af;margin-bottom:6px;font-weight:600">Surgery Summary</div>' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px;color:#1e293b">' +
                            '<div>Current Phase: <strong>' + esc(phase) + '</strong></div>' +
                            '<div>Transfer to: <strong>' + esc(dest) + '</strong></div>' +
                            '<div>Blood Loss: <strong>' + esc((rec.bloodLoss || '0') + ' ml') + '</strong></div>' +
                            '<div>Duration: <strong>' + esc(rec.anesthesiaStartTime ? 'Recorded' : 'N/A') + '</strong></div>' +
                        '</div>' +
                    '</div>' +
                    '<p style="font-size:12px;color:#64748b;margin:10px 0 0">This will mark the surgery as <strong>Completed</strong> and close the intra-operative record.</p>' +
                '</div>' +
                '<div class="modal-footer" style="border:none;padding:12px 20px;gap:8px">' +
                    '<button class="btn-outline" data-bs-dismiss="modal" style="min-width:90px">Cancel</button>' +
                    '<button class="btn-primary" id="btnIntraOpCompleteConfirm" style="min-width:200px;background:var(--aqua-mint);color:var(--midnight-blue);border-color:var(--aqua-mint);font-weight:700">' +
                        '<i data-lucide="check-circle" style="width:14px;height:14px"></i> Confirm &amp; Complete Surgery' +
                    '</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(modal);
        lucide.createIcons();

        var $modal  = $('#intraOpCompleteConfirmModal');
        var bsModal = new bootstrap.Modal($modal[0]);
        bsModal.show();

        $modal[0].addEventListener('hidden.bs.modal', function() {
            if ($pendingIntraOpCompleteBtn) {
                $pendingIntraOpCompleteBtn = null;
                _doIntraOpComplete(op, rec);
            }
            $modal.remove();
        }, { once: true });

        $('#btnIntraOpCompleteConfirm').off('click').on('click', function() {
            $pendingIntraOpCompleteBtn = true;
            bsModal.hide();
        });
    }

    function _doIntraOpComplete(op, rec) {
        var opId = selectedIntraOpId;
        var dest = (rec && rec.postOpDestination) || 'Recovery';

        saveOtIntraopCustomFormValues();
        var recFresh = intraOpState[opId] || defaultIntraOp();
        var payload  = {
            intraopRecord: recFresh,
            currentPhase: recFresh.currentPhase || 'Pre-Induction',
            anesthesiaStartTime: recFresh.anesthesiaStartTime || null,
            status: 'In Progress'
        };

        $.ajax({
            url: '/api/ot/intraop/' + encodeURIComponent(opId) + '/complete',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload)
        }).done(function() {
            if (op) op.status = 'Completed';
            renderIntraOpTab();
            _showIntraOpCompleteSuccess(op, dest);
        }).fail(function() {
            HMS.toast('Failed to complete surgery record. Please try again.', 'error');
        });
    }

    function _showIntraOpCompleteSuccess(op, dest) {
        $('#intraOpCompleteSuccessModal').remove();

        var modal =
            '<div class="modal fade" id="intraOpCompleteSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:400px">' +
            '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
                '<div style="background:linear-gradient(135deg,var(--midnight-blue) 0%,#1e3a8a 100%);padding:28px 24px;text-align:center">' +
                    '<div style="width:60px;height:60px;background:rgba(127,255,212,0.15);border:2px solid var(--aqua-mint);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">' +
                        '<i data-lucide="check-circle" style="width:30px;height:30px;color:var(--aqua-mint)"></i>' +
                    '</div>' +
                    '<h4 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 4px">Surgery Completed!</h4>' +
                    '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0">' + esc(op ? op.patientName : '') + '</p>' +
                '</div>' +
                '<div style="padding:20px 24px;text-align:center">' +
                    '<div style="display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 18px;font-size:13px;color:#166534;margin-bottom:8px">' +
                        '<i data-lucide="arrow-right-circle" style="width:15px;height:15px"></i>' +
                        '<span>Patient transferred to <strong>' + esc(dest) + '</strong></span>' +
                    '</div>' +
                    '<p style="font-size:12px;color:#64748b;margin:8px 0 0">The intra-operative record has been saved and the surgery is marked as completed.</p>' +
                '</div>' +
                '<div style="padding:0 20px 20px;text-align:center">' +
                    '<button class="btn-primary" id="btnIntraOpSuccessClose" style="width:100%">Close</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(modal);
        lucide.createIcons();
        var bsModal = new bootstrap.Modal(document.getElementById('intraOpCompleteSuccessModal'));
        bsModal.show();

        $('#btnIntraOpSuccessClose').off('click').on('click', function() { bsModal.hide(); });

        document.getElementById('intraOpCompleteSuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#intraOpCompleteSuccessModal').remove();
            /* Close the intra-op offcanvas after success popup is dismissed */
            var oc = bootstrap.Offcanvas.getInstance(document.getElementById('otIntraOpSheet'));
            if (oc) oc.hide();
        }, { once: true });
    }

    // ===== PRE-OP CHECKLIST =====
    var selectedPreOpOp = null;
    var checklistState = {};   // last saved / committed state (mirrors API)
    var checklistDraft  = {};  // unsaved working copy (discarded on close without save)
    var checklistAutoSaveTimer = null;
    var otFormSections = [];
    var otCustomChecklistData = {};
    var otIntraopFormSections = [];
    var otCustomIntraopData = {};
    var MANDATORY_ITEMS = ['patientIdentityConfirmed','procedureVerified','surgicalSiteMarked','surgeryConsentSigned','anesthesiaConsentSigned','pacCompleted','npoSince','cbcDone','bloodGroupingDone','ecgDone','chestXrayDone','ivLineSecured','otPrepared','equipmentSterilized','reviewedBySurgeon'];

    function loadOtFormSections() {
        $.get('/api/ot/form-sections').done(function(sections) {
            otFormSections = sections || [];
        }).fail(function() { otFormSections = []; });
    }

    function getAvailableOtSections() {
        var defaults = otFormSections.filter(function(s) { return s.isDefault && s.isEnabled; });
        var customs  = otFormSections.filter(function(s) { return !s.isDefault && s.isEnabled; });
        return defaults.concat(customs);
    }

    function loadOtIntraopFormSections() {
        $.get('/api/ot/intraop-form-sections').done(function(sections) {
            otIntraopFormSections = sections || [];
        }).fail(function() { otIntraopFormSections = []; });
    }

    function getAvailableOtIntraopSections() {
        return otIntraopFormSections.filter(function(s) { return s.isEnabled; });
    }

    loadOtFormSections();
    loadOtIntraopFormSections();

    function defaultChecklist() {
        return {
            patientIdentityConfirmed:false, nameVerifiedWithId:false, wristbandChecked:false,
            procedureVerified:false, patientConfirmsProcedure:false, siteMark:false, surgicalSiteMarked:false,
            surgeryConsentSigned:false, surgeryConsentDate:'', anesthesiaConsentSigned:false,
            bloodTransfusionConsent:false, highRiskConsent:false, implantConsent:false,
            consentObtainedBy:'', witnessName:'',
            pacCompleted:false, pacDate:'', asaClassification:'ASA I (Healthy)',
            mallampatiScore:'Class I', airwayAssessment:'Normal',
            medicalClearanceObtained:false, clearanceSpecialty:'', clearanceBy:'',
            npoSince:'',
            cbcDone:false, cbcHb:'', cbcWbc:'', cbcPlatelets:'',
            bloodGroupingDone:false, bloodGroup:'', unitsArranged:'',
            coagProfileDone:false, ptInr:'', aptt:'',
            renalFunctionDone:false, creatinine:'', urea:'',
            liverFunctionDone:false, electrolytesDone:false, sodium:'', potassium:'',
            bloodSugarDone:false, bloodSugar:'',
            ecgDone:false, ecgResult:'Normal', chestXrayDone:false, chestXrayResult:'Normal',
            echoDone:false, otherInvestigation:'',
            preOpAntibioticsGiven:false, antibioticMed:'', antibioticDose:'', antibioticTime:'',
            preMedGiven:false, preMedDetails:'',
            patientBathed:false, surgicalSiteShaved:false, nailPolishRemoved:false,
            jewelryRemoved:false, denturesRemoved:false, contactLensesRemoved:false,
            hearingAidsRemoved:false, bladderEmptied:false, preOpGownWorn:false,
            ivLineSecured:false, ivSite:'Right hand', ivGauge:'18G',
            vsBP:'', vsHR:'', vsTemp:'', vsRR:'', vsSpO2:'', vsWeight:'', vsTime:'',
            knownAllergies:'',
            rfDiabetes:false, rfHypertension:false, rfCardiac:false, rfRespiratory:false,
            rfRenal:false, rfBleeding:false, rfAnesthesiaComplication:false, rfSmoking:false, rfObesity:false,
            otPrepared:false, equipmentSterilized:false, instrumentsCounted:false, instrumentInitialCount:'',
            implantsAvailable:false, bloodProductsAvailable:false, emergencyDrugsChecked:false,
            reviewedBySurgeon:false, reviewedByAnaesthesiologist:false, allTeamBriefed:false, specialConsiderations:''
        };
    }

    function getChecklistProgress(cl) {
        var completed = 0;
        MANDATORY_ITEMS.forEach(function(key) { if (cl[key]) completed++; });
        return { completed: completed, total: MANDATORY_ITEMS.length };
    }

    function otPreGetBaseOps() {
        var today = new Date().toDateString();
        /* Always include: today's surgeries + Scheduled + In Progress + any record
           that already has a checklist started/completed (so Complete records never
           disappear from the table regardless of date) */
        return operations.filter(function(op) {
            var isToday     = op.surgeryDate && new Date(op.surgeryDate).toDateString() === today;
            var isActive    = op.status === 'Scheduled' || op.status === 'In Progress';
            var hasChecklist = op.checklistStatus && op.checklistStatus !== 'Not Started';
            return isToday || isActive || hasChecklist;
        });
    }

    function otPrePopulateFilterOptions() {
        var theaterWrap = document.getElementById('otPreCsTheater');
        if (theaterWrap && theaterWrap.setOptions) {
            var theaters = ['All OTs'];
            otPreGetBaseOps().forEach(function(op) {
                if (op.theater && theaters.indexOf(op.theater) < 0) theaters.push(op.theater);
            });
            theaterWrap.setOptions(theaters);
        }
    }

    function renderChecklistTab() {
        otPrePopulateFilterOptions();
        var search = ($('#preOpSearch').val() || '').toLowerCase();
        var base   = otPreFiltered !== null ? otPreFiltered : otPreGetBaseOps();
        var filtered = base.filter(function(op) {
            return !search || (op.patientName||'').toLowerCase().indexOf(search) > -1 || (op.procedure||'').toLowerCase().indexOf(search) > -1 || (op.operationId||'').toLowerCase().indexOf(search) > -1;
        });

        var completeCount    = filtered.filter(function(op) { return op.checklistStatus === 'Complete'; }).length;
        var inProgressCount  = filtered.filter(function(op) { return op.checklistStatus === 'In Progress'; }).length;
        var notStartedCount  = filtered.length - completeCount - inProgressCount;

        $('#preOpStatTotal').text(filtered.length);
        $('#preOpStatComplete').text(completeCount);
        $('#preOpStatInProgress').text(inProgressCount);
        $('#preOpStatNotStarted').text(Math.max(0, notStartedCount));

        _otPreRenderPagination(filtered);
    }

    function _otPreRenderPagination(source) {
        var total    = source.length;
        var totalPgs = Math.max(1, Math.ceil(total / otPrePerPageVal));
        if (otPreCurrentPage > totalPgs) otPreCurrentPage = totalPgs;
        var start = (otPreCurrentPage - 1) * otPrePerPageVal;
        var page  = source.slice(start, start + otPrePerPageVal);

        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="8"><div class="empty-state"><i data-lucide="clipboard-list"></i><p>No surgeries found</p><p class="empty-sub">All scheduled surgeries will appear here with their pre-op checklist status</p></div></td></tr>';
        } else {
            page.forEach(function(op) {
                var cl = checklistState[op.operationId] || defaultChecklist();
                var prog = getChecklistProgress(cl);
                var pct = Math.round(prog.completed / prog.total * 100);
                var clStatus = op.checklistStatus || 'Not Started';
                var statusCls = clStatus === 'Complete' ? 'badge-success' : clStatus === 'In Progress' ? 'badge-warning' : 'badge-outline';
                var progressBar = '<div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:6px;background:var(--color-border);border-radius:3px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:' + (pct === 100 ? '#10B981' : pct > 0 ? '#CA8A04' : '#E5E7EB') + ';border-radius:3px;transition:width 0.3s"></div></div><span style="font-size:11px;color:var(--color-muted-foreground);white-space:nowrap">' + prog.completed + '/' + prog.total + '</span></div>';
                var consentBadge = cl.surgeryConsentSigned && cl.anesthesiaConsentSigned ? '<span class="badge badge-success" style="font-size:10px">Signed</span>' : cl.surgeryConsentSigned ? '<span class="badge badge-warning" style="font-size:10px">Partial</span>' : '<span class="badge badge-outline" style="font-size:10px;color:var(--color-muted-foreground)">Pending</span>';
                var timeDisplay = op.startTime ? op.startTime : (op.surgeryDate ? new Date(op.surgeryDate).toLocaleDateString() : '-');
                html += '<tr class="clickable-row preop-row" data-op-id="' + esc(op.operationId) + '" style="transition:background 0.15s">' +
                    '<td style="font-size:12px;font-family:monospace;font-weight:500;color:var(--color-muted-foreground)">' + esc(op.operationId) + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:8px"><div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(op.patientName) + '</div><div><span style="font-weight:500;font-size:14px">' + esc(op.patientName) + '</span><div style="font-size:11px;color:var(--color-muted-foreground)">' + (op.age ? op.age + 'y ' : '') + esc(op.gender || '') + '</div></div></div></td>' +
                    '<td style="font-size:13px;font-weight:500;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(op.procedure) + '">' + esc(op.procedure) + '</td>' +
                    '<td style="font-size:12px">' + esc(timeDisplay) + '</td>' +
                    '<td><span class="badge badge-outline" style="font-size:11px">' + esc(op.theater || '-') + '</span></td>' +
                    '<td style="min-width:140px">' + progressBar + '<span class="badge ' + statusCls + '" style="font-size:10px;margin-top:4px">' + esc(clStatus) + '</span></td>' +
                    '<td>' + consentBadge + '</td>' +
                    '<td class="text-center"><button class="btn-primary btn-sm preop-start-btn" data-op-id="' + esc(op.operationId) + '" style="font-size:11px;padding:5px 10px"><i data-lucide="clipboard-check" style="width:12px;height:12px"></i> Start Pre-Op</button></td>' +
                '</tr>';
            });
        }
        $('#preOpTableBody').html(html);

        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + otPrePerPageVal, total);
        $('#otPreTableInfo').text('Showing ' + from + '–' + to + ' of ' + total + ' records');

        var numsHtml = '';
        var maxBtns = 5, half = Math.floor(maxBtns / 2);
        var pStart = Math.max(1, otPreCurrentPage - half);
        var pEnd   = Math.min(totalPgs, pStart + maxBtns - 1);
        if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
        for (var p = pStart; p <= pEnd; p++) {
            numsHtml += '<button class="opd-page-num' + (p === otPreCurrentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        $('#otPrePageNums').html(numsHtml);
        $('#otPrePrevPage').prop('disabled', otPreCurrentPage <= 1);
        $('#otPreNextPage').prop('disabled', otPreCurrentPage >= totalPgs);

        lucide.createIcons();
    }

    $('#preOpSearch').on('input', function() { otPreCurrentPage = 1; renderChecklistTab(); });

    $(document).on('click', '#otPrePageNums .opd-page-num', function() {
        otPreCurrentPage = parseInt($(this).data('page')); renderChecklistTab();
    });
    $(document).on('click', '#otPrePrevPage', function() {
        if (otPreCurrentPage > 1) { otPreCurrentPage--; renderChecklistTab(); }
    });
    $(document).on('click', '#otPreNextPage', function() {
        otPreCurrentPage++; renderChecklistTab();
    });

    $(document).on('click', '.preop-row', function(e) {
        if ($(e.target).closest('.preop-start-btn').length) return;
        var opId = $(this).data('op-id');
        if (opId) openPreOpChecklist(opId);
    });
    $(document).on('click', '.preop-start-btn', function(e) {
        e.stopPropagation();
        var opId = $(this).data('op-id');
        if (opId) openPreOpChecklist(opId);
    });

    function openPreOpChecklist(operationId) {
        var op = operations.find(function(o) { return o.operationId === operationId; });
        if (!op) return;
        selectedPreOpOp = operationId;

        if (!checklistState[operationId]) checklistState[operationId] = defaultChecklist();
        otCustomChecklistData = {};

        var clReq  = $.get('/api/ot/checklist/' + encodeURIComponent(operationId));
        var opsReq = $.get('/api/ot/operations');

        clReq.done(function(res) {
            if (res.checklist && Object.keys(res.checklist).length > 0) {
                checklistState[operationId] = $.extend(defaultChecklist(), res.checklist);
            }
            /* Always reset draft to the last saved state when opening */
            checklistDraft[operationId] = $.extend(true, {}, checklistState[operationId]);
        }).fail(function() {
            checklistDraft[operationId] = $.extend(true, {}, checklistState[operationId]);
        });

        opsReq.done(function(ops) {
            var o = (ops || []).find(function(x) { return x.operationId === operationId; });
            otCustomChecklistData = (o && o.customChecklistData) ? o.customChecklistData : {};
        }).fail(function() { otCustomChecklistData = {}; });

        $.when(clReq, opsReq).always(function() {
            renderPreOpSheet(op);
            new bootstrap.Offcanvas(document.getElementById('otPreOpSheet')).show();
            startPreOpAutoSave();
        });
    }

    function startPreOpAutoSave() {
        /* Auto-save removed — progress only saved via "Save Progress" button */
        if (checklistAutoSaveTimer) { clearInterval(checklistAutoSaveTimer); checklistAutoSaveTimer = null; }

        document.getElementById('otPreOpSheet').addEventListener('hidden.bs.offcanvas', function() {
            /* Discard unsaved draft — revert to last committed state */
            if (selectedPreOpOp && checklistState[selectedPreOpOp]) {
                checklistDraft[selectedPreOpOp] = $.extend(true, {}, checklistState[selectedPreOpOp]);
            }
            selectedPreOpOp = null;
        }, { once: true });
    }

    function saveChecklistProgress(showFeedback, markComplete) {
        if (!selectedPreOpOp) return;
        if (showFeedback) {
            /* Show confirmation popup before saving */
            _showPreOpSaveConfirm(markComplete);
            return;
        }
        /* Internal direct save (no confirm needed) */
        _doSaveChecklist(markComplete);
    }

    var $pendingPreOpSaveBtn = null;

    function _showPreOpSaveConfirm(markComplete) {
        var opId = selectedPreOpOp;
        var op   = operations.find(function(o) { return o.operationId === opId; });
        var cl   = checklistDraft[opId] || checklistState[opId] || defaultChecklist();
        var prog = getChecklistProgress(cl);

        /* Remove any existing modal */
        $('#preOpSaveConfirmModal').remove();

        var title  = markComplete ? 'Mark Checklist Complete' : 'Save Checklist Progress';
        var icon   = markComplete ? 'check-circle' : 'save';
        var btnLbl = markComplete ? 'Confirm & Mark Complete' : 'Confirm & Save';
        var bodyHtml =
            '<div style="display:flex;align-items:center;gap:14px;padding:16px;background:#f8fafc;border-radius:10px;margin-bottom:16px">' +
                '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff">' + getInitials(op ? op.patientName : '') + '</div>' +
                '<div>' +
                    '<div style="font-weight:600;font-size:15px">' + esc(op ? op.patientName : '') + '</div>' +
                    '<div style="font-size:12px;color:#64748b;font-family:monospace">' + esc(opId) + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:8px">' +
                '<div style="font-size:13px;font-weight:600;color:#1e40af;margin-bottom:6px">Checklist Summary</div>' +
                '<div style="font-size:13px;color:#1e293b">' +
                    '<span style="font-weight:500">' + prog.completed + '</span> of <span style="font-weight:500">' + prog.total + '</span> mandatory items completed' +
                    ' <span style="font-weight:700;color:' + (prog.completed === prog.total ? '#10b981' : '#f59e0b') + '">(' + Math.round(prog.completed / Math.max(prog.total,1) * 100) + '%)</span>' +
                '</div>' +
            '</div>';

        var modal =
            '<div class="modal fade" id="preOpSaveConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:440px">' +
            '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
                '<div class="modal-header" style="background:var(--midnight-blue);color:#fff;border:none;padding:16px 20px">' +
                    '<div style="display:flex;align-items:center;gap:10px">' +
                        '<i data-lucide="' + icon + '" style="width:20px;height:20px"></i>' +
                        '<h5 class="modal-title" style="margin:0;font-size:16px;font-weight:600">' + title + '</h5>' +
                    '</div>' +
                    '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>' +
                '</div>' +
                '<div class="modal-body" style="padding:20px">' + bodyHtml + '</div>' +
                '<div class="modal-footer" style="border:none;padding:12px 20px;gap:8px">' +
                    '<button class="btn-outline" data-bs-dismiss="modal" style="min-width:90px">Cancel</button>' +
                    '<button class="btn-primary" id="btnPreOpSaveConfirm" style="min-width:160px">' +
                        '<i data-lucide="' + icon + '" style="width:14px;height:14px"></i> ' + btnLbl +
                    '</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(modal);
        lucide.createIcons();

        var $modal = $('#preOpSaveConfirmModal');
        var bsModal = new bootstrap.Modal($modal[0]);
        bsModal.show();

        $modal[0].addEventListener('hidden.bs.modal', function() {
            if ($pendingPreOpSaveBtn) {
                var mc = $pendingPreOpSaveBtn;
                $pendingPreOpSaveBtn = null;
                _doSaveChecklist(mc);
            }
            $modal.remove();
        }, { once: true });

        $('#btnPreOpSaveConfirm').off('click').on('click', function() {
            $pendingPreOpSaveBtn = markComplete;
            bsModal.hide();
        });
    }

    function _doSaveChecklist(markComplete) {
        if (!selectedPreOpOp) return;
        var opId = selectedPreOpOp;
        var cl   = checklistDraft[opId] || checklistState[opId] || defaultChecklist();
        var prog = getChecklistProgress(cl);
        var status = markComplete ? 'Complete' : (prog.completed > 0 ? 'In Progress' : 'Not Started');

        saveOtCustomFormValues();

        $.ajax({
            url: '/api/ot/checklist/' + encodeURIComponent(opId),
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ checklist: cl, checklistStatus: status })
        }).done(function() {
            /* Commit draft → state on successful save */
            checklistState[opId] = $.extend(true, {}, cl);

            var op = operations.find(function(o) { return o.operationId === opId; });
            if (op) op.checklistStatus = status;
            renderChecklistTab();
            _showPreOpSaveSuccess(op, prog, markComplete);
        }).fail(function() {
            HMS.toast('Failed to save checklist. Please try again.', 'error');
        });
    }

    function _showPreOpSaveSuccess(op, prog, markComplete) {
        $('#preOpSaveSuccessModal').remove();

        var modal =
            '<div class="modal fade" id="preOpSaveSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:400px">' +
            '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
                '<div style="background:linear-gradient(135deg,var(--midnight-blue) 0%,#1e3a8a 100%);padding:28px 24px;text-align:center">' +
                    '<div style="width:56px;height:56px;background:rgba(16,185,129,0.15);border:2px solid #10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">' +
                        '<i data-lucide="check-circle" style="width:28px;height:28px;color:#10b981"></i>' +
                    '</div>' +
                    '<h4 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 4px">' + (markComplete ? 'Checklist Complete!' : 'Progress Saved!') + '</h4>' +
                    '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0">' + (op ? esc(op.patientName) : '') + '</p>' +
                '</div>' +
                '<div style="padding:20px 24px;text-align:center">' +
                    '<div style="display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 18px;font-size:13px;color:#166534">' +
                        '<i data-lucide="clipboard-check" style="width:15px;height:15px"></i>' +
                        '<span><strong>' + prog.completed + '/' + prog.total + '</strong> items · ' + Math.round(prog.completed / Math.max(prog.total,1) * 100) + '% complete</span>' +
                    '</div>' +
                '</div>' +
                '<div style="padding:0 20px 20px;text-align:center">' +
                    '<button class="btn-primary" data-bs-dismiss="modal" style="width:100%">Close</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(modal);
        lucide.createIcons();
        var bsModal = new bootstrap.Modal(document.getElementById('preOpSaveSuccessModal'));
        bsModal.show();
        $('#preOpSaveSuccessModal')[0].addEventListener('hidden.bs.modal', function() {
            $('#preOpSaveSuccessModal').remove();
            /* Close the pre-op offcanvas if marking complete */
            if (markComplete) {
                var offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('otPreOpSheet'));
                if (offcanvas) offcanvas.hide();
            }
        }, { once: true });
    }

    function updatePreOpProgress() {
        if (!selectedPreOpOp) return;
        var cl = checklistDraft[selectedPreOpOp] || checklistState[selectedPreOpOp] || defaultChecklist();
        var prog = getChecklistProgress(cl);
        var pct = Math.round(prog.completed / prog.total * 100);
        $('#preOpProgressBar').css('width', pct + '%').css('background', pct === 100 ? '#10B981' : pct >= 50 ? '#CA8A04' : '#3B82F6');
        $('#preOpProgressText').text(prog.completed + ' / ' + prog.total + ' mandatory items completed (' + pct + '%)');
        $('#btnMarkPreOpComplete').prop('disabled', prog.completed < prog.total);
    }

    function renderOtCustomSectionContent(sec) {
        var data = otCustomChecklistData[sec.key] || {};
        var fields = sec.fields || [];
        var html = '';
        if (!fields.length) {
            html += '<p style="font-size:13px;color:var(--color-muted-foreground)">No fields configured for this section.</p>';
            return html;
        }
        var OPTION_TYPES = ['dropdown', 'multi-select', 'radio', 'checkbox'];
        fields.forEach(function(f) {
            var fid = 'otcust_' + sec.key + '_' + f.name;
            var val = data[f.name] !== undefined ? data[f.name] : (f.defaultValue || '');
            var input = '';
            if (f.type === 'text' || f.type === 'email' || f.type === 'number' || f.type === 'date' || f.type === 'time') {
                input = '<input type="' + f.type + '" class="form-control" id="' + fid + '" value="' + esc(val) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>';
            } else if (f.type === 'textarea') {
                input = '<textarea class="form-control" id="' + fid + '" rows="3"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>' + esc(val) + '</textarea>';
            } else if (f.type === 'dropdown') {
                var opts = (f.options || []).map(function(o) { return '<option value="' + esc(o) + '"' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('');
                input = '<select class="form-select" id="' + fid + '">' + opts + '</select>';
            } else if (f.type === 'multi-select') {
                input = (f.options || []).map(function(o) {
                    var chk = Array.isArray(val) ? val.indexOf(o) >= 0 : false;
                    return '<div class="form-check"><input class="form-check-input" type="checkbox" id="' + fid + '_' + o.replace(/\s/g,'_') + '" value="' + esc(o) + '"' + (chk ? ' checked' : '') + ' data-ms-group="' + fid + '"> <label class="form-check-label" for="' + fid + '_' + o.replace(/\s/g,'_') + '">' + esc(o) + '</label></div>';
                }).join('');
            } else if (f.type === 'radio') {
                input = (f.options || []).map(function(o) {
                    return '<div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="' + fid + '" id="' + fid + '_' + o.replace(/\s/g,'_') + '" value="' + esc(o) + '"' + (val === o ? ' checked' : '') + '> <label class="form-check-label" for="' + fid + '_' + o.replace(/\s/g,'_') + '">' + esc(o) + '</label></div>';
                }).join('');
            } else if (f.type === 'checkbox') {
                var chkd = val === true || val === 'true' || val === 1 || val === '1';
                input = '<div class="form-check"><input class="form-check-input" type="checkbox" id="' + fid + '"' + (chkd ? ' checked' : '') + '> <label class="form-check-label" for="' + fid + '">' + esc(f.label) + '</label></div>';
            } else if (f.type === 'password') {
                input = '<input type="password" class="form-control" id="' + fid + '" value="' + esc(val) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>';
            }
            if (f.type !== 'checkbox') {
                html += '<div class="mb-3"><label class="form-label" style="font-size:12px;font-weight:600">' + esc(f.label) + (f.required ? ' <span style="color:#EF4444">*</span>' : '') + '</label>' + input + '</div>';
            } else {
                html += '<div class="mb-3">' + input + '</div>';
            }
        });
        return html;
    }

    function saveOtCustomFormValues() {
        if (!selectedPreOpOp) return;
        var customData = {};
        otFormSections.filter(function(s) { return !s.isDefault && s.isEnabled; }).forEach(function(sec) {
            var sectionData = {};
            (sec.fields || []).forEach(function(f) {
                var fid = 'otcust_' + sec.key + '_' + f.name;
                var el = document.getElementById(fid);
                if (f.type === 'multi-select') {
                    var checked = [];
                    document.querySelectorAll('[data-ms-group="' + fid + '"]:checked').forEach(function(cb) { checked.push(cb.value); });
                    sectionData[f.name] = checked;
                } else if (f.type === 'checkbox') {
                    sectionData[f.name] = el ? el.checked : false;
                } else if (el) {
                    sectionData[f.name] = el.value;
                }
            });
            customData[sec.key] = sectionData;
        });
        if (Object.keys(customData).length > 0) {
            otCustomChecklistData = Object.assign({}, otCustomChecklistData, customData);
            $.ajax({
                url: '/api/ot/operations/' + encodeURIComponent(selectedPreOpOp) + '/custom-checklist-data',
                method: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify({ custom_checklist_data: otCustomChecklistData })
            });
        }
    }

    function renderPreOpSheet(op) {
        var cl = checklistDraft[op.operationId] || checklistState[op.operationId] || defaultChecklist();
        var prog = getChecklistProgress(cl);
        var pct = Math.round(prog.completed / prog.total * 100);

        var npoHours = '';
        if (cl.npoSince) {
            var diff = (Date.now() - new Date(cl.npoSince).getTime()) / 3600000;
            npoHours = diff.toFixed(1);
        }
        var npoAdequate = parseFloat(npoHours) >= 6;

        var html = '<div style="display:grid;grid-template-columns:1fr 340px;height:100%;min-height:0">';

        html += '<div style="overflow-y:auto;padding:24px;border-right:1px solid var(--color-border)">';

        html += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="display:flex;align-items:center;gap:16px">' +
                '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff;font-size:16px;font-weight:700">' + getInitials(op.patientName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
                        '<h3 style="font-size:16px;font-weight:600;margin:0">' + esc(op.patientName) + '</h3>' +
                        '<span class="badge badge-outline" style="font-size:10px">' + esc(op.mrn) + '</span>' +
                        (op.age ? '<span style="font-size:12px;color:var(--color-muted-foreground)">' + op.age + 'y ' + esc(op.gender||'') + '</span>' : '') +
                    '</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:6px">' +
                        '<span style="font-size:12px"><strong>Procedure:</strong> ' + esc(op.procedure) + '</span>' +
                        '<span style="font-size:12px"><strong>Time:</strong> ' + esc(op.startTime || '-') + '</span>' +
                        '<span style="font-size:12px"><strong>OT:</strong> ' + esc(op.theater || '-') + '</span>' +
                        '<span style="font-size:12px"><strong>Surgeon:</strong> ' + esc(op.surgeon || '-') + '</span>' +
                    '</div>' +
                '</div>' +
            '</div></div>';

        var __sn = 0;
        function secNum() { return String(++__sn); }
        function isSectionEnabled(key) {
            if (!otFormSections.length) return true;
            var s = otFormSections.find(function(x) { return x.key === key; });
            return !s || s.isEnabled;
        }

        if (isSectionEnabled('patient_verification')) html += buildSection(secNum(), 'Patient Verification (WHO Checklist)', 'shield-check',
            chkRow('patIdentCheck', 'patientIdentityConfirmed', 'Patient identity confirmed', cl.patientIdentityConfirmed, [
                chkSub('patNameId', 'nameVerifiedWithId', 'Name verified with ID', cl.nameVerifiedWithId),
                chkSub('patWristband', 'wristbandChecked', 'Wristband checked', cl.wristbandChecked)
            ]) +
            chkRow('procVerCheck', 'procedureVerified', 'Procedure verified', cl.procedureVerified, [
                chkSub('patConfProc', 'patientConfirmsProcedure', 'Patient confirms procedure', cl.patientConfirmsProcedure),
                chkSub('siteMark', 'siteMark', 'Site marked (if applicable)', cl.siteMark)
            ]) +
            chkRow('surgSiteCheck', 'surgicalSiteMarked', 'Surgical site marked', cl.surgicalSiteMarked)
        );

        if (isSectionEnabled('consent')) html += buildSection(secNum(), 'Consent Documentation', 'pen-line',
            chkRow('surgConsentCheck', 'surgeryConsentSigned', 'Surgery consent signed', cl.surgeryConsentSigned) +
            (cl.surgeryConsentSigned ? '<div style="margin:-8px 0 8px 28px"><label style="font-size:11px;color:var(--color-muted-foreground)">Date/Time</label><input type="datetime-local" class="form-control" id="cl_surgeryConsentDate" value="' + esc(cl.surgeryConsentDate) + '" style="width:200px;font-size:12px"></div>' : '') +
            chkRow('aneConsentCheck', 'anesthesiaConsentSigned', 'Anesthesia consent signed', cl.anesthesiaConsentSigned) +
            chkRow('bloodConsentCheck', 'bloodTransfusionConsent', 'Blood transfusion consent (if needed)', cl.bloodTransfusionConsent) +
            chkRow('highRiskConCheck', 'highRiskConsent', 'High-risk procedure consent (if applicable)', cl.highRiskConsent) +
            chkRow('implantConCheck', 'implantConsent', 'Implant consent (if applicable)', cl.implantConsent) +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">' +
                formGroup('Consent obtained by', '<select class="form-select" id="cl_consentObtainedBy">' + (doctors.length > 0 ? doctors.map(function(d) { return '<option value="Dr. '+d.firstName+' '+d.lastName+'"'+(cl.consentObtainedBy==='Dr. '+d.firstName+' '+d.lastName?' selected':'')+'>Dr. '+d.firstName+' '+d.lastName+'</option>'; }).join('') : '<option>N/A</option>') + '</select>') +
                formGroup('Witness name', '<input type="text" class="form-control" id="cl_witnessName" value="' + esc(cl.witnessName) + '" placeholder="Witness full name">') +
            '</div>'
        );

        if (isSectionEnabled('preanesthetic')) html += buildSection(secNum(), 'Pre-Anesthetic Evaluation', 'stethoscope',
            chkRow('pacCheck', 'pacCompleted', 'PAC completed', cl.pacCompleted) +
            (cl.pacCompleted ? '<div style="margin:-8px 0 8px 28px"><input type="date" class="form-control" id="cl_pacDate" value="' + esc(cl.pacDate) + '" style="width:160px;font-size:12px"></div>' : '') +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:8px">' +
                formGroup('ASA Classification', '<select class="form-select" id="cl_asaClassification">' + ['ASA I (Healthy)','ASA II (Mild systemic disease)','ASA III (Severe systemic disease)','ASA IV (Life-threatening disease)','ASA V (Moribund)','ASA VI (Brain-dead organ donor)'].map(function(a){return '<option value="'+a+'"'+(cl.asaClassification===a?' selected':'')+'>'+a+'</option>';}).join('') + '</select>') +
                formGroup('Mallampati Score', '<select class="form-select" id="cl_mallampatiScore">' + ['Class I','Class II','Class III','Class IV'].map(function(c){return '<option value="'+c+'"'+(cl.mallampatiScore===c?' selected':'')+'>'+c+'</option>';}).join('') + '</select>') +
                formGroup('Airway Assessment', '<select class="form-select" id="cl_airwayAssessment">' + ['Normal','Potentially difficult','Known difficult'].map(function(a){return '<option value="'+a+'"'+(cl.airwayAssessment===a?' selected':'')+'>'+a+'</option>';}).join('') + '</select>') +
            '</div>' +
            chkRow('medClearCheck', 'medicalClearanceObtained', 'Medical clearance obtained', cl.medicalClearanceObtained) +
            (cl.medicalClearanceObtained ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:-8px 0 8px 28px">' + formGroup('Specialty', '<input type="text" class="form-control" id="cl_clearanceSpecialty" value="' + esc(cl.clearanceSpecialty) + '" placeholder="e.g. Cardiology" style="font-size:12px">') + formGroup('Cleared by', '<input type="text" class="form-control" id="cl_clearanceBy" value="' + esc(cl.clearanceBy) + '" placeholder="Doctor name" style="font-size:12px">') + '</div>' : '')
        );

        if (isSectionEnabled('npo')) html += buildSection(secNum(), 'NPO Status', 'coffee',
            '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;padding:8px 0">' +
                '<div>' + formGroup('NPO Since', '<input type="datetime-local" class="form-control" id="cl_npoSince" value="' + esc(cl.npoSince) + '">') + '</div>' +
                '<div style="text-align:center">' +
                    '<p style="font-size:11px;color:var(--color-muted-foreground);margin:0">NPO Hours</p>' +
                    '<p style="font-size:28px;font-weight:700;margin:0;color:var(--midnight-blue)" id="npoHoursDisplay">' + (npoHours || '-') + '</p>' +
                '</div>' +
                '<div>' + (cl.npoSince ? (npoAdequate ? '<div style="display:flex;align-items:center;gap:8px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px 14px"><i data-lucide="check-circle" style="width:16px;height:16px;color:#10B981"></i><span style="font-size:12px;font-weight:600;color:#10B981">NPO Adequate (&gt;6 hrs)</span></div>' : '<div style="display:flex;align-items:center;gap:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px 14px"><i data-lucide="alert-triangle" style="width:16px;height:16px;color:#EF4444"></i><span style="font-size:12px;font-weight:600;color:#EF4444">INADEQUATE — Surgery at risk!</span></div>') : '') + '</div>' +
            '</div>'
        );

        if (isSectionEnabled('investigations')) html += buildSection(secNum(), 'Pre-Operative Investigations', 'flask-conical',
            invRow('cbcDone', 'cbcCheck', 'CBC', cl.cbcDone, [
                '<input type="text" class="form-control" id="cl_cbcHb" placeholder="Hb" value="' + esc(cl.cbcHb) + '" style="width:80px;font-size:12px">',
                '<input type="text" class="form-control" id="cl_cbcWbc" placeholder="WBC" value="' + esc(cl.cbcWbc) + '" style="width:80px;font-size:12px">',
                '<input type="text" class="form-control" id="cl_cbcPlatelets" placeholder="Plt" value="' + esc(cl.cbcPlatelets) + '" style="width:80px;font-size:12px">'
            ]) +
            invRow('bloodGroupingDone', 'bgCheck', 'Blood Grouping & Cross Match', cl.bloodGroupingDone, [
                '<input type="text" class="form-control" id="cl_bloodGroup" placeholder="Blood Group" value="' + esc(cl.bloodGroup) + '" style="width:100px;font-size:12px">',
                '<input type="number" class="form-control" id="cl_unitsArranged" placeholder="Units" value="' + esc(cl.unitsArranged) + '" style="width:70px;font-size:12px">'
            ]) +
            invRow('coagProfileDone', 'coagCheck', 'Coagulation Profile', cl.coagProfileDone, [
                '<input type="text" class="form-control" id="cl_ptInr" placeholder="PT/INR" value="' + esc(cl.ptInr) + '" style="width:90px;font-size:12px">',
                '<input type="text" class="form-control" id="cl_aptt" placeholder="APTT" value="' + esc(cl.aptt) + '" style="width:90px;font-size:12px">'
            ]) +
            invRow('renalFunctionDone', 'renalCheck', 'Renal Function', cl.renalFunctionDone, [
                '<input type="text" class="form-control" id="cl_creatinine" placeholder="Creatinine" value="' + esc(cl.creatinine) + '" style="width:100px;font-size:12px">',
                '<input type="text" class="form-control" id="cl_urea" placeholder="Urea" value="' + esc(cl.urea) + '" style="width:80px;font-size:12px">'
            ]) +
            invRow('liverFunctionDone', 'liverCheck', 'Liver Function Tests', cl.liverFunctionDone) +
            invRow('electrolytesDone', 'electCheck', 'Electrolytes', cl.electrolytesDone, [
                '<input type="text" class="form-control" id="cl_sodium" placeholder="Na+" value="' + esc(cl.sodium) + '" style="width:70px;font-size:12px">',
                '<input type="text" class="form-control" id="cl_potassium" placeholder="K+" value="' + esc(cl.potassium) + '" style="width:70px;font-size:12px">'
            ]) +
            invRow('bloodSugarDone', 'bsCheck', 'Blood Sugar (Random/Fasting)', cl.bloodSugarDone, [
                '<input type="text" class="form-control" id="cl_bloodSugar" placeholder="mg/dL" value="' + esc(cl.bloodSugar) + '" style="width:90px;font-size:12px">'
            ]) +
            invRow('ecgDone', 'ecgCheck', 'ECG', cl.ecgDone, [
                '<select class="form-select" id="cl_ecgResult" style="width:140px;font-size:12px"><option value="Normal"'+(cl.ecgResult==='Normal'?' selected':'')+'>Normal</option><option value="Abnormal"'+(cl.ecgResult==='Abnormal'?' selected':'')+'>Abnormal</option></select>'
            ]) +
            invRow('chestXrayDone', 'cxrCheck', 'Chest X-Ray', cl.chestXrayDone, [
                '<select class="form-select" id="cl_chestXrayResult" style="width:140px;font-size:12px"><option value="Normal"'+(cl.chestXrayResult==='Normal'?' selected':'')+'>Normal</option><option value="Abnormal"'+(cl.chestXrayResult==='Abnormal'?' selected':'')+'>Abnormal</option></select>'
            ]) +
            invRow('echoDone', 'echoCheck', 'Echo (if cardiac surgery)', cl.echoDone) +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:8px">' +
                '<label style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">Other:</label>' +
                '<input type="text" class="form-control" id="cl_otherInvestigation" value="' + esc(cl.otherInvestigation) + '" placeholder="Specify other investigation" style="font-size:12px">' +
            '</div>'
        );

        if (isSectionEnabled('medications')) html += buildSection(secNum(), 'Pre-Operative Medications', 'pill',
            chkRow('antibioticsCheck', 'preOpAntibioticsGiven', 'Pre-op antibiotics given', cl.preOpAntibioticsGiven) +
            (cl.preOpAntibioticsGiven ? '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin:-8px 0 8px 28px">' +
                formGroup('Medicine', '<input type="text" class="form-control" id="cl_antibioticMed" value="' + esc(cl.antibioticMed) + '" placeholder="e.g. Ceftriaxone" style="font-size:12px">') +
                formGroup('Dose', '<input type="text" class="form-control" id="cl_antibioticDose" value="' + esc(cl.antibioticDose) + '" placeholder="e.g. 1g IV" style="font-size:12px">') +
                formGroup('Time given', '<input type="time" class="form-control" id="cl_antibioticTime" value="' + esc(cl.antibioticTime) + '" style="font-size:12px">') +
            '</div>' : '') +
            chkRow('preMedCheck', 'preMedGiven', 'Pre-medication given', cl.preMedGiven) +
            (cl.preMedGiven ? '<div style="margin:-8px 0 8px 28px">' + formGroup('Details', '<input type="text" class="form-control" id="cl_preMedDetails" value="' + esc(cl.preMedDetails) + '" placeholder="e.g. Midazolam 2mg IV" style="font-size:12px">') + '</div>' : '')
        );

        if (isSectionEnabled('physical_prep')) html += buildSection(secNum(), 'Physical Preparation', 'user-check',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' +
                chkSmall('patBathedCheck', 'patientBathed', 'Patient bathed', cl.patientBathed) +
                chkSmall('siteShaveCheck', 'surgicalSiteShaved', 'Surgical site shaved/prepped', cl.surgicalSiteShaved) +
                chkSmall('nailCheck', 'nailPolishRemoved', 'Nail polish removed', cl.nailPolishRemoved) +
                chkSmall('jewelryCheck', 'jewelryRemoved', 'Jewelry removed', cl.jewelryRemoved) +
                chkSmall('denturesCheck', 'denturesRemoved', 'Dentures removed (if applicable)', cl.denturesRemoved) +
                chkSmall('contactCheck', 'contactLensesRemoved', 'Contact lenses removed', cl.contactLensesRemoved) +
                chkSmall('hearingCheck', 'hearingAidsRemoved', 'Hearing aids removed/noted', cl.hearingAidsRemoved) +
                chkSmall('bladderCheck', 'bladderEmptied', 'Bladder emptied', cl.bladderEmptied) +
                chkSmall('gownCheck', 'preOpGownWorn', 'Pre-op gown worn', cl.preOpGownWorn) +
            '</div>' +
            chkRow('ivLineCheck', 'ivLineSecured', 'IV line secured', cl.ivLineSecured) +
            (cl.ivLineSecured ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:-8px 0 8px 28px">' +
                formGroup('IV Site', '<select class="form-select" id="cl_ivSite" style="font-size:12px">' + ['Right hand','Left hand','Right arm','Left arm'].map(function(s){return '<option value="'+s+'"'+(cl.ivSite===s?' selected':'')+'>'+s+'</option>';}).join('') + '</select>') +
                formGroup('IV Gauge', '<select class="form-select" id="cl_ivGauge" style="font-size:12px">' + ['18G','20G','22G'].map(function(g){return '<option value="'+g+'"'+(cl.ivGauge===g?' selected':'')+'>'+g+'</option>';}).join('') + '</select>') +
            '</div>' : '')
        );

        if (isSectionEnabled('vitals')) html += buildSection(secNum(), 'Vital Signs (Last Recorded)', 'heart-pulse',
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px">' +
                vitalField('Blood Pressure', 'vsBP', cl.vsBP, 'mmHg', '120/80') +
                vitalField('Heart Rate', 'vsHR', cl.vsHR, 'bpm', '72') +
                vitalField('Temperature', 'vsTemp', cl.vsTemp, '°F', '98.6') +
                vitalField('Resp Rate', 'vsRR', cl.vsRR, '/min', '16') +
            '</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">' +
                vitalField('SPO2', 'vsSpO2', cl.vsSpO2, '%', '98') +
                vitalField('Weight', 'vsWeight', cl.vsWeight, 'kg', '') +
                formGroup('Recorded at', '<input type="time" class="form-control" id="cl_vsTime" value="' + esc(cl.vsTime) + '">') +
            '</div>'
        );

        if (isSectionEnabled('allergies')) html += buildSection(secNum(), 'Allergies & Risk Factors', 'alert-triangle',
            '<div style="margin-bottom:12px">' +
                formGroup('Known allergies', '<input type="text" class="form-control" id="cl_knownAllergies" value="' + esc(cl.knownAllergies) + '" placeholder="None known / List allergies here">') +
            '</div>' +
            (cl.knownAllergies && cl.knownAllergies !== '' && cl.knownAllergies.toLowerCase() !== 'none' && cl.knownAllergies.toLowerCase() !== 'nkda' ? '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px;margin-bottom:12px;display:flex;gap:8px"><i data-lucide="alert-triangle" style="width:16px;height:16px;color:#EF4444;flex-shrink:0;margin-top:1px"></i><span style="font-size:13px;font-weight:600;color:#EF4444">ALLERGY ALERT: ' + esc(cl.knownAllergies) + '</span></div>' : '') +
            '<p style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin-bottom:8px">Risk Factors</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">' +
                chkSmall('rfDiabCheck', 'rfDiabetes', 'Diabetes', cl.rfDiabetes) +
                chkSmall('rfHTNCheck', 'rfHypertension', 'Hypertension', cl.rfHypertension) +
                chkSmall('rfCardiacCheck', 'rfCardiac', 'Cardiac disease', cl.rfCardiac) +
                chkSmall('rfRespCheck', 'rfRespiratory', 'Respiratory disease', cl.rfRespiratory) +
                chkSmall('rfRenalCheck', 'rfRenal', 'Renal disease', cl.rfRenal) +
                chkSmall('rfBleedCheck', 'rfBleeding', 'Bleeding disorder', cl.rfBleeding) +
                chkSmall('rfAneCheck', 'rfAnesthesiaComplication', 'Previous anesthesia complications', cl.rfAnesthesiaComplication) +
                chkSmall('rfSmkCheck', 'rfSmoking', 'Smoking', cl.rfSmoking) +
                chkSmall('rfObeCheck', 'rfObesity', 'Obesity (BMI > 30)', cl.rfObesity) +
            '</div>'
        );

        if (isSectionEnabled('equipment')) html += buildSection(secNum(), 'Equipment & Supplies Check', 'package-check',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
                chkSmall('otPrepCheck', 'otPrepared', 'OT prepared', cl.otPrepared) +
                chkSmall('equipSterCheck', 'equipmentSterilized', 'Equipment sterilized', cl.equipmentSterilized) +
                chkSmall('instrCountCheck', 'instrumentsCounted', 'Instruments counted', cl.instrumentsCounted) +
                chkSmall('implantsCheck', 'implantsAvailable', 'Implants available (if needed)', cl.implantsAvailable) +
                chkSmall('bloodProdCheck', 'bloodProductsAvailable', 'Blood products available (if needed)', cl.bloodProductsAvailable) +
                chkSmall('emergDrugsCheck', 'emergencyDrugsChecked', 'Emergency drugs checked', cl.emergencyDrugsChecked) +
            '</div>' +
            (cl.instrumentsCounted ? '<div style="margin-top:8px">' + formGroup('Initial instrument count', '<input type="number" class="form-control" id="cl_instrumentInitialCount" value="' + esc(cl.instrumentInitialCount) + '" placeholder="e.g. 42" style="width:120px;font-size:12px">') + '</div>' : '')
        );

        if (isSectionEnabled('final_verification')) html += buildSection(secNum(), 'Final Verification', 'clipboard-check',
            chkRow('surgReviewCheck', 'reviewedBySurgeon', 'Pre-op checklist reviewed by surgeon', cl.reviewedBySurgeon) +
            chkRow('aneReviewCheck', 'reviewedByAnaesthesiologist', 'Pre-op checklist reviewed by anesthesiologist', cl.reviewedByAnaesthesiologist) +
            chkRow('teamBriefCheck', 'allTeamBriefed', 'All team members briefed', cl.allTeamBriefed) +
            formGroup('Special considerations / concerns', '<textarea class="form-control" id="cl_specialConsiderations" rows="3" placeholder="Document any special requirements, concerns, or considerations for this surgery">' + esc(cl.specialConsiderations) + '</textarea>')
        );

        // Custom sections
        otFormSections.filter(function(s) { return !s.isDefault && s.isEnabled; }).forEach(function(sec) {
            html += buildSection(secNum(), esc(sec.label), 'layout-panel-left', renderOtCustomSectionContent(sec));
        });

        html += '</div>';

        html += '<div style="display:flex;flex-direction:column;overflow-y:auto">';
        html += '<div style="padding:20px;border-bottom:1px solid var(--color-border)">';
        html += '<h3 style="font-size:15px;font-weight:600;margin-bottom:12px">Overall Progress</h3>';
        html += '<div style="height:10px;background:var(--color-border);border-radius:5px;overflow:hidden;margin-bottom:8px"><div id="preOpProgressBar" style="width:' + pct + '%;height:100%;background:' + (pct === 100 ? '#10B981' : pct >= 50 ? '#CA8A04' : '#3B82F6') + ';border-radius:5px;transition:width 0.4s"></div></div>';
        html += '<p id="preOpProgressText" style="font-size:12px;color:var(--color-muted-foreground);margin:0">' + prog.completed + ' / ' + prog.total + ' mandatory items completed (' + pct + '%)</p>';
        html += '</div>';

        html += '<div style="padding:20px;border-bottom:1px solid var(--color-border)">';
        html += '<h3 style="font-size:13px;font-weight:600;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:12px">Quick Status</h3>';
        var sections = [
            { label: 'Patient Verification', done: cl.patientIdentityConfirmed && cl.procedureVerified && cl.surgicalSiteMarked },
            { label: 'Consent', done: cl.surgeryConsentSigned && cl.anesthesiaConsentSigned },
            { label: 'Pre-Anesthetic Eval', done: cl.pacCompleted },
            { label: 'NPO Status', done: !!cl.npoSince && npoAdequate },
            { label: 'Investigations', done: cl.cbcDone && cl.bloodGroupingDone && cl.ecgDone && cl.chestXrayDone },
            { label: 'Physical Prep', done: cl.ivLineSecured && cl.preOpGownWorn },
            { label: 'Vital Signs', done: !!(cl.vsBP && cl.vsHR) },
            { label: 'Equipment', done: cl.otPrepared && cl.equipmentSterilized },
            { label: 'Final Verification', done: cl.reviewedBySurgeon }
        ];
        sections.forEach(function(s) {
            html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--color-border)">' +
                '<span style="font-size:12px">' + esc(s.label) + '</span>' +
                (s.done ? '<span style="color:#10B981;font-size:12px;font-weight:600">✓ Done</span>' : '<span style="color:var(--color-muted-foreground);font-size:12px">Pending</span>') +
            '</div>';
        });
        html += '</div>';

        var isLocked = op.checklistStatus === 'Complete';

        html += '<div style="padding:20px;display:flex;flex-direction:column;gap:10px;margin-top:auto">';
        if (isLocked) {
            /* Locked state — show read-only badge, hide edit buttons */
            html += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;' +
                'background:#f0fdf4;border:1.5px solid #10b981;border-radius:10px;padding:12px 16px">' +
                '<i data-lucide="lock" style="width:16px;height:16px;color:#10b981"></i>' +
                '<span style="font-size:13px;font-weight:600;color:#166534">Checklist Complete — Read Only</span>' +
                '</div>';
            html += '<button class="btn-outline btn-sm" id="btnPrintPreOp" style="width:100%"><i data-lucide="printer" style="width:14px;height:14px"></i> Print Checklist</button>';
        } else {
            html += '<button class="btn-outline btn-sm" id="btnSavePreOp" style="width:100%"><i data-lucide="save" style="width:14px;height:14px"></i> Save Progress</button>';
            html += '<button class="btn-outline btn-sm" id="btnPrintPreOp" style="width:100%"><i data-lucide="printer" style="width:14px;height:14px"></i> Print Checklist</button>';
            /* All checkboxes optional — button is always enabled */
            html += '<button class="btn-primary" id="btnMarkPreOpComplete" style="width:100%"><i data-lucide="check-circle" style="width:14px;height:14px"></i> Mark Complete &amp; Transfer to OT</button>';
        }
        html += '</div></div>';

        html += '</div>';

        /* Preserve scroll position of the left scrollable panel across re-renders */
        var $scrollPane = $('#otPreOpSheetBody').find('div[style*="overflow-y:auto"]').first();
        var savedScroll = $scrollPane.length ? $scrollPane.scrollTop() : 0;

        $('#otPreOpSheetBody').html(html);
        lucide.createIcons();
        bindPreOpEvents();

        /* ── Lock checklist if already completed ── */
        if (isLocked) {
            var $leftPane = $('#otPreOpSheetBody').find('div[style*="overflow-y:auto"]').first();
            /* Disable all interactive elements — do NOT set pointer-events:none on the
               scroll container itself as that would block mouse-wheel scrolling */
            $leftPane.find('input, select, textarea, button').prop('disabled', true);
            $leftPane.find('label').css('cursor', 'default');
            /* Subtle visual dimming only — scrolling still works */
            $leftPane.css('opacity', '0.85');
            /* Locked banner at top of checklist */
            $leftPane.prepend(
                '<div style="display:flex;align-items:center;gap:10px;' +
                    'background:#f0fdf4;border:1.5px solid #10b981;border-radius:10px;' +
                    'padding:12px 16px;margin-bottom:20px">' +
                    '<i data-lucide="lock" style="width:18px;height:18px;color:#10b981"></i>' +
                    '<div>' +
                        '<div style="font-size:13px;font-weight:700;color:#166534">Checklist Completed &amp; Locked</div>' +
                        '<div style="font-size:12px;color:#16a34a">This checklist is read-only and cannot be modified.</div>' +
                    '</div>' +
                '</div>'
            );
            lucide.createIcons();
        }

        /* Restore scroll after DOM is rebuilt */
        if (savedScroll > 0) {
            $('#otPreOpSheetBody').find('div[style*="overflow-y:auto"]').first().scrollTop(savedScroll);
        }
    }

    function buildSection(num, title, icon, content) {
        return '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--color-border);background:var(--color-muted);border-radius:12px 12px 0 0">' +
                '<div style="width:28px;height:28px;border-radius:6px;background:var(--midnight-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">' + num + '</div>' +
                '<i data-lucide="' + icon + '" style="width:16px;height:16px;color:var(--midnight-blue)"></i>' +
                '<h4 style="font-size:14px;font-weight:600;margin:0">' + title + '</h4>' +
            '</div>' +
            '<div style="padding:16px 20px">' + content + '</div>' +
        '</div>';
    }

    function chkRow(id, key, label, checked, subItems) {
        var sub = '';
        if (subItems && subItems.length) {
            sub = '<div style="margin-left:28px;margin-top:4px;display:flex;flex-direction:column;gap:4px">' + subItems.join('') + '</div>';
        }
        return '<div style="margin-bottom:10px">' +
            '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13px;font-weight:500">' +
                '<input type="checkbox" class="preop-checkbox" data-key="' + key + '" id="' + id + '"' + (checked ? ' checked' : '') + ' style="width:16px;height:16px;accent-color:var(--midnight-blue);flex-shrink:0">' +
                (checked ? '<i data-lucide="check-circle" style="width:16px;height:16px;color:#10B981;flex-shrink:0"></i>' : '<i data-lucide="circle" style="width:16px;height:16px;color:var(--color-muted-foreground);flex-shrink:0"></i>') +
                '<span>' + label + '</span>' +
            '</label>' + sub +
        '</div>';
    }

    function chkSub(id, key, label, checked) {
        return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:var(--color-muted-foreground)">' +
            '<input type="checkbox" class="preop-checkbox" data-key="' + key + '" id="' + id + '"' + (checked ? ' checked' : '') + ' style="width:14px;height:14px;accent-color:var(--midnight-blue)">' +
            label + '</label>';
    }

    function chkSmall(id, key, label, checked) {
        return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;padding:6px 0;border-bottom:1px solid var(--color-border)">' +
            '<input type="checkbox" class="preop-checkbox" data-key="' + key + '" id="' + id + '"' + (checked ? ' checked' : '') + ' style="width:14px;height:14px;accent-color:var(--midnight-blue)">' +
            (checked ? '<i data-lucide="check-circle" style="width:13px;height:13px;color:#10B981"></i>' : '<i data-lucide="circle" style="width:13px;height:13px;color:var(--color-border)"></i>') +
            '<span' + (checked ? ' style="color:var(--color-foreground)"' : ' style="color:var(--color-muted-foreground)"') + '>' + label + '</span>' +
        '</label>';
    }

    function invRow(key, id, label, checked, inputs) {
        var inputsHtml = inputs && inputs.length ? '<div style="display:flex;gap:6px;margin-left:4px">' + inputs.join('') + '</div>' : '';
        return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--color-border)">' +
            '<input type="checkbox" class="preop-checkbox" data-key="' + key + '" id="' + id + '"' + (checked ? ' checked' : '') + ' style="width:14px;height:14px;accent-color:var(--midnight-blue);flex-shrink:0">' +
            (checked ? '<i data-lucide="check-circle" style="width:14px;height:14px;color:#10B981;flex-shrink:0"></i>' : '<i data-lucide="circle" style="width:14px;height:14px;color:var(--color-border);flex-shrink:0"></i>') +
            '<span style="font-size:12px;font-weight:500;min-width:160px">' + label + '</span>' +
            inputsHtml +
        '</div>';
    }

    function formGroup(label, input) {
        return '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase;display:block;margin-bottom:4px">' + label + '</label>' + input + '</div>';
    }

    function vitalField(label, id, value, unit, placeholder) {
        return '<div><label style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase;display:block;margin-bottom:4px">' + label + ' <span style="font-weight:400">(' + unit + ')</span></label><input type="text" class="form-control cl-vital" data-key="' + id + '" id="cl_' + id + '" value="' + esc(value) + '" placeholder="' + placeholder + '"></div>';
    }

    function bindPreOpEvents() {
        $(document).off('change.preop').on('change.preop', '.preop-checkbox', function() {
            var key     = $(this).data('key');
            if (!selectedPreOpOp || !key) return;
            /* Block changes on completed/locked checklists */
            var _op = operations.find(function(o) { return o.operationId === selectedPreOpOp; });
            if (_op && _op.checklistStatus === 'Complete') return;

            var isChecked    = $(this).is(':checked');
            /* Write to draft only — checklistState is only updated on explicit Save */
            var state        = checklistDraft[selectedPreOpOp] || (checklistDraft[selectedPreOpOp] = {});

            /* ── DOM structure created by chkRow / chkSub ──
               <div style="margin-bottom:10px">          ← wrapper
                 <label>
                   <input class="preop-checkbox">        ← parent checkbox
                 </label>
                 <div style="margin-left:28px;...">      ← sub container (only when subs exist)
                   <label><input class="preop-checkbox"></label>
                   ...
                 </div>
               </div>
            */
            var $wrapper     = $(this).closest('div[style*="margin-bottom:10px"]');
            var $subCont     = $wrapper.children('div[style*="margin-left:28px"]');
            var $parentChk   = $wrapper.children('label').find('.preop-checkbox').first();
            var isParent     = $parentChk.length && $parentChk.is(this);

            /* Save own state first */
            state[key] = isChecked;

            if (isParent && $subCont.length) {
                /* Parent toggled → force all subs to same state */
                $subCont.find('.preop-checkbox').each(function() {
                    var subKey = $(this).data('key');
                    if (subKey) state[subKey] = isChecked;
                });
            } else if (!isParent && $parentChk.length && $subCont.length) {
                /* Sub toggled → parent = true only when every sub is checked */
                var $allSubs   = $subCont.find('.preop-checkbox');
                var checkedCnt = 0;
                $allSubs.each(function() {
                    var k = $(this).data('key');
                    if (k && state[k]) checkedCnt++;
                });
                var parentKey = $parentChk.data('key');
                if (parentKey) state[parentKey] = (checkedCnt === $allSubs.length);
            }

            var op = operations.find(function(o) { return o.operationId === selectedPreOpOp; });
            if (op) renderPreOpSheet(op);
        });

        $(document).off('input.preop').on('input.preop', '[id^="cl_"]', function() {
            if (!selectedPreOpOp) return;
            var _op2 = operations.find(function(o) { return o.operationId === selectedPreOpOp; });
            if (_op2 && _op2.checklistStatus === 'Complete') return;
            var rawId = $(this).attr('id').replace('cl_', '');
            if (!checklistDraft[selectedPreOpOp]) checklistDraft[selectedPreOpOp] = {};
            checklistDraft[selectedPreOpOp][rawId] = $(this).val();
            if (rawId === 'npoSince') {
                var diff = (Date.now() - new Date($(this).val()).getTime()) / 3600000;
                $('#npoHoursDisplay').text(diff > 0 ? diff.toFixed(1) : '-');
            }
            updatePreOpProgress();
        });

        $(document).off('change.prepselect').on('change.prepselect', '[id^="cl_"]', function() {
            if (!selectedPreOpOp) return;
            var rawId = $(this).attr('id').replace('cl_', '');
            if (!checklistDraft[selectedPreOpOp]) checklistDraft[selectedPreOpOp] = {};
            checklistDraft[selectedPreOpOp][rawId] = $(this).val();
            updatePreOpProgress();
        });

        $(document).off('click.preop').on('click.preop', '#btnSavePreOp', function() {
            saveChecklistProgress(true, false);
        });

        $(document).off('click.preOpComplete').on('click.preOpComplete', '#btnMarkPreOpComplete', function() {
            saveChecklistProgress(true, true);
            /* Offcanvas will close after user dismisses the success popup */
        });

        $(document).off('click.preOpPrint').on('click.preOpPrint', '#btnPrintPreOp', function() {
            printPreOpChecklist();
        });
    }

    // ── Pre-Op Checklist Print ────────────────────────────────────────────────
    function printPreOpChecklist() {
        if (!selectedPreOpOp) return;
        var op = operations.find(function(o) { return o.operationId === selectedPreOpOp; });
        if (!op) return;
        var cl = checklistDraft[selectedPreOpOp] || checklistState[selectedPreOpOp] || defaultChecklist();

        $.when(
            $.get('/api/hospital-info/settings/letterhead'),
            $.get('/api/hospital-info/settings/footer'),
            $.get('/api/hospital-info/settings/basic')
        ).done(function(lhRes, ftRes, prRes) {
            var lh = lhRes[0].settings || {};
            var ft = ftRes[0].settings || {};
            var pr = prRes[0].settings || {};

            var color    = lh.lh_primary_color || '#003366';
            var hospName = (lh.lh_show_name !== '0') ? (pr.basic_name || '') : '';
            var tagline  = (lh.lh_show_tagline === '1') ? (pr.basic_tagline || '') : '';
            var logoPath = (lh.lh_show_logo !== '0') ? (pr.logo || pr.basic_logo || '') : '';
            var logoSizeMap = { small: '44px', medium: '64px', large: '88px' };
            var logoSize = logoSizeMap[lh.lh_logo_size] || '64px';

            var addrParts = (lh.lh_show_address === '1')
                ? [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean)
                : [];

            var svgPhone = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
            var svgMail  = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
            var svgGlobe = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/></svg>';
            var contactParts = [];
            if (lh.lh_show_phone   === '1' && pr.contact_phone)   contactParts.push(svgPhone + e(pr.contact_phone));
            if (lh.lh_show_email   === '1' && pr.contact_email)   contactParts.push(svgMail  + e(pr.contact_email));
            if (lh.lh_show_website === '1' && pr.contact_website) contactParts.push(svgGlobe + e(pr.contact_website));

            // ── Patient / operation data ──────────────────────────────────────
            var patientName  = op.patientName  || '-';
            var mrn          = op.mrn          || '-';
            var operationId  = op.operationId  || '-';
            var surgeon      = op.surgeon      || '-';
            var anaesthetist = op.anaesthetist || '-';
            var theater      = op.theater      || '-';
            var surgeryType  = op.surgeryType  || '-';
            var phone        = op.phone        || '-';
            var cnic         = op.cnic         || '-';
            var age          = op.age          ? (op.age + ' Years') : '-';
            var gender       = op.gender       || '-';
            var procedure    = op.procedure    || '-';
            var surgeryDate  = op.surgeryDate  ? new Date(op.surgeryDate).toLocaleDateString('en-GB') : '-';
            var startTime    = op.startTime    || '-';
            var estDuration  = op.estimatedDuration || '-';
            var priority     = op.priority     || '-';
            var savedBy      = op.checklistSavedBy || '';

            // ── Footer meta ───────────────────────────────────────────────────
            var footerLines = [ft.footer_line1, ft.footer_line2, ft.footer_line3].filter(Boolean);
            var metaParts = [];
            if (ft.footer_show_page_number === '1') metaParts.push('Page 1 of 1');
            if (ft.footer_show_date === '1') {
                var _now = new Date();
                metaParts.push('Printed: ' + _now.toLocaleDateString('en-GB') + ', ' + _now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            }
            if (ft.footer_show_disclaimer === '1') metaParts.push('Confidential \u2014 For medical use only');

            // ── Helpers ───────────────────────────────────────────────────────
            function e(v) {
                return (v || '').toString()
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            function infoCell(label, val, borderRight, rowBg) {
                return '<td style="padding:7px 12px;background:' + (rowBg || '#fff') + ';'
                     + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + e(label) + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + e(val) + '</div>'
                     + '</td>';
            }
            function chk(checked) {
                return checked
                    ? '<span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;background:#16a34a;border-radius:3px;color:#fff;font-size:9px;font-weight:700;flex-shrink:0;margin-right:6px">&#10003;</span>'
                    : '<span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border:1.5px solid #cbd5e1;border-radius:3px;flex-shrink:0;margin-right:6px"></span>';
            }
            function clItem(label, checked) {
                return '<div style="display:flex;align-items:center;padding:3px 0;font-size:10px;color:#1e293b">'
                     + chk(checked) + e(label) + '</div>';
            }
            function clItemVal(label, checked, value, unit) {
                return '<div style="display:flex;align-items:center;padding:3px 0;font-size:10px;color:#1e293b">'
                     + chk(checked) + e(label)
                     + (value ? '<span style="margin-left:auto;font-size:10px;font-weight:600;color:#0f172a">' + e(value) + (unit ? ' <span style="font-size:9px;color:#94a3b8">' + e(unit) + '</span>' : '') + '</span>' : '')
                     + '</div>';
            }
            function secHead(title) {
                return '<div style="background:' + color + ';color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:5px 10px;border-radius:4px 4px 0 0">' + e(title) + '</div>';
            }
            function secBox(title, content) {
                return '<div style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:10px">'
                     + secHead(title)
                     + '<div style="padding:8px 10px;background:#fff">' + content + '</div>'
                     + '</div>';
            }
            function vCell(label, value, unit) {
                return '<td style="padding:7px 10px;border-right:1px solid #e8edf2;text-align:center">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#94a3b8;margin-bottom:3px">' + e(label) + '</div>'
                     + '<div style="font-size:12px;font-weight:700;color:#0f172a">' + e(value || '\u2014') + '</div>'
                     + (unit ? '<div style="font-size:8px;color:#94a3b8">' + e(unit) + '</div>' : '')
                     + '</td>';
            }

            // ── Logo block ────────────────────────────────────────────────────
            var logoHtml = '';
            if (lh.lh_show_logo !== '0') {
                logoHtml = '<div style="width:' + logoSize + ';height:' + logoSize
                         + ';background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2e8f0;flex-shrink:0">'
                         + (logoPath ? '<img src="' + logoPath + '" style="max-width:100%;max-height:100%;object-fit:contain">' : '<span style="font-size:9px;color:#94a3b8">Logo</span>')
                         + '</div>';
            }

            // ── Section visibility (mirrors live isSectionEnabled) ────────────
            function isSec(key) {
                if (!otFormSections.length) return true;
                var s = otFormSections.find(function(x) { return x.key === key; });
                return !s || s.isEnabled;
            }

            // ── Checklist sections content ────────────────────────────────────
            // Section 1: Patient Verification
            var secPatVerif = clItem('Patient identity confirmed', cl.patientIdentityConfirmed)
                + clItem('Name verified with ID', cl.nameVerifiedWithId)
                + clItem('Wristband checked', cl.wristbandChecked)
                + clItem('Procedure verified', cl.procedureVerified)
                + clItem('Patient confirms procedure', cl.patientConfirmsProcedure)
                + clItem('Site marked (if applicable)', cl.siteMark)
                + clItem('Surgical site marked', cl.surgicalSiteMarked);

            // Section 2: Consent Documentation
            var secConsent = clItem('Surgery consent signed', cl.surgeryConsentSigned)
                + (cl.surgeryConsentDate ? '<div style="font-size:9px;color:#64748b;padding:1px 0 3px 20px">Date: ' + e(cl.surgeryConsentDate) + '</div>' : '')
                + clItem('Anesthesia consent signed', cl.anesthesiaConsentSigned)
                + clItem('Blood transfusion consent', cl.bloodTransfusionConsent)
                + clItem('High-risk procedure consent', cl.highRiskConsent)
                + clItem('Implant consent', cl.implantConsent)
                + (cl.consentObtainedBy ? '<div style="font-size:9px;color:#64748b;padding:2px 0 0 0">Obtained by: <strong>' + e(cl.consentObtainedBy) + '</strong></div>' : '')
                + (cl.witnessName ? '<div style="font-size:9px;color:#64748b;padding:1px 0">Witness: <strong>' + e(cl.witnessName) + '</strong></div>' : '');

            // Section 3: Pre-Anesthetic Evaluation
            var secPreAne = clItem('PAC completed', cl.pacCompleted)
                + (cl.pacDate ? '<div style="font-size:9px;color:#64748b;padding:1px 0 3px 20px">Date: ' + e(cl.pacDate) + '</div>' : '')
                + clItem('Medical clearance obtained', cl.medicalClearanceObtained)
                + (cl.clearanceSpecialty ? '<div style="font-size:9px;color:#64748b;padding:1px 0 1px 20px">Specialty: <strong>' + e(cl.clearanceSpecialty) + '</strong></div>' : '')
                + (cl.clearanceBy ? '<div style="font-size:9px;color:#64748b;padding:1px 0 3px 20px">By: <strong>' + e(cl.clearanceBy) + '</strong></div>' : '')
                + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:6px">'
                + '<div style="background:#f8fafc;padding:5px 7px;border-radius:4px"><div style="font-size:7px;color:#94a3b8;text-transform:uppercase;font-weight:700">ASA</div><div style="font-size:9px;font-weight:600;color:#0f172a">' + e(cl.asaClassification || '-') + '</div></div>'
                + '<div style="background:#f8fafc;padding:5px 7px;border-radius:4px"><div style="font-size:7px;color:#94a3b8;text-transform:uppercase;font-weight:700">Mallampati</div><div style="font-size:9px;font-weight:600;color:#0f172a">' + e(cl.mallampatiScore || '-') + '</div></div>'
                + '<div style="background:#f8fafc;padding:5px 7px;border-radius:4px"><div style="font-size:7px;color:#94a3b8;text-transform:uppercase;font-weight:700">Airway</div><div style="font-size:9px;font-weight:600;color:#0f172a">' + e(cl.airwayAssessment || '-') + '</div></div>'
                + '</div>';

            // Section 4: NPO Status
            var npoHours = '';
            if (cl.npoSince) {
                var diff = (Date.now() - new Date(cl.npoSince).getTime()) / 3600000;
                npoHours = diff.toFixed(1) + ' hrs';
            }
            var secNpo = (cl.npoSince
                ? '<div style="display:flex;align-items:center;gap:8px;padding:4px 0">'
                  + '<div style="font-size:9px;color:#64748b">NPO Since: <strong style="color:#0f172a">' + e(cl.npoSince.replace('T',' ').substring(0,16)) + '</strong></div>'
                  + '<div style="margin-left:auto;font-size:12px;font-weight:700;color:' + (parseFloat(npoHours) >= 6 ? '#16a34a' : '#dc2626') + '">' + e(npoHours) + '</div>'
                  + '</div>'
                : '<div style="font-size:10px;color:#94a3b8">NPO time not recorded</div>');

            // Section 5: Investigations
            var secInv = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px">'
                + clItemVal('CBC', cl.cbcDone, (cl.cbcHb ? 'Hb:' + cl.cbcHb + (cl.cbcWbc ? ' WBC:' + cl.cbcWbc : '') + (cl.cbcPlatelets ? ' Plt:' + cl.cbcPlatelets : '') : ''), '')
                + clItemVal('Blood Grouping', cl.bloodGroupingDone, (cl.bloodGroup ? cl.bloodGroup + (cl.unitsArranged ? ' / ' + cl.unitsArranged + 'u' : '') : ''), '')
                + clItemVal('Coag Profile', cl.coagProfileDone, (cl.ptInr ? 'INR:' + cl.ptInr + (cl.aptt ? ' APTT:' + cl.aptt : '') : ''), '')
                + clItemVal('Renal Function', cl.renalFunctionDone, (cl.creatinine ? 'Cr:' + cl.creatinine + (cl.urea ? ' Urea:' + cl.urea : '') : ''), '')
                + clItemVal('Liver Function', cl.liverFunctionDone, '', '')
                + clItemVal('Electrolytes', cl.electrolytesDone, (cl.sodium ? 'Na:' + cl.sodium + (cl.potassium ? ' K:' + cl.potassium : '') : ''), '')
                + clItemVal('Blood Sugar', cl.bloodSugarDone, cl.bloodSugar, 'mg/dL')
                + clItemVal('ECG', cl.ecgDone, cl.ecgResult, '')
                + clItemVal('Chest X-Ray', cl.chestXrayDone, cl.chestXrayResult, '')
                + clItemVal('ECHO', cl.echoDone, '', '')
                + '</div>'
                + (cl.otherInvestigation ? '<div style="font-size:9px;color:#64748b;margin-top:4px">Other: <strong>' + e(cl.otherInvestigation) + '</strong></div>' : '');

            // Section 6: Pre-Op Medications
            var secMeds = clItem('Pre-op antibiotics given', cl.preOpAntibioticsGiven)
                + (cl.preOpAntibioticsGiven && (cl.antibioticMed || cl.antibioticDose || cl.antibioticTime)
                    ? '<div style="font-size:9px;color:#64748b;padding:1px 0 3px 20px">'
                      + (cl.antibioticMed ? e(cl.antibioticMed) : '') + (cl.antibioticDose ? ' ' + e(cl.antibioticDose) : '') + (cl.antibioticTime ? ' @ ' + e(cl.antibioticTime) : '')
                      + '</div>' : '')
                + clItem('Pre-medication given', cl.preMedGiven)
                + (cl.preMedGiven && cl.preMedDetails ? '<div style="font-size:9px;color:#64748b;padding:1px 0 3px 20px">' + e(cl.preMedDetails) + '</div>' : '');

            // Section 7: Physical Preparation
            var secPhysical = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px">'
                + clItem('Patient bathed', cl.patientBathed)
                + clItem('Surgical site shaved/prepped', cl.surgicalSiteShaved)
                + clItem('Nail polish removed', cl.nailPolishRemoved)
                + clItem('Jewelry removed', cl.jewelryRemoved)
                + clItem('Dentures removed', cl.denturesRemoved)
                + clItem('Contact lenses removed', cl.contactLensesRemoved)
                + clItem('Hearing aids removed', cl.hearingAidsRemoved)
                + clItem('Bladder emptied', cl.bladderEmptied)
                + clItem('Pre-op gown worn', cl.preOpGownWorn)
                + clItem('IV line secured', cl.ivLineSecured)
                + '</div>'
                + (cl.ivLineSecured ? '<div style="font-size:9px;color:#64748b;margin-top:4px">IV: <strong>' + e(cl.ivSite || '-') + ' / ' + e(cl.ivGauge || '-') + '</strong></div>' : '');

            // Section 8: Allergies & Risk Factors
            var riskItems = [];
            if (cl.rfDiabetes)             riskItems.push('Diabetes');
            if (cl.rfHypertension)         riskItems.push('Hypertension');
            if (cl.rfCardiac)              riskItems.push('Cardiac disease');
            if (cl.rfRespiratory)          riskItems.push('Respiratory disease');
            if (cl.rfRenal)                riskItems.push('Renal disease');
            if (cl.rfBleeding)             riskItems.push('Bleeding disorder');
            if (cl.rfAnesthesiaComplication) riskItems.push('Previous anesthesia complications');
            if (cl.rfSmoking)              riskItems.push('Smoking');
            if (cl.rfObesity)              riskItems.push('Obesity (BMI > 30)');
            var secAllergies = '<div style="font-size:10px;color:#1e293b;margin-bottom:6px">'
                + '<span style="font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700">Known Allergies: </span>'
                + (cl.knownAllergies
                    ? '<strong style="color:' + (cl.knownAllergies.toLowerCase().indexOf('none') < 0 && cl.knownAllergies.toLowerCase() !== 'nkda' ? '#dc2626' : '#16a34a') + '">' + e(cl.knownAllergies) + '</strong>'
                    : '<span style="color:#94a3b8">Not recorded</span>')
                + '</div>'
                + (riskItems.length > 0
                    ? '<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:4px;padding:6px 8px"><div style="font-size:8px;font-weight:700;color:#9a3412;text-transform:uppercase;margin-bottom:4px">Risk Factors</div><div style="font-size:9px;color:#7c2d12">' + riskItems.map(function(r) { return e(r); }).join(' &bull; ') + '</div></div>'
                    : '<div style="font-size:9px;color:#94a3b8">No risk factors recorded</div>');

            // Section 9: Equipment & Supplies
            var secEquip = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px">'
                + clItem('OT prepared', cl.otPrepared)
                + clItem('Equipment sterilized', cl.equipmentSterilized)
                + clItem('Instruments counted', cl.instrumentsCounted)
                + clItem('Implants available', cl.implantsAvailable)
                + clItem('Blood products available', cl.bloodProductsAvailable)
                + clItem('Emergency drugs checked', cl.emergencyDrugsChecked)
                + '</div>'
                + (cl.instrumentsCounted && cl.instrumentInitialCount ? '<div style="font-size:9px;color:#64748b;margin-top:4px">Initial count: <strong>' + e(cl.instrumentInitialCount) + '</strong></div>' : '');

            // Section 10: Final Verification
            var secFinal = clItem('Pre-op checklist reviewed by surgeon', cl.reviewedBySurgeon)
                + clItem('Pre-op checklist reviewed by anaesthesiologist', cl.reviewedByAnaesthesiologist)
                + clItem('All team members briefed', cl.allTeamBriefed)
                + (cl.specialConsiderations ? '<div style="font-size:9px;color:#64748b;margin-top:4px;border-top:1px solid #f1f5f9;padding-top:4px"><strong>Special Considerations:</strong> ' + e(cl.specialConsiderations) + '</div>' : '');

            // ── Full HTML ─────────────────────────────────────────────────────
            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
                + '<title>Pre-Operative Checklist \u2014 ' + e(patientName) + '</title>'
                + '<style>'
                + '* { margin:0; padding:0; box-sizing:border-box; }'
                + 'body { font-family:"SF Pro Text","Segoe UI",Arial,sans-serif; background:#fff; color:#1e293b; }'
                + '@page { size:A4; margin:10mm 10mm 8mm 10mm; }'
                + '@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }'
                + 'table { border-collapse:collapse; width:100%; }'
                + '</style></head><body>'

                + '<div style="max-width:740px;margin:0 auto;background:#fff">'

                // Top accent bar
                + '<div style="height:4px;background:' + color + '"></div>'

                // Letterhead
                + '<div style="padding:20px 28px 14px">'
                + '<div style="display:flex;align-items:flex-start;gap:20px">'
                + logoHtml
                + '<div style="flex:1;min-width:0">'
                + (hospName ? '<div style="font-size:17px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;line-height:1.1">' + e(hospName) + '</div>' : '')
                + (tagline  ? '<div style="font-size:11px;color:#64748b;margin-top:4px;font-style:italic">' + e(tagline) + '</div>' : '')
                + (addrParts.length ? '<div style="font-size:10px;color:#475569;margin-top:5px">' + e(addrParts.join(', ')) + '</div>' : '')
                + (contactParts.length ? '<div style="font-size:10px;color:#475569;margin-top:4px;display:flex;gap:14px;flex-wrap:wrap;align-items:center">' + contactParts.map(function(p) { return '<span style="display:inline-flex;align-items:center;gap:2px">' + p + '</span>'; }).join('') + '</div>' : '')
                + '</div>'
                + '</div>'
                + '<div style="margin-top:14px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '</div>'

                // Title strip
                + '<div style="padding:9px 28px;background:' + color + ';display:flex;align-items:center;justify-content:space-between">'
                + '<span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">PRE-OPERATIVE CHECKLIST</span>'
                + '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:9px;font-weight:600;padding:2px 9px;border-radius:20px;letter-spacing:0.5px">' + e(procedure) + '</span>'
                + '</div>'

                // Content area
                + '<div style="padding:14px 28px">'

                // Patient grid
                + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:14px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '<table style="table-layout:fixed">'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('PATIENT NAME', patientName, true, '#fff')
                + infoCell('MRN', mrn, true, '#fff')
                + infoCell('OPERATION ID', operationId, true, '#fff')
                + infoCell('SURGERY TYPE', surgeryType, false, '#fff')
                + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('SURGEON', surgeon, true, '#f8fafc')
                + infoCell('ANAESTHETIST', anaesthetist, true, '#f8fafc')
                + infoCell('THEATER', theater, true, '#f8fafc')
                + infoCell('PRIORITY', priority, false, '#f8fafc')
                + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('PHONE NO.', phone, true, '#fff')
                + infoCell('CNIC', cnic, true, '#fff')
                + infoCell('AGE', age, true, '#fff')
                + infoCell('GENDER', gender, false, '#fff')
                + '</tr>'
                + '<tr>'
                + infoCell('SURGERY DATE', surgeryDate, true, '#f8fafc')
                + infoCell('START TIME', startTime, true, '#f8fafc')
                + infoCell('EST. DURATION', estDuration, true, '#f8fafc')
                + infoCell('PROCEDURE', procedure, false, '#f8fafc')
                + '</tr>'
                + '</table>'
                + '</div>'

                // Checklist sections — 2-column layout
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">'

                // Left column
                + '<div>'
                + (isSec('patient_verification') ? secBox('1. Patient Verification (WHO Checklist)', secPatVerif) : '')
                + (isSec('consent')              ? secBox('2. Consent Documentation', secConsent) : '')
                + (isSec('preanesthetic')        ? secBox('3. Pre-Anesthetic Evaluation', secPreAne) : '')
                + (isSec('npo')                  ? secBox('4. NPO Status', secNpo) : '')
                + (isSec('medications')          ? secBox('6. Pre-Operative Medications', secMeds) : '')
                + '</div>'

                // Right column
                + '<div>'
                + (isSec('investigations')   ? secBox('5. Pre-Operative Investigations', secInv) : '')
                + (isSec('physical_prep')    ? secBox('7. Physical Preparation', secPhysical) : '')
                + (isSec('equipment')        ? secBox('9. Equipment & Supplies Check', secEquip) : '')
                + (isSec('final_verification') ? secBox('10. Final Verification', secFinal) : '')
                + '</div>'

                + '</div>'

                // Allergies & Risk Factors (full width)
                + (isSec('allergies') ? secBox('8. Allergies & Risk Factors', secAllergies) : '')

                // Vital Signs (full width grid card)
                + (isSec('vitals') ? '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">'
                + '<div style="background:' + color + ';color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:5px 10px">Vital Signs (Last Recorded' + (cl.vsTime ? ' \u2014 ' + cl.vsTime : '') + ')</div>'
                + '<table style="table-layout:fixed">'
                + '<tr>'
                + vCell('Blood Pressure', cl.vsBP, 'mmHg')
                + vCell('Heart Rate', cl.vsHR, 'bpm')
                + vCell('Temperature', cl.vsTemp, '\u00b0F')
                + vCell('Resp. Rate', cl.vsRR, '/min')
                + vCell('SpO\u2082', cl.vsSpO2, '%')
                + '<td style="padding:7px 10px;text-align:center"><div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#94a3b8;margin-bottom:3px">Weight</div><div style="font-size:12px;font-weight:700;color:#0f172a">' + e(cl.vsWeight || '\u2014') + '</div><div style="font-size:8px;color:#94a3b8">kg</div></td>'
                + '</tr>'
                + '</table>'
                + '</div>' : '')

                // Signature
                + '<div style="display:flex;justify-content:flex-end;margin-top:8px">'
                + '<div style="width:220px;text-align:center">'
                + (savedBy ? '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">' + e(savedBy) + '</div>' : '<div style="height:30px"></div>')
                + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Anaesthetist / Nurse</div>'
                + '</div>'
                + '</div>'

                + '</div>' // end content

                // Footer
                + '<div style="margin:0 28px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '<div style="padding:10px 28px;display:flex;justify-content:space-between;align-items:flex-start">'
                + '<div style="font-size:9px;color:#64748b;line-height:1.6">' + footerLines.map(function(l) { return '<div>' + e(l) + '</div>'; }).join('') + '</div>'
                + '<div style="font-size:9px;color:#64748b;text-align:right;line-height:1.6">' + metaParts.map(function(p) { return '<div>' + e(p) + '</div>'; }).join('') + '</div>'
                + '</div>'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '</div>' // end wrapper

                + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>'
                + '</body></html>';

            var w = window.open('', '_blank', 'width=900,height=750');
            if (w) { w.document.write(html); w.document.close(); }
        });
    }

    // ── Intra-Op Record Print (Anesthesia Chart / Operative Note) ────────────
    function printIntraOpRecord(mode) {
        // mode: 'anesthesia' | 'operative'
        if (!selectedIntraOpId) return;
        var op = operations.find(function(o) { return o.operationId === selectedIntraOpId; });
        if (!op) return;
        var rec = intraOpState[selectedIntraOpId] || defaultIntraOp();

        $.when(
            $.get('/api/hospital-info/settings/letterhead'),
            $.get('/api/hospital-info/settings/footer'),
            $.get('/api/hospital-info/settings/basic')
        ).done(function(lhRes, ftRes, prRes) {
            var lh = lhRes[0].settings || {};
            var ft = ftRes[0].settings || {};
            var pr = prRes[0].settings || {};

            var color    = lh.lh_primary_color || '#003366';
            var hospName = (lh.lh_show_name !== '0') ? (pr.basic_name || '') : '';
            var tagline  = (lh.lh_show_tagline === '1') ? (pr.basic_tagline || '') : '';
            var logoPath = (lh.lh_show_logo !== '0') ? (pr.logo || pr.basic_logo || '') : '';
            var logoSizeMap = { small: '44px', medium: '64px', large: '88px' };
            var logoSize = logoSizeMap[lh.lh_logo_size] || '64px';
            var addrParts = (lh.lh_show_address === '1')
                ? [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean) : [];

            var svgPhone = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
            var svgMail  = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
            var svgGlobe = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/></svg>';
            var contactParts = [];
            if (lh.lh_show_phone   === '1' && pr.contact_phone)   contactParts.push(svgPhone + e(pr.contact_phone));
            if (lh.lh_show_email   === '1' && pr.contact_email)   contactParts.push(svgMail  + e(pr.contact_email));
            if (lh.lh_show_website === '1' && pr.contact_website) contactParts.push(svgGlobe + e(pr.contact_website));

            // ── Patient / op data ─────────────────────────────────────────────
            var patientName  = op.patientName  || '-';
            var mrn          = op.mrn          || '-';
            var operationId  = op.operationId  || '-';
            var surgeon      = op.surgeon      || '-';
            var anaesthetist = op.anaesthetist || '-';
            var theater      = op.theater      || '-';
            var surgeryType  = op.surgeryType  || '-';
            var phone        = op.phone        || '-';
            var cnic         = op.cnic         || '-';
            var age          = op.age          ? (op.age + ' Years') : '-';
            var gender       = op.gender       || '-';
            var procedure    = op.procedure    || '-';
            var surgeryDate  = op.surgeryDate  ? new Date(op.surgeryDate).toLocaleDateString('en-GB') : '-';
            var startTime    = op.startTime    || '-';
            var phase        = rec.currentPhase || 'Pre-Induction';
            var savedBy      = op.intraopSavedBy || '';

            // ── Computed values ────────────────────────────────────────────────
            var totalAneTime = (rec.anesthesiaStartTime && rec.anesthesiaEndTime)
                ? Math.round((new Date(rec.anesthesiaEndTime) - new Date(rec.anesthesiaStartTime)) / 60000) + ' min' : '-';
            var totalSurgTime = (rec.incisionTime && rec.finalSutureTime)
                ? Math.round((new Date(rec.finalSutureTime) - new Date(rec.incisionTime)) / 60000) + ' min' : '-';
            var crystVol = rec.crystalloids.reduce(function(a, c) { return a + (parseInt(c.volume)||0); }, 0);
            var collVol  = rec.colloids.reduce(function(a, c) { return a + (parseInt(c.volume)||0); }, 0);
            var totalIn  = crystVol + collVol;
            var bloodLossNum = parseInt(rec.bloodLoss) || 0;
            var urineVol = parseInt(rec.urineOutput) || 0;
            var fluidBalance = totalIn - bloodLossNum - urineVol;
            var allCountsMatch = rec.instrumentMatch && rec.spongeMatch && rec.needleMatch;

            // ── Footer meta ────────────────────────────────────────────────────
            var footerLines = [ft.footer_line1, ft.footer_line2, ft.footer_line3].filter(Boolean);
            var metaParts = [];
            if (ft.footer_show_page_number === '1') metaParts.push('Page 1 of 1');
            if (ft.footer_show_date === '1') {
                var _now = new Date();
                metaParts.push('Printed: ' + _now.toLocaleDateString('en-GB') + ', ' + _now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            }
            if (ft.footer_show_disclaimer === '1') metaParts.push('Confidential \u2014 For medical use only');

            // ── Helpers ────────────────────────────────────────────────────────
            function e(v) { return (v||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
            function chk(checked) {
                return checked
                    ? '<span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;background:#16a34a;border-radius:3px;color:#fff;font-size:8px;font-weight:700;flex-shrink:0;margin-right:5px">&#10003;</span>'
                    : '<span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;border:1.5px solid #cbd5e1;border-radius:3px;flex-shrink:0;margin-right:5px"></span>';
            }
            function clItem(label, checked) {
                return '<div style="display:flex;align-items:center;padding:2px 0;font-size:9.5px;color:#1e293b">' + chk(checked) + e(label) + '</div>';
            }
            function infoCell(label, val, borderRight, rowBg) {
                return '<td style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + e(label) + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + e(val) + '</div>'
                     + '</td>';
            }
            function secBox(title, content, accentColor) {
                var ac = accentColor || color;
                return '<div style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:10px">'
                     + '<div style="background:' + ac + ';color:#fff;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;padding:5px 10px">' + e(title) + '</div>'
                     + '<div style="padding:8px 10px;background:#fff">' + content + '</div>'
                     + '</div>';
            }
            function kv(label, val) {
                return '<div style="font-size:9px;color:#64748b;margin-bottom:3px">' + e(label) + ': <strong style="color:#0f172a">' + e(val||'\u2014') + '</strong></div>';
            }
            function medList(arr) {
                if (!arr || !arr.length) return '<div style="font-size:9px;color:#94a3b8">None recorded</div>';
                return arr.map(function(m) {
                    return '<div style="font-size:9px;color:#334155;padding:2px 0">'
                         + e(m.name||'') + (m.dose ? ' <span style="color:#64748b">'+e(m.dose)+'</span>' : '')
                         + (m.route ? ' <span style="color:#94a3b8">'+e(m.route)+'</span>' : '')
                         + (m.time  ? ' <span style="color:#94a3b8">@ '+e(m.time)+'</span>' : '')
                         + '</div>';
                }).join('');
            }
            function fluidList(arr) {
                if (!arr || !arr.length) return '<span style="font-size:9px;color:#94a3b8">None</span>';
                return arr.map(function(f) { return '<span style="font-size:9px;color:#334155">' + e(f.type||'') + (f.volume ? ' '+e(f.volume)+'ml' : '') + '</span>'; }).join(' &bull; ');
            }

            // ── Logo ──────────────────────────────────────────────────────────
            var logoHtml = '';
            if (lh.lh_show_logo !== '0') {
                logoHtml = '<div style="width:' + logoSize + ';height:' + logoSize
                         + ';background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2e8f0;flex-shrink:0">'
                         + (logoPath ? '<img src="' + logoPath + '" style="max-width:100%;max-height:100%;object-fit:contain">' : '<span style="font-size:9px;color:#94a3b8">Logo</span>')
                         + '</div>';
            }

            // ── Section content builders ───────────────────────────────────────
            // WHO Sign In
            var whoSignIn = clItem('Patient identity confirmed', rec.whoSignIn.patientIdentityConfirmed)
                + clItem('Surgical site marked / confirmed', rec.whoSignIn.siteMarkedConfirmed)
                + clItem('Consent confirmed', rec.whoSignIn.consentConfirmed)
                + clItem('Anaesthesia safety check complete', rec.whoSignIn.anesthesiaSafetyCheckComplete);

            // WHO Time Out
            var whoTimeOut = '<div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.18);border-radius:4px;padding:6px;margin-bottom:6px">'
                + '<div style="font-size:8px;font-weight:700;color:#dc2626;margin-bottom:4px">CRITICAL \u2014 Entire Team Required</div>'
                + clItem('All team members introduced', rec.whoTimeOut.teamMembersIntroduced)
                + clItem('Identity, site & procedure confirmed by entire team', rec.whoTimeOut.identitySiteConfirmedByTeam)
                + clItem('Anticipated critical events reviewed', rec.whoTimeOut.criticalEventsReviewed)
                + clItem('Antibiotic prophylaxis given within last 60 min', rec.whoTimeOut.antibioticProphylaxisGiven)
                + clItem('Essential imaging displayed', rec.whoTimeOut.imagingDisplayed)
                + '</div>'
                + (rec.whoTimeOut.timeOutCompletedAt || rec.whoTimeOut.confirmedBy
                    ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">'
                      + kv('Time Out at', rec.whoTimeOut.timeOutCompletedAt)
                      + kv('Confirmed by', rec.whoTimeOut.confirmedBy)
                      + '</div>' : '');

            // Anesthesia Induction
            var aneInduction = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px">'
                + kv('Induction started', rec.inductionStartTime)
                + kv('Technique', rec.inductionTechnique)
                + kv('Airway type', rec.airwayType + (rec.airwayType === 'ETT' ? ' ' + rec.ettSize : ''))
                + (rec.airwayType === 'ETT' && rec.cuffPressure ? kv('Cuff pressure', rec.cuffPressure + ' cmH\u2082O') : '')
                + '</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Induction Complications</div>'
                + (rec.inductionComplicationsNone ? clItem('None', true)
                    : [rec.inductionDifficultIntubation && 'Difficult intubation' + (rec.inductionAttempts ? ' ('+rec.inductionAttempts+' attempts)' : ''),
                       rec.inductionHypotension && 'Hypotension',
                       rec.inductionBradycardia && 'Bradycardia',
                       rec.inductionOther && (rec.inductionOtherText || 'Other')
                    ].filter(Boolean).map(function(t){ return clItem(t, true); }).join('') || clItem('None', false))
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin:6px 0 3px">Induction Medications</div>'
                + medList(rec.inductionMedications);

            // Anesthesia Maintenance
            var agentsList = [
                rec.sevoflurane && ('Sevoflurane' + (rec.sevoConc ? ' '+rec.sevoConc+'%' : '')),
                rec.isoflurane  && ('Isoflurane'  + (rec.isoConc  ? ' '+rec.isoConc+'%'  : '')),
                rec.desflurane  && ('Desflurane'  + (rec.desConc  ? ' '+rec.desConc+'%'  : '')),
                rec.propofol    && ('Propofol'    + (rec.propofolRate ? ' '+rec.propofolRate+'ml/hr' : '')),
                rec.maintenanceOther && (rec.maintenanceOtherText || 'Other agent')
            ].filter(Boolean);
            var aneMaintenance = '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Anaesthetic Agents</div>'
                + (agentsList.length ? '<div style="font-size:9px;color:#334155;margin-bottom:6px">' + agentsList.map(function(a){ return e(a); }).join(' &bull; ') + '</div>' : '<div style="font-size:9px;color:#94a3b8;margin-bottom:6px">None recorded</div>')
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Muscle Relaxants</div>'
                + medList(rec.muscleRelaxants)
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin:5px 0 3px">Analgesics</div>'
                + medList(rec.analgesics);

            // Vitals Log
            var vitalsTable = '<table style="width:100%;border-collapse:collapse;font-size:8.5px">'
                + '<thead><tr style="background:' + color + '1a">'
                + ['Time','HR','BP','SpO\u2082','ETCO\u2082','Temp','RR'].map(function(h){ return '<th style="padding:4px 6px;text-align:left;font-weight:700;color:#334155">' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>';
            if (rec.vitalsLog.length === 0) {
                vitalsTable += '<tr><td colspan="7" style="padding:10px;text-align:center;font-size:9px;color:#94a3b8">No vitals recorded</td></tr>';
            } else {
                rec.vitalsLog.forEach(function(v, i) {
                    vitalsTable += '<tr style="background:' + (i%2===1?'#f8fafc':'#fff') + ';border-top:1px solid #f1f5f9">'
                        + [v.time,v.hr,v.bp,v.spo2,v.etco2,v.temp,v.rr].map(function(c){ return '<td style="padding:4px 6px;color:#334155">' + e(c||'\u2014') + '</td>'; }).join('') + '</tr>';
                });
            }
            vitalsTable += '</tbody></table>';

            // Fluids
            var fluidsContent = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px">'
                + '<div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:3px">Crystalloids</div>' + fluidList(rec.crystalloids) + '</div>'
                + '<div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:3px">Colloids</div>' + fluidList(rec.colloids) + '</div>'
                + '<div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:3px">Blood Products</div>' + (rec.bloodProducts.length ? rec.bloodProducts.map(function(b){ return '<span style="font-size:9px;color:#334155">' + e(b.type||'') + (b.units ? ' '+e(b.units)+'u' : '') + '</span>'; }).join(' ') : '<span style="font-size:9px;color:#94a3b8">None</span>') + '</div>'
                + '</div>'
                + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">'
                + '<div style="background:#f8fafc;border-radius:4px;padding:6px"><div style="font-size:8px;color:#94a3b8">Total In</div><div style="font-size:13px;font-weight:700;color:#10b981">' + e(String(totalIn)) + ' ml</div></div>'
                + '<div style="background:#fff7ed;border-radius:4px;padding:6px"><div style="font-size:8px;color:#94a3b8">Blood Loss / Urine</div><div style="font-size:12px;font-weight:700;color:#ea580c">' + e(String(bloodLossNum)) + ' / ' + e(String(urineVol)) + ' ml</div></div>'
                + '<div style="background:' + (fluidBalance >= 0 ? '#f0fdf4' : '#fef2f2') + ';border-radius:4px;padding:6px"><div style="font-size:8px;color:#94a3b8">Fluid Balance</div><div style="font-size:13px;font-weight:700;color:' + (fluidBalance >= 0 ? '#16a34a' : '#dc2626') + '">' + (fluidBalance >= 0 ? '+' : '') + e(String(fluidBalance)) + ' ml</div></div>'
                + '</div>';

            // Surgery Timeline
            var timeline = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">'
                + kv('Anaesthesia start', rec.anesthesiaStartTime ? new Date(rec.anesthesiaStartTime).toTimeString().slice(0,5) : rec.anesthesiaStartTime)
                + kv('Incision time', rec.incisionTime)
                + kv('Procedure start', rec.procedureStartTime)
                + kv('Procedure end', rec.procedureEndTime)
                + kv('Closure start', rec.closureStartTime)
                + kv('Final suture', rec.finalSutureTime)
                + kv('Anaesthesia end', rec.anesthesiaEndTime)
                + kv('Patient out of OT', rec.patientOutTime)
                + '</div>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px">'
                + '<div style="background:#f8fafc;border-radius:4px;padding:6px"><div style="font-size:8px;color:#94a3b8">Total Anaesthesia</div><div style="font-size:13px;font-weight:700;color:#0f172a">' + e(totalAneTime) + '</div></div>'
                + '<div style="background:#f8fafc;border-radius:4px;padding:6px"><div style="font-size:8px;color:#94a3b8">Total Surgery</div><div style="font-size:13px;font-weight:700;color:#0f172a">' + e(totalSurgTime) + '</div></div>'
                + '</div>';

            // Position & Findings
            var findings = kv('Patient position', rec.patientPosition)
                + kv('Pressure points padded', rec.pressurePointsPadded ? 'Yes' : 'No')
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin:5px 0 3px">Pre-operative Diagnosis</div>'
                + '<div style="font-size:9.5px;color:#334155;margin-bottom:5px">' + e(procedure) + '</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Intra-operative Findings</div>'
                + '<div style="font-size:9.5px;color:#334155;margin-bottom:5px">' + e(rec.intraOpFindings || '\u2014') + '</div>'
                + kv('Post-operative diagnosis', rec.postOpDiagnosis);

            // Procedure & Specimens
            var procContent = '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Procedure Description</div>'
                + '<div style="font-size:9.5px;color:#334155;margin-bottom:8px;line-height:1.5">' + e(rec.procedureDescription || '\u2014') + '</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Specimens</div>'
                + (rec.specimens.length ? rec.specimens.map(function(s){ return '<div style="font-size:9px;color:#334155">' + e(s.specimen||'') + (s.container ? ' \u2014 '+e(s.container) : '') + '</div>'; }).join('') : '<div style="font-size:9px;color:#94a3b8">None</div>')
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin:5px 0 3px">Implants</div>'
                + (rec.implants.length ? rec.implants.map(function(m){ return '<div style="font-size:9px;color:#334155">' + e(m.name||'') + (m.size ? ' '+e(m.size) : '') + '</div>'; }).join('') : '<div style="font-size:9px;color:#94a3b8">None</div>');

            // Drains & Catheters
            var drains = '';
            var drainList = [rec.drainRedivac && 'Redivac drain', rec.drainPigtail && 'Pigtail drain', rec.drainTTube && 'T-tube', rec.drainOther && (rec.drainOtherText||'Other drain')].filter(Boolean);
            var catList   = [rec.catUrinary && 'Urinary catheter', rec.catCentralLine && 'Central line', rec.catArterialLine && 'Arterial line', rec.catNgTube && 'NG tube', rec.catOther && (rec.catOtherText||'Other')].filter(Boolean);
            drains = '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Drains</div>'
                + (drainList.length
                    ? drainList.map(function(d){ return clItem(d + (rec.drainLocation ? ' \u2014 '+rec.drainLocation : '') + (rec.drainSize ? ' ('+rec.drainSize+')' : ''), true); }).join('')
                    : '<div style="font-size:9px;color:#94a3b8">None placed</div>')
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin:5px 0 3px">Catheters</div>'
                + (catList.length ? catList.map(function(c){ return clItem(c, true); }).join('') : '<div style="font-size:9px;color:#94a3b8">None placed</div>');

            // Surgical Counts
            var countsContent = '<table style="width:100%;border-collapse:collapse;font-size:9px">'
                + '<thead><tr style="background:' + color + '1a">'
                + ['Item','Before','After','Match'].map(function(h){ return '<th style="padding:5px 8px;text-align:left;font-weight:700;color:#334155">' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>'
                + [['Instruments', rec.instrumentBefore, rec.instrumentAfter, rec.instrumentMatch],
                   ['Sponges',     rec.spongeBefore,     rec.spongeAfter,     rec.spongeMatch],
                   ['Needles',     rec.needleBefore,     rec.needleAfter,     rec.needleMatch]].map(function(r, i) {
                    return '<tr style="background:' + (i%2===1?'#f8fafc':'#fff') + ';border-top:1px solid #f1f5f9">'
                         + '<td style="padding:5px 8px;color:#334155">' + r[0] + '</td>'
                         + '<td style="padding:5px 8px;color:#64748b">' + e(r[1]||'\u2014') + '</td>'
                         + '<td style="padding:5px 8px;color:#64748b">' + e(r[2]||'\u2014') + '</td>'
                         + '<td style="padding:5px 8px;font-weight:700;color:' + (r[3] ? '#16a34a' : '#dc2626') + '">' + (r[3] ? '\u2713 Match' : '\u2717 MISMATCH') + '</td>'
                         + '</tr>';
                }).join('')
                + '</tbody></table>'
                + '<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;margin-top:6px;border-radius:5px;background:' + (allCountsMatch ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)') + ';border:1px solid ' + (allCountsMatch ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.3)') + '">'
                + '<span style="font-size:12px">' + (allCountsMatch ? '\u2713' : '\u26a0') + '</span>'
                + '<span style="font-size:10px;font-weight:700;color:' + (allCountsMatch ? '#16a34a' : '#dc2626') + '">' + (allCountsMatch ? 'All counts correct' : 'COUNT MISMATCH \u2014 X-Ray Required!') + '</span></div>';

            // Complications
            var compList = [rec.compExcessiveBleeding && 'Excessive bleeding', rec.compOrganInjury && 'Organ injury', rec.compVascularInjury && 'Vascular injury', rec.compNerveInjury && 'Nerve injury', rec.compUnexpectedFindings && 'Unexpected findings', rec.compOther && (rec.compOtherText||'Other')].filter(Boolean);
            var comps = rec.compNone
                ? clItem('None', true)
                : (compList.length ? compList.map(function(c){ return clItem(c, true); }).join('')
                    + (rec.compDescription ? '<div style="font-size:9px;color:#64748b;margin-top:4px;border-top:1px solid #f1f5f9;padding-top:4px">' + e(rec.compDescription) + '</div>' : '') : clItem('None reported', false));

            // Surgical Team
            var teamContent = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">'
                + [['Primary Surgeon', surgeon], ['Anaesthesiologist', anaesthetist],
                   ['Assistant Surgeon(s)', rec.assistantSurgeons], ['Scrub Nurse', rec.scrubNurse],
                   ['Circulating Nurse', rec.circulatingNurse], ['Anaesthesia Technician', rec.anesthesiaTechnician],
                   ['Other Staff', rec.otherStaff]].map(function(t) {
                    return t[1] ? '<div style="background:#f8fafc;border-radius:4px;padding:5px 7px"><div style="font-size:7.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:2px">' + e(t[0]) + '</div><div style="font-size:9.5px;font-weight:600;color:#0f172a">' + e(t[1]) + '</div></div>' : '';
                }).filter(Boolean).join('')
                + '</div>';

            // Post-Op Instructions
            var monList = [rec.postOpVitals15 && 'Vitals every 15 min', rec.postOpVitals30 && 'Vitals every 30 min', rec.postOpDrainOutput && 'Drain output', rec.postOpUrineOutput && 'Urine output', rec.postOpNeuro && 'Neurological obs', rec.postOpOtherMonitor && (rec.postOpOtherMonitorText||'Other monitoring')].filter(Boolean);
            var postOp = kv('Destination', rec.postOpDestination)
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin:4px 0 3px">Monitoring</div>'
                + (monList.length ? monList.map(function(m){ return clItem(m, true); }).join('') : '<div style="font-size:9px;color:#94a3b8">Not specified</div>')
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:5px">'
                + kv('Activity', rec.activityOrders) + kv('Diet', rec.dietOrders)
                + '</div>'
                + (rec.woundCare ? '<div style="margin-top:4px">' + kv('Wound care', rec.woundCare) + '</div>' : '')
                + (rec.drainManagement ? kv('Drain management', rec.drainManagement) : '')
                + (rec.specialInstructions ? '<div style="margin-top:4px;font-size:9px;color:#64748b;border-top:1px solid #f1f5f9;padding-top:4px">' + e(rec.specialInstructions) + '</div>' : '');

            // WHO Sign Out
            var whoSignOut = '<div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:4px;padding:6px;margin-bottom:6px">'
                + clItem('Procedure recorded correctly', rec.whoSignOut.procedureRecorded)
                + clItem('Instrument, sponge & needle counts correct', rec.whoSignOut.countsCorrect)
                + clItem('Specimens labeled correctly', rec.whoSignOut.specimensLabeled)
                + clItem('Equipment issues addressed', rec.whoSignOut.equipmentIssuesAddressed)
                + clItem('Key concerns for recovery reviewed', rec.whoSignOut.keyConcernsReviewed)
                + '</div>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">'
                + kv('Sign Out at', rec.whoSignOut.signOutCompletedAt)
                + kv('Confirmed by', rec.whoSignOut.confirmedBy)
                + '</div>';

            // ── Determine which sections to show based on mode ─────────────────
            function isSec(key) {
                if (!otIntraopFormSections.length) return true;
                var s = otIntraopFormSections.find(function(x) { return x.key === key; });
                return !s || s.isEnabled;
            }

            var docTitle = mode === 'anesthesia' ? 'ANAESTHESIA CHART' : 'OPERATIVE NOTE';

            // ── Full HTML ──────────────────────────────────────────────────────
            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
                + '<title>' + (mode === 'anesthesia' ? 'Anaesthesia Chart' : 'Operative Note') + ' \u2014 ' + e(patientName) + '</title>'
                + '<style>'
                + '* { margin:0; padding:0; box-sizing:border-box; }'
                + 'body { font-family:"SF Pro Text","Segoe UI",Arial,sans-serif; background:#fff; color:#1e293b; }'
                + '@page { size:A4; margin:10mm 10mm 8mm 10mm; }'
                + '@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }'
                + 'table { border-collapse:collapse; width:100%; }'
                + '</style></head><body>'

                + '<div style="max-width:740px;margin:0 auto;background:#fff">'
                + '<div style="height:4px;background:' + color + '"></div>'

                // Letterhead
                + '<div style="padding:20px 28px 14px">'
                + '<div style="display:flex;align-items:flex-start;gap:20px">'
                + logoHtml
                + '<div style="flex:1;min-width:0">'
                + (hospName ? '<div style="font-size:17px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;line-height:1.1">' + e(hospName) + '</div>' : '')
                + (tagline  ? '<div style="font-size:11px;color:#64748b;margin-top:4px;font-style:italic">' + e(tagline) + '</div>' : '')
                + (addrParts.length ? '<div style="font-size:10px;color:#475569;margin-top:5px">' + e(addrParts.join(', ')) + '</div>' : '')
                + (contactParts.length ? '<div style="font-size:10px;color:#475569;margin-top:4px;display:flex;gap:14px;flex-wrap:wrap;align-items:center">' + contactParts.map(function(p) { return '<span style="display:inline-flex;align-items:center;gap:2px">' + p + '</span>'; }).join('') + '</div>' : '')
                + '</div></div>'
                + '<div style="margin-top:14px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '</div>'

                // Title strip
                + '<div style="padding:9px 28px;background:' + color + ';display:flex;align-items:center;justify-content:space-between">'
                + '<span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">' + docTitle + '</span>'
                + '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:9px;font-weight:600;padding:2px 9px;border-radius:20px;letter-spacing:0.5px">' + e(phase) + '</span>'
                + '</div>'

                // Content
                + '<div style="padding:14px 28px">'

                // Patient grid
                + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:14px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '<table style="table-layout:fixed">'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('PATIENT NAME', patientName, true, '#fff')
                + infoCell('MRN', mrn, true, '#fff')
                + infoCell('OPERATION ID', operationId, true, '#fff')
                + infoCell('SURGERY TYPE', surgeryType, false, '#fff')
                + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('SURGEON', surgeon, true, '#f8fafc')
                + infoCell('ANAESTHETIST', anaesthetist, true, '#f8fafc')
                + infoCell('THEATER', theater, true, '#f8fafc')
                + infoCell('CURRENT PHASE', phase, false, '#f8fafc')
                + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('PHONE NO.', phone, true, '#fff')
                + infoCell('CNIC', cnic, true, '#fff')
                + infoCell('AGE', age, true, '#fff')
                + infoCell('GENDER', gender, false, '#fff')
                + '</tr>'
                + '<tr>'
                + infoCell('SURGERY DATE', surgeryDate, true, '#f8fafc')
                + infoCell('START TIME', startTime, true, '#f8fafc')
                + infoCell('PROCEDURE', procedure, true, '#f8fafc')
                + infoCell('STATUS', op.status || '-', false, '#f8fafc')
                + '</tr>'
                + '</table>'
                + '</div>'

                // ── Two-column layout ─────────────────────────────────────────
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">'
                + '<div>'  // left col

                + (isSec('who_signin')           ? secBox('WHO Safety \u2014 Sign In',                  whoSignIn)     : '')
                + (isSec('who_timeout')          ? secBox('WHO Safety \u2014 Time Out',                 whoTimeOut)    : '')
                + (isSec('anesthesia_induction') ? secBox('Section 1A: Anaesthesia \u2014 Induction',   aneInduction)  : '')
                + (isSec('anesthesia_maintenance') ? secBox('Section 1B: Anaesthesia \u2014 Maintenance', aneMaintenance) : '')
                + (isSec('surgery_timeline')     ? secBox('Section 2A: Surgery Timeline',               timeline)      : '')
                + (isSec('complications')        ? secBox('Section 2F: Complications',                  comps)         : '')

                + '</div>'
                + '<div>'  // right col

                + (isSec('vitals_monitoring')    ? secBox('Section 1C: Vitals Log', vitalsTable)       : '')
                + (isSec('fluids_blood')         ? secBox('Section 1D: Fluids & Blood Products', fluidsContent) : '')
                + (isSec('position_findings')    ? secBox('Section 2B: Position & Surgical Findings', findings) : '')
                + (isSec('drains_catheters')     ? secBox('Section 2D: Drains & Catheters', drains)    : '')
                + (isSec('postop_instructions')  ? secBox('Section 4: Post-Operative Instructions', postOp) : '')
                + (isSec('who_signout')          ? secBox('WHO Safety \u2014 Sign Out', whoSignOut)    : '')

                + '</div>'
                + '</div>' // end 2-col

                // Full-width sections
                + (isSec('procedure_specimens')  ? secBox('Section 2C: Procedure & Specimens', procContent) : '')
                + (isSec('surgical_counts')      ? secBox('Section 2E: Surgical Counts (Critical Safety)', countsContent) : '')
                + (isSec('surgical_team')        ? secBox('Section 3: Surgical Team', teamContent) : '')

                // Signature
                + '<div style="display:flex;justify-content:flex-end;margin-top:8px">'
                + '<div style="width:220px;text-align:center">'
                + (savedBy ? '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">' + e(savedBy) + '</div>' : '<div style="height:30px"></div>')
                + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Anaesthetist / Surgeon</div>'
                + '</div>'
                + '</div>'

                + '</div>' // end content

                + '<div style="margin:0 28px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '<div style="padding:10px 28px;display:flex;justify-content:space-between;align-items:flex-start">'
                + '<div style="font-size:9px;color:#64748b;line-height:1.6">' + footerLines.map(function(l){ return '<div>' + e(l) + '</div>'; }).join('') + '</div>'
                + '<div style="font-size:9px;color:#64748b;text-align:right;line-height:1.6">' + metaParts.map(function(p){ return '<div>' + e(p) + '</div>'; }).join('') + '</div>'
                + '</div>'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '</div>' // end wrapper

                + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>'
                + '</body></html>';

            var w = window.open('', '_blank', 'width=900,height=750');
            if (w) { w.document.write(html); w.document.close(); }
        });
    }

    // ── Post-Op Notes Print ───────────────────────────────────────────────────
    function printPostOpNotes() {
        if (!selectedPostOpId) return;
        var op = operations.find(function(o) { return o.operationId === selectedPostOpId; });
        if (!op) return;
        var rec = postOpState[selectedPostOpId] || defaultPostOpNotes();

        $.when(
            $.get('/api/hospital-info/settings/letterhead'),
            $.get('/api/hospital-info/settings/footer'),
            $.get('/api/hospital-info/settings/basic')
        ).done(function(lhRes, ftRes, prRes) {
            var lh = lhRes[0].settings || {};
            var ft = ftRes[0].settings || {};
            var pr = prRes[0].settings || {};

            var color    = lh.lh_primary_color || '#003366';
            var hospName = (lh.lh_show_name !== '0') ? (pr.basic_name || '') : '';
            var tagline  = (lh.lh_show_tagline === '1') ? (pr.basic_tagline || '') : '';
            var logoPath = (lh.lh_show_logo !== '0') ? (pr.logo || pr.basic_logo || '') : '';
            var logoSizeMap = { small: '44px', medium: '64px', large: '88px' };
            var logoSize = logoSizeMap[lh.lh_logo_size] || '64px';
            var addrParts = (lh.lh_show_address === '1')
                ? [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean) : [];

            var svgPhone = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
            var svgMail  = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
            var svgGlobe = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/></svg>';
            var contactParts = [];
            if (lh.lh_show_phone   === '1' && pr.contact_phone)   contactParts.push(svgPhone + e(pr.contact_phone));
            if (lh.lh_show_email   === '1' && pr.contact_email)   contactParts.push(svgMail  + e(pr.contact_email));
            if (lh.lh_show_website === '1' && pr.contact_website) contactParts.push(svgGlobe + e(pr.contact_website));

            // ── Patient / op data ─────────────────────────────────────────────
            var patientName  = op.patientName  || '-';
            var mrn          = op.mrn          || '-';
            var operationId  = op.operationId  || '-';
            var surgeon      = op.surgeon      || '-';
            var anaesthetist = op.anaesthetist || '-';
            var theater      = op.theater      || '-';
            var procedure    = op.procedure    || '-';
            var surgeryType  = op.surgeryType  || '-';
            var phone        = op.phone        || '-';
            var cnic         = op.cnic         || '-';
            var age          = op.age          ? (op.age + ' Years') : '-';
            var gender       = op.gender       || '-';
            var surgeryDate  = op.surgeryDate  ? new Date(op.surgeryDate).toLocaleDateString('en-GB') : '-';
            var postopLoc    = rec.postopLocation || op.postopLocation || 'Recovery Room / PACU';
            var expDischarge = rec.expectedDischargeDate ? new Date(rec.expectedDischargeDate).toLocaleDateString('en-GB') : '-';
            var podDays      = op.surgeryDate ? Math.floor((Date.now() - new Date(op.surgeryDate).getTime()) / 86400000) : 0;
            var savedBy      = op.postopSavedBy || '';

            // ── Aldrete ───────────────────────────────────────────────────────
            var aldreteOpts = {
                aldreteActivity:      [{ val:2, label:'Able to move 4 extremities voluntarily' }, { val:1, label:'Able to move 2 extremities' }, { val:0, label:'Unable to move extremities' }],
                aldreteRespiration:   [{ val:2, label:'Breathes deeply, coughs freely' },          { val:1, label:'Dyspnea or shallow breathing' }, { val:0, label:'Apneic' }],
                aldreteCirculation:   [{ val:2, label:'BP \u00b120% of pre-anesthetic level' },      { val:1, label:'BP \u00b120\u201350%' },              { val:0, label:'BP \u00b1>50%' }],
                aldreteConsciousness: [{ val:2, label:'Fully awake' },                              { val:1, label:'Arousable on calling' },          { val:0, label:'Not responding' }],
                aldreteOxygen:        [{ val:2, label:'SpO\u2082 >92% on room air' },               { val:1, label:'Needs O\u2082 to maintain SpO\u2082 >90%' }, { val:0, label:'SpO\u2082 <90% even with O\u2082' }]
            };
            var aldreteLabels = { aldreteActivity:'Activity', aldreteRespiration:'Respiration', aldreteCirculation:'Circulation', aldreteConsciousness:'Consciousness', aldreteOxygen:'Oxygen Saturation' };
            var aldreteTotal = (parseInt(rec.aldreteActivity)||0) + (parseInt(rec.aldreteRespiration)||0) + (parseInt(rec.aldreteCirculation)||0) + (parseInt(rec.aldreteConsciousness)||0) + (parseInt(rec.aldreteOxygen)||0);
            var aldreteReady = aldreteTotal >= 9;

            // ── Discharge criteria ────────────────────────────────────────────
            var dischargeCriteria = [
                { key:'dischargeCriteriaPainControlled',  label:'Pain controlled on oral medications' },
                { key:'dischargeCriteriaToleratingDiet',  label:'Tolerating diet' },
                { key:'dischargeCriteriaAmbulating',      label:'Ambulating adequately' },
                { key:'dischargeCriteriaWoundHealing',    label:'Wound healing well' },
                { key:'dischargeCriteriaDrainsRemoved',   label:'Drains removed (if applicable)' },
                { key:'dischargeCriteriaAfebrile',        label:'Afebrile >24 hours' },
                { key:'dischargeCriteriaEducationDone',   label:'Patient / family education done' },
            ];
            var criteriaMet = dischargeCriteria.filter(function(c){ return rec[c.key]; }).length;

            // ── Complications ─────────────────────────────────────────────────
            var compList = [
                rec.compBleeding          && 'Bleeding',
                rec.compInfection         && 'Infection',
                rec.compWoundDehiscence   && 'Wound dehiscence',
                rec.compDVTPE             && 'DVT / PE',
                rec.compPneumonia         && 'Pneumonia',
                rec.compUrinaryRetention  && 'Urinary retention',
                rec.compIleus             && 'Ileus',
                rec.compAKI               && 'Acute kidney injury',
                rec.compOther             && (rec.compOtherText || 'Other')
            ].filter(Boolean);

            // ── Footer meta ────────────────────────────────────────────────────
            var footerLines = [ft.footer_line1, ft.footer_line2, ft.footer_line3].filter(Boolean);
            var metaParts = [];
            if (ft.footer_show_page_number === '1') metaParts.push('Page 1 of 1');
            if (ft.footer_show_date === '1') {
                var _now = new Date();
                metaParts.push('Printed: ' + _now.toLocaleDateString('en-GB') + ', ' + _now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }));
            }
            if (ft.footer_show_disclaimer === '1') metaParts.push('Confidential \u2014 For medical use only');

            // ── Helpers ────────────────────────────────────────────────────────
            function e(v) { return (v||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
            function chk(checked) {
                return checked
                    ? '<span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;background:#16a34a;border-radius:3px;color:#fff;font-size:8px;font-weight:700;flex-shrink:0;margin-right:5px">&#10003;</span>'
                    : '<span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;border:1.5px solid #cbd5e1;border-radius:3px;flex-shrink:0;margin-right:5px"></span>';
            }
            function clItem(label, checked) {
                return '<div style="display:flex;align-items:center;padding:2px 0;font-size:9.5px;color:#1e293b">' + chk(checked) + e(label) + '</div>';
            }
            function infoCell(label, val, borderRight, rowBg) {
                return '<td style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + e(label) + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + e(val) + '</div>'
                     + '</td>';
            }
            function secBox(title, content) {
                return '<div style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:10px">'
                     + '<div style="background:' + color + ';color:#fff;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;padding:5px 10px">' + e(title) + '</div>'
                     + '<div style="padding:8px 10px;background:#fff">' + content + '</div>'
                     + '</div>';
            }
            function kv(label, val) {
                return '<div style="font-size:9px;color:#64748b;margin-bottom:3px">' + e(label) + ': <strong style="color:#0f172a">' + e(val||'\u2014') + '</strong></div>';
            }
            function isSec(key) {
                if (!otPostopFormSections.length) return true;
                var s = otPostopFormSections.find(function(x){ return x.key === key; });
                return !s || s.isEnabled;
            }

            // ── Logo ──────────────────────────────────────────────────────────
            var logoHtml = '';
            if (lh.lh_show_logo !== '0') {
                logoHtml = '<div style="width:' + logoSize + ';height:' + logoSize
                         + ';background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2e8f0;flex-shrink:0">'
                         + (logoPath ? '<img src="' + logoPath + '" style="max-width:100%;max-height:100%;object-fit:contain">' : '<span style="font-size:9px;color:#94a3b8">Logo</span>')
                         + '</div>';
            }

            // ── Section builders ───────────────────────────────────────────────

            // Aldrete Score table
            var aldreteHtml = '<table style="width:100%;border-collapse:collapse;font-size:9px;margin-bottom:8px">'
                + '<thead><tr style="background:' + color + '1a">'
                + ['Parameter','Score','Criteria'].map(function(h){ return '<th style="padding:4px 7px;text-align:left;font-weight:700;color:#334155">' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>';
            Object.keys(aldreteOpts).forEach(function(key, i) {
                var score = parseInt(rec[key]) || 0;
                var found = aldreteOpts[key].find(function(o){ return o.val === score; });
                var scoreColor = score === 2 ? '#16a34a' : score === 1 ? '#f97316' : '#dc2626';
                aldreteHtml += '<tr style="background:' + (i%2===1?'#f8fafc':'#fff') + ';border-top:1px solid #f1f5f9">'
                    + '<td style="padding:4px 7px;font-weight:600;color:#334155">' + e(aldreteLabels[key]) + '</td>'
                    + '<td style="padding:4px 7px;text-align:center"><span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:' + scoreColor + ';color:#fff;font-size:9px;font-weight:700;line-height:20px;text-align:center">' + score + '</span></td>'
                    + '<td style="padding:4px 7px;color:#64748b">' + e(found ? found.label : '-') + '</td>'
                    + '</tr>';
            });
            aldreteHtml += '</tbody></table>'
                + '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;background:' + (aldreteReady?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.08)') + ';border:1px solid ' + (aldreteReady?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.3)') + '">'
                + '<div style="text-align:center"><div style="font-size:8px;color:#94a3b8">Score</div><div style="font-size:22px;font-weight:800;color:' + (aldreteReady?'#16a34a':'#dc2626') + ';line-height:1">' + aldreteTotal + '<span style="font-size:11px;font-weight:400">/10</span></div></div>'
                + '<div><div style="font-size:10px;font-weight:700;color:' + (aldreteReady?'#16a34a':'#dc2626') + '">' + (aldreteReady ? '\u2713 Ready for PACU Discharge' : '\u26a0 Score <9 \u2014 Continue monitoring') + '</div>'
                + '<div style="font-size:8.5px;color:#64748b">Score \u22659 required for discharge from recovery room</div></div>'
                + '</div>';

            // Recovery Vitals table
            var recVitalsHtml = '<table style="width:100%;border-collapse:collapse;font-size:8.5px">'
                + '<thead><tr style="background:' + color + '1a">'
                + ['Time','BP','HR','RR','Temp','SpO\u2082','Pain'].map(function(h){ return '<th style="padding:4px 6px;text-align:left;font-weight:700;color:#334155">' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>';
            if (rec.recoveryVitals.length === 0) {
                recVitalsHtml += '<tr><td colspan="7" style="padding:10px;text-align:center;font-size:9px;color:#94a3b8">No vitals recorded</td></tr>';
            } else {
                rec.recoveryVitals.forEach(function(v, i) {
                    var ps = parseInt(v.painScore) || 0;
                    var pc = ps >= 7 ? '#dc2626' : ps >= 4 ? '#f97316' : '#16a34a';
                    recVitalsHtml += '<tr style="background:' + (i%2===1?'#f8fafc':'#fff') + ';border-top:1px solid #f1f5f9">'
                        + [v.time,v.bp,v.hr,v.rr,v.temp,v.spo2].map(function(c){ return '<td style="padding:4px 6px;color:#334155">' + e(c||'\u2014') + '</td>'; }).join('')
                        + '<td style="padding:4px 6px;font-weight:700;color:' + pc + '">' + e(String(ps)) + '/10</td>'
                        + '</tr>';
                });
            }
            recVitalsHtml += '</tbody></table>';

            // Pain & Nausea
            var painScore = parseInt(rec.painScore) || 0;
            var painCol   = painScore >= 7 ? '#dc2626' : painScore >= 4 ? '#f97316' : '#16a34a';
            var painLabel = painScore <= 3 ? 'Mild' : painScore <= 6 ? 'Moderate' : 'Severe';
            var analList  = rec.analgesicsGiven && rec.analgesicsGiven.length
                ? rec.analgesicsGiven.map(function(a){ return e((a.drug||a.name||'') + (a.dose?' '+a.dose:'') + (a.time?' @ '+a.time:'')); }).join(' &bull; ')
                : '<span style="color:#94a3b8">None recorded</span>';
            var painHtml = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">'
                + '<div style="background:' + painCol + '1a;border:1px solid ' + painCol + '33;border-radius:8px;padding:8px 12px;text-align:center;flex-shrink:0">'
                + '<div style="font-size:8px;color:#94a3b8">Pain Score</div>'
                + '<div style="font-size:22px;font-weight:800;color:' + painCol + ';line-height:1">' + painScore + '<span style="font-size:11px;font-weight:400">/10</span></div>'
                + '<div style="font-size:8px;color:' + painCol + ';font-weight:600">' + painLabel + '</div>'
                + '</div>'
                + '<div style="flex:1">'
                + (rec.painLocation ? kv('Pain location', rec.painLocation) : '')
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Analgesics Given</div>'
                + '<div style="font-size:9px;color:#334155">' + analList + '</div>'
                + '</div>'
                + '</div>'
                + clItem('Nausea / Vomiting present', rec.nauseaPresent)
                + (rec.nauseaPresent ? '<div style="margin-left:18px">' + kv('Severity', rec.nauseaSeverity) + kv('Anti-emetics', rec.antiemeticsGiven) + '</div>' : '');

            // POD Progress Notes
            var podHtml = '';
            if (!rec.podNotes || rec.podNotes.length === 0) {
                podHtml = '<div style="font-size:9px;color:#94a3b8;text-align:center;padding:10px">No progress notes added yet</div>';
            } else {
                rec.podNotes.forEach(function(note) {
                    var woundBadges = (note.woundStatus||[]).map(function(w){
                        var wc = (w==='Clean and dry') ? '#16a34a' : (w==='Signs of infection'||w==='Dehiscence') ? '#dc2626' : '#f97316';
                        return '<span style="display:inline-block;padding:1px 5px;border-radius:8px;font-size:8px;font-weight:600;background:' + wc + '1a;color:' + wc + ';margin:1px">' + e(w) + '</span>';
                    }).join('');
                    var stCol = (note.patientStatus==='Improving') ? '#16a34a' : (note.patientStatus==='Deteriorating') ? '#dc2626' : '#3b82f6';
                    podHtml += '<div style="border:1px solid #e2e8f0;border-radius:6px;padding:8px;margin-bottom:6px">'
                        + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">'
                        + '<span style="font-size:10px;font-weight:700;background:' + color + '1a;color:' + color + ';padding:2px 7px;border-radius:10px">POD-' + (note.pod||'') + '</span>'
                        + '<span style="font-size:9px;color:#64748b">' + e(note.date||'') + '</span>'
                        + '</div>'
                        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:5px">'
                        + '<div><div style="font-size:7.5px;color:#94a3b8">Status</div><span style="font-size:9px;font-weight:600;color:' + stCol + '">' + e(note.patientStatus||'Stable') + '</span></div>'
                        + '<div><div style="font-size:7.5px;color:#94a3b8">Pain Control</div><span style="font-size:9px;font-weight:600;color:' + (note.painControl==='Adequate'?'#16a34a':'#dc2626') + '">' + e(note.painControl||'Adequate') + '</span></div>'
                        + '<div><div style="font-size:7.5px;color:#94a3b8">Wound</div>' + (woundBadges || '<span style="font-size:9px;color:#94a3b8">\u2014</span>') + '</div>'
                        + '</div>'
                        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:4px">'
                        + (note.drainOutput ? '<div><div style="font-size:7.5px;color:#94a3b8">Drain</div><span style="font-size:9px;color:#334155">' + e(note.drainOutput) + ' ml</span></div>' : '')
                        + (note.urineOutput ? '<div><div style="font-size:7.5px;color:#94a3b8">Urine</div><span style="font-size:9px;color:#334155">' + e(note.urineOutput) + ' ml</span></div>' : '')
                        + (note.ambulation ? '<div><div style="font-size:7.5px;color:#94a3b8">Ambulation</div><span style="font-size:9px;color:#334155">' + e(note.ambulation) + '</span></div>' : '')
                        + '</div>'
                        + (note.plan ? '<div style="background:#f8fafc;border-radius:4px;padding:4px 6px;font-size:9px;color:#334155">' + e(note.plan) + '</div>' : '')
                        + '</div>';
                });
            }

            // Complications
            var compsHtml = rec.compNone
                ? clItem('None', true)
                : (compList.length
                    ? compList.map(function(c){ return clItem(c, true); }).join('')
                      + (rec.compManagement ? '<div style="margin-top:5px;font-size:9px;color:#64748b;border-top:1px solid #f1f5f9;padding-top:4px">'
                        + '<strong>Management:</strong> ' + e(rec.compManagement) + '</div>' : '')
                    : clItem('None reported', false));

            // Discharge Planning
            var critPct = Math.round((criteriaMet / dischargeCriteria.length) * 100);
            var critReady = criteriaMet >= 6;
            var dischargePlanHtml = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 7px"><div style="font-size:7.5px;color:#94a3b8">Exp. Discharge</div><div style="font-size:9.5px;font-weight:600;color:#0f172a">' + e(expDischarge) + '</div></div>'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 7px"><div style="font-size:7.5px;color:#94a3b8">Follow-up Date</div><div style="font-size:9.5px;font-weight:600;color:#0f172a">' + e(rec.followUpDate ? new Date(rec.followUpDate).toLocaleDateString('en-GB') : '\u2014') + '</div></div>'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 7px"><div style="font-size:7.5px;color:#94a3b8">Follow-up Doctor</div><div style="font-size:9.5px;font-weight:600;color:#0f172a">' + e(rec.followUpDoctor || '\u2014') + '</div></div>'
                + '</div>'
                + (rec.stitchRemovalDate ? '<div style="font-size:9px;color:#64748b;margin-bottom:6px">Stitch removal: <strong>' + e(new Date(rec.stitchRemovalDate).toLocaleDateString('en-GB')) + '</strong></div>' : '')
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Discharge Criteria (' + criteriaMet + '/' + dischargeCriteria.length + ' met)</div>'
                + '<div style="background:#e2e8f0;border-radius:4px;height:5px;margin-bottom:5px"><div style="background:' + (critReady?'#16a34a':'#f97316') + ';height:5px;border-radius:4px;width:' + critPct + '%"></div></div>'
                + dischargeCriteria.map(function(c){ return clItem(c.label, rec[c.key]); }).join('');

            // ── Full HTML ──────────────────────────────────────────────────────
            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
                + '<title>Post-Op Notes \u2014 ' + e(patientName) + '</title>'
                + '<style>'
                + '* { margin:0; padding:0; box-sizing:border-box; }'
                + 'body { font-family:"SF Pro Text","Segoe UI",Arial,sans-serif; background:#fff; color:#1e293b; }'
                + '@page { size:A4; margin:10mm 10mm 8mm 10mm; }'
                + '@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }'
                + 'table { border-collapse:collapse; width:100%; }'
                + '</style></head><body>'

                + '<div style="max-width:740px;margin:0 auto;background:#fff">'
                + '<div style="height:4px;background:' + color + '"></div>'

                // Letterhead
                + '<div style="padding:20px 28px 14px">'
                + '<div style="display:flex;align-items:flex-start;gap:20px">'
                + logoHtml
                + '<div style="flex:1;min-width:0">'
                + (hospName ? '<div style="font-size:17px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;line-height:1.1">' + e(hospName) + '</div>' : '')
                + (tagline  ? '<div style="font-size:11px;color:#64748b;margin-top:4px;font-style:italic">' + e(tagline) + '</div>' : '')
                + (addrParts.length ? '<div style="font-size:10px;color:#475569;margin-top:5px">' + e(addrParts.join(', ')) + '</div>' : '')
                + (contactParts.length ? '<div style="font-size:10px;color:#475569;margin-top:4px;display:flex;gap:14px;flex-wrap:wrap;align-items:center">' + contactParts.map(function(p){ return '<span style="display:inline-flex;align-items:center;gap:2px">' + p + '</span>'; }).join('') + '</div>' : '')
                + '</div></div>'
                + '<div style="margin-top:14px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '</div>'

                // Title strip
                + '<div style="padding:9px 28px;background:' + color + ';display:flex;align-items:center;justify-content:space-between">'
                + '<span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">POST-OPERATIVE NOTES</span>'
                + '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:9px;font-weight:600;padding:2px 9px;border-radius:20px;letter-spacing:0.5px">POD-' + podDays + ' \u2014 ' + e(postopLoc) + '</span>'
                + '</div>'

                // Content
                + '<div style="padding:14px 28px">'

                // Patient grid
                + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:14px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '<table style="table-layout:fixed">'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('PATIENT NAME', patientName, true, '#fff')
                + infoCell('MRN', mrn, true, '#fff')
                + infoCell('OPERATION ID', operationId, true, '#fff')
                + infoCell('SURGERY TYPE', surgeryType, false, '#fff')
                + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('SURGEON', surgeon, true, '#f8fafc')
                + infoCell('ANAESTHETIST', anaesthetist, true, '#f8fafc')
                + infoCell('THEATER', theater, true, '#f8fafc')
                + infoCell('PROCEDURE', procedure, false, '#f8fafc')
                + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('PHONE NO.', phone, true, '#fff')
                + infoCell('CNIC', cnic, true, '#fff')
                + infoCell('AGE', age, true, '#fff')
                + infoCell('GENDER', gender, false, '#fff')
                + '</tr>'
                + '<tr>'
                + infoCell('SURGERY DATE', surgeryDate, true, '#f8fafc')
                + infoCell('POST-OP LOCATION', postopLoc, true, '#f8fafc')
                + infoCell('EXP. DISCHARGE', expDischarge, true, '#f8fafc')
                + infoCell('STATUS', op.status || '-', false, '#f8fafc')
                + '</tr>'
                + '</table>'
                + '</div>'

                // 2-column layout
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">'

                + '<div>' // left col
                + (isSec('pacu_assessment')  ? secBox('Section 1: PACU Assessment \u2014 Aldrete Score', aldreteHtml) : '')
                + (isSec('recovery_vitals')  ? secBox('Recovery Vitals (Every 15 Minutes)', recVitalsHtml)              : '')
                + (isSec('pain_nausea')      ? secBox('Pain Assessment & Nausea', painHtml)                             : '')
                + (isSec('complications')    ? secBox('Section 3: Post-Op Complications', compsHtml)                    : '')
                + '</div>'

                + '<div>' // right col
                + (isSec('pod_progress')      ? secBox('Section 2: Post-Op Day Progress Notes', podHtml)               : '')
                + (isSec('discharge_planning') ? secBox('Section 4: Discharge Planning', dischargePlanHtml)            : '')
                + '</div>'

                + '</div>' // end 2-col

                // Signature
                + '<div style="display:flex;justify-content:flex-end;margin-top:8px">'
                + '<div style="width:220px;text-align:center">'
                + (savedBy ? '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">' + e(savedBy) + '</div>' : '<div style="height:30px"></div>')
                + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Surgeon / Recovery Nurse</div>'
                + '</div>'
                + '</div>'

                + '</div>' // end content

                + '<div style="margin:0 28px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '<div style="padding:10px 28px;display:flex;justify-content:space-between;align-items:flex-start">'
                + '<div style="font-size:9px;color:#64748b;line-height:1.6">' + footerLines.map(function(l){ return '<div>' + e(l) + '</div>'; }).join('') + '</div>'
                + '<div style="font-size:9px;color:#64748b;text-align:right;line-height:1.6">' + metaParts.map(function(p){ return '<div>' + e(p) + '</div>'; }).join('') + '</div>'
                + '</div>'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '</div>'

                + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>'
                + '</body></html>';

            var w = window.open('', '_blank', 'width=900,height=750');
            if (w) { w.document.write(html); w.document.close(); }
        });
    }

    // ── OT Scheduling toolbar window functions ───────────────────────────────
    window.toggleOtSchFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('otSchFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnOtSchFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyOtSchFilters = function() {
        var stVal  = ($('#otSchStatusFilter').val() || '').toLowerCase();
        var surVal = ($('#otSchSurgeonFilter').val() || '').toLowerCase();
        var priVal = ($('#otSchPriorityFilter').val() || '').toLowerCase();
        var dfVal  = $('#otSchDateFrom').val() || '';
        var dtVal  = $('#otSchDateTo').val() || '';

        var filtered = operations.filter(function(op) {
            if (stVal  && stVal  !== 'all status'    && (!op.status   || op.status.toLowerCase()   !== stVal))  return false;
            if (surVal && surVal !== 'all surgeons'   && (!op.surgeon  || op.surgeon.toLowerCase()  !== surVal)) return false;
            if (priVal && priVal !== 'all priorities' && (!op.priority || op.priority.toLowerCase() !== priVal)) return false;
            if (dfVal && op.surgeryDate && op.surgeryDate < dfVal) return false;
            if (dtVal && op.surgeryDate && op.surgeryDate > dtVal) return false;
            return true;
        });

        otSchFiltered = filtered;
        otSchCurrentPage = 1;

        var count = 0;
        if (stVal  && stVal  !== 'all status')    count++;
        if (surVal && surVal !== 'all surgeons')   count++;
        if (priVal && priVal !== 'all priorities') count++;
        if (dfVal) count++;
        if (dtVal) count++;
        var badge = document.getElementById('otSchFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }

        renderSchedulingTab();
        toggleOtSchFilter();
    };

    window.resetOtSchFilters = function() {
        otSchFiltered = null;
        otSchCurrentPage = 1;
        ['otSchCsStatus','otSchCsSurgeon','otSchCsPriority'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['otSchDpDateFrom','otSchDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('otSchFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        renderSchedulingTab();
    };

    window.toggleOtSchRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otSchRowsMenu'); if (m) m.classList.toggle('open');
    };

    window.setOtSchRowsPer = function(n) {
        otSchPerPageVal = n;
        otSchCurrentPage = 1;
        var m = document.getElementById('otSchRowsMenu'); if (m) m.classList.remove('open');
        renderSchedulingTab();
    };

    window.toggleOtSchColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otSchColVisMenu'); if (m) m.classList.toggle('open');
    };

    window.otSchColVisSelectAll = function() {
        $('#otSchColVisList input[type=checkbox]').prop('checked', true);
    };

    window.applyOtSchColVis = function() {
        var m = document.getElementById('otSchColVisMenu'); if (m) m.classList.remove('open');
        $('#otSchColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col')); var show = $(this).is(':checked');
            $('#otSchTable thead tr th:eq(' + col + ')').toggle(show);
            $('#otSchTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleOtSchExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otSchExportMenu'); if (m) m.classList.toggle('open');
    };

    window.exportOtSch = function(type) {
        var m = document.getElementById('otSchExportMenu');
        if (m) m.classList.remove('open');
        var source = otSchFiltered !== null ? otSchFiltered : operations;
        if (type === 'csv') {
            var rows = [['MRN','Visit ID','Patient Name','Procedure','Surgeon','Theater','Priority','Status','Payment']];
            source.forEach(function(op) {
                var shortId = op.operationId ? op.operationId.replace(op.mrn + '-', '') : '';
                rows.push([op.mrn||'',shortId,op.patientName||'',op.procedure||'',op.surgeon||'',op.theater||'',op.priority||'',op.status||'',op.paymentStatus||'']);
            });
            var csv = rows.map(function(r){ return r.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(','); }).join('\n');
            var a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'ot-scheduling.csv';
            a.click();
        } else {
            window.print();
        }
    };

    // ── Custom datepicker & searchable-select init (OT) ─────────────────────
    function otCloseAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p){ p.classList.remove('open'); });
        document.querySelectorAll('.opd-dp-trigger.open').forEach(function(t){ t.classList.remove('open'); });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p){ p.classList.remove('open'); });
        document.querySelectorAll('.opd-cs-trigger.open').forEach(function(t){ t.classList.remove('open'); });
    }

    function otRepositionOpen() {
        var popup = document.querySelector('.opd-dp-popup.open, .opd-cs-popup.open');
        if (!popup) return;
        var trigger = popup._trigger;
        if (!trigger) return;
        var r = trigger.getBoundingClientRect();
        popup.style.top  = (r.bottom + 6) + 'px';
        popup.style.left = Math.max(0, Math.min(r.left, window.innerWidth - popup.offsetWidth - 8)) + 'px';
    }

    function otInitDp(wrapId) {
        var wrap = document.getElementById(wrapId);
        if (!wrap) return;
        var targetId  = wrap.getAttribute('data-target');
        var phText    = wrap.getAttribute('data-placeholder') || 'Select date';
        var curYear   = new Date().getFullYear();
        var curMonth  = new Date().getMonth();
        var selDate   = null;

        wrap.innerHTML =
            '<div class="opd-dp-trigger" id="' + wrapId + '_trigger">' +
                '<span class="opd-dp-val opd-ph" id="' + wrapId + '_val">' + phText + '</span>' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;flex-shrink:0;color:#374151"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
            '</div>' +
            '<div class="opd-dp-popup" id="' + wrapId + '_popup">' +
                '<div class="opd-dp-header">' +
                    '<button class="opd-dp-nav" id="' + wrapId + '_prev">&#8249;</button>' +
                    '<span class="opd-dp-month-year" id="' + wrapId + '_my"></span>' +
                    '<button class="opd-dp-nav" id="' + wrapId + '_next">&#8250;</button>' +
                '</div>' +
                '<div class="opd-dp-grid" id="' + wrapId + '_grid"></div>' +
            '</div>';

        var trigger = document.getElementById(wrapId + '_trigger');
        var popup   = document.getElementById(wrapId + '_popup');
        var valEl   = document.getElementById(wrapId + '_val');
        popup._trigger = trigger;

        function renderGrid() {
            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            document.getElementById(wrapId + '_my').textContent = months[curMonth] + ' ' + curYear;
            var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
            var html = days.map(function(d){ return '<div class="opd-dp-dayname">' + d + '</div>'; }).join('');
            var first = new Date(curYear, curMonth, 1).getDay();
            var daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
            for (var i = 0; i < first; i++) html += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= daysInMonth; d++) {
                var dateStr = curYear + '-' + String(curMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
                var isSel = selDate === dateStr;
                html += '<div class="opd-dp-day' + (isSel ? ' selected' : '') + '" data-date="' + dateStr + '">' + d + '</div>';
            }
            document.getElementById(wrapId + '_grid').innerHTML = html;
        }

        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = popup.classList.contains('open');
            otCloseAll();
            if (!isOpen) {
                renderGrid();
                var r = trigger.getBoundingClientRect();
                popup.style.top  = (r.bottom + 6) + 'px';
                popup.style.left = Math.max(0, Math.min(r.left, window.innerWidth - 280)) + 'px';
                popup.classList.add('open');
                trigger.classList.add('open');
            }
        });

        document.getElementById(wrapId + '_prev').addEventListener('click', function(e) {
            e.stopPropagation();
            curMonth--; if (curMonth < 0) { curMonth = 11; curYear--; } renderGrid();
        });
        document.getElementById(wrapId + '_next').addEventListener('click', function(e) {
            e.stopPropagation();
            curMonth++; if (curMonth > 11) { curMonth = 0; curYear++; } renderGrid();
        });
        document.getElementById(wrapId + '_grid').addEventListener('click', function(e) {
            var day = e.target.closest('.opd-dp-day:not(.empty)');
            if (!day) return;
            selDate = day.getAttribute('data-date');
            if (targetId) document.getElementById(targetId).value = selDate;
            valEl.textContent = selDate;
            valEl.classList.remove('opd-ph');
            otCloseAll();
        });

        wrap._reset = function() {
            selDate = null;
            if (targetId) document.getElementById(targetId).value = '';
            valEl.textContent = phText;
            valEl.classList.add('opd-ph');
        };
    }

    function otInitCs(wrapId) {
        var wrap = document.getElementById(wrapId);
        if (!wrap) return;
        var targetId = wrap.getAttribute('data-target');
        var phText   = wrap.getAttribute('data-placeholder') || 'Select';
        var options  = [];
        var selected = null;

        wrap.innerHTML =
            '<div class="opd-cs-trigger" id="' + wrapId + '_trigger">' +
                '<span class="opd-cs-val opd-ph" id="' + wrapId + '_val">' + phText + '</span>' +
                '<i style="font-size:12px;color:#374151;flex-shrink:0">&#9660;</i>' +
            '</div>' +
            '<div class="opd-cs-popup" id="' + wrapId + '_popup">' +
                '<input class="opd-cs-search" id="' + wrapId + '_search" placeholder="Search...">' +
                '<div class="opd-cs-list" id="' + wrapId + '_list"></div>' +
            '</div>';

        var trigger = document.getElementById(wrapId + '_trigger');
        var popup   = document.getElementById(wrapId + '_popup');
        var valEl   = document.getElementById(wrapId + '_val');
        var searchEl= document.getElementById(wrapId + '_search');
        var listEl  = document.getElementById(wrapId + '_list');
        popup._trigger = trigger;

        function renderList(filter) {
            var q = (filter || '').toLowerCase();
            var html = '';
            options.forEach(function(opt) {
                if (q && opt.toLowerCase().indexOf(q) < 0) return;
                html += '<div class="opd-cs-option' + (opt === selected ? ' selected' : '') + '" data-val="' + opt + '">' + opt + '</div>';
            });
            listEl.innerHTML = html || '<div class="opd-cs-empty">No results</div>';
        }

        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = popup.classList.contains('open');
            otCloseAll();
            if (!isOpen) {
                renderList('');
                searchEl.value = '';
                var r = trigger.getBoundingClientRect();
                popup.style.width  = Math.max(trigger.offsetWidth, 180) + 'px';
                popup.style.top    = (r.bottom + 6) + 'px';
                popup.style.left   = Math.max(0, Math.min(r.left, window.innerWidth - parseInt(popup.style.width) - 8)) + 'px';
                popup.classList.add('open');
                trigger.classList.add('open');
                setTimeout(function(){ searchEl.focus(); }, 50);
            }
        });

        searchEl.addEventListener('input', function(e) { e.stopPropagation(); renderList(this.value); });
        searchEl.addEventListener('click', function(e) { e.stopPropagation(); });

        listEl.addEventListener('click', function(e) {
            var opt = e.target.closest('.opd-cs-option');
            if (!opt) return;
            selected = opt.getAttribute('data-val');
            if (targetId) document.getElementById(targetId).value = selected;
            valEl.textContent = selected;
            valEl.classList.remove('opd-ph');
            otCloseAll();
        });

        wrap.setOptions = function(opts) {
            options = opts;
        };

        wrap._reset = function() {
            selected = null;
            if (targetId) document.getElementById(targetId).value = '';
            valEl.textContent = phText;
            valEl.classList.add('opd-ph');
        };
    }

    // ── Outside-click: close all OT menus ───────────────────────────────────
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#otSchRowsMenu, #otSchRowsBtn').length)   $('#otSchRowsMenu').removeClass('open');
        if (!$(e.target).closest('#otSchColVisMenu, .opd-col-vis-wrap').length) $('#otSchColVisMenu').removeClass('open');
        if (!$(e.target).closest('#otSchExportMenu, .opd-export-wrap').length)  $('#otSchExportMenu').removeClass('open');
        if (!$(e.target).closest('.opd-dp-trigger,.opd-dp-popup,.opd-cs-trigger,.opd-cs-popup').length) otCloseAll();
    });

    window.addEventListener('scroll', otRepositionOpen, true);
    window.addEventListener('resize', otRepositionOpen);

    // ── OT Pre-Op toolbar window functions ───────────────────────────────────
    window.toggleOtPreFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('otPreFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnOtPreFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyOtPreFilters = function() {
        var stVal  = ($('#otPreStatusFilter').val()  || '').toLowerCase();
        var thVal  = ($('#otPreTheaterFilter').val() || '').toLowerCase();
        var dfVal  = $('#otPreDateFrom').val() || '';
        var dtVal  = $('#otPreDateTo').val()   || '';

        var filtered = otPreGetBaseOps().filter(function(op) {
            var clStatus = (op.checklistStatus || 'Not Started').toLowerCase();
            if (stVal && stVal !== 'all status'  && clStatus !== stVal)  return false;
            if (thVal && thVal !== 'all ots'     && (!op.theater || op.theater.toLowerCase() !== thVal)) return false;
            if (dfVal && op.surgeryDate && op.surgeryDate < dfVal) return false;
            if (dtVal && op.surgeryDate && op.surgeryDate > dtVal) return false;
            return true;
        });

        otPreFiltered = filtered;
        otPreCurrentPage = 1;

        var count = 0;
        if (stVal && stVal !== 'all status') count++;
        if (thVal && thVal !== 'all ots')    count++;
        if (dfVal) count++;
        if (dtVal) count++;
        var badge = document.getElementById('otPreFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }

        renderChecklistTab();
        toggleOtPreFilter();
    };

    window.resetOtPreFilters = function() {
        otPreFiltered = null; otPreCurrentPage = 1;
        ['otPreCsStatus','otPreCsTheater'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['otPreDpDateFrom','otPreDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('otPreFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        renderChecklistTab();
    };

    window.toggleOtPreRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otPreRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setOtPreRowsPer = function(n) {
        otPrePerPageVal = n; otPreCurrentPage = 1;
        var m = document.getElementById('otPreRowsMenu'); if (m) m.classList.remove('open');
        renderChecklistTab();
    };

    window.toggleOtPreColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otPreColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.otPreColVisSelectAll = function() {
        $('#otPreColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyOtPreColVis = function() {
        var m = document.getElementById('otPreColVisMenu'); if (m) m.classList.remove('open');
        $('#otPreColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col')); var show = $(this).is(':checked');
            $('#otPreTable thead tr th:eq(' + col + ')').toggle(show);
            $('#otPreTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleOtPreExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otPreExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportOtPre = function(type) {
        var m = document.getElementById('otPreExportMenu'); if (m) m.classList.remove('open');
        var source = otPreFiltered !== null ? otPreFiltered : otPreGetBaseOps();
        if (type === 'csv') {
            var hdrs = ['Surgery ID','Patient Name','Procedure','Scheduled Time','OT Number','Pre-Op Status','Consent'];
            var rows = source.map(function(op) {
                var cl = checklistState[op.operationId] || defaultChecklist();
                var clStatus = op.checklistStatus || 'Not Started';
                var consent = cl.surgeryConsentSigned && cl.anesthesiaConsentSigned ? 'Signed' : cl.surgeryConsentSigned ? 'Partial' : 'Pending';
                var timeDisplay = op.startTime ? op.startTime : (op.surgeryDate ? new Date(op.surgeryDate).toLocaleDateString() : '-');
                return [op.operationId||'', op.patientName||'', op.procedure||'', timeDisplay, op.theater||'', clStatus, consent];
            });
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){ lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(',')); });
            var blob = new Blob([lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'ot-preop-checklist.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // Extend outside-click handler with Pre-Op menus
    $(document).on('click.otpre', function(e) {
        if (!$(e.target).closest('#otPreRowsMenu, #otPreRowsBtn').length)     $('#otPreRowsMenu').removeClass('open');
        if (!$(e.target).closest('#otPreColVisMenu, .opd-col-vis-wrap').length) $('#otPreColVisMenu').removeClass('open');
        if (!$(e.target).closest('#otPreExportMenu, .opd-export-wrap').length)  $('#otPreExportMenu').removeClass('open');
    });

    // ── Init custom components ───────────────────────────────────────────────
    ['otSchDpDateFrom','otSchDpDateTo'].forEach(otInitDp);
    ['otSchCsStatus','otSchCsSurgeon','otSchCsPriority'].forEach(otInitCs);

    var schStWrap = document.getElementById('otSchCsStatus');
    if (schStWrap && schStWrap.setOptions) {
        schStWrap.setOptions(['All Status','Scheduled','In Progress','Completed','Cancelled']);
    }
    var schPriWrap = document.getElementById('otSchCsPriority');
    if (schPriWrap && schPriWrap.setOptions) {
        schPriWrap.setOptions(['All Priorities','Elective','Urgent','Emergency']);
    }

    // ── Init Pre-Op custom components ────────────────────────────────────────
    ['otPreDpDateFrom','otPreDpDateTo'].forEach(otInitDp);
    ['otPreCsStatus','otPreCsTheater'].forEach(otInitCs);

    var preStWrap = document.getElementById('otPreCsStatus');
    if (preStWrap && preStWrap.setOptions) {
        preStWrap.setOptions(['All Status','Complete','In Progress','Not Started']);
    }

    // ── OT Intra-Op toolbar window functions ─────────────────────────────────
    window.toggleOtIoFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('otIoFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnOtIoFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyOtIoFilters = function() {
        var stVal  = ($('#otIoStatusFilter').val()  || '').toLowerCase();
        var surVal = ($('#otIoSurgeonFilter').val()  || '').toLowerCase();
        var thVal  = ($('#otIoTheaterFilter').val() || '').toLowerCase();
        var dfVal  = $('#otIoDateFrom').val() || '';
        var dtVal  = $('#otIoDateTo').val()   || '';

        var filtered = otIoGetBaseOps().filter(function(op) {
            if (stVal  && stVal  !== 'all status'   && (!op.status  || op.status.toLowerCase()  !== stVal))  return false;
            if (surVal && surVal !== 'all surgeons'  && (!op.surgeon || op.surgeon.toLowerCase() !== surVal)) return false;
            if (thVal  && thVal  !== 'all ots'       && (!op.theater || op.theater.toLowerCase() !== thVal))  return false;
            if (dfVal && op.surgeryDate && op.surgeryDate < dfVal) return false;
            if (dtVal && op.surgeryDate && op.surgeryDate > dtVal) return false;
            return true;
        });

        otIoFiltered = filtered;
        otIoCurrentPage = 1;

        var count = 0;
        if (stVal  && stVal  !== 'all status')  count++;
        if (surVal && surVal !== 'all surgeons') count++;
        if (thVal  && thVal  !== 'all ots')     count++;
        if (dfVal) count++;
        if (dtVal) count++;
        var badge = document.getElementById('otIoFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }

        renderIntraOpTab();
        toggleOtIoFilter();
    };

    window.resetOtIoFilters = function() {
        otIoFiltered = null; otIoCurrentPage = 1;
        ['otIoCsStatus','otIoCsSurgeon','otIoCsTheater'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['otIoDpDateFrom','otIoDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('otIoFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        renderIntraOpTab();
    };

    window.toggleOtIoRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otIoRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setOtIoRowsPer = function(n) {
        otIoPerPageVal = n; otIoCurrentPage = 1;
        var m = document.getElementById('otIoRowsMenu'); if (m) m.classList.remove('open');
        renderIntraOpTab();
    };

    window.toggleOtIoColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otIoColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.otIoColVisSelectAll = function() {
        $('#otIoColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyOtIoColVis = function() {
        var m = document.getElementById('otIoColVisMenu'); if (m) m.classList.remove('open');
        $('#otIoColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col')); var show = $(this).is(':checked');
            $('#otIoTable thead tr th:eq(' + col + ')').toggle(show);
            $('#otIoTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleOtIoExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otIoExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportOtIo = function(type) {
        var m = document.getElementById('otIoExportMenu'); if (m) m.classList.remove('open');
        var source = otIoFiltered !== null ? otIoFiltered : otIoGetBaseOps();
        if (type === 'csv') {
            var hdrs = ['Surgery ID','Patient Name','Procedure','OT Number','Started Time','Current Phase','Surgeon','Status'];
            var rows = source.map(function(op) {
                var rec = intraOpState[op.operationId] || {};
                var startTime = op.anesthesiaStartTime || rec.anesthesiaStartTime || null;
                var startedDisplay = startTime ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (op.startTime || '-');
                var phase = op.currentPhase || rec.currentPhase || 'Pre-Induction';
                return [op.operationId||'', op.patientName||'', op.procedure||'', op.theater||'', startedDisplay, phase, op.surgeon||'', op.status||''];
            });
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){ lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(',')); });
            var blob = new Blob([lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'ot-intraop.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // Extend outside-click handler with Intra-Op menus
    $(document).on('click.otio', function(e) {
        if (!$(e.target).closest('#otIoRowsMenu, #otIoRowsBtn').length)      $('#otIoRowsMenu').removeClass('open');
        if (!$(e.target).closest('#otIoColVisMenu, .opd-col-vis-wrap').length) $('#otIoColVisMenu').removeClass('open');
        if (!$(e.target).closest('#otIoExportMenu, .opd-export-wrap').length)  $('#otIoExportMenu').removeClass('open');
    });

    // ── Init Intra-Op custom components ──────────────────────────────────────
    ['otIoDpDateFrom','otIoDpDateTo'].forEach(otInitDp);
    ['otIoCsStatus','otIoCsSurgeon','otIoCsTheater'].forEach(otInitCs);

    var ioStWrap = document.getElementById('otIoCsStatus');
    if (ioStWrap && ioStWrap.setOptions) {
        ioStWrap.setOptions(['All Status','In Progress','Scheduled','Completed']);
    }

    // ── OT Post-Op toolbar window functions ──────────────────────────────────
    window.toggleOtPoFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('otPoFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnOtPoFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyOtPoFilters = function() {
        var stVal   = ($('#otPoStatusFilter').val()   || '').toLowerCase();
        var locVal  = ($('#otPoLocationFilter').val() || '').toLowerCase();
        var compVal = ($('#otPoCompFilter').val()     || '').toLowerCase();
        var dfVal   = $('#otPoDateFrom').val() || '';
        var dtVal   = $('#otPoDateTo').val()   || '';

        var filtered = otPoGetBaseOps().filter(function(op) {
            if (stVal  && stVal  !== 'all status'    && (!op.status || op.status.toLowerCase() !== stVal)) return false;
            var loc = (op.postopLocation || (postOpState[op.operationId] && postOpState[op.operationId].postopLocation) || '').toLowerCase();
            if (locVal && locVal !== 'all locations' && loc.indexOf(locVal) < 0) return false;
            if (compVal && compVal !== 'all') {
                var rec2 = postOpState[op.operationId] || defaultPostOpNotes();
                var hasComp = !rec2.compNone && (rec2.compBleeding || rec2.compInfection || rec2.compWoundDehiscence || rec2.compDVTPE || rec2.compPneumonia || rec2.compUrinaryRetention || rec2.compIleus || rec2.compAKI || rec2.compOther);
                if (compVal === 'yes' && !hasComp) return false;
                if (compVal === 'none' && hasComp) return false;
            }
            if (dfVal && op.surgeryDate && op.surgeryDate < dfVal) return false;
            if (dtVal && op.surgeryDate && op.surgeryDate > dtVal) return false;
            return true;
        });

        otPoFiltered = filtered;
        otPoCurrentPage = 1;

        var count = 0;
        if (stVal   && stVal   !== 'all status')    count++;
        if (locVal  && locVal  !== 'all locations') count++;
        if (compVal && compVal !== 'all')           count++;
        if (dfVal) count++;
        if (dtVal) count++;
        var badge = document.getElementById('otPoFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }

        renderPostOpTab();
        toggleOtPoFilter();
    };

    window.resetOtPoFilters = function() {
        otPoFiltered = null; otPoCurrentPage = 1;
        ['otPoCsStatus','otPoCsLocation','otPoCsComp'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['otPoDpDateFrom','otPoDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('otPoFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        renderPostOpTab();
    };

    window.toggleOtPoRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otPoRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setOtPoRowsPer = function(n) {
        otPoPerPageVal = n; otPoCurrentPage = 1;
        var m = document.getElementById('otPoRowsMenu'); if (m) m.classList.remove('open');
        renderPostOpTab();
    };

    window.toggleOtPoColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otPoColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.otPoColVisSelectAll = function() {
        $('#otPoColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyOtPoColVis = function() {
        var m = document.getElementById('otPoColVisMenu'); if (m) m.classList.remove('open');
        $('#otPoColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col')); var show = $(this).is(':checked');
            $('#otPoTable thead tr th:eq(' + col + ')').toggle(show);
            $('#otPoTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleOtPoExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('otPoExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportOtPo = function(type) {
        var m = document.getElementById('otPoExportMenu'); if (m) m.classList.remove('open');
        var source = otPoFiltered !== null ? otPoFiltered : otPoGetBaseOps();
        if (type === 'csv') {
            var hdrs = ['Surgery ID','Patient Name','Procedure','Completed Time','Current Location','Post-Op Status','Complications'];
            var rows = source.map(function(op) {
                var rec2 = postOpState[op.operationId] || defaultPostOpNotes();
                var loc  = op.postopLocation || (rec2 && rec2.postopLocation) || 'Recovery Room / PACU';
                var hasComp = !rec2.compNone && (rec2.compBleeding || rec2.compInfection || rec2.compWoundDehiscence || rec2.compDVTPE || rec2.compPneumonia || rec2.compUrinaryRetention || rec2.compIleus || rec2.compAKI || rec2.compOther);
                var aldreteTotal = (parseInt(rec2.aldreteActivity)||0)+(parseInt(rec2.aldreteRespiration)||0)+(parseInt(rec2.aldreteCirculation)||0)+(parseInt(rec2.aldreteConsciousness)||0)+(parseInt(rec2.aldreteOxygen)||0);
                var postStatus = op.status === 'Discharged' ? 'Discharged' : (aldreteTotal >= 9 ? 'PACU Ready' : 'In Recovery');
                return [op.operationId||'', op.patientName||'', op.procedure||'', op.patientOutTime||'-', loc, postStatus, hasComp ? 'Yes' : 'None'];
            });
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){ lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(',')); });
            var blob = new Blob([lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'ot-postop.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // Extend outside-click handler with Post-Op menus
    $(document).on('click.otpo', function(e) {
        if (!$(e.target).closest('#otPoRowsMenu, #otPoRowsBtn').length)      $('#otPoRowsMenu').removeClass('open');
        if (!$(e.target).closest('#otPoColVisMenu, .opd-col-vis-wrap').length) $('#otPoColVisMenu').removeClass('open');
        if (!$(e.target).closest('#otPoExportMenu, .opd-export-wrap').length)  $('#otPoExportMenu').removeClass('open');
    });

    // ── Init Post-Op custom components ───────────────────────────────────────
    ['otPoDpDateFrom','otPoDpDateTo'].forEach(otInitDp);
    ['otPoCsStatus','otPoCsLocation','otPoCsComp'].forEach(otInitCs);

    var poStWrap = document.getElementById('otPoCsStatus');
    if (poStWrap && poStWrap.setOptions) {
        poStWrap.setOptions(['All Status','Completed','Discharged']);
    }
    var poCompWrap = document.getElementById('otPoCsComp');
    if (poCompWrap && poCompWrap.setOptions) {
        poCompWrap.setOptions(['All','Yes','None']);
    }

    // ── OT Registration Slip printing ────────────────────────────────────────

    function printOtRegistrationSlip(op, patient) {
        if (!op) return;
        var lhReq  = $.get('/api/hospital-info/settings/letterhead');
        var ftReq  = $.get('/api/hospital-info/settings/footer');
        var prReq  = $.get('/api/hospital-info/settings/basic');
        var fmtReq = $.get('/api/hospital-info/settings/doc_format_scheduling_reg');
        $.when(lhReq, ftReq, prReq, fmtReq).done(function(lhRes, ftRes, prRes, fmtRes) {
            var lh  = (lhRes[0]  && lhRes[0].settings)  || {};
            var ft  = (ftRes[0]  && ftRes[0].settings)  || {};
            var pr  = (prRes[0]  && prRes[0].settings)  || {};
            var fmt = (fmtRes[0] && fmtRes[0].settings && fmtRes[0].settings.doc_format_scheduling_reg) || 'a4';

            if (fmt === 'thermal') { _printOtThermal(op, patient, pr); return; }

            // ── A4 path ──────────────────────────────────────────────────────
            var pat      = patient || {};
            var fullName = pat.firstName ? (pat.firstName + ' ' + (pat.lastName || '')).trim() : (op.patientName || '—');
            var mrn      = op.mrn || '—';
            var phone    = pat.contactPhone || pat.phone || op.phone || '—';
            var cnic     = pat.cnic || op.cnic || '—';
            var age      = pat.age || op.age || '—';
            var gender   = pat.gender || op.gender || '—';
            var currency = pr.currency || (hospitalInfo && hospitalInfo.currency) || 'PKR';

            var surgeonFee = parseFloat(op.surgeonFee || 0);
            var anaFee     = parseFloat(op.anaesthetistFee || 0);
            var netTotal   = surgeonFee + anaFee;

            var surgDate    = op.surgeryDate ? new Date(op.surgeryDate) : null;
            var surgDateStr = surgDate
                ? surgDate.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
                  + (op.startTime ? ', ' + op.startTime : '')
                : '—';

            var now     = new Date();
            var nowDate = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
            var nowTime = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });

            var color  = lh.lh_accent_color || '#003366';
            var font   = lh.lh_font         || 'Inter';
            var logoUrl = lh.lh_logo || '';
            var addrParts = [pr.address_street, pr.address_city, pr.address_state].filter(Boolean);
            var addrStr   = addrParts.join(', ');

            function fmt2(n) { return currency + ' ' + parseFloat(n || 0).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 }); }
            function infoCell(label, value, rightBorder, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg || '#fff') + ';' + (rightBorder ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + esc(value || '—') + '</div>'
                     + '</div>';
            }

            var rows = [
                [['PATIENT NAME', fullName, true], ['MRN', mrn, true], ['OPERATION ID', op.operationId || '—', true], ['BILL ID', op.billId || '—', false]],
                [['SURGEON', op.surgeon || '—', true], ['ANAESTHETIST', op.anaesthetist || '—', true], ['THEATER', op.theater || '—', true], ['SURGERY TYPE', op.surgeryType || '—', false]],
                [['PHONE NO.', phone, true], ['CNIC', cnic, true], ['AGE', age + ' Years', true], ['GENDER', gender, false]],
                [['SURGERY DATE', surgDateStr, true], ['EST. DURATION', (op.estimatedDuration || '—') + ' hrs', true], ['ANESTHESIA', op.anesthesiaType || '—', true], ['PRIORITY', op.priority || '—', false]],
            ];

            var gridHtml = '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            gridHtml += '<div style="height:3px;background:' + color + '"></div>';
            rows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                gridHtml += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < rows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { gridHtml += infoCell(cell[0], cell[1], cell[2], rowBg); });
                gridHtml += '</div>';
            });
            gridHtml += '</div>';

            var charges = [];
            if (surgeonFee > 0) charges.push({ desc: 'Surgeon Fee' + (op.surgeon ? ' — ' + op.surgeon : ''), qty: 1, rate: surgeonFee, disc: 0, net: surgeonFee });
            if (anaFee > 0)     charges.push({ desc: 'Anaesthetist Fee' + (op.anaesthetist ? ' — ' + op.anaesthetist : ''), qty: 1, rate: anaFee, disc: 0, net: anaFee });

            var chargesHtml = '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            chargesHtml += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + color + ';padding:9px 14px">';
            ['S.NO', 'DESCRIPTION', 'QTY', 'RATE', 'DISC.', 'NET'].forEach(function(h, i) {
                chargesHtml += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;' + (i > 1 ? 'text-align:right' : '') + '">' + h + '</div>';
            });
            chargesHtml += '</div>';
            if (charges.length === 0) {
                chargesHtml += '<div style="padding:12px 14px;font-size:10px;color:#94a3b8;text-align:center">No charges recorded</div>';
            } else {
                charges.forEach(function(c, i) {
                    var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                    chargesHtml += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                        + '<div style="font-size:10px;color:#64748b">' + (i + 1) + '</div>'
                        + '<div style="font-size:10px;color:#334155;font-weight:500">' + esc(c.desc) + '</div>'
                        + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.qty + '</div>'
                        + '<div style="font-size:10px;color:#64748b;text-align:right">' + fmt2(c.rate) + '</div>'
                        + '<div style="font-size:10px;color:#64748b;text-align:right">' + (c.disc > 0 ? fmt2(c.disc) : '—') + '</div>'
                        + '<div style="font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + fmt2(c.net) + '</div>'
                        + '</div>';
                });
            }
            chargesHtml += '</div>';

            var totalBarHtml = '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</div>'
                + '<div style="font-size:16px;font-weight:800;color:#fff">' + fmt2(netTotal) + '</div>'
                + '</div>';

            var sigHtml = '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                + '<div style="width:220px;text-align:center">'
                + '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">Registered By</div>'
                + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                + '</div></div>';

            // ── Letterhead header ──
            var logoHtml = logoUrl
                ? '<img src="' + logoUrl + '" style="height:56px;width:auto;object-fit:contain;border-radius:4px">'
                : '<div style="width:56px;height:56px;background:' + color + ';border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff">'
                  + (pr.basic_name ? pr.basic_name.charAt(0).toUpperCase() : 'H') + '</div>';

            var lhHtml = '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">'
                + '<div style="display:flex;align-items:center;gap:16px">' + logoHtml
                + '<div><div style="font-size:22px;font-weight:800;color:' + color + ';font-family:' + font + ',sans-serif">' + esc(pr.basic_name || 'Hospital Name') + '</div>'
                + (pr.contact_phone ? '<div style="font-size:11px;color:#64748b;margin-top:2px">Tel: ' + esc(pr.contact_phone) + '</div>' : '')
                + (pr.contact_website ? '<div style="font-size:11px;color:#64748b">' + esc(pr.contact_website) + '</div>' : '')
                + (addrStr ? '<div style="font-size:10px;color:#94a3b8;margin-top:2px">' + esc(addrStr) + '</div>' : '')
                + '</div></div>'
                + '<div style="text-align:right"><div style="font-size:10px;color:#64748b">' + nowDate + '</div><div style="font-size:10px;color:#64748b">' + nowTime + '</div></div>'
                + '</div>';

            var footerLines = '';
            if (ft.footer_line1) footerLines += '<div>' + esc(ft.footer_line1) + '</div>';
            if (ft.footer_line2) footerLines += '<div>' + esc(ft.footer_line2) + '</div>';

            var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
                + '<style>@page{size:A4;margin:15mm 18mm}body{margin:0;font-family:' + font + ',sans-serif;font-size:12px;color:#1e293b}'
                + 'table{border-collapse:collapse}*{box-sizing:border-box}'
                + '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'
                + '<div style="max-width:780px;margin:0 auto;padding:20px 0">'
                + lhHtml
                + '<div style="height:2px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));margin-bottom:6px"></div>'
                + '<div style="background:' + color + ';color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:8px 16px;margin-bottom:20px;border-radius:0 0 6px 6px;font-family:' + font + ',sans-serif">OT REGISTRATION SLIP</div>'
                + gridHtml + chargesHtml + totalBarHtml + sigHtml
                + (footerLines ? '<div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:10px;text-align:center;font-size:9px;color:#94a3b8">' + footerLines + '</div>' : '')
                + '</div></body></html>';

            var w = window.open('', '_blank', 'width=900,height=700');
            if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
        });
    }

    function _printOtThermal(op, patient, pr) {
        var pat      = patient || {};
        var fullName = pat.firstName ? (pat.firstName + ' ' + (pat.lastName || '')).trim() : (op.patientName || '—');
        var currency = pr.currency || (hospitalInfo && hospitalInfo.currency) || 'PKR';
        var phone    = pat.contactPhone || pat.phone || op.phone || '—';
        var cnic     = pat.cnic || op.cnic || '—';
        var age      = pat.age || op.age || '—';
        var gender   = pat.gender || op.gender || '—';

        var surgeonFee = parseFloat(op.surgeonFee || 0);
        var anaFee     = parseFloat(op.anaesthetistFee || 0);
        var netTotal   = surgeonFee + anaFee;

        var surgDate    = op.surgeryDate ? new Date(op.surgeryDate) : null;
        var surgDateStr = surgDate
            ? surgDate.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
              + (op.startTime ? ' ' + op.startTime : '')
            : '—';

        var addrParts = [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean);
        var addrStr   = addrParts.join(', ');
        var now       = new Date();
        var dateStr   = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
        var timeStr   = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
        var createdBy = op.createdByName || op.createdBy || 'Staff';

        function fmt2(n) { return currency + ' ' + parseFloat(n || 0).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 }); }

        var rows = [
            ['Patient',    fullName],
            ['MRN',        op.mrn || '—'],
            ['Op. ID',     op.operationId || '—'],
            ['Bill ID',    op.billId || '—'],
            ['Surgeon',    op.surgeon || '—'],
            ['Anaesthet.', op.anaesthetist || '—'],
            ['Theater',    op.theater || '—'],
            ['Surg. Type', op.surgeryType || '—'],
            ['Anesthesia', op.anesthesiaType || '—'],
            ['Phone',      phone],
            ['CNIC',       cnic],
            ['Age/Gender', age + ' / ' + gender],
            ['Surg. Date', surgDateStr],
            ['Est. Dur.',  (op.estimatedDuration || '—') + ' hrs'],
            ['Priority',   op.priority || '—'],
        ];

        var charges = [];
        if (surgeonFee > 0) charges.push({ desc: 'Surgeon Fee', qty: 1, disc: 0, net: surgeonFee });
        if (anaFee > 0)     charges.push({ desc: 'Anaesthet. Fee', qty: 1, disc: 0, net: anaFee });

        var rowsHtml = rows.map(function(r) {
            return '<tr>'
                + '<td style="padding:2px 3px;font-size:10px;color:#64748b;white-space:nowrap">' + r[0] + '</td>'
                + '<td style="padding:2px 3px;font-size:10px;font-weight:600;text-align:right">' + esc(r[1]) + '</td>'
                + '</tr>';
        }).join('');

        var chargesHtml = charges.map(function(c) {
            return '<tr>'
                + '<td style="padding:2px 3px;font-size:10px">' + esc(c.desc) + '</td>'
                + '<td style="padding:2px 3px;font-size:10px;text-align:center">' + c.qty + '</td>'
                + '<td style="padding:2px 3px;font-size:10px;text-align:right">0</td>'
                + '<td style="padding:2px 3px;font-size:10px;text-align:right;white-space:nowrap">' + fmt2(c.net) + '</td>'
                + '<td style="padding:2px 3px;font-size:10px;text-align:right;white-space:nowrap">' + fmt2(c.net) + '</td>'
                + '</tr>';
        }).join('');

        var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
            + '<style>@page{size:80mm auto;margin:4mm}body{margin:0;font-family:monospace;font-size:11px;width:80mm}'
            + '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'
            + '<div style="text-align:center;border-bottom:1px dashed #94a3b8;padding-bottom:6px;margin-bottom:6px">'
            + '<div style="font-size:13px;font-weight:700">' + esc(pr.basic_name || 'Hospital Name') + '</div>'
            + (pr.contact_phone   ? '<div style="font-size:9px;color:#64748b">Tel: ' + esc(pr.contact_phone) + '</div>' : '')
            + (pr.contact_website ? '<div style="font-size:9px;color:#64748b">' + esc(pr.contact_website) + '</div>' : '')
            + '<div style="font-size:10px;font-weight:700;margin-top:5px;letter-spacing:1px">OT REGISTRATION SLIP</div>'
            + '<div style="font-size:9px;color:#64748b">' + dateStr + ' | ' + timeStr + '</div>'
            + '</div>'
            + '<table style="width:100%;border-collapse:collapse;margin-bottom:6px">' + rowsHtml + '</table>'
            + '<div style="border-top:1px dashed #94a3b8;padding-top:5px;margin-top:2px">'
            + '<table style="width:100%;border-collapse:collapse">'
            + '<tr>'
            + '<th style="font-size:9px;font-weight:700;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:left">Description</th>'
            + '<th style="font-size:9px;font-weight:700;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:center">Qty</th>'
            + '<th style="font-size:9px;font-weight:700;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Disc</th>'
            + '<th style="font-size:9px;font-weight:700;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Net</th>'
            + '<th style="font-size:9px;font-weight:700;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Total</th>'
            + '</tr>'
            + (chargesHtml || '<tr><td colspan="5" style="padding:4px 3px;font-size:9px;color:#94a3b8;text-align:center">No charges</td></tr>')
            + '</table></div>'
            + '<div style="border-top:1px dashed #94a3b8;margin-top:5px;padding-top:5px;display:flex;justify-content:space-between;font-weight:700;font-size:12px">'
            + '<span>TOTAL</span><span>' + fmt2(netTotal) + '</span></div>'
            + '<div style="border-top:1px dashed #94a3b8;margin-top:8px;padding-top:6px;text-align:center">'
            + (addrStr ? '<div style="font-size:8px;color:#64748b;margin-bottom:3px">' + esc(addrStr) + '</div>' : '')
            + '<div style="height:22px;border-bottom:1px solid #334155;margin:6px auto 3px;width:110px"></div>'
            + '<div style="font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Receptionist / Cashier</div>'
            + '<div style="font-size:8px;color:#94a3b8;margin-top:2px">Created by: ' + esc(createdBy) + '</div>'
            + '</div>'
            + '</body></html>';

        var w = window.open('', '_blank', 'width=400,height=600');
        if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
    }

    loadAllData();
});
