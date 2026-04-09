$(document).ready(function() {
    function getMockDoctors() {
        return [
            { id: 1, firstName: 'Ahmed', lastName: 'Khan', department: 'General Medicine', specialization: 'General Physician', status: 'ACTIVE' },
            { id: 2, firstName: 'Fatima', lastName: 'Noor', department: 'Cardiology', specialization: 'Cardiologist', status: 'ACTIVE' },
            { id: 3, firstName: 'Hassan', lastName: 'Ali', department: 'Orthopedics', specialization: 'Orthopedic Surgeon', status: 'ACTIVE' },
            { id: 4, firstName: 'Ayesha', lastName: 'Siddiqui', department: 'Pediatrics', specialization: 'Pediatrician', status: 'ACTIVE' },
            { id: 5, firstName: 'Usman', lastName: 'Malik', department: 'Dermatology', specialization: 'Dermatologist', status: 'ACTIVE' },
            { id: 6, firstName: 'Sana', lastName: 'Rehman', department: 'Gynecology', specialization: 'Gynecologist', status: 'ACTIVE' },
            { id: 7, firstName: 'Bilal', lastName: 'Mirza', department: 'ENT', specialization: 'ENT Specialist', status: 'ACTIVE' },
            { id: 8, firstName: 'Zainab', lastName: 'Shah', department: 'Ophthalmology', specialization: 'Ophthalmologist', status: 'ACTIVE' },
            { id: 9, firstName: 'Tariq', lastName: 'Mehmood', department: 'Neurology', specialization: 'Neurologist', status: 'ACTIVE' },
            { id: 10, firstName: 'Rabia', lastName: 'Iqbal', department: 'Psychiatry', specialization: 'Psychiatrist', status: 'ACTIVE' }
        ];
    }

    var admissions = [];
    var patients = [];
    var doctors = [];
    var masterCharges = [];
    var hospitalInfo = { currency: 'PKR' };
    var floors = [];
    var wards = [];
    var availableBeds = [];
    var ipdDepartments = [];
    var ipdAdmissionTypes = [];
    var opdVisits = [];
    var erVisits = [];
    var activeTab = 'registration';

    /* IPD Registration pagination / filter state */
    var ipdRegCurrentPage = 1;
    var ipdRegPerPageVal  = 10;
    var ipdRegFiltered    = null; /* null = show all */

    /* IPD Billing pagination / filter state */
    var ipdBillCurrentPage = 1;
    var ipdBillPerPageVal  = 10;
    var ipdBillFiltered    = null;

    /* IPD Clinical Orders pagination / filter state */
    var ipdOrdCurrentPage = 1;
    var ipdOrdPerPageVal  = 10;
    var ipdOrdFiltered    = null;

    /* IPD Investigations pagination / filter state */
    var ipdInvCurrentPage = 1;
    var ipdInvPerPageVal  = 10;
    var ipdInvFiltered    = null;

    /* IPD Nursing Station pagination / filter state */
    var ipdNurCurrentPage = 1;
    var ipdNurPerPageVal  = 10;
    var ipdNurFiltered    = null;

    /* Nursing tiles pagination / filter state */
    var nurTilesCurrentPage = 1;
    var nurTilesPerPageVal  = 12;
    var nurTilesFiltered    = null;

    /* IPD Discharge pagination / filter state */
    var ipdDischCurrentPage = 1;
    var ipdDischPerPageVal  = 10;
    var ipdDischFiltered    = null;

    var registrationStep = 'source-select';
    var admissionSource = null;
    var selectedPatientMRN = null;
    var resolvedPatient = null;
    var phoneSearch = '';
    var phoneSearchResults = null;
    var patientForm = { name: '', age: '', gender: 'Male', cnic: '', contactType: 'SELF', guardianName: '', guardianCnic: '', relationshipToPatient: '' };
    var admissionForm = { doctorName: '', department: '', doctorFee: '0', doctorFeeDiscount: 0, admissionType: 'Routine', initialDiagnosis: '', estimatedStay: '', ward: '', floorRoom: '', bed: '', bedId: '' };
    var selectedOptionalCharges = [];
    var chargesGrid = [];
    var validationErrors = [];

    var bills = [];
    var billingChargeFilter = 'All';
    var billingAddlChargeFilter = 'All';
    var _ipdDetailPatient = null; /* tracks last-fetched patient for print */
    var ipdVisitTypes = ['Admission', 'Follow-up Visit', 'Emergency Admission', 'Scheduled Surgery', 'Transfer', 'Re-admission', 'Day Case', 'Observation', 'Consultation'];
    var ordersPatients = [];
    var activeOrders = [];
    var marPatients = [];
    var marMedications = [];
    var selectedMarPatient = 0;
    var masterInvestigations = [];
    var groupedInvestigations = [];
    var cbcResults = [];
    var invActiveTab = 'all';
    var wardPatients = [];
    var nursingTasks = [];
    var nursingNotes = [];
    var dischargePatients = [];
    var dischargeMeds = [];
    var investigationsPerformed = [];
    var checklistItems = [];

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
        if (status === 'Active') return '<span class="badge badge-success">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Discharged') return '<span class="badge badge-info">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Paid') return '<span class="badge badge-success">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Pending') return '<span class="badge badge-warning">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Partial') return '<span class="badge badge-warning">' + esc(status).toUpperCase() + '</span>';
        return '<span class="badge badge-outline">' + esc(status || 'N/A').toUpperCase() + '</span>';
    }

    function showToast(msg, type) {
        var bg = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : type === 'info' ? '#2563EB' : '#92400E';
        var $t = $('<div style="position:fixed;top:20px;right:20px;z-index:99999;background:' + bg + ';color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:400px;animation:fadeIn 0.3s">' + esc(msg) + '</div>');
        $('body').append($t);
        setTimeout(function() { $t.fadeOut(300, function() { $t.remove(); }); }, 3000);
    }

    function chargeKey(c) {
        return c.chargeId || c.id;
    }

    function getActiveIpdCharges() {
        return masterCharges.filter(function(c) { return c.status === 'ACTIVE' || !c.status; });
    }

    function loadAllData() {
        var safeGet = function(url) {
            return $.get(url).then(
                function(data) { return data; },
                function() { return $.Deferred().resolve([]); }
            );
        };
        $.when(
            safeGet('/api/ipd/admissions'),
            safeGet('/api/patients'),
            safeGet('/api/doctors'),
            safeGet('/api/config/hospital-charges/module/IPD'),
            safeGet('/api/config/hospital-info'),
            safeGet('/api/bed-management/floors'),
            safeGet('/api/bed-management/wards'),
            safeGet('/api/bed-management/beds/available'),
            safeGet('/api/opd/visits'),
            safeGet('/api/emergency/visits'),
            safeGet('/api/ipd/bills'),
            safeGet('/api/ipd/clinical-orders/investigations'),
            safeGet('/api/hr-config/department'),
            safeGet('/api/opd-config/ipd_admission_type')
        ).done(function(r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14) {
            admissions = r1 || [];
            patients = r2 || [];
            doctors = (r3 || []).filter(function(d) { return d.status === 'ACTIVE'; });
            if (doctors.length === 0) doctors = getMockDoctors();
            masterCharges = r4 || [];
            if (r5 && !Array.isArray(r5)) { hospitalInfo = $.extend({ currency: 'PKR' }, r5); }
            floors = r6 || [];
            wards = r7 || [];
            availableBeds = r8 || [];
            opdVisits = r9 || [];
            erVisits = r10 || [];
            bills = r11 || [];
            
            if (r12) {
                masterInvestigations = r12.all || [];
                groupedInvestigations = r12.grouped || [];
            }
            ipdDepartments = Array.isArray(r13) ? r13 : [];
            ipdAdmissionTypes = Array.isArray(r14) && r14.length > 0 ? r14 : ['Routine', 'Emergency', 'Day Case'];
            
            renderAll();
        });
        loadIpdFormSections();
    }

    function loadIpdFormSections() {
        $.get('/api/ipd/form-sections').done(function(sections) {
            ipdFormSections = sections || [];
        }).fail(function() {
            ipdFormSections = [];
        });
    }

    function getAvailableIpdSections() {
        if (!ipdFormSections || ipdFormSections.length === 0) {
            return [
                { id: 'medication',    label: 'Medication',          icon: 'pill',           isDefault: true },
                { id: 'investigation', label: 'Investigation',        icon: 'flask-conical',  isDefault: true },
                { id: 'ivfluids',      label: 'IV Fluids',           icon: 'droplets',       isDefault: true },
                { id: 'diet',          label: 'Diet',                icon: 'utensils',       isDefault: true },
                { id: 'nursing',       label: 'Nursing',             icon: 'heart-pulse',    isDefault: true },
                { id: 'procedure',     label: 'Procedures',          icon: 'stethoscope',    isDefault: true },
                { id: 'ordersummary',  label: 'Order Summary',       icon: 'clipboard-list', isDefault: true }
            ];
        }
        var BUILTIN_ICONS = { medication: 'pill', investigation: 'flask-conical', ivfluids: 'droplets', diet: 'utensils', nursing: 'heart-pulse', procedure: 'stethoscope', ordersummary: 'clipboard-list' };
        return ipdFormSections
            .filter(function(s) { return s.isEnabled; })
            .map(function(s) {
                return {
                    id: s.key,
                    label: s.label,
                    icon: BUILTIN_ICONS[s.key] || 'layout-panel-left',
                    isDefault: s.isDefault,
                    fields: s.fields || [],
                    dbId: s.id
                };
            });
    }

    function renderAll() {
        try { renderRegistrationTab(); } catch(e) { console.warn('renderRegistrationTab error:', e); }
        try { renderBillingTab(); } catch(e) { console.warn('renderBillingTab error:', e); }
        try { renderOrdersTab(); } catch(e) { console.warn('renderOrdersTab error:', e); }
        try { renderMARTab(); } catch(e) { console.warn('renderMARTab error:', e); }
        try { renderInvestigationsTab(); } catch(e) { console.warn('renderInvestigationsTab error:', e); }
        try { renderNursingTab(); } catch(e) { console.warn('renderNursingTab error:', e); }
        try { renderDischargeTab(); } catch(e) { console.warn('renderDischargeTab error:', e); }
        if (window.ipdRegPopulateFilterOptions) window.ipdRegPopulateFilterOptions();
        if (window.ipdBillPopulateFilterOptions) window.ipdBillPopulateFilterOptions();
        if (window.ipdOrdPopulateFilterOptions) window.ipdOrdPopulateFilterOptions();
        if (window.ipdInvPopulateFilterOptions) window.ipdInvPopulateFilterOptions();
        if (window.ipdDischPopulateFilterOptions) window.ipdDischPopulateFilterOptions();
        lucide.createIcons();
    }

    // ===== TAB SWITCHING =====
    $('.module-tab').on('click', function() {
        var tab = $(this).data('tab');
        activeTab = tab;
        $('.module-tab').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').hide();
        $('#tab-' + tab).show();
        lucide.createIcons();
    });

    // ===== TAB 1: REGISTRATION =====
    function _ipdRegBuildRows(list) {
        var html = '';
        if (list.length === 0) {
            return '<tr><td colspan="12"><div class="empty-state"><i data-lucide="users"></i><p>No admissions found</p><p class="empty-sub">Try adjusting your search or filters</p><button class="btn-primary btn-sm" onclick="window.ipdOpenRegistration()"><i data-lucide="user-plus"></i> Admit New Patient</button></div></td></tr>';
        }
        list.forEach(function(a) {
            var statusClass = a.status === 'Active' ? 'badge-success' : a.status === 'Discharged' ? 'badge-info' : 'badge-outline';
            var payClass = a.paymentStatus === 'Paid' ? 'badge-success' : a.paymentStatus === 'Pending' ? 'badge-warning' : 'badge-outline';
            var shortId = a.admissionId.replace(a.mrn + '-', '');
            var admDate = new Date(a.admissionDate);
            var admFormatted = admDate.toLocaleDateString() + ', ' + admDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
            var wardBed = (a.ward || '-') + (a.bed ? ', ' + a.bed : '');
            var patient = patients.find(function(p) { return p.mrn === a.mrn; });
            var gender = (patient && patient.gender) ? patient.gender : (a.gender || '-');
            var diagnosis = a.initialDiagnosis || '-';
            html += '<tr class="clickable-row" data-admission-id="' + esc(a.admissionId) + '">' +
                '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(a.mrn) + '</td>' +
                '<td><span style="font-weight:500;font-size:14px">' + esc(a.patientName) + '</span></td>' +
                '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(shortId) + '</td>' +
                '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(a.department || '-') + '</td>' +
                '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(a.doctorName || '-') + '</td>' +
                '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(a.admissionSource || '-') + '</td>' +
                '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(gender) + '</td>' +
                '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(wardBed) + '</td>' +
                '<td style="font-size:12px;color:var(--color-muted-foreground);max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + esc(diagnosis) + '">' + esc(diagnosis) + '</td>' +
                '<td><span class="badge ' + statusClass + '">' + esc(a.status).toUpperCase() + '</span></td>' +
                '<td><span class="badge ' + payClass + '">' + esc(a.paymentStatus || 'N/A').toUpperCase() + '</span></td>' +
                '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(admFormatted) + '</td>' +
                '</tr>';
        });
        return html;
    }

    function _ipdRegRenderPagination(source) {
        /* Sort: most recently admitted (createdAt → admissionDate) first */
        var sorted = source.slice().sort(function(a, b) {
            return new Date(b.createdAt || b.admissionDate || 0) - new Date(a.createdAt || a.admissionDate || 0);
        });
        var total  = sorted.length;
        var pages  = Math.max(1, Math.ceil(total / ipdRegPerPageVal));
        ipdRegCurrentPage = Math.min(ipdRegCurrentPage, pages);
        var start  = (ipdRegCurrentPage - 1) * ipdRegPerPageVal;
        var slice  = sorted.slice(start, start + ipdRegPerPageVal);

        $('#regTableBody').html(_ipdRegBuildRows(slice));

        /* page info */
        var end = Math.min(start + ipdRegPerPageVal, total);
        $('#regTableInfo').text(total === 0 ? 'No results' : 'Showing ' + (start + 1) + '–' + end + ' of ' + total + ' admissions');

        /* page numbers */
        var nums = '';
        for (var p = 1; p <= pages; p++) {
            nums += '<button class="opd-page-num' + (p === ipdRegCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        }
        $('#ipdRegPageNums').html(nums);
        $('#ipdRegPrevPage').prop('disabled', ipdRegCurrentPage <= 1);
        $('#ipdRegNextPage').prop('disabled', ipdRegCurrentPage >= pages);

        lucide.createIcons();
    }

    function renderRegistrationTab() {
        var search = ($('#regSearch').val() || '').toLowerCase();
        var base = ipdRegFiltered !== null ? ipdRegFiltered : admissions;
        var filtered = base.filter(function(a) {
            return !search || a.patientName.toLowerCase().indexOf(search) > -1 || a.admissionId.toLowerCase().indexOf(search) > -1 || a.mrn.toLowerCase().indexOf(search) > -1;
        });

        var activeCount = admissions.filter(function(a) { return a.status === 'Active'; }).length;
        var today = new Date().toDateString();
        var todayAdm = admissions.filter(function(a) { return new Date(a.admissionDate).toDateString() === today; }).length;

        $('#statActiveCount').text(activeCount);
        $('#statTotalAdm').text(admissions.length);
        $('#statAvailBeds').text(availableBeds.length);
        $('#statTodayAdm').text(todayAdm);

        /* populate ward filter dropdown */
        var wardSel = document.getElementById('ipdRegWardFilter');
        if (wardSel && wardSel.options.length <= 1) {
            var wardNames = [];
            admissions.forEach(function(a) { if (a.ward && wardNames.indexOf(a.ward) === -1) wardNames.push(a.ward); });
            wardNames.sort().forEach(function(w) {
                var o = document.createElement('option'); o.value = w; o.textContent = w; wardSel.appendChild(o);
            });
        }

        _ipdRegRenderPagination(filtered);
    }

    /* Pagination event bindings */
    $(document).on('click', '#ipdRegPageNums .opd-page-num', function() {
        ipdRegCurrentPage = parseInt($(this).data('p'));
        renderRegistrationTab();
    });
    $('#ipdRegPrevPage').on('click', function() { if (ipdRegCurrentPage > 1) { ipdRegCurrentPage--; renderRegistrationTab(); } });
    $('#ipdRegNextPage').on('click', function() { ipdRegCurrentPage++; renderRegistrationTab(); });

    $('#regSearch').on('input', function() { ipdRegCurrentPage = 1; renderRegistrationTab(); });

    $(document).on('click', '#regTableBody .clickable-row', function() {
        var admissionId = $(this).data('admission-id');
        if (admissionId) window.ipdViewAdmission(admissionId);
    });

    $(document).on('click', '.dropdown-toggle-btn', function(e) {
        e.stopPropagation();
        var parent = $(this).closest('.dropdown-actions');
        var wasOpen = parent.hasClass('open');
        $('.dropdown-actions').removeClass('open');
        if (!wasOpen) parent.addClass('open');
    });
    $(document).on('click', function() { $('.dropdown-actions').removeClass('open'); });

    window.ipdViewAdmission = function(admissionId) {
        var adm = admissions.find(function(a) { return a.admissionId === admissionId; });
        if (!adm) return;

        /* ── Financial data from already-loaded bills array ── */
        var bill = bills.find(function(b) { return b.admissionId === admissionId; });
        var currency    = (hospitalInfo && hospitalInfo.currency) || 'PKR';
        var totalAmount = bill ? Number(bill.totalAmount || 0) : 0;
        var paidAmount  = bill ? Number(bill.paidAmount  || 0) : 0;
        var roomCharges = bill ? Number(bill.roomCharges || 0) : 0;
        var otherCharges= bill ? Number(bill.otherCharges || bill.additionalCharges || 0) : 0;
        var billId      = bill ? (bill.billId || '-') : '-';
        var payStatus   = adm.paymentStatus || (bill ? bill.paymentStatus : '') || '-';

        /* ── Badges ── */
        var payBadge = '';
        if (payStatus === 'Paid') {
            payBadge = '<span style="background:#16A34A;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">Paid</span>';
        } else if (payStatus === 'Pending') {
            payBadge = '<span style="background:#EAB308;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">Pending</span>';
        } else {
            payBadge = '<span style="background:#6B7280;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(payStatus) + '</span>';
        }

        var statusColor = adm.status === 'Active' ? '#EAB308' : adm.status === 'Discharged' ? '#6B7280' : '#3B82F6';
        var admStatusBadge = '<span style="background:' + statusColor + ';color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(adm.status || 'Active') + '</span>';

        /* ── Admission date formatted ── */
        var admDate    = adm.admissionDate ? new Date(adm.admissionDate) : null;
        var admDateStr = admDate
            ? admDate.toLocaleDateString('en-GB', {day:'2-digit',month:'2-digit',year:'numeric'}) +
              ', ' + admDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
            : '-';

        /* ── Initial body (patient info section with placeholder while fetching) ── */
        function _buildBody(patient) {
            var patientName = patient ? patient.name : adm.patientName;
            var cnic    = patient ? (patient.cnic  || '-') : '-';
            var phone   = patient ? (patient.phone || '-') : '-';
            var ageGend = patient ? (patient.age + ' / ' + patient.gender) : '-';

            var body =
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
                            '<div><span style="font-size:12px;font-family:monospace;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:3px 10px;border-radius:4px">' + esc(adm.mrn) + '</span></div>' +
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

                /* ── ADMISSION DETAILS + FINANCIAL DETAILS ── */
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +

                    /* Left — Admission Details */
                    '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px">' +
                        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                            '<i data-lucide="clipboard-list" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                            '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">Admission Details</span>' +
                        '</div>' +
                        '<table style="width:100%;font-size:13px;border-collapse:collapse">' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Admission ID</td><td style="padding:8px 0;text-align:right;font-weight:400;font-family:monospace;color:var(--color-foreground)">#' + esc(adm.admissionId) + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Department</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(adm.department || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Consultant</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(adm.doctorName || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Ward / Bed</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc((adm.ward || '-') + ' / ' + (adm.bed || '-')) + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Adm. Date</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px;color:var(--color-foreground)">' + esc(admDateStr) + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Adm. Source</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(adm.admissionSource || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Initial Diagnosis</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground);max-width:160px;word-break:break-word">' + esc(adm.initialDiagnosis || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Status</td><td style="padding:8px 0;text-align:right">' + admStatusBadge + '</td></tr>' +
                        '</table>' +
                    '</div>' +

                    /* Right — Financial Details */
                    '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px">' +
                        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                            '<i data-lucide="wallet" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                            '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">Financial Details</span>' +
                        '</div>' +
                        '<table style="width:100%;font-size:13px;border-collapse:collapse">' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Invoice Ref</td><td style="padding:8px 0;text-align:right;font-weight:600;font-family:monospace;color:var(--color-foreground)">' + esc(billId) + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Payment Status</td><td style="padding:8px 0;text-align:right">' + payBadge + '</td></tr>' +
                            '<tr><td colspan="2" style="padding:0"><hr style="margin:8px 0;border-color:var(--color-border)"></td></tr>' +
                            (roomCharges > 0 ? '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Room Charges</td><td style="padding:8px 0;text-align:right;font-weight:500;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + roomCharges.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' : '') +
                            (otherCharges > 0 ? '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Other Charges</td><td style="padding:8px 0;text-align:right;font-weight:500;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + otherCharges.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' : '') +
                            '<tr><td colspan="2" style="padding:0"><hr style="margin:8px 0;border-color:var(--color-border)"></td></tr>' +
                            '<tr><td style="padding:8px 0;font-weight:700;font-size:13px;text-transform:uppercase;color:var(--color-foreground)">Net Total</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:18px;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + totalAmount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' +
                        '</table>' +
                    '</div>' +
                '</div>';

            return body;
        }

        /* Render immediately with adm data, then update with full patient data */
        $('#admissionDetailBody').html(_buildBody(null));
        $('#admissionDetailFooter').html(
            '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
                '<button class="btn-outline" data-bs-dismiss="offcanvas">CLOSE</button>' +
                '<button class="btn-primary" id="btnIpdAdmPrint" style="display:flex;align-items:center;gap:6px">' +
                    '<i data-lucide="printer" style="width:16px;height:16px"></i> PRINT' +
                '</button>' +
            '</div>'
        );
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('admissionDetailSheet')).show();

        /* Fetch full patient data and re-render body with CNIC/phone/age */
        _ipdDetailPatient = null;
        $.get('/api/patients/' + encodeURIComponent(adm.mrn)).done(function(patient) {
            if (patient) {
                _ipdDetailPatient = patient;
                $('#admissionDetailBody').html(_buildBody(patient));
                lucide.createIcons();
            }
        });

        /* Print button */
        $(document).off('click.ipdAdmPrint').on('click.ipdAdmPrint', '#btnIpdAdmPrint', function() {
            printIpdRegistrationSlip(adm, _ipdDetailPatient, bill);
        });
    };

    // ===== REGISTRATION SHEET =====
    $('#btnAdmitNew').on('click', function() {
        window.ipdOpenRegistration();
    });

    window.ipdOpenRegistration = function() {
        resetRegistration();
        renderRegistrationSheet();
        new bootstrap.Offcanvas(document.getElementById('registrationSheet')).show();
    };

    function resetRegistration() {
        registrationStep = 'source-select';
        admissionSource = null;
        selectedPatientMRN = null;
        resolvedPatient = null;
        phoneSearch = '';
        phoneSearchResults = null;
        patientForm = { name: '', age: '', gender: 'Male', cnic: '', contactType: 'SELF', guardianName: '', guardianCnic: '', relationshipToPatient: '' };
        admissionForm = { doctorName: '', department: '', doctorFee: '0', doctorFeeDiscount: 0, admissionType: 'Routine', initialDiagnosis: '', estimatedStay: '', ward: '', floorRoom: '', bed: '', bedId: '' };
        selectedOptionalCharges = [];
        chargesGrid = [];
        validationErrors = [];
    }

    function renderRegistrationSheet() {
        var titleMap = {
            'source-select': '<i data-lucide="bed-double"></i> New IPD Admission',
            'mrn-lookup': '<i data-lucide="search"></i> Patient MRN Lookup',
            'phone-search': '<i data-lucide="phone"></i> Phone-First Registration',
            'phone-results': '<i data-lucide="users"></i> Search Results',
            'new-patient': '<i data-lucide="user-plus"></i> New Patient Details',
            'admission-details': '<i data-lucide="bed-double"></i> Admission Details'
        };
        $('#regSheetTitle').html(titleMap[registrationStep] || titleMap['source-select']);

        var body = '';
        var footer = '';
        var errHtml = renderValidationErrors();

        if (registrationStep === 'source-select') {
            body = '<div style="display:flex;flex-direction:column;gap:24px">' +
                '<div style="background:rgba(127,255,212,0.05);border:1px solid rgba(127,255,212,0.2);padding:16px;border-radius:8px">' +
                    '<p style="font-size:14px;font-weight:600;color:var(--midnight-blue)">Select Admission Source</p>' +
                    '<p style="font-size:12px;color:var(--color-muted-foreground)">Choose how the patient is being admitted to the hospital</p>' +
                '</div>' +
                '<div style="display:grid;gap:16px">' +
                    '<button class="source-select-btn" data-source="Outpatient" style="display:flex;align-items:center;gap:16px;padding:20px;border:2px solid #DBEAFE;border-radius:12px;background:transparent;cursor:pointer;transition:all 0.15s;text-align:left" onmouseover="this.style.borderColor=\'#60A5FA\';this.style.background=\'#EFF6FF\'" onmouseout="this.style.borderColor=\'#DBEAFE\';this.style.background=\'transparent\'">' +
                        '<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--color-muted)"><i data-lucide="stethoscope" style="width:24px;height:24px;color:var(--midnight-blue)"></i></div>' +
                        '<div><p style="font-size:14px;font-weight:700;margin:0">Outpatient (OPD)</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Admit from OPD</p></div>' +
                    '</button>' +
                    '<button class="source-select-btn" data-source="Emergency" style="display:flex;align-items:center;gap:16px;padding:20px;border:2px solid #FEE2E2;border-radius:12px;background:transparent;cursor:pointer;transition:all 0.15s;text-align:left" onmouseover="this.style.borderColor=\'#F87171\';this.style.background=\'#FEF2F2\'" onmouseout="this.style.borderColor=\'#FEE2E2\';this.style.background=\'transparent\'">' +
                        '<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--color-muted)"><i data-lucide="ambulance" style="width:24px;height:24px;color:var(--midnight-blue)"></i></div>' +
                        '<div><p style="font-size:14px;font-weight:700;margin:0">Emergency (ER)</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Admit from Emergency</p></div>' +
                    '</button>' +
                    '<button class="source-select-btn" data-source="Direct Inpatient" style="display:flex;align-items:center;gap:16px;padding:20px;border:2px solid #D1FAE5;border-radius:12px;background:transparent;cursor:pointer;transition:all 0.15s;text-align:left" onmouseover="this.style.borderColor=\'#34D399\';this.style.background=\'#ECFDF5\'" onmouseout="this.style.borderColor=\'#D1FAE5\';this.style.background=\'transparent\'">' +
                        '<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--color-muted)"><i data-lucide="bed-double" style="width:24px;height:24px;color:var(--midnight-blue)"></i></div>' +
                        '<div><p style="font-size:14px;font-weight:700;margin:0">Direct IPD</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Direct admission</p></div>' +
                    '</button>' +
                '</div></div>';
            footer = '<div style="display:flex;justify-content:flex-start"><button class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button></div>';
        } else if (registrationStep === 'mrn-lookup') {
            var sourceVisits = admissionSource === 'Outpatient' ? opdVisits : erVisits;
            var seen = {};
            var uniqueVisits = sourceVisits.filter(function(v) { if (seen[v.mrn]) return false; seen[v.mrn] = true; return true; });
            var srcLabel = admissionSource === 'Outpatient' ? 'OPD' : 'Emergency';
            body = errHtml + '<div style="display:flex;flex-direction:column;gap:24px">' +
                '<div style="background:#EFF6FF;border:1px solid #DBEAFE;padding:16px;border-radius:8px">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><i data-lucide="search" style="width:16px;height:16px;color:#2563EB"></i><p style="font-size:14px;font-weight:600;color:#1E40AF;margin:0">Select Patient from ' + srcLabel + '</p></div>' +
                    '<p style="font-size:12px;color:#2563EB;margin:0">Select a patient from ' + srcLabel + ' visits to proceed with IPD admission.</p>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;position:relative">' +
                    '<label style="font-size:12px;font-weight:600;text-transform:uppercase">SELECT PATIENT (MRN) <span style="color:var(--color-destructive)">*</span></label>' +
                    /* ── Searchable patient picker (same pattern as OT module) ── */
                    '<div id="ipdMrnDropdown" style="' +
                        'background:#fff;border:1px solid #e2e8f0;border-radius:10px;' +
                        'box-shadow:0 4px 18px rgba(0,0,0,0.10);overflow:hidden' +
                    '">' +
                        /* Search box always visible at top */
                        '<div style="padding:10px 12px;border-bottom:1px solid #f1f5f9">' +
                            '<input type="text" id="ipdMrnSearchInput" autocomplete="off"' +
                                ' placeholder="Search..."' +
                                ' style="width:100%;border:none;outline:none;font-size:13px;' +
                                        'color:#1e293b;background:transparent;padding:2px 0">' +
                        '</div>' +
                        /* Scrollable patient list */
                        '<div id="ipdMrnList" style="max-height:220px;overflow-y:auto">';

            var patientsJson = JSON.stringify(uniqueVisits.map(function(v){ return {mrn: v.mrn, name: v.patientName}; }));
            uniqueVisits.forEach(function(v) {
                body += '<div class="ipd-mrn-opt" data-mrn="' + esc(v.mrn) + '"' +
                    ' style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #f8fafc">' +
                    '<div style="font-size:13px;font-weight:600;color:#1e293b">' + esc(v.patientName) + '</div>' +
                    '<div style="font-size:11px;color:#64748b;font-family:monospace;margin-top:1px">' + esc(v.mrn) + '</div>' +
                    '</div>';
            });
            if (uniqueVisits.length === 0) {
                body += '<div style="padding:16px;font-size:13px;color:#94a3b8;text-align:center">No ' + srcLabel + ' patients found</div>';
            }
            body += '</div></div>' + /* close ipdMrnList + ipdMrnDropdown */
                    '<input type="hidden" id="mrnLookupSelect" value="">' +
                    '<script>window._ipdPatList = ' + patientsJson + ';<\/script>' +
                '</div></div>';
            footer = '<div style="display:flex;justify-content:space-between;width:100%"><button class="btn-outline" id="btnRegBack"><i data-lucide="arrow-left" style="width:16px;height:16px"></i> Back</button><div></div></div>';
        } else if (registrationStep === 'phone-search') {
            body = errHtml + '<div style="display:flex;flex-direction:column;gap:24px">' +
                '<div style="background:#ECFDF5;border:1px solid #D1FAE5;padding:16px;border-radius:8px">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><i data-lucide="phone" style="width:16px;height:16px;color:#059669"></i><p style="font-size:14px;font-weight:600;color:#065F46;margin:0">Phone-First Registration</p></div>' +
                    '<p style="font-size:12px;color:#059669;margin:0">Enter the patient\'s phone number to check for existing records.</p>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px">' +
                    '<label style="font-size:12px;font-weight:600;text-transform:uppercase">MOBILE NUMBER <span style="color:var(--color-destructive)">*</span></label>' +
                    '<input type="text" class="form-control" id="ipdPhoneInput" value="' + esc(phoneSearch) + '" placeholder="Enter phone number" style="height:40px">' +
                '</div></div>';
            footer = '<div style="display:flex;justify-content:space-between;width:100%"><button class="btn-outline" id="btnRegBack"><i data-lucide="arrow-left" style="width:16px;height:16px"></i> Back</button><button class="btn-primary" id="btnPhoneSearch">Search</button></div>';
        } else if (registrationStep === 'phone-results') {
            body = errHtml + '<div style="display:flex;flex-direction:column;gap:24px">';
            body += '<div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--color-muted-foreground)"><i data-lucide="phone" style="width:16px;height:16px"></i> Results for: <span style="font-family:monospace;font-weight:600;color:var(--color-foreground)">' + esc(phoneSearchResults ? phoneSearchResults.phone : phoneSearch) + '</span></div>';
            if (phoneSearchResults && (phoneSearchResults.self.length > 0 || phoneSearchResults.guardian.length > 0)) {
                if (phoneSearchResults.self.length > 0) {
                    body += '<div style="display:flex;flex-direction:column;gap:12px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">As Self</h4>';
                    phoneSearchResults.self.forEach(function(p) {
                        body += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--color-border);border-radius:8px;transition:background 0.15s" onmouseover="this.style.background=\'var(--color-muted)\'" onmouseout="this.style.background=\'transparent\'">' +
                            '<div style="display:flex;align-items:center;gap:12px"><div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(p.name) + '</div><div><p style="font-size:14px;font-weight:500;margin:0">' + esc(p.name) + '</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0"><span style="font-family:monospace">' + esc(p.mrn) + '</span> · ' + p.age + 'Y / ' + p.gender + '</p></div></div>' +
                            '<div style="display:flex;align-items:center;gap:8px"><span class="badge badge-outline" style="font-size:10px;background:#EFF6FF;color:#1D4ED8;border-color:#BFDBFE">SELF</span><button class="btn-outline btn-sm select-patient-btn" data-mrn="' + esc(p.mrn) + '">Select Patient</button></div>' +
                        '</div>';
                    });
                    body += '</div>';
                }
                if (phoneSearchResults.guardian.length > 0) {
                    body += '<div style="display:flex;flex-direction:column;gap:12px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">As Guardian</h4>';
                    phoneSearchResults.guardian.forEach(function(p) {
                        body += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--color-border);border-radius:8px;transition:background 0.15s" onmouseover="this.style.background=\'var(--color-muted)\'" onmouseout="this.style.background=\'transparent\'">' +
                            '<div style="display:flex;align-items:center;gap:12px"><div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(p.name) + '</div><div><p style="font-size:14px;font-weight:500;margin:0">' + esc(p.name) + '</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0"><span style="font-family:monospace">' + esc(p.mrn) + '</span> · ' + p.age + 'Y / ' + p.gender + '</p></div></div>' +
                            '<div style="display:flex;align-items:center;gap:8px"><span class="badge badge-outline" style="font-size:10px;background:#FFF7ED;color:#C2410C;border-color:#FED7AA">GUARDIAN</span><button class="btn-outline btn-sm select-patient-btn" data-mrn="' + esc(p.mrn) + '">Select Patient</button></div>' +
                        '</div>';
                    });
                    body += '</div>';
                }
            } else {
                body += '<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:32px 0"><i data-lucide="users" style="width:48px;height:48px;color:var(--color-muted-foreground);opacity:0.3"></i><div style="text-align:center"><p style="font-size:14px;font-weight:500;color:var(--color-muted-foreground)">No patients found</p><p style="font-size:12px;color:var(--color-muted-foreground);opacity:0.7">No records match this phone number</p></div></div>';
            }
            body += '</div>';
            footer = '<div style="display:flex;justify-content:space-between;width:100%"><button class="btn-outline" id="btnRegBack"><i data-lucide="arrow-left" style="width:16px;height:16px"></i> Back</button><button class="btn-primary" id="btnNewPatient"><i data-lucide="user-plus" style="width:16px;height:16px"></i> Register New Patient</button></div>';
        } else if (registrationStep === 'new-patient') {
            body = errHtml + renderNewPatientForm();
            footer = '<div style="display:flex;justify-content:space-between;width:100%"><button class="btn-outline" id="btnRegBack"><i data-lucide="arrow-left" style="width:16px;height:16px"></i> Back</button><button class="btn-primary" id="btnCreatePatient">Create & Continue</button></div>';
        } else if (registrationStep === 'admission-details') {
            body = errHtml + renderAdmissionDetailsForm();
            footer = '<div style="display:flex;justify-content:space-between;width:100%"><button class="btn-outline" id="btnRegBack"><i data-lucide="arrow-left" style="width:16px;height:16px"></i> Back</button><button class="btn-primary" id="btnProceedBilling">PROCEED TO BILLING</button></div>';
        }

        $('#regSheetBody').html(body);
        $('#regSheetFooter').html(footer);
        lucide.createIcons();
    }

    function renderValidationErrors() {
        if (validationErrors.length === 0) return '';
        var html = '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px;margin-bottom:16px">' +
            '<p style="font-size:14px;font-weight:600;color:var(--color-destructive);display:flex;align-items:center;gap:6px;margin:0 0 4px"><i data-lucide="alert-triangle" style="width:16px;height:16px"></i> Please fix the following:</p>' +
            '<ul style="font-size:12px;color:var(--color-destructive);margin:0;padding-left:20px">';
        validationErrors.forEach(function(e) { html += '<li>' + esc(e) + '</li>'; });
        html += '</ul></div>';
        return html;
    }

    function renderNewPatientForm() {
        var hasSelf = phoneSearchResults && phoneSearchResults.hasSelf;
        var selfChecked = patientForm.contactType === 'SELF' ? 'checked' : '';
        var guardianChecked = patientForm.contactType === 'GUARDIAN' ? 'checked' : '';
        var selfBorder = patientForm.contactType === 'SELF' ? 'border-color:var(--aquamint);background:rgba(127,255,212,0.05)' : '';
        var guardianBorder = patientForm.contactType === 'GUARDIAN' ? 'border-color:var(--aquamint);background:rgba(127,255,212,0.05)' : '';

        var html = '<div style="display:flex;flex-direction:column;gap:24px">' +
            '<div style="display:flex;flex-direction:column;gap:16px">' +
            '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Patient Information</h4>' +
            '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">FULL NAME <span style="color:var(--color-destructive)">*</span></label><input type="text" class="form-control ipd-pf" data-field="name" value="' + esc(patientForm.name) + '" placeholder="Patient Name" style="height:40px"></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">AGE (YEARS) <span style="color:var(--color-destructive)">*</span></label><input type="number" class="form-control ipd-pf" data-field="age" value="' + esc(patientForm.age) + '" placeholder="YY"></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">GENDER <span style="color:var(--color-destructive)">*</span></label><select class="form-select ipd-pf" data-field="gender"><option value="Male"' + (patientForm.gender === 'Male' ? ' selected' : '') + '>Male</option><option value="Female"' + (patientForm.gender === 'Female' ? ' selected' : '') + '>Female</option><option value="Other"' + (patientForm.gender === 'Other' ? ' selected' : '') + '>Other</option></select></div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">CNIC / NATIONAL ID</label><input type="text" class="form-control ipd-pf" data-field="cnic" value="' + esc(patientForm.cnic) + '" placeholder="XXXXX-XXXXXXX-X"></div>' +
            '</div>' +
            '<div style="height:1px;background:var(--color-border)"></div>' +
            '<div style="display:flex;flex-direction:column;gap:16px">' +
            '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Contact Type</h4>' +
            '<div style="display:flex;gap:16px">' +
                '<label style="display:flex;align-items:center;gap:8px;padding:12px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;flex:1;transition:all 0.15s;' + selfBorder + '"><input type="radio" name="ipdContactType" value="SELF" ' + selfChecked + ' class="ipd-contact-radio" style="accent-color:var(--aquamint)"><div><p style="font-size:14px;font-weight:500;margin:0">Self</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Patient owns this phone</p></div></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:12px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;flex:1;transition:all 0.15s;' + guardianBorder + '"><input type="radio" name="ipdContactType" value="GUARDIAN" ' + guardianChecked + ' class="ipd-contact-radio" style="accent-color:var(--aquamint)"><div><p style="font-size:14px;font-weight:500;margin:0">Guardian</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Phone belongs to guardian</p></div></label>' +
            '</div>';
        if (patientForm.contactType === 'SELF' && hasSelf) {
            html += '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px"><p style="font-size:12px;color:var(--color-destructive);display:flex;align-items:center;gap:6px;margin:0"><i data-lucide="alert-triangle" style="width:16px;height:16px"></i> A SELF contact already exists for this phone number. Please choose GUARDIAN instead.</p></div>';
        }
        if (patientForm.contactType === 'GUARDIAN') {
            html += '<div style="border-left:2px solid rgba(127,255,212,0.2);padding-left:16px;display:flex;flex-direction:column;gap:16px">' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">GUARDIAN NAME</label><input type="text" class="form-control ipd-pf" data-field="guardianName" value="' + esc(patientForm.guardianName) + '" placeholder="Guardian Name" style="height:40px"></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">GUARDIAN PHONE</label><input type="text" class="form-control" value="' + esc(phoneSearch) + '" disabled style="height:40px;background:var(--color-muted)"></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">GUARDIAN CNIC</label><input type="text" class="form-control ipd-pf" data-field="guardianCnic" value="' + esc(patientForm.guardianCnic) + '" placeholder="XXXXX-XXXXXXX-X"></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">RELATIONSHIP</label><select class="form-select ipd-pf" data-field="relationshipToPatient"><option value="">-- Select Relationship --</option>';
            relationshipOptions.forEach(function(r) {
                html += '<option value="' + r + '"' + (patientForm.relationshipToPatient === r ? ' selected' : '') + '>' + r + '</option>';
            });
            html += '</select></div></div>';
        }
        html += '</div></div>';
        return html;
    }

    function renderAdmissionDetailsForm() {
        var patientName = resolvedPatient ? resolvedPatient.name : patientForm.name || 'NEW PATIENT';
        var html = '<div style="display:flex;flex-direction:column;gap:24px">' +
            '<div style="background:rgba(127,255,212,0.05);border:1px solid rgba(127,255,212,0.2);padding:16px;border-radius:8px">' +
                '<p style="font-size:10px;font-weight:700;color:var(--aquamint);text-transform:uppercase;margin:0">SELECTED PATIENT</p>' +
                '<p style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin:4px 0 0">' + esc(patientName) + '</p>' +
                '<p style="font-size:12px;color:var(--color-muted-foreground);font-family:monospace;margin:2px 0 0">' + esc(selectedPatientMRN || '') + '</p>' +
                (resolvedPatient ? '<p style="font-size:12px;color:var(--color-muted-foreground);margin:4px 0 0">' + resolvedPatient.age + 'Y / ' + resolvedPatient.gender + ' · ' + esc(resolvedPatient.phone) + '</p>' : '') +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:16px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Doctor Assignment</h4>' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">ASSIGNED DOCTOR <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="admDoctorSelect" style="height:40px"><option value="">-- Select Doctor --</option>';
        doctors.forEach(function(d) {
            var fullName = d.firstName + ' ' + d.lastName;
            html += '<option value="' + esc(fullName) + '"' + (admissionForm.doctorName === fullName ? ' selected' : '') + '>' + esc(fullName) + ' - ' + esc(d.specialization) + ' (' + esc(d.department) + ')</option>';
        });
        html += '</select></div>';
        if (admissionForm.doctorFee !== '0') {
            html += '<div style="background:var(--color-muted);padding:12px;border-radius:8px;display:flex;align-items:center;justify-content:space-between"><span style="font-size:12px;color:var(--color-muted-foreground)">Doctor Fee (from config)</span><span style="font-size:14px;font-family:monospace;font-weight:600">' + hospitalInfo.currency + ' ' + Number(admissionForm.doctorFee).toLocaleString() + '</span></div>';
        }
        html += '</div>' +
            '<div style="display:flex;flex-direction:column;gap:16px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Admission Information</h4>' +
                (function() {
                    var deptOpts = '<option value="">-- Select --</option>';
                    ipdDepartments.forEach(function(d) { deptOpts += '<option' + (admissionForm.department === d ? ' selected' : '') + '>' + esc(d) + '</option>'; });
                    return '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">DEPARTMENT <span style="color:var(--color-destructive)">*</span></label><select class="form-select ipd-af" data-field="department" style="height:40px">' + deptOpts + '</select></div>';
                })() +
                (function() {
                    var typeOpts = '';
                    ipdAdmissionTypes.forEach(function(t) { typeOpts += '<option' + (admissionForm.admissionType === t ? ' selected' : '') + '>' + esc(t) + '</option>'; });
                    return '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">ADMISSION TYPE</label><select class="form-select ipd-af" data-field="admissionType" style="height:40px">' + typeOpts + '</select></div>';
                })() +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">INITIAL DIAGNOSIS</label><textarea class="form-control ipd-af" data-field="initialDiagnosis" rows="2" style="resize:none;font-size:14px" placeholder="Enter diagnosis...">' + esc(admissionForm.initialDiagnosis) + '</textarea></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">ESTIMATED STAY</label><input type="text" class="form-control ipd-af" data-field="estimatedStay" value="' + esc(admissionForm.estimatedStay) + '" placeholder="e.g., 3-5 days"></div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:16px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Bed Assignment</h4>' +
                '<div style="display:flex;flex-direction:column;gap:8px"><label style="font-size:12px;font-weight:600;text-transform:uppercase">SELECT BED</label><select class="form-select" id="admBedSelect" style="height:40px"><option value="">-- Select Available Bed --</option>';
        availableBeds.forEach(function(b) {
            var w = wards.find(function(wd) { return wd.wardId === b.wardId; });
            var f = floors.find(function(fl) { return fl.floorId === b.floorId; });
            html += '<option value="' + esc(b.bedId) + '"' + (admissionForm.bedId === b.bedId ? ' selected' : '') + '>' + esc(b.bedNumber) + (w ? ' - ' + esc(w.name) : '') + (f ? ' (' + esc(f.name) + ')' : '') + '</option>';
        });
        html += '</select></div>';
        if (admissionForm.bed) {
            html += '<div style="background:var(--color-muted);padding:12px;border-radius:8px;display:flex;align-items:center;gap:8px"><i data-lucide="bed-double" style="width:16px;height:16px;color:var(--midnight-blue)"></i><span style="font-size:12px">Bed: <strong>' + esc(admissionForm.bed) + '</strong> | Ward: <strong>' + esc(admissionForm.ward) + '</strong> | Floor: <strong>' + esc(admissionForm.floorRoom) + '</strong></span></div>';
        }
        html += '</div></div>';
        return html;
    }

    // Registration event handlers
    $(document).on('click', '.source-select-btn', function() {
        admissionSource = $(this).data('source');
        validationErrors = [];
        if (admissionSource === 'Direct Inpatient') {
            registrationStep = 'phone-search';
        } else {
            registrationStep = 'mrn-lookup';
        }
        renderRegistrationSheet();
    });

    /* ── IPD Searchable patient picker events ── */
    function _ipdMrnFilter() {
        var q = ($('#ipdMrnSearchInput').val() || '').toLowerCase();
        var list = window._ipdPatList || [];
        var $list = $('#ipdMrnList');
        var html = '';
        var filtered = q ? list.filter(function(p) {
            return p.mrn.toLowerCase().indexOf(q) > -1 || p.name.toLowerCase().indexOf(q) > -1;
        }) : list;
        if (filtered.length === 0) {
            html = '<div style="padding:16px;font-size:13px;color:#94a3b8;text-align:center">No patients found</div>';
        } else {
            filtered.forEach(function(p) {
                html += '<div class="ipd-mrn-opt" data-mrn="' + esc(p.mrn) + '"' +
                    ' style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #f8fafc">' +
                    '<div style="font-size:13px;font-weight:600;color:#1e293b">' + esc(p.name) + '</div>' +
                    '<div style="font-size:11px;color:#64748b;font-family:monospace;margin-top:1px">' + esc(p.mrn) + '</div>' +
                    '</div>';
            });
        }
        $list.html(html);
    }

    $(document).on('input', '#ipdMrnSearchInput', function() { _ipdMrnFilter(); });

    $(document).on('mouseover', '.ipd-mrn-opt', function() {
        $(this).css('background', '#f0f9ff');
    }).on('mouseout', '.ipd-mrn-opt', function() {
        $(this).css('background', '');
    });

    $(document).on('click', '.ipd-mrn-opt', function() {
        var mrn = $(this).data('mrn');
        if (!mrn) return;
        /* Highlight selected row */
        $('.ipd-mrn-opt').css({'background': '', 'border-left': ''});
        $(this).css({'background': '#eff6ff', 'border-left': '3px solid var(--midnight-blue)'});
        $('#mrnLookupSelect').val(mrn);
        /* Load patient and proceed */
        $.get('/api/patients/' + mrn).done(function(patient) {
            resolvedPatient = patient;
            selectedPatientMRN = patient.mrn;
            registrationStep = 'admission-details';
            renderRegistrationSheet();
        }).fail(function() {
            validationErrors = ['Patient not found with this MRN'];
            renderRegistrationSheet();
        });
    });

    $(document).on('change', '#mrnLookupSelect', function() {
        var mrn = $(this).val();
        if (!mrn) return;
        $.get('/api/patients/' + mrn).done(function(patient) {
            resolvedPatient = patient;
            selectedPatientMRN = patient.mrn;
            registrationStep = 'admission-details';
            renderRegistrationSheet();
        }).fail(function() {
            validationErrors = ['Patient not found with this MRN'];
            renderRegistrationSheet();
        });
    });

    $(document).on('click', '#btnPhoneSearch', function() {
        phoneSearch = $('#ipdPhoneInput').val();
        if (!phoneSearch.trim()) {
            validationErrors = ['Please enter a phone number'];
            renderRegistrationSheet();
            return;
        }
        validationErrors = [];
        $.ajax({
            url: '/api/patients/search-by-phone',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ phone: phoneSearch.trim() }),
            success: function(results) {
                phoneSearchResults = results;
                registrationStep = 'phone-results';
                renderRegistrationSheet();
            },
            error: function(xhr) {
                validationErrors = [xhr.responseJSON?.message || 'Failed to search'];
                renderRegistrationSheet();
            }
        });
    });

    $(document).on('keydown', '#ipdPhoneInput', function(e) {
        if (e.key === 'Enter') { phoneSearch = $(this).val(); $('#btnPhoneSearch').click(); }
    });

    $(document).on('click', '.select-patient-btn', function() {
        var mrn = $(this).data('mrn');
        var allPatients = (phoneSearchResults ? phoneSearchResults.self.concat(phoneSearchResults.guardian) : []);
        var patient = allPatients.find(function(p) { return p.mrn === mrn; });
        if (patient) {
            selectedPatientMRN = patient.mrn;
            resolvedPatient = patient;
            validationErrors = [];
            registrationStep = 'admission-details';
            renderRegistrationSheet();
        }
    });

    $(document).on('click', '#btnNewPatient', function() {
        var hasSelf = phoneSearchResults && phoneSearchResults.hasSelf;
        patientForm.contactType = hasSelf ? 'GUARDIAN' : 'SELF';
        validationErrors = [];
        registrationStep = 'new-patient';
        renderRegistrationSheet();
    });

    $(document).on('change', '.ipd-pf', function() {
        patientForm[$(this).data('field')] = $(this).val();
    });
    $(document).on('change', '.ipd-af', function() {
        admissionForm[$(this).data('field')] = $(this).val();
    });
    $(document).on('change', '.ipd-contact-radio', function() {
        patientForm.contactType = $(this).val();
        renderRegistrationSheet();
    });

    $(document).on('click', '#btnCreatePatient', function() {
        syncPatientForm();
        var errors = [];
        if (!patientForm.name.trim()) errors.push('Patient Name is required');
        if (!patientForm.age || isNaN(Number(patientForm.age)) || Number(patientForm.age) <= 0) errors.push('Valid Age is required');
        if (!patientForm.gender) errors.push('Gender is required');
        if (patientForm.contactType === 'SELF' && phoneSearchResults && phoneSearchResults.hasSelf) errors.push('A SELF contact already exists. Choose GUARDIAN.');
        if (errors.length > 0) { validationErrors = errors; renderRegistrationSheet(); return; }
        validationErrors = [];
        var data = {
            name: patientForm.name, age: Number(patientForm.age), gender: patientForm.gender,
            phone: phoneSearch.trim(), cnic: patientForm.cnic, contactType: patientForm.contactType
        };
        if (patientForm.contactType === 'GUARDIAN') {
            data.guardianName = patientForm.guardianName;
            data.guardianPhone = phoneSearch.trim();
            data.guardianCnic = patientForm.guardianCnic;
            data.relationshipToPatient = patientForm.relationshipToPatient;
        }
        $.ajax({
            url: '/api/patients', method: 'POST', contentType: 'application/json', data: JSON.stringify(data),
            success: function(newPatient) {
                selectedPatientMRN = newPatient.mrn;
                resolvedPatient = newPatient;
                registrationStep = 'admission-details';
                renderRegistrationSheet();
            },
            error: function(xhr) { validationErrors = [xhr.responseJSON?.message || 'Failed to create patient']; renderRegistrationSheet(); }
        });
    });

    function syncPatientForm() {
        $('#regSheetBody .ipd-pf').each(function() { patientForm[$(this).data('field')] = $(this).val(); });
    }

    $(document).on('change', '#admDoctorSelect', function() {
        admissionForm.doctorName = $(this).val();
        var doctor = doctors.find(function(d) { return (d.firstName + ' ' + d.lastName) === admissionForm.doctorName; });
        if (doctor) {
            var docId = doctor.doctorId || doctor.id;
            $.get('/api/config/doctor-fees/lookup', { doctorId: docId, serviceType: 'IPD' }).done(function(config) {
                admissionForm.doctorFee = config && config.fee ? config.fee.toString() : '0';
                renderRegistrationSheet();
            }).fail(function() { admissionForm.doctorFee = '0'; renderRegistrationSheet(); });
        }
    });

    $(document).on('change', '#admBedSelect', function() {
        var bedId = $(this).val();
        var bed = availableBeds.find(function(b) { return b.bedId === bedId; });
        if (bed) {
            var ward = wards.find(function(w) { return w.wardId === bed.wardId; });
            var floor = floors.find(function(f) { return f.floorId === bed.floorId; });
            admissionForm.bedId = bed.bedId;
            admissionForm.bed = bed.bedNumber;
            admissionForm.ward = ward ? ward.name : '';
            admissionForm.floorRoom = floor ? floor.name : '';
            renderRegistrationSheet();
        }
    });

    $(document).on('click', '#btnProceedBilling', function() {
        $('#regSheetBody .ipd-af').each(function() { admissionForm[$(this).data('field')] = $(this).val(); });
        admissionForm.doctorName = $('#admDoctorSelect').val() || admissionForm.doctorName;
        var errors = [];
        if (!admissionForm.doctorName) errors.push('Assigned Doctor is required');
        if (!admissionForm.department) errors.push('Department is required');
        if (errors.length > 0) { validationErrors = errors; renderRegistrationSheet(); return; }
        validationErrors = [];
        bootstrap.Offcanvas.getInstance(document.getElementById('registrationSheet'))?.hide();
        openChargesSheet();
    });

    $(document).on('click', '#btnRegBack', function() {
        validationErrors = [];
        if (registrationStep === 'mrn-lookup' || registrationStep === 'phone-search') {
            registrationStep = 'source-select';
        } else if (registrationStep === 'phone-results') {
            registrationStep = 'phone-search';
        } else if (registrationStep === 'new-patient') {
            registrationStep = 'phone-results';
        } else if (registrationStep === 'admission-details') {
            if (admissionSource === 'Direct Inpatient') {
                registrationStep = 'phone-results';
            } else {
                registrationStep = 'mrn-lookup';
            }
            selectedPatientMRN = null;
            resolvedPatient = null;
        }
        renderRegistrationSheet();
    });

    // ===== CHARGES SHEET (pixel-perfect copy of OPD) =====
    function getActiveIpdChargesForGrid() {
        return masterCharges.filter(function(c) { return (c.isActive !== false && (c.status === 'ACTIVE' || !c.status)); });
    }

    function buildChargesGrid() {
        chargesGrid = [];
        var sr = 1;
        var activeCharges = getActiveIpdChargesForGrid();
        activeCharges.filter(function(c) { return c.isMandatory; }).forEach(function(c) {
            chargesGrid.push({ sr: sr++, id: chargeKey(c), name: c.name, qty: 1, discount: 0, unitPrice: Number(c.amount), mandatory: true, type: 'charge' });
        });
        activeCharges.filter(function(c) { return !c.isMandatory && selectedOptionalCharges.indexOf(chargeKey(c)) > -1; }).forEach(function(c) {
            chargesGrid.push({ sr: sr++, id: chargeKey(c), name: c.name, qty: 1, discount: 0, unitPrice: Number(c.amount), mandatory: false, type: 'charge' });
        });
    }

    function calcRowAmount(row) {
        var subtotal = row.unitPrice * row.qty;
        return Math.max(0, subtotal - Number(row.discount || 0));
    }

    function calcChargesTotal() {
        return chargesGrid.reduce(function(sum, row) { return sum + calcRowAmount(row); }, 0);
    }

    function calcDoctorFeeTotal() {
        var fee = Number(admissionForm.doctorFee) || 0;
        var disc = Number(admissionForm.doctorFeeDiscount) || 0;
        return Math.max(0, fee - disc);
    }

    function calcGrandTotal() {
        return calcDoctorFeeTotal() + calcChargesTotal();
    }

    function renderChargesGridRows() {
        var tbody = '';
        chargesGrid.forEach(function(row, idx) {
            var amt = calcRowAmount(row);
            var deleteBtn = row.mandatory ? '' : '<button class="btn btn-sm p-0 border-0 charge-row-delete" data-idx="' + idx + '" title="Remove"><i data-lucide="x-circle" style="width:16px;height:16px;color:#dc3545"></i></button>';
            tbody += '<tr>' +
                '<td style="text-align:center;vertical-align:middle;width:50px">' + row.sr + '</td>' +
                '<td style="vertical-align:middle"><span style="font-weight:500">' + esc(row.name) + '</span>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);font-family:monospace">@ ' + hospitalInfo.currency + ' ' + Number(row.unitPrice).toLocaleString() + ' each</div></td>' +
                '<td style="width:80px;vertical-align:middle"><input type="number" class="form-control form-control-sm charge-qty" data-idx="' + idx + '" value="' + row.qty + '" min="1" style="text-align:center;font-family:monospace"></td>' +
                '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm charge-discount" data-idx="' + idx + '" value="' + row.discount + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
                '<td style="text-align:right;vertical-align:middle;font-weight:600;font-family:monospace;width:120px">' + hospitalInfo.currency + ' ' + amt.toLocaleString() + '</td>' +
                '<td style="text-align:center;vertical-align:middle;width:40px">' + deleteBtn + '</td>' +
                '</tr>';
        });
        return tbody;
    }

    function getAvailableOptionalCharges() {
        var activeCharges = getActiveIpdChargesForGrid();
        var usedIds = chargesGrid.map(function(r) { return r.id; });
        return activeCharges.filter(function(c) {
            return !c.isMandatory && usedIds.indexOf(chargeKey(c)) === -1;
        });
    }

    function renderNewChargeRow() {
        var available = getAvailableOptionalCharges();
        if (available.length === 0) return '';
        var row = '<tr class="new-charge-row" style="background:#f8f9fa">' +
            '<td style="text-align:center;vertical-align:middle;width:50px"><i data-lucide="plus-circle" style="width:16px;height:16px;color:var(--aqua-mint-dark)"></i></td>' +
            '<td colspan="4" style="vertical-align:middle"><select class="form-select form-select-sm new-charge-select" style="font-size:13px"><option value="">Select a charge to add...</option>';
        available.forEach(function(c) {
            row += '<option value="' + chargeKey(c) + '" data-amount="' + c.amount + '">' + esc(c.name) + ' — ' + hospitalInfo.currency + ' ' + Number(c.amount).toLocaleString() + '</option>';
        });
        row += '</select></td><td></td></tr>';
        return row;
    }

    function openChargesSheet() {
        var patientName = resolvedPatient ? resolvedPatient.name : patientForm.name || 'NEW PATIENT';
        if (!admissionForm.doctorFeeDiscount) admissionForm.doctorFeeDiscount = 0;
        buildChargesGrid();
        var total = calcGrandTotal();
        var doctorFee = Number(admissionForm.doctorFee) || 0;
        var doctorDisc = Number(admissionForm.doctorFeeDiscount) || 0;
        var doctorNet = calcDoctorFeeTotal();

        var body = '<div style="display:flex;align-items:center;justify-content:space-between;background:#EFF6FF;border:1px solid #DBEAFE;padding:12px 16px;border-radius:8px;margin-bottom:20px">' +
            '<div><p style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;margin:0">CHARGES BREAKDOWN</p>' +
            '<h3 style="font-size:16px;font-weight:700;color:var(--midnight-blue);margin:0">' + esc(patientName) + '</h3>' +
            '<p style="font-size:12px;color:var(--color-muted-foreground);margin:0">' + esc(selectedPatientMRN || 'GENERATING NEW MRN') + '</p></div>' +
            '<div style="width:32px;height:32px;background:#DBEAFE;border-radius:50%;display:flex;align-items:center;justify-content:center"><i data-lucide="receipt" style="width:18px;height:18px;color:#2563EB"></i></div></div>';

        body += '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden;margin-bottom:16px">' +
            '<table class="table table-sm mb-0" style="font-size:13px" id="doctorFeeGrid">' +
            '<thead><tr style="background:var(--midnight-blue);color:#fff">' +
            '<th style="text-align:center;width:50px;padding:10px 8px">Sr#</th>' +
            '<th style="padding:10px 8px">Doctor Fee</th>' +
            '<th style="text-align:center;width:80px;padding:10px 8px">QTY</th>' +
            '<th style="text-align:right;width:100px;padding:10px 8px">Discount</th>' +
            '<th style="text-align:right;width:120px;padding:10px 8px">Amount</th>' +
            '<th style="width:40px;padding:10px 8px"></th>' +
            '</tr></thead><tbody>' +
            '<tr>' +
            '<td style="text-align:center;vertical-align:middle">1</td>' +
            '<td style="vertical-align:middle"><span style="font-weight:500">Consultant Doctor Fee</span>' +
            '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(admissionForm.doctorName || 'Doctor') + ' — IPD</div></td>' +
            '<td style="width:80px;vertical-align:middle"><input type="number" class="form-control form-control-sm" value="1" disabled style="text-align:center;font-family:monospace;background:#f1f1f1"></td>' +
            '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm" id="doctorFeeDiscount" value="' + doctorDisc + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
            '<td style="text-align:right;vertical-align:middle;font-weight:600;font-family:monospace;width:120px" id="doctorFeeAmount">' + hospitalInfo.currency + ' ' + doctorNet.toLocaleString() + '</td>' +
            '<td style="width:40px"></td>' +
            '</tr></tbody></table></div>';

        body += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<span style="font-size:12px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase">Hospital Charges</span>' +
            '<button class="btn btn-sm btn-outline-primary" id="btnAddChargeRow" style="font-size:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Row</button></div>';

        body += '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden;margin-bottom:16px">' +
            '<table class="table table-sm mb-0" style="font-size:13px" id="chargesGridTable">' +
            '<thead><tr style="background:var(--midnight-blue);color:#fff">' +
            '<th style="text-align:center;width:50px;padding:10px 8px">Sr#</th>' +
            '<th style="padding:10px 8px">Charges</th>' +
            '<th style="text-align:center;width:80px;padding:10px 8px">QTY</th>' +
            '<th style="text-align:right;width:100px;padding:10px 8px">Discount</th>' +
            '<th style="text-align:right;width:120px;padding:10px 8px">Amount</th>' +
            '<th style="width:40px;padding:10px 8px"></th>' +
            '</tr></thead>' +
            '<tbody id="chargesGridBody">' + renderChargesGridRows();
        if (chargesGrid.length === 0) {
            body += '<tr id="chargesEmptyRow"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add charges.</td></tr>';
        }
        body += '</tbody></table></div>';

        body += '<div style="background:var(--midnight-blue);padding:16px;border-radius:8px;color:#fff;display:flex;align-items:center;justify-content:space-between">' +
            '<div><p style="font-size:12px;font-weight:500;opacity:0.8;text-transform:uppercase;margin:0">Grand Total</p>' +
            '<p style="font-size:10px;opacity:0.6;margin:0">DOCTOR FEE + ' + chargesGrid.length + ' CHARGE' + (chargesGrid.length !== 1 ? 'S' : '') + '</p></div>' +
            '<div style="font-size:24px;font-weight:700;font-family:monospace" id="chargeTotalDisplay">' + hospitalInfo.currency + ' ' + total.toLocaleString() + '</div></div>';

        var footer = '<button class="btn-outline" id="btnChargesBack">BACK</button><button class="btn-primary" id="btnFinalizeAdmission">CONFIRM ADMISSION</button>';

        $('#chargesSheetBody').html(body);
        $('#chargesSheetFooter').html(footer);
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('chargesSheet')).show();
        bindChargesGridEvents();
    }

    function bindChargesGridEvents() {
        $(document).off('input.chargesGrid').on('input.chargesGrid', '.charge-qty', function() {
            var idx = $(this).data('idx');
            var val = parseInt($(this).val()) || 1;
            if (val < 1) val = 1;
            chargesGrid[idx].qty = val;
            refreshChargesGrid();
        });

        $(document).off('input.chargesDiscount').on('input.chargesDiscount', '.charge-discount', function() {
            var idx = $(this).data('idx');
            var val = parseFloat($(this).val()) || 0;
            if (val < 0) val = 0;
            chargesGrid[idx].discount = val;
            refreshChargesGrid();
        });

        $(document).off('input.doctorDiscount').on('input.doctorDiscount', '#doctorFeeDiscount', function() {
            var val = parseFloat($(this).val()) || 0;
            if (val < 0) val = 0;
            admissionForm.doctorFeeDiscount = val;
            var net = calcDoctorFeeTotal();
            $('#doctorFeeAmount').text(hospitalInfo.currency + ' ' + net.toLocaleString());
            var total = calcGrandTotal();
            $('#chargeTotalDisplay').text(hospitalInfo.currency + ' ' + total.toLocaleString());
        });

        $(document).off('click.chargesDelete').on('click.chargesDelete', '.charge-row-delete', function() {
            var idx = $(this).data('idx');
            var row = chargesGrid[idx];
            if (row && !row.mandatory) {
                selectedOptionalCharges = selectedOptionalCharges.filter(function(id) { return id !== row.id; });
                chargesGrid.splice(idx, 1);
                chargesGrid.forEach(function(r, i) { r.sr = i + 1; });
                refreshChargesGrid();
                if (chargesGrid.length === 0) {
                    $('#chargesGridBody').html('<tr id="chargesEmptyRow"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add charges.</td></tr>');
                }
            }
        });

        $(document).off('click.addRow').on('click.addRow', '#btnAddChargeRow', function() {
            var available = getAvailableOptionalCharges();
            if (available.length === 0) {
                HMS.toast('All available charges have already been added.', 'info');
                return;
            }
            $('#chargesEmptyRow').remove();
            var existingNew = $('#chargesGridBody .new-charge-row');
            if (existingNew.length > 0) return;
            $('#chargesGridBody').append(renderNewChargeRow());
            lucide.createIcons();
        });

        $(document).off('change.newCharge').on('change.newCharge', '.new-charge-select', function() {
            var chargeId = $(this).val();
            if (!chargeId) return;
            if (selectedOptionalCharges.indexOf(chargeId) === -1) {
                selectedOptionalCharges.push(chargeId);
            }
            var activeCharges = getActiveIpdChargesForGrid();
            var charge = activeCharges.find(function(c) { return chargeKey(c) === chargeId; });
            if (charge) {
                var sr = chargesGrid.length + 1;
                chargesGrid.push({ sr: sr, id: chargeId, name: charge.name, qty: 1, discount: 0, unitPrice: Number(charge.amount), mandatory: false, type: 'charge' });
            }
            $('.new-charge-row').remove();
            refreshChargesGrid();
            if (chargesGrid.length === 0) {
                $('#chargesGridBody').html('<tr id="chargesEmptyRow"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add charges.</td></tr>');
            }
        });

        $('#btnChargesBack').off('click').on('click', function() {
            try { var oc = bootstrap.Offcanvas.getInstance(document.getElementById('chargesSheet')); if (oc) oc.hide(); } catch(e) {}
            renderRegistrationSheet();
            new bootstrap.Offcanvas(document.getElementById('registrationSheet')).show();
        });

        $('#btnFinalizeAdmission').off('click').on('click', function() {
            _showIpdAdmitConfirm();
        });
    }

    var $pendingIpdAdmitBtn = null;

    function _showIpdAdmitConfirm() {
        var patName = (resolvedPatient && resolvedPatient.name) ? resolvedPatient.name : (selectedPatientMRN || '');
        var mrn     = selectedPatientMRN || '';
        var total   = calcGrandTotal();
        var currency= (hospitalInfo && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';

        /* Build charges rows for preview */
        var chargesHtml = '';
        /* Doctor fee row */
        var docFee = Number(admissionForm.doctorFee) || 0;
        chargesHtml +=
            '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid #f1f5f9">' +
            '<span style="color:#475569">Doctor Fee — ' + esc(admissionForm.doctorName || '-') + '</span>' +
            '<span style="font-weight:600">' + currency + ' ' + docFee.toLocaleString() + '</span></div>';
        chargesGrid.forEach(function(row) {
            if (row.type !== 'charge') return;
            var amt = (row.qty * row.unitPrice) - (row.discount || 0);
            chargesHtml +=
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid #f1f5f9">' +
                '<span style="color:#475569">' + esc(row.name) + ' &times; ' + row.qty + '</span>' +
                '<span style="font-weight:600">' + currency + ' ' + amt.toLocaleString() + '</span></div>';
        });
        if (chargesGrid.length === 0) {
            chargesHtml += '<div style="font-size:12px;color:#94a3b8;padding:6px 0">No additional hospital charges</div>';
        }

        $('#ipdAdmitConfirmModal').remove();
        var modal =
            '<div class="modal fade" id="ipdAdmitConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:460px">' +
            '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
                '<div class="modal-header" style="background:var(--midnight-blue);color:#fff;border:none;padding:16px 20px">' +
                    '<div style="display:flex;align-items:center;gap:10px">' +
                        '<i data-lucide="bed-double" style="width:20px;height:20px;color:var(--aqua-mint)"></i>' +
                        '<h5 class="modal-title" style="margin:0;font-size:16px;font-weight:600">Confirm Admission</h5>' +
                    '</div>' +
                    '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>' +
                '</div>' +
                '<div class="modal-body" style="padding:20px">' +
                    /* Patient card */
                    '<div style="display:flex;align-items:center;gap:14px;padding:14px;background:#f8fafc;border-radius:10px;margin-bottom:16px">' +
                        '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff;font-size:14px;font-weight:700">' +
                            esc(patName.split(' ').map(function(x){return x[0]||'';}).slice(0,2).join('').toUpperCase()) +
                        '</div>' +
                        '<div>' +
                            '<div style="font-weight:600;font-size:15px;color:var(--midnight-blue)">' + esc(patName) + '</div>' +
                            '<div style="font-family:monospace;font-size:12px;color:#64748b">' + esc(mrn) + '</div>' +
                            '<div style="font-size:12px;color:#64748b;margin-top:3px">' +
                                esc(admissionForm.department || '') +
                                (admissionForm.ward ? ' &bull; ' + esc(admissionForm.ward) : '') +
                                (admissionForm.bed  ? ' / ' + esc(admissionForm.bed) : '') +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    /* Charges breakdown */
                    '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:12px">' +
                        '<div style="font-size:12px;font-weight:600;color:#1e40af;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.04em">Charges Breakdown</div>' +
                        chargesHtml +
                    '</div>' +
                    /* Grand total */
                    '<div style="display:flex;justify-content:space-between;align-items:center;' +
                        'background:var(--midnight-blue);color:#fff;border-radius:8px;padding:12px 16px">' +
                        '<span style="font-size:12px;font-weight:600;text-transform:uppercase;opacity:0.85">Grand Total</span>' +
                        '<span style="font-size:18px;font-weight:700;font-family:monospace">' + currency + ' ' + total.toLocaleString() + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="modal-footer" style="border:none;padding:12px 20px;gap:8px">' +
                    '<button class="btn-outline" data-bs-dismiss="modal" style="min-width:90px">Cancel</button>' +
                    '<button class="btn-primary" id="btnIpdAdmitFinalConfirm"' +
                        ' style="min-width:180px;background:var(--aqua-mint);color:var(--midnight-blue);border-color:var(--aqua-mint);font-weight:700">' +
                        '<i data-lucide="bed-double" style="width:14px;height:14px"></i> Confirm Admission' +
                    '</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(modal);
        lucide.createIcons();

        var $modal  = $('#ipdAdmitConfirmModal');
        var bsModal = new bootstrap.Modal($modal[0]);
        bsModal.show();

        $modal[0].addEventListener('hidden.bs.modal', function() {
            if ($pendingIpdAdmitBtn) {
                $pendingIpdAdmitBtn = null;
                _doIpdAdmit();
            }
            $modal.remove();
        }, { once: true });

        $('#btnIpdAdmitFinalConfirm').off('click').on('click', function() {
            $pendingIpdAdmitBtn = true;
            bsModal.hide();
        });
    }

    function _doIpdAdmit() {
        var patName  = (resolvedPatient && resolvedPatient.name) ? resolvedPatient.name : (selectedPatientMRN || '');
        var mrn      = selectedPatientMRN || '';
        var chargeIds = [];
        chargesGrid.forEach(function(row) { if (row.type === 'charge') chargeIds.push(row.id); });

        $.ajax({
            url: '/api/ipd/admissions', method: 'POST', contentType: 'application/json',
            data: JSON.stringify({
                mrn: mrn, doctorName: admissionForm.doctorName, department: admissionForm.department,
                doctorFee: Number(admissionForm.doctorFee), chargeIds: chargeIds,
                admissionSource: admissionSource, admissionType: admissionForm.admissionType,
                initialDiagnosis: admissionForm.initialDiagnosis, estimatedStay: admissionForm.estimatedStay,
                ward: admissionForm.ward, floorRoom: admissionForm.floorRoom, bed: admissionForm.bed, bedId: admissionForm.bedId
            }),
            success: function(res) {
                try { var cs = bootstrap.Offcanvas.getInstance(document.getElementById('chargesSheet')); if (cs) cs.hide(); } catch(e) {}
                try { var rs = bootstrap.Offcanvas.getInstance(document.getElementById('registrationSheet')); if (rs) rs.hide(); } catch(e) {}
                resetRegistration();
                setTimeout(function() { loadAllData(); }, 300);
                _showIpdAdmitSuccess(patName, mrn, res, resolvedPatient);
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed to admit patient');
            }
        });
    }

    function _showIpdAdmitSuccess(patName, mrn, res, patient) {
        var admId    = (res && res.admissionId) ? res.admissionId : '';
        var currency = (hospitalInfo && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';
        var total    = calcGrandTotal();

        $('#ipdAdmitSuccessModal').remove();
        var modal =
            '<div class="modal fade" id="ipdAdmitSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:400px">' +
            '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
                '<div style="background:linear-gradient(135deg,var(--midnight-blue) 0%,#1e3a8a 100%);padding:28px 24px;text-align:center">' +
                    '<div style="width:64px;height:64px;background:rgba(127,255,212,0.15);border:2px solid var(--aqua-mint);' +
                        'border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px">' +
                        '<i data-lucide="check-circle" style="width:32px;height:32px;color:var(--aqua-mint)"></i>' +
                    '</div>' +
                    '<h4 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 4px">Admission Confirmed!</h4>' +
                    '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0">' + esc(patName) + '</p>' +
                '</div>' +
                '<div style="padding:20px 24px">' +
                    (admId ? '<div style="display:flex;justify-content:space-between;align-items:center;' +
                        'background:#f8fafc;border-radius:8px;padding:10px 14px;margin-bottom:10px">' +
                        '<span style="font-size:12px;color:#64748b">Admission ID</span>' +
                        '<span style="font-family:monospace;font-size:13px;font-weight:600;color:var(--midnight-blue)">' + esc(admId) + '</span>' +
                        '</div>' : '') +
                    '<div style="display:flex;justify-content:space-between;align-items:center;' +
                        'background:#f8fafc;border-radius:8px;padding:10px 14px;margin-bottom:10px">' +
                        '<span style="font-size:12px;color:#64748b">MRN</span>' +
                        '<span style="font-family:monospace;font-size:13px;font-weight:600;color:var(--midnight-blue)">' + esc(mrn) + '</span>' +
                    '</div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;' +
                        'background:var(--midnight-blue);border-radius:8px;padding:10px 14px;color:#fff">' +
                        '<span style="font-size:12px;font-weight:600;opacity:0.85;text-transform:uppercase">Total Charges</span>' +
                        '<span style="font-family:monospace;font-size:16px;font-weight:700">' + currency + ' ' + total.toLocaleString() + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="padding:0 20px 20px;display:flex;gap:10px">' +
                    '<button class="btn-outline" id="btnIpdAdmitSuccessClose" style="flex:1">Close</button>' +
                    '<button class="btn-primary" id="btnIpdPrintSlip" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px">' +
                        '<i data-lucide="printer" style="width:15px;height:15px"></i> Print Slip' +
                    '</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(modal);
        lucide.createIcons();
        var bsModal = new bootstrap.Modal(document.getElementById('ipdAdmitSuccessModal'));
        bsModal.show();

        $('#btnIpdAdmitSuccessClose').off('click').on('click', function() { bsModal.hide(); });
        document.getElementById('ipdAdmitSuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#ipdAdmitSuccessModal').remove();
        }, { once: true });

        $('#btnIpdPrintSlip').off('click').on('click', function() {
            var adm  = res.admission || { admissionId: admId, mrn: mrn };
            var bill = res.bill      || null;
            printIpdRegistrationSlip(adm, patient, bill);
        });
    }

    function refreshChargesGrid() {
        var total = calcGrandTotal();
        var rows = renderChargesGridRows();
        if (chargesGrid.length === 0) {
            rows = '<tr id="chargesEmptyRow"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add charges.</td></tr>';
        }
        $('#chargesGridBody').html(rows);
        $('#chargeTotalDisplay').text(hospitalInfo.currency + ' ' + total.toLocaleString());
        lucide.createIcons();
    }

    // ===== TAB 2: BILLING =====
    function _ipdBuildBillData() {
        return bills.map(function(b) {
            var adm = admissions.find(function(a) { return a.admissionId === b.admissionId; });
            var paidAmount = Number(b.paidAmount || 0);
            var totalAmount = Number(b.totalAmount || 0);
            return {
                billId: b.billId, admissionId: b.admissionId, mrn: b.mrn,
                patientName: b.patientName,
                bed: adm ? (adm.bed || '-') : '-',
                ward: adm ? (adm.ward || '') : '',
                department: adm ? (adm.department || '') : '',
                doctorName: adm ? (adm.doctorName || '') : '',
                admissionSource: adm ? (adm.admissionSource || '') : '',
                initialDiagnosis: adm ? (adm.initialDiagnosis || '') : '',
                admissionDate: adm ? adm.admissionDate : (b.createdAt || ''),
                status: adm ? (adm.status || 'Active') : 'Active',
                totalAmount: totalAmount, paidAmount: paidAmount,
                balance: totalAmount - paidAmount,
                paymentStatus: b.paymentStatus,
                roomCharges: Number(b.roomCharges || 0),
                doctorFee: Number(b.doctorFee || 0),
                history: b.history || []
            };
        });
    }

    function _ipdBillRenderPagination(source) {
        /* Sort: most recently admitted first */
        var sorted = source.slice().sort(function(a, b) {
            return new Date(b.admissionDate || b.createdAt || 0) - new Date(a.admissionDate || a.createdAt || 0);
        });
        var total = sorted.length;
        var pages = Math.max(1, Math.ceil(total / ipdBillPerPageVal));
        ipdBillCurrentPage = Math.min(ipdBillCurrentPage, pages);
        var start = (ipdBillCurrentPage - 1) * ipdBillPerPageVal;
        var slice = sorted.slice(start, start + ipdBillPerPageVal);
        var end = Math.min(start + ipdBillPerPageVal, total);

        var html = '';
        if (slice.length === 0) {
            html = '<tr><td colspan="13"><div class="empty-state"><i data-lucide="receipt"></i><p>No billing records found</p><p class="empty-sub">Admit a patient to generate billing records</p></div></td></tr>';
        } else {
            slice.forEach(function(b) {
                var wardBed = (b.ward || '-') + (b.bed && b.bed !== '-' ? ', ' + b.bed : '');
                var admDate = b.admissionDate ? new Date(b.admissionDate) : null;
                var dateStr = admDate ? admDate.toLocaleDateString() + ', ' + admDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-';
                var shortId = b.admissionId.replace(b.mrn + '-', '');
                html += '<tr class="clickable-row billing-row" data-bill-id="' + esc(b.billId) + '">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(b.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(b.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(shortId) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(b.department || '-') + '</td>' +
                    '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(b.doctorName || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(b.admissionSource || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(wardBed) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(b.initialDiagnosis || '') + '">' + esc(b.initialDiagnosis || '-') + '</td>' +
                    '<td class="text-right font-mono" style="font-size:13px;font-weight:600">' + hospitalInfo.currency + ' ' + b.totalAmount.toLocaleString() + '</td>' +
                    '<td class="text-right font-mono" style="font-size:13px;color:var(--color-success)">' + hospitalInfo.currency + ' ' + b.paidAmount.toLocaleString() + '</td>' +
                    '<td class="text-right font-mono" style="font-size:13px;font-weight:700;color:' + (b.balance > 0 ? 'var(--color-destructive)' : 'var(--color-success)') + '">' + hospitalInfo.currency + ' ' + b.balance.toLocaleString() + '</td>' +
                    '<td>' + statusBadge(b.paymentStatus) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + dateStr + '</td>' +
                    '</tr>';
            });
        }
        $('#billTableBody').html(html);
        $('#billTableInfo').text(total === 0 ? 'No results' : 'Showing ' + (start + 1) + '–' + end + ' of ' + total + ' records');
        var nums = '';
        for (var p = 1; p <= pages; p++) nums += '<button class="opd-page-num' + (p === ipdBillCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        $('#ipdBillPageNums').html(nums);
        $('#ipdBillPrevPage').prop('disabled', ipdBillCurrentPage <= 1);
        $('#ipdBillNextPage').prop('disabled', ipdBillCurrentPage >= pages);
        lucide.createIcons();
    }

    function renderBillingTab() {
        var search = ($('#billSearch').val() || '').toLowerCase();
        var billData = _ipdBuildBillData();

        var pending = billData.filter(function(b) { return b.paymentStatus === 'Pending'; });
        var paid    = billData.filter(function(b) { return b.paymentStatus === 'Paid'; });
        $('#statBillTotal').text(hospitalInfo.currency + ' ' + billData.reduce(function(s,b){return s+b.totalAmount;},0).toLocaleString());
        $('#statBillCollected').text(hospitalInfo.currency + ' ' + paid.reduce(function(s,b){return s+b.totalAmount;},0).toLocaleString());
        $('#statBillOutstanding').text(hospitalInfo.currency + ' ' + pending.reduce(function(s,b){return s+b.balance;},0).toLocaleString());
        $('#statBillCleared').text(paid.length);

        var base = ipdBillFiltered !== null ? ipdBillFiltered : billData;
        var filtered = base.filter(function(b) {
            return !search || (b.patientName||'').toLowerCase().indexOf(search) > -1 ||
                (b.admissionId||'').toLowerCase().indexOf(search) > -1 ||
                (b.mrn||'').toLowerCase().indexOf(search) > -1;
        });
        _ipdBillRenderPagination(filtered);
    }

    $(document).on('click', '#ipdBillPageNums .opd-page-num', function() { ipdBillCurrentPage = parseInt($(this).data('p')); renderBillingTab(); });
    $('#ipdBillPrevPage').on('click', function() { if (ipdBillCurrentPage > 1) { ipdBillCurrentPage--; renderBillingTab(); } });
    $('#ipdBillNextPage').on('click', function() { ipdBillCurrentPage++; renderBillingTab(); });
    $('#billSearch').on('input', function() { ipdBillCurrentPage = 1; renderBillingTab(); });

    $(document).on('click', '.billing-row', function() {
        window.ipdOpenBillingDetail($(this).data('bill-id'));
    });

    window.ipdOpenBillingDetail = function(billId) {
        var bill = bills.find(function(b) { return b.billId === billId; });
        if (!bill) return;
        var adm = admissions.find(function(a) { return a.admissionId === bill.admissionId; });
        var patient = patients.find(function(p) { return p.mrn === bill.mrn; });
        billingChargeFilter = 'All';
        billingAddlChargeFilter = 'All';
        renderIpdBillingDetailContent(adm, patient, bill);
    };

    var selectedBillingBillId = null;

    function renderIpdBillingDetailContent(admission, patient, bill) {
        var patientName = patient ? patient.name : (bill ? bill.patientName : (admission ? admission.patientName : 'Unknown'));
        var initials = getInitials(patientName);
        var totalAmount = bill ? Number(bill.totalAmount) : 0;
        var paidAmount = bill ? Number(bill.paidAmount || 0) : 0;
        var dueAmount = Math.max(0, totalAmount - paidAmount);
        var admDate = admission ? new Date(admission.admissionDate) : (bill ? new Date(bill.createdAt) : new Date());
        var admissionId = admission ? admission.admissionId : (bill ? bill.admissionId : '');
        var department = admission ? (admission.department || '') : '';
        var correctedFields = bill ? (bill.correctedFields || []) : [];

        var chargeItems = [];
        if (bill) {
            var dfRemoved = correctedFields.some(function(f) { return f.indexOf('doctorFee') >= 0 && f.indexOf('Removed') >= 0; });
            if (dfRemoved) {
                chargeItems.push({ chargeId: 'doctor-fee', date: admDate, description: 'Consultant Doctor Fee — ' + esc(admission ? admission.doctorName : ''), category: 'Doctor Fee', qty: 1, amount: 0, corrected: true, removed: true });
            } else if (Number(bill.doctorFee) > 0) {
                chargeItems.push({ chargeId: 'doctor-fee', date: admDate, description: 'Consultant Doctor Fee — ' + esc(admission ? admission.doctorName : ''), category: 'Doctor Fee', qty: 1, amount: Number(bill.doctorFee), corrected: false, removed: false });
            }
            if (bill.chargeIds && bill.chargeIds.length > 0) {
                bill.chargeIds.forEach(function(cid) {
                    var mc = masterCharges.find(function(m) { return String(m.chargeId || m.id) === String(cid); });
                    if (mc) {
                        chargeItems.push({ chargeId: String(mc.chargeId || mc.id), date: admDate, description: esc(mc.name), category: mc.category || 'Hospital Charges', qty: 1, amount: Number(mc.amount), corrected: false, removed: false });
                    }
                });
            } else if (Number(bill.roomCharges) > 0) {
                chargeItems.push({ chargeId: 'room', date: admDate, description: 'Room Charges', category: 'Room Charges', qty: 1, amount: Number(bill.roomCharges), corrected: false, removed: false });
            }
            correctedFields.forEach(function(f) {
                if (f.indexOf('Removed') < 0) return;
                if (f.indexOf('doctorFee') >= 0) return;
                if (f.indexOf('roomCharges') >= 0) return;
                var chargeMatch = f.match(/^charge_([^\s]+)/);
                if (chargeMatch) {
                    var removedCid = chargeMatch[1].replace(' (Removed)', '');
                    var alreadyShown = chargeItems.some(function(ci) { return ci.chargeId === removedCid; });
                    if (!alreadyShown) {
                        var mc = masterCharges.find(function(m) { return String(m.chargeId || m.id) === removedCid; });
                        var desc = mc ? esc(mc.name) : 'Charge ' + removedCid;
                        var cat = mc ? (mc.category || 'Hospital Charges') : 'Hospital Charges';
                        chargeItems.push({ chargeId: removedCid, date: admDate, description: desc, category: cat, qty: 1, amount: 0, corrected: true, removed: true });
                    }
                }
            });
            if (chargeItems.length === 0 && totalAmount > 0) {
                chargeItems.push({ chargeId: 'total', date: admDate, description: 'IPD Admission Charges', category: 'Admission', qty: 1, amount: totalAmount, corrected: false, removed: false });
            }
        }

        var categories = ['All'];
        chargeItems.forEach(function(ci) { if (categories.indexOf(ci.category) === -1) categories.push(ci.category); });

        var body = '' +
            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div style="flex:1">' +
                    '<h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                        '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(admissionId) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(department) + '</span>' +
                        (admission ? '<span style="font-size:12px;color:var(--color-muted-foreground)">Bed: ' + esc(admission.bed || '-') + (admission.ward ? ' (' + esc(admission.ward) + ')' : '') + '</span>' : '') +
                    '</div>' +
                '</div>' +
                '<div style="text-align:right">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground)">Admission Date</div>' +
                    '<div style="font-size:13px;font-weight:600">' + admDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>' +
                '</div>' +
            '</div>';

        if (!bill) {
            body += '<div style="background:var(--color-card);padding:40px 24px;border-radius:12px;border:1px solid var(--color-border);text-align:center">' +
                '<i data-lucide="receipt" style="width:48px;height:48px;color:var(--color-muted-foreground);margin-bottom:12px"></i>' +
                '<h4 style="margin:0 0 8px;font-size:16px;font-weight:600">No Billing Record</h4>' +
                '<p style="margin:0;font-size:14px;color:var(--color-muted-foreground)">No bill has been generated for this admission yet.</p>' +
            '</div>';
            var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%"><button class="btn-outline" data-bs-dismiss="offcanvas">Close</button><div></div></div>';
            $('#billingDetailBody').html(body);
            $('#billingDetailFooter').html(footer);
            lucide.createIcons();
            new bootstrap.Offcanvas(document.getElementById('billingDetailSheet')).show();
            return;
        }

        body += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px">' +
                '<div style="background:var(--color-card);padding:16px 20px;border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                    '<div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:4px">Total</div>' +
                    '<div style="font-size:20px;font-weight:700;color:var(--midnight-blue);font-family:\'Roobert\',sans-serif">' + hospitalInfo.currency + ' ' + totalAmount.toLocaleString() + '</div>' +
                '</div>' +
                '<div style="background:var(--color-card);padding:16px 20px;border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                    '<div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:4px">Paid</div>' +
                    '<div style="font-size:20px;font-weight:700;color:var(--color-success);font-family:\'Roobert\',sans-serif">' + hospitalInfo.currency + ' ' + paidAmount.toLocaleString() + '</div>' +
                '</div>' +
                '<div style="background:var(--color-card);padding:16px 20px;border-radius:10px;border:1px solid var(--color-border);text-align:center">' +
                    '<div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:4px">Due</div>' +
                    '<div style="font-size:20px;font-weight:700;color:' + (dueAmount > 0 ? 'var(--color-destructive)' : 'var(--color-success)') + ';font-family:\'Roobert\',sans-serif">' + hospitalInfo.currency + ' ' + dueAmount.toLocaleString() + '</div>' +
                '</div>' +
            '</div>';

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                '<h4 style="margin:0;font-size:15px;font-weight:700">Detailed Charges</h4>' +
                '<div style="display:flex;gap:6px;align-items:center" id="chargeFilterPills">' +
                    categories.map(function(cat) {
                        var isActive = billingChargeFilter === cat;
                        return '<button class="ipd-charge-filter-pill" data-filter="' + cat + '" style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid ' + (isActive ? 'var(--midnight-blue)' : 'var(--color-border)') + ';background:' + (isActive ? 'var(--midnight-blue)' : '#fff') + ';color:' + (isActive ? '#fff' : 'var(--color-muted-foreground)') + ';cursor:pointer">' + cat + '</button>';
                    }).join('') +
                '</div>' +
            '</div>' +
            '<table style="width:100%;border-collapse:collapse">' +
                '<thead><tr style="border-bottom:2px solid var(--color-border)">' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Date</th>' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Description</th>' +
                    '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Qty</th>' +
                    '<th style="text-align:right;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Amount</th>' +
                '</tr></thead>' +
                '<tbody id="chargeItemsBody">';

        var filteredCharges = billingChargeFilter === 'All' ? chargeItems : chargeItems.filter(function(ci) { return ci.category === billingChargeFilter; });
        var subtotal = 0;
        if (filteredCharges.length === 0) {
            body += '<tr><td colspan="4" style="padding:16px 4px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No charges found</td></tr>';
        } else {
            filteredCharges.forEach(function(ci) {
                subtotal += ci.amount * ci.qty;
                var isRemoved = ci.removed === true;
                var corrBadge = '';
                if (isRemoved) {
                    corrBadge = ' <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FFF7ED;color:#ea580c;border:1px solid #FDBA74;margin-left:6px"><i data-lucide="x-circle" style="width:10px;height:10px"></i> Excluded</span>';
                } else if (ci.corrected) {
                    corrBadge = ' <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FFF7ED;color:#ea580c;border:1px solid #FDBA74;margin-left:6px"><i data-lucide="pencil-line" style="width:10px;height:10px"></i> Corrected</span>';
                }
                var rowStyle = 'border-bottom:1px solid var(--color-border)' + (isRemoved || ci.corrected ? ';border-left:3px solid #ea580c' : '');
                if (isRemoved) rowStyle += ';opacity:0.6';
                var descStyle = isRemoved ? 'padding:12px 4px;font-size:13px;font-weight:500;text-decoration:line-through;color:var(--color-muted-foreground)' : 'padding:12px 4px;font-size:13px;font-weight:500';
                var amtStyle = isRemoved ? 'padding:12px 4px;font-size:13px;font-weight:600;text-align:right;font-family:monospace;color:#dc2626' : 'padding:12px 4px;font-size:13px;font-weight:600;text-align:right;font-family:monospace';
                body += '<tr style="' + rowStyle + '">' +
                    '<td style="padding:12px 4px;font-size:13px;color:var(--color-muted-foreground)">' + ci.date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ', ' + ci.date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }) + '</td>' +
                    '<td style="' + descStyle + '">' + ci.description + ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#F1F5F9;color:#475569;border:1px solid #E2E8F0;margin-left:6px">' + ci.category + '</span>' + corrBadge + '</td>' +
                    '<td style="padding:12px 4px;font-size:13px;text-align:center">' + ci.qty + '</td>' +
                    '<td style="' + amtStyle + '">' + hospitalInfo.currency + ' ' + (ci.amount * ci.qty).toLocaleString() + '</td>' +
                '</tr>';
            });
        }

        body += '</tbody>' +
                '<tfoot><tr>' +
                    '<td colspan="3" style="padding:12px 4px;text-align:right;font-size:14px;font-weight:600">Subtotal</td>' +
                    '<td style="padding:12px 4px;text-align:right;font-size:16px;font-weight:700;font-family:monospace;color:var(--midnight-blue)">' + hospitalInfo.currency + ' ' + subtotal.toLocaleString() + '</td>' +
                '</tr></tfoot>' +
            '</table></div>';

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border)">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                '<h4 style="margin:0;font-size:15px;font-weight:700">Payment Transactions</h4>' +
                (bill && (dueAmount > 0 || bill.paymentStatus === 'Partial') ? '<button class="btn-primary btn-sm" id="btnIpdAddPayment" style="font-size:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Payment</button>' : '') +
            '</div>' +
            '<table style="width:100%;border-collapse:collapse">' +
                '<thead><tr style="border-bottom:2px solid var(--color-border)">' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Date</th>' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Description</th>' +
                    '<th style="text-align:right;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Amount</th>' +
                    '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Mode</th>' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Receipt #</th>' +
                '</tr></thead>' +
                '<tbody>' +
                '<tr id="ipdPaymentsTbodyPlaceholder"><td colspan="5" style="padding:16px 4px;text-align:center;color:var(--color-muted-foreground);font-size:13px"><span class="spinner-border spinner-border-sm"></span> Loading...</td></tr>' +
            '</tbody></table></div>';

        var addlCharges = bill.additionalCharges || [];
        var addlItems = [];
        addlCharges.forEach(function(ac) {
            var acDate = ac.addedAt ? new Date(ac.addedAt) : new Date();
            var desc = ac.name || 'Additional Charge';
            if (ac.type === 'doctor_fee' && ac.doctorName) desc += ' — ' + ac.doctorName;
            var cat = ac.type === 'doctor_fee' ? 'Doctor Fee' : (ac.category || 'Hospital Charges');
            var acName = ac.name || 'Additional Charge';
            var addlRemoved = ac.removed === true || correctedFields.some(function(f) { return f.indexOf(acName) >= 0 && f.indexOf('Removed') >= 0; });
            addlItems.push({ date: acDate, description: esc(desc), category: cat, qty: ac.qty || 1, amount: Number(ac.net || 0), corrected: addlRemoved, removed: addlRemoved });
        });

        var addlCategories = ['All'];
        addlItems.forEach(function(ai) { if (addlCategories.indexOf(ai.category) === -1) addlCategories.push(ai.category); });

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-top:20px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                '<h4 style="margin:0;font-size:15px;font-weight:700">Additional Charges</h4>' +
                '<div style="display:flex;gap:6px;align-items:center">' +
                    addlCategories.map(function(cat) {
                        var isActive = billingAddlChargeFilter === cat;
                        return '<button class="ipd-addl-charge-filter-pill" data-filter="' + cat + '" style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid ' + (isActive ? 'var(--midnight-blue)' : 'var(--color-border)') + ';background:' + (isActive ? 'var(--midnight-blue)' : '#fff') + ';color:' + (isActive ? '#fff' : 'var(--color-muted-foreground)') + ';cursor:pointer">' + cat + '</button>';
                    }).join('') +
                    '<button class="btn-primary btn-sm" id="btnIpdAddAdditionalCharges" style="font-size:12px;margin-left:8px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Charges</button>' +
                '</div>' +
            '</div>' +
            '<table style="width:100%;border-collapse:collapse">' +
                '<thead><tr style="border-bottom:2px solid var(--color-border)">' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Date</th>' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Description</th>' +
                    '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Qty</th>' +
                    '<th style="text-align:right;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Amount</th>' +
                '</tr></thead>' +
                '<tbody>';

        var filteredAddl = billingAddlChargeFilter === 'All' ? addlItems : addlItems.filter(function(ai) { return ai.category === billingAddlChargeFilter; });
        var addlSubtotal = 0;
        if (filteredAddl.length === 0) {
            body += '<tr><td colspan="4" style="padding:16px 4px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No additional charges added yet</td></tr>';
        } else {
            filteredAddl.forEach(function(ai) {
                addlSubtotal += ai.amount * ai.qty;
                var aiRemoved = ai.removed === true;
                var addlCorrBadge = '';
                if (aiRemoved) {
                    addlCorrBadge = ' <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FFF7ED;color:#ea580c;border:1px solid #FDBA74;margin-left:6px"><i data-lucide="x-circle" style="width:10px;height:10px"></i> Excluded</span>';
                } else if (ai.corrected) {
                    addlCorrBadge = ' <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FFF7ED;color:#ea580c;border:1px solid #FDBA74;margin-left:6px"><i data-lucide="pencil-line" style="width:10px;height:10px"></i> Corrected</span>';
                }
                var aiRowStyle = 'border-bottom:1px solid var(--color-border)' + (aiRemoved || ai.corrected ? ';border-left:3px solid #ea580c' : '');
                if (aiRemoved) aiRowStyle += ';opacity:0.6';
                var aiDescStyle = aiRemoved ? 'padding:12px 4px;font-size:13px;font-weight:500;text-decoration:line-through;color:var(--color-muted-foreground)' : 'padding:12px 4px;font-size:13px;font-weight:500';
                var aiAmtStyle = aiRemoved ? 'padding:12px 4px;font-size:13px;font-weight:600;text-align:right;font-family:monospace;color:#dc2626' : 'padding:12px 4px;font-size:13px;font-weight:600;text-align:right;font-family:monospace';
                body += '<tr style="' + aiRowStyle + '">' +
                    '<td style="padding:12px 4px;font-size:13px;color:var(--color-muted-foreground)">' + ai.date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ', ' + ai.date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }) + '</td>' +
                    '<td style="' + aiDescStyle + '">' + ai.description + ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#F1F5F9;color:#475569;border:1px solid #E2E8F0;margin-left:6px">' + ai.category + '</span>' + addlCorrBadge + '</td>' +
                    '<td style="padding:12px 4px;font-size:13px;text-align:center">' + ai.qty + '</td>' +
                    '<td style="' + aiAmtStyle + '">' + hospitalInfo.currency + ' ' + (ai.amount * ai.qty).toLocaleString() + '</td>' +
                '</tr>';
            });
        }

        var addlTotal = addlItems.reduce(function(s, ai) { return s + ai.amount * ai.qty; }, 0);
        body += '</tbody>' +
                '<tfoot><tr>' +
                    '<td colspan="3" style="padding:12px 4px;text-align:right;font-size:14px;font-weight:600">Subtotal</td>' +
                    '<td style="padding:12px 4px;text-align:right;font-size:16px;font-weight:700;font-family:monospace;color:var(--midnight-blue)">' + hospitalInfo.currency + ' ' + (billingAddlChargeFilter === 'All' ? addlTotal : addlSubtotal).toLocaleString() + '</td>' +
                '</tr></tfoot>' +
            '</table></div>';

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>' +
            '<div style="display:flex;gap:8px">' +
                '<button class="btn-outline" id="btnIpdCorrectionLog" style="font-size:13px"><i data-lucide="history" style="width:14px;height:14px"></i> Correction Log</button>' +
                '<button class="btn-outline" id="btnIpdCorrection" style="font-size:13px;border-color:#ea580c;color:#ea580c"><i data-lucide="pencil-line" style="width:14px;height:14px"></i> Correction</button>' +
                '<button class="btn-primary" id="btnIpdGenerateBill" style="font-size:13px"><i data-lucide="file-text" style="width:14px;height:14px"></i> Generate Bill</button>' +
            '</div></div>';

        selectedBillingBillId = bill.billId;
        $('#billingDetailBody').html(body);
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('billingDetailSheet')).show();

        var allPaymentLookupItems = chargeItems.slice();
        var addlForLookup = bill ? (bill.additionalCharges || []) : [];
        addlForLookup.forEach(function(ac) {
            var desc = ac.name || 'Additional Charge';
            if (ac.type === 'doctor_fee' && ac.doctorName) desc += ' — ' + ac.doctorName;
            var cat = ac.type === 'doctor_fee' ? 'Doctor Fee' : (ac.category || 'Hospital Charges');
            var stableId = 'addl-' + (ac.type || 'charge') + '-' + (ac.name || '').replace(/\s+/g, '_') + '-' + (ac.addedAt || '0');
            allPaymentLookupItems.push({ chargeId: stableId, description: esc(desc), category: cat, qty: ac.qty || 1, amount: Number(ac.net || 0) });
        });

        if (bill) {
            $.get('/api/ipd/payments/' + encodeURIComponent(bill.billId), function(data) {
                var $placeholder = $('#ipdPaymentsTbodyPlaceholder');
                if (!$placeholder.length) return;
                var $tbody = $placeholder.closest('tbody');
                $placeholder.remove();
                if (!data || data.length === 0) {
                    $tbody.append('<tr><td colspan="5" style="padding:16px 4px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No payments recorded</td></tr>');
                } else {
                    var paymentTotal = 0;
                    data.forEach(function(p) {
                        var pDate = new Date(p.createdAt);
                        var mode = p.paymentMode || 'Cash';
                        var isRefund = mode === 'Refund' || Number(p.amount) < 0;
                        var modeBg = isRefund ? '#FEE2E2' : (mode === 'Cash' ? '#DCFCE7' : mode === 'Card' ? '#DBEAFE' : '#FEF3C7');
                        var modeColor = isRefund ? '#991B1B' : (mode === 'Cash' ? '#166534' : mode === 'Card' ? '#1E40AF' : '#92400E');
                        var pChargeIds = p.chargeIds || [];

                        if (isRefund) {
                            var refundAmt = Math.abs(Number(p.amount));
                            paymentTotal -= refundAmt;
                            var refundDesc = p.notes || p.reference || 'Refund (Bill Correction)';
                            $tbody.append('<tr style="border-bottom:1px solid var(--color-border);background:#FEF2F2">' +
                                '<td style="padding:10px 4px;font-size:13px;color:var(--color-muted-foreground)">' + pDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ', ' + pDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }) + '</td>' +
                                '<td style="padding:10px 4px;font-size:13px;font-weight:500;color:#991B1B"><i data-lucide="rotate-ccw" style="width:12px;height:12px;vertical-align:-2px;margin-right:4px"></i> ' + esc(refundDesc) + '</td>' +
                                '<td style="padding:10px 4px;font-size:13px;font-weight:600;text-align:right;color:var(--color-destructive);font-family:monospace">-' + hospitalInfo.currency + ' ' + refundAmt.toLocaleString() + '</td>' +
                                '<td style="padding:10px 4px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:500;background:' + modeBg + ';color:' + modeColor + '">Refund</span></td>' +
                                '<td style="padding:10px 4px;font-size:13px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(p.receiptNumber || p.paymentId || '-') + '</td>' +
                            '</tr>');
                            lucide.createIcons();
                        } else if (pChargeIds.length > 0) {
                            pChargeIds.forEach(function(cid) {
                                var match = allPaymentLookupItems.find(function(ci) { return String(ci.chargeId) === String(cid); });
                                var desc, lineAmt;
                                if (match) {
                                    desc = match.description;
                                    lineAmt = match.amount;
                                } else {
                                    var mcLookup = masterCharges.find(function(m) { return String(m.chargeId || m.id) === String(cid); });
                                    desc = mcLookup ? esc(mcLookup.name) : (cid === 'doctor-fee' ? 'Consultant Doctor Fee' : 'Charge #' + esc(String(cid)));
                                    lineAmt = 0;
                                }
                                paymentTotal += lineAmt;
                                var isExcluded = match ? match.removed === true : (lineAmt === 0);
                                var pDescStyle = isExcluded ? 'padding:10px 4px;font-size:13px;font-weight:500;text-decoration:line-through;color:var(--color-muted-foreground)' : 'padding:10px 4px;font-size:13px;font-weight:500';
                                var pAmtColor = isExcluded ? '#dc2626' : 'var(--color-success)';
                                var excludedBadge = isExcluded ? ' <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FFF7ED;color:#ea580c;border:1px solid #FDBA74;margin-left:6px"><i data-lucide="x-circle" style="width:10px;height:10px"></i> Excluded</span>' : '';
                                var pRowStyle = isExcluded ? 'border-bottom:1px solid var(--color-border);opacity:0.6;border-left:3px solid #ea580c' : 'border-bottom:1px solid var(--color-border)';

                                $tbody.append('<tr style="' + pRowStyle + '">' +
                                    '<td style="padding:10px 4px;font-size:13px;color:var(--color-muted-foreground)">' + pDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ', ' + pDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }) + '</td>' +
                                    '<td style="' + pDescStyle + '">' + desc + excludedBadge + '</td>' +
                                    '<td style="padding:10px 4px;font-size:13px;font-weight:600;text-align:right;color:' + pAmtColor + ';font-family:monospace">' + hospitalInfo.currency + ' ' + lineAmt.toLocaleString() + '</td>' +
                                    '<td style="padding:10px 4px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:500;background:' + modeBg + ';color:' + modeColor + '">' + esc(mode) + '</span></td>' +
                                    '<td style="padding:10px 4px;font-size:13px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(p.receiptNumber || p.paymentId || '-') + '</td>' +
                                '</tr>');
                                if (isExcluded) lucide.createIcons();
                            });
                        } else {
                            var pAmt = Number(p.amount);
                            paymentTotal += pAmt;
                            $tbody.append('<tr style="border-bottom:1px solid var(--color-border)">' +
                                '<td style="padding:10px 4px;font-size:13px;color:var(--color-muted-foreground)">' + pDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ', ' + pDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }) + '</td>' +
                                '<td style="padding:10px 4px;font-size:13px;font-weight:500">Payment</td>' +
                                '<td style="padding:10px 4px;font-size:13px;font-weight:600;text-align:right;color:var(--color-success);font-family:monospace">' + hospitalInfo.currency + ' ' + pAmt.toLocaleString() + '</td>' +
                                '<td style="padding:10px 4px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:500;background:' + modeBg + ';color:' + modeColor + '">' + esc(mode) + '</span></td>' +
                                '<td style="padding:10px 4px;font-size:13px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(p.receiptNumber || p.paymentId || '-') + '</td>' +
                            '</tr>');
                        }
                    });
                    var netPayColor = paymentTotal >= 0 ? 'var(--color-success)' : 'var(--color-destructive)';
                    $tbody.closest('table').append(
                        '<tfoot><tr style="border-top:2px solid var(--color-border)">' +
                            '<td colspan="2" style="padding:12px 4px;text-align:right;font-size:14px;font-weight:600">Net Paid</td>' +
                            '<td style="padding:12px 4px;text-align:right;font-size:16px;font-weight:700;font-family:monospace;color:' + netPayColor + '">' + hospitalInfo.currency + ' ' + paymentTotal.toLocaleString() + '</td>' +
                            '<td colspan="2"></td>' +
                        '</tr></tfoot>'
                    );
                }
                lucide.createIcons();
            }).fail(function() {
                var $placeholder = $('#ipdPaymentsTbodyPlaceholder');
                if ($placeholder.length) $placeholder.html('<td colspan="5" style="padding:16px 4px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No payments recorded</td>');
            });
        }

        $(document).off('click.ipdChargeFilter').on('click.ipdChargeFilter', '.ipd-charge-filter-pill', function() {
            billingChargeFilter = $(this).data('filter');
            renderIpdBillingDetailContent(admission, patient, bill);
        });
        $(document).off('click.ipdAddlFilter').on('click.ipdAddlFilter', '.ipd-addl-charge-filter-pill', function() {
            billingAddlChargeFilter = $(this).data('filter');
            renderIpdBillingDetailContent(admission, patient, bill);
        });
        $('#btnIpdAddAdditionalCharges').off('click').on('click', function() {
            renderIpdAddChargesView(admission, patient, bill);
        });
        $('#btnIpdAddPayment').off('click').on('click', function() {
            renderIpdAddPaymentView(admission, patient, bill, chargeItems);
        });
        $('#btnIpdCorrection').off('click').on('click', function() {
            renderIpdCorrectionEditView(admission, patient, bill);
        });
        $('#btnIpdCorrectionLog').off('click').on('click', function() {
            renderIpdCorrectionLogView(admission, patient, bill);
        });
        $('#btnIpdGenerateBill').off('click').on('click', function() {
            generateIpdBillPrint(admission, patient, bill, chargeItems, addlItems);
        });
    }

    function renderIpdAddChargesView(admission, patient, bill) {
        var patientName = patient ? patient.name : (bill ? bill.patientName : 'Unknown');
        var initials = getInitials(patientName);
        var admissionId = admission ? admission.admissionId : (bill ? bill.admissionId : '');
        var addlGrid = [];
        var addlDoctorFees = [];

        function calcAddlTotal() {
            var dt = addlDoctorFees.reduce(function(s, d) {
                return s + Math.max(0, (Number(d.fee) * (d.qty || 1)) - Number(d.discount || 0));
            }, 0);
            var ct = addlGrid.reduce(function(s, r) {
                return s + Math.max(0, (r.unitPrice * r.qty) - Number(r.discount || 0));
            }, 0);
            return dt + ct;
        }

        function renderAddChargesBody() {
            var body = '' +
                '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                    '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                    '<div style="flex:1">' +
                        '<h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                        '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                            '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(admissionId) + '</span>' +
                            '<span style="font-size:12px;background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(bill.billId) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div style="text-align:right"><div style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase">ADDITIONAL CHARGES</div><div style="font-size:11px;color:var(--color-muted-foreground)">Add doctors & charges</div></div>' +
                '</div>';

            body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700"><i data-lucide="stethoscope" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i> Doctor Fees</h4>' +
                    '<button class="btn btn-sm btn-outline-primary" id="btnIpdAddDoctorRow" style="font-size:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Doctor</button>' +
                '</div>' +
                '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden;margin-bottom:8px">' +
                '<table class="table table-sm mb-0" style="font-size:13px" id="ipdAddlDoctorFeeGrid"><thead><tr style="background:var(--midnight-blue);color:#fff">' +
                '<th style="text-align:center;width:50px;padding:10px 8px">Sr#</th><th style="padding:10px 8px">Doctor</th><th style="text-align:right;width:100px;padding:10px 8px">Fee</th><th style="text-align:right;width:100px;padding:10px 8px">Discount</th><th style="text-align:right;width:100px;padding:10px 8px">Amount</th><th style="width:40px;padding:10px 8px"></th></tr></thead><tbody id="ipdAddlDoctorFeeBody">';

            if (addlDoctorFees.length === 0) {
                body += '<tr id="ipdAddlDoctorEmpty"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No doctor fees added. Click "Add Doctor" to add.</td></tr>';
            } else {
                addlDoctorFees.forEach(function(d, idx) {
                    var net = Math.max(0, (Number(d.fee) * (d.qty || 1)) - Number(d.discount || 0));
                    body += '<tr><td style="text-align:center;vertical-align:middle">' + (idx + 1) + '</td>' +
                        '<td style="vertical-align:middle"><span style="font-weight:500">' + esc(d.doctorName) + '</span><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(d.department || '') + '</div></td>' +
                        '<td style="text-align:right;vertical-align:middle;font-family:monospace">' + hospitalInfo.currency + ' ' + Number(d.fee).toLocaleString() + '</td>' +
                        '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm ipd-addl-doc-discount" data-idx="' + idx + '" value="' + (d.discount || 0) + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
                        '<td style="text-align:right;vertical-align:middle;font-weight:600;font-family:monospace">' + hospitalInfo.currency + ' ' + net.toLocaleString() + '</td>' +
                        '<td style="text-align:center;vertical-align:middle"><button class="btn btn-sm p-0 border-0 ipd-addl-doc-delete" data-idx="' + idx + '" title="Remove"><i data-lucide="x-circle" style="width:16px;height:16px;color:#dc3545"></i></button></td></tr>';
                });
            }
            body += '</tbody></table></div></div>';

            body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700"><i data-lucide="receipt" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i> Hospital Charges</h4>' +
                    '<button class="btn btn-sm btn-outline-primary" id="btnIpdAddChargeRowAddl" style="font-size:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Row</button>' +
                '</div>' +
                '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden"><table class="table table-sm mb-0" style="font-size:13px"><thead><tr style="background:var(--midnight-blue);color:#fff">' +
                '<th style="text-align:center;width:50px;padding:10px 8px">Sr#</th><th style="padding:10px 8px">Charges</th><th style="text-align:center;width:80px;padding:10px 8px">QTY</th><th style="text-align:right;width:100px;padding:10px 8px">Discount</th><th style="text-align:right;width:120px;padding:10px 8px">Amount</th><th style="width:40px;padding:10px 8px"></th></tr></thead><tbody id="ipdAddlChargesGridBody">';

            if (addlGrid.length === 0) {
                body += '<tr id="ipdAddlChargesEmpty"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add.</td></tr>';
            } else {
                addlGrid.forEach(function(row, idx) {
                    var amt = Math.max(0, (row.unitPrice * row.qty) - Number(row.discount || 0));
                    body += '<tr><td style="text-align:center;vertical-align:middle">' + (idx + 1) + '</td>' +
                        '<td style="vertical-align:middle"><span style="font-weight:500">' + esc(row.name) + '</span><div style="font-size:11px;color:var(--color-muted-foreground);font-family:monospace">@ ' + hospitalInfo.currency + ' ' + Number(row.unitPrice).toLocaleString() + ' each</div></td>' +
                        '<td style="width:80px;vertical-align:middle"><input type="number" class="form-control form-control-sm ipd-addl-charge-qty" data-idx="' + idx + '" value="' + row.qty + '" min="1" style="text-align:center;font-family:monospace"></td>' +
                        '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm ipd-addl-charge-discount" data-idx="' + idx + '" value="' + (row.discount || 0) + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
                        '<td style="text-align:right;vertical-align:middle;font-weight:600;font-family:monospace;width:120px">' + hospitalInfo.currency + ' ' + amt.toLocaleString() + '</td>' +
                        '<td style="text-align:center;vertical-align:middle"><button class="btn btn-sm p-0 border-0 ipd-addl-charge-delete" data-idx="' + idx + '" title="Remove"><i data-lucide="x-circle" style="width:16px;height:16px;color:#dc3545"></i></button></td></tr>';
                });
            }
            body += '</tbody></table></div></div>';

            var total = calcAddlTotal();
            body += '<div style="background:var(--midnight-blue);padding:16px;border-radius:8px;color:#fff;display:flex;align-items:center;justify-content:space-between">' +
                '<div><p style="font-size:12px;font-weight:500;opacity:0.8;text-transform:uppercase;margin:0">Additional Total</p>' +
                '<p style="font-size:10px;opacity:0.6;margin:0">' + addlDoctorFees.length + ' DOCTOR(S) + ' + addlGrid.length + ' CHARGE(S)</p></div>' +
                '<div style="font-size:24px;font-weight:700;font-family:monospace">' + hospitalInfo.currency + ' ' + total.toLocaleString() + '</div></div>';
            return body;
        }

        function refreshAddChargesView() {
            $('#billingDetailBody').html(renderAddChargesBody());
            lucide.createIcons();
            bindAddChargesEvents();
        }

        function getAvailableAddlCharges() {
            var activeCharges = getActiveIpdCharges();
            var usedIds = addlGrid.map(function(r) { return r.id; });
            return activeCharges.filter(function(c) { return usedIds.indexOf(chargeKey(c)) === -1; });
        }

        function bindAddChargesEvents() {
            $('#btnIpdAddDoctorRow').off('click').on('click', function() {
                var doctorOpts = '';
                var activeDoctors = doctors.filter(function(d) { return d.status === 'ACTIVE'; });
                activeDoctors.forEach(function(d) {
                    var docName = d.firstName + ' ' + d.lastName;
                    var docIdVal = d.doctorId || d.id;
                    doctorOpts += '<option value="' + esc(docIdVal) + '" data-name="' + esc(docName) + '" data-dept="' + esc(d.department || '') + '">' + esc(docName) + ' — ' + esc(d.department || '') + '</option>';
                });
                $('#ipdAddlDoctorEmpty').remove();
                if ($('#ipdAddlDoctorNewRow').length) return;
                var newRow = '<tr id="ipdAddlDoctorNewRow" style="background:#f8f9fa">' +
                    '<td style="text-align:center;vertical-align:middle"><i data-lucide="plus-circle" style="width:16px;height:16px;color:var(--aqua-mint-dark)"></i></td>' +
                    '<td colspan="2" style="vertical-align:middle"><select id="ipdAddlDoctorSelect" class="form-select form-select-sm" style="font-size:13px"><option value="">Select doctor...</option>' + doctorOpts + '</select></td>' +
                    '<td colspan="3" style="vertical-align:middle;text-align:center;font-size:12px;color:var(--color-muted-foreground)" id="ipdAddlDocFeeInfo">Select a doctor to lookup fee</td>' +
                    '<td></td></tr>';
                $('#ipdAddlDoctorFeeBody').append(newRow);
                lucide.createIcons();

                $('#ipdAddlDoctorSelect').off('change').on('change', function() {
                    var docId = $(this).val();
                    if (!docId) { $('#ipdAddlDocFeeInfo').text('Select a doctor to lookup fee'); return; }
                    $('#ipdAddlDocFeeInfo').html('<span class="spinner-border spinner-border-sm"></span>');
                    $.get('/api/config/doctor-fees/lookup', { doctorId: docId, serviceType: 'IPD' }).done(function(config) {
                        var fee = config && config.fee ? Number(config.fee) : 0;
                        var docName = $('#ipdAddlDoctorSelect option:selected').data('name') || '';
                        var dept = $('#ipdAddlDoctorSelect option:selected').data('dept') || '';
                        if (fee > 0) {
                            addlDoctorFees.push({ doctorId: docId, doctorName: docName, department: dept, visitType: 'IPD', fee: fee, qty: 1, discount: 0 });
                            refreshAddChargesView();
                        } else {
                            $('#ipdAddlDocFeeInfo').html('<span style="color:var(--color-destructive);font-size:12px">No IPD fee configured for this doctor</span>');
                        }
                    }).fail(function() { $('#ipdAddlDocFeeInfo').html('<span style="color:var(--color-destructive);font-size:12px">Fee lookup failed</span>'); });
                });
            });

            $(document).off('input.ipdAddlDocDisc').on('input.ipdAddlDocDisc', '.ipd-addl-doc-discount', function() {
                addlDoctorFees[$(this).data('idx')].discount = parseFloat($(this).val()) || 0;
                refreshAddChargesView();
            });
            $(document).off('click.ipdAddlDocDel').on('click.ipdAddlDocDel', '.ipd-addl-doc-delete', function() {
                addlDoctorFees.splice($(this).data('idx'), 1);
                refreshAddChargesView();
            });

            $('#btnIpdAddChargeRowAddl').off('click').on('click', function() {
                var available = getAvailableAddlCharges();
                if (available.length === 0) { showToast('All available charges have already been added.', 'info'); return; }
                $('#ipdAddlChargesEmpty').remove();
                if ($('#ipdAddlChargesNewRow').length) return;
                var opts = '';
                available.forEach(function(c) { opts += '<option value="' + chargeKey(c) + '" data-amount="' + c.amount + '">' + esc(c.name) + ' — ' + hospitalInfo.currency + ' ' + Number(c.amount).toLocaleString() + '</option>'; });
                var row = '<tr id="ipdAddlChargesNewRow" style="background:#f8f9fa"><td style="text-align:center;vertical-align:middle"><i data-lucide="plus-circle" style="width:16px;height:16px;color:var(--aqua-mint-dark)"></i></td><td colspan="4" style="vertical-align:middle"><select class="form-select form-select-sm ipd-addl-new-charge-select" style="font-size:13px"><option value="">Select a charge to add...</option>' + opts + '</select></td><td></td></tr>';
                $('#ipdAddlChargesGridBody').append(row);
                lucide.createIcons();
            });

            $(document).off('change.ipdAddlNewCharge').on('change.ipdAddlNewCharge', '.ipd-addl-new-charge-select', function() {
                var cid = $(this).val();
                if (!cid) return;
                var activeCharges = getActiveIpdCharges();
                var charge = activeCharges.find(function(c) { return chargeKey(c) === cid; });
                if (charge) addlGrid.push({ id: cid, name: charge.name, qty: 1, discount: 0, unitPrice: Number(charge.amount) });
                refreshAddChargesView();
            });
            $(document).off('input.ipdAddlChargeQty').on('input.ipdAddlChargeQty', '.ipd-addl-charge-qty', function() {
                addlGrid[$(this).data('idx')].qty = Math.max(1, parseInt($(this).val()) || 1);
                refreshAddChargesView();
            });
            $(document).off('input.ipdAddlChargeDisc').on('input.ipdAddlChargeDisc', '.ipd-addl-charge-discount', function() {
                addlGrid[$(this).data('idx')].discount = parseFloat($(this).val()) || 0;
                refreshAddChargesView();
            });
            $(document).off('click.ipdAddlChargeDel').on('click.ipdAddlChargeDel', '.ipd-addl-charge-delete', function() {
                addlGrid.splice($(this).data('idx'), 1);
                refreshAddChargesView();
            });
        }

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" id="btnIpdBackFromAddlCharges" style="font-size:13px"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button>' +
            '<button class="btn-primary" id="btnIpdSaveAddlCharges" style="font-size:13px"><i data-lucide="check" style="width:14px;height:14px"></i> Save Charges</button></div>';

        $('#billingDetailBody').html(renderAddChargesBody());
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();
        bindAddChargesEvents();

        $('#btnIpdBackFromAddlCharges').off('click').on('click', function() {
            renderIpdBillingDetailContent(admission, patient, bill);
        });

        $('#btnIpdSaveAddlCharges').off('click').on('click', function() {
            if (addlDoctorFees.length === 0 && addlGrid.length === 0) { showToast('Please add at least one doctor fee or charge', 'error'); return; }
            var items = [];
            addlDoctorFees.forEach(function(d) { items.push({ type: 'doctor_fee', name: 'Consultant Doctor Fee', doctorId: d.doctorId, doctorName: d.doctorName, visitType: d.visitType, amount: Number(d.fee), qty: d.qty || 1, discount: Number(d.discount || 0) }); });
            addlGrid.forEach(function(r) { items.push({ type: 'hospital_charge', name: r.name, chargeId: r.id, category: r.category || 'Hospital Charges', amount: r.unitPrice, qty: r.qty, discount: Number(r.discount || 0) }); });

            var $btn = $('#btnIpdSaveAddlCharges');
            $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');
            $.ajax({
                url: '/api/ipd/bills/' + encodeURIComponent(bill.billId) + '/additional-charges',
                method: 'POST', contentType: 'application/json',
                data: JSON.stringify({ items: items }),
                success: function(resp) {
                    var updatedBill = resp.bill || bill;
                    var idx = bills.findIndex(function(b) { return b.billId === bill.billId; });
                    if (idx !== -1) bills[idx] = updatedBill;
                    var aIdx = admissions.findIndex(function(a) { return a.admissionId === (admission ? admission.admissionId : bill.admissionId); });
                    if (aIdx !== -1) admissions[aIdx].paymentStatus = updatedBill.paymentStatus;
                    renderBillingTab();
                    renderIpdBillingDetailContent(admission, patient, updatedBill);
                    showToast('Additional charges saved successfully', 'success');
                },
                error: function(xhr) {
                    showToast(xhr.responseJSON ? xhr.responseJSON.error : 'Failed to save additional charges', 'error');
                    $btn.prop('disabled', false).html('<i data-lucide="check" style="width:14px;height:14px"></i> Save Charges');
                    lucide.createIcons();
                }
            });
        });
    }

    function renderIpdAddPaymentView(admission, patient, bill, chargeItems) {
        var patientName = patient ? patient.name : (bill ? bill.patientName : 'Unknown');
        var initials = getInitials(patientName);
        var totalAmount = Number(bill.totalAmount);
        var paidAmount = Number(bill.paidAmount || 0);
        var dueAmount = Math.max(0, totalAmount - paidAmount);
        var admissionId = admission ? admission.admissionId : (bill ? bill.admissionId : '');

        var allChargeItems = chargeItems.slice();
        var addlCharges = bill.additionalCharges || [];
        addlCharges.forEach(function(ac) {
            var desc = ac.name || 'Additional Charge';
            if (ac.type === 'doctor_fee' && ac.doctorName) desc += ' — ' + ac.doctorName;
            var cat = ac.type === 'doctor_fee' ? 'Doctor Fee' : (ac.category || 'Hospital Charges');
            var stableId = 'addl-' + (ac.type || 'charge') + '-' + (ac.name || '').replace(/\s+/g, '_') + '-' + (ac.addedAt || '0');
            allChargeItems.push({ chargeId: stableId, date: ac.addedAt ? new Date(ac.addedAt) : new Date(), description: esc(desc), category: cat, qty: ac.qty || 1, amount: Number(ac.net || 0) });
        });

        $('#billingDetailBody').html('<div style="padding:40px;text-align:center"><span class="spinner-border"></span><div style="margin-top:12px;font-size:13px;color:var(--color-muted-foreground)">Loading payment details...</div></div>');
        $('#billingDetailFooter').html('');

        $.get('/api/ipd/payments/' + encodeURIComponent(bill.billId), function(existingPayments) {
            var paidChargeIds = [];
            (existingPayments || []).forEach(function(p) { if (p.chargeIds && p.chargeIds.length) p.chargeIds.forEach(function(cid) { paidChargeIds.push(String(cid)); }); });
            var unpaidItems = allChargeItems.filter(function(ci) { return paidChargeIds.indexOf(String(ci.chargeId)) === -1; });
            buildIpdPaymentForm(admission, patient, bill, unpaidItems, dueAmount, initials, patientName);
        }).fail(function() {
            buildIpdPaymentForm(admission, patient, bill, allChargeItems, dueAmount, initials, patientName);
        });
    }

    function buildIpdPaymentForm(admission, patient, bill, unpaidItems, dueAmount, initials, patientName) {
        var admissionId = admission ? admission.admissionId : (bill ? bill.admissionId : '');
        var body = '' +
            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div style="flex:1">' +
                    '<h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                        '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(admissionId) + '</span>' +
                        '<span style="font-size:12px;background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(bill.billId) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="text-align:right"><div style="font-size:11px;color:var(--color-muted-foreground)">Outstanding</div><div style="font-size:20px;font-weight:700;color:var(--color-destructive);font-family:monospace">' + hospitalInfo.currency + ' ' + dueAmount.toLocaleString() + '</div></div>' +
            '</div>';

        if (unpaidItems.length === 0) {
            body += '<div style="background:var(--color-card);padding:40px 24px;border-radius:12px;border:1px solid var(--color-border);text-align:center">' +
                '<i data-lucide="check-circle-2" style="width:48px;height:48px;color:var(--color-success);margin-bottom:12px"></i>' +
                '<h4 style="margin:0 0 8px;font-size:16px;font-weight:600">All Charges Paid</h4>' +
                '<p style="margin:0;font-size:14px;color:var(--color-muted-foreground)">All itemized charges have been fully paid.</p></div>';
        } else {
            body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700"><i data-lucide="list-checks" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i> Select Charges to Pay</h4>' +
                    '<button class="btn-outline btn-sm" id="btnIpdSelectAllCharges" style="font-size:12px">Select All</button>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid var(--color-border)">' +
                    '<th style="text-align:center;padding:8px 4px;width:40px"><input type="checkbox" id="ipdChkAllCharges" style="width:16px;height:16px;accent-color:var(--aqua-mint)"></th>' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Description</th>' +
                    '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Category</th>' +
                    '<th style="text-align:right;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Amount</th>' +
                '</tr></thead><tbody>';

            unpaidItems.forEach(function(ci, idx) {
                var ck = ci.chargeId || ('item-' + idx);
                body += '<tr style="border-bottom:1px solid var(--color-border)">' +
                    '<td style="padding:10px 4px;text-align:center"><input type="checkbox" class="ipd-pay-charge-chk" data-idx="' + idx + '" data-key="' + esc(ck) + '" data-amount="' + ci.amount + '" style="width:16px;height:16px;accent-color:var(--aqua-mint)"></td>' +
                    '<td style="padding:10px 4px;font-size:13px;font-weight:500">' + ci.description + '</td>' +
                    '<td style="padding:10px 4px;text-align:center"><span style="font-size:11px;padding:2px 8px;border-radius:4px;background:#F3F4F6;color:#374151">' + esc(ci.category) + '</span></td>' +
                    '<td style="padding:10px 4px;text-align:right;font-family:monospace;font-size:13px;font-weight:600">' + hospitalInfo.currency + ' ' + ci.amount.toLocaleString() + '</td></tr>';
            });

            body += '</tbody><tfoot><tr style="border-top:2px solid var(--color-border)"><td colspan="3" style="padding:12px 4px;text-align:right;font-size:14px;font-weight:700">Selected Total</td>' +
                '<td style="padding:12px 4px;text-align:right;font-size:16px;font-weight:700;font-family:monospace;color:var(--midnight-blue)" id="ipdPaySelectedTotal">' + hospitalInfo.currency + ' 0</td></tr></tfoot></table></div>';

            body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border)">' +
                '<h4 style="margin:0 0 16px;font-size:15px;font-weight:700"><i data-lucide="credit-card" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i> Payment Details</h4>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
                    '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Payment Method *</label>' +
                        '<select id="ipdPaymentMode" class="form-control" style="font-size:13px"><option value="Cash">Cash</option><option value="Card">Card (Credit/Debit)</option><option value="Online">Online Payment</option><option value="Insurance">Insurance</option></select></div>' +
                    '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reference / Transaction ID</label>' +
                        '<input type="text" id="ipdPaymentReference" class="form-control" placeholder="Optional reference" style="font-size:13px"></div>' +
                '</div>' +
                '<div class="form-group" style="margin-top:12px"><label style="font-size:12px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Notes</label>' +
                    '<textarea id="ipdPaymentNotes" class="form-control" rows="2" placeholder="Optional payment notes" style="font-size:13px;resize:none"></textarea></div></div>';
        }

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" id="btnIpdBackToBilling" style="font-size:13px"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button>' +
            (unpaidItems.length > 0 ? '<button class="btn-primary" id="btnIpdSavePayment" disabled style="font-size:13px;opacity:0.5"><i data-lucide="check" style="width:14px;height:14px"></i> Save Payment</button>' : '') +
        '</div>';

        $('#billingDetailBody').html(body);
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();

        function updateSelectedTotal() {
            var total = 0, anyChecked = false;
            $('.ipd-pay-charge-chk:checked').each(function() { total += Number($(this).data('amount')); anyChecked = true; });
            if (total > dueAmount) total = dueAmount;
            $('#ipdPaySelectedTotal').text(hospitalInfo.currency + ' ' + total.toLocaleString());
            $('#btnIpdSavePayment').prop('disabled', !anyChecked).css('opacity', anyChecked ? '1' : '0.5');
            $('#ipdChkAllCharges').prop('checked', $('.ipd-pay-charge-chk').length === $('.ipd-pay-charge-chk:checked').length);
        }

        $(document).off('change.ipdPayChk').on('change.ipdPayChk', '.ipd-pay-charge-chk', updateSelectedTotal);
        $('#ipdChkAllCharges').off('change').on('change', function() { $('.ipd-pay-charge-chk').prop('checked', $(this).is(':checked')); updateSelectedTotal(); });
        $('#btnIpdSelectAllCharges').off('click').on('click', function() {
            var allChecked = $('.ipd-pay-charge-chk').length === $('.ipd-pay-charge-chk:checked').length;
            $('.ipd-pay-charge-chk').prop('checked', !allChecked);
            $('#ipdChkAllCharges').prop('checked', !allChecked);
            updateSelectedTotal();
        });

        $('#btnIpdBackToBilling').off('click').on('click', function() {
            renderIpdBillingDetailContent(admission, patient, bill);
        });

        $('#btnIpdSavePayment').off('click').on('click', function() {
            var selectedChargeIds = [], selectedAmount = 0;
            $('.ipd-pay-charge-chk:checked').each(function() { selectedChargeIds.push(String($(this).data('key'))); selectedAmount += Number($(this).data('amount')); });
            if (selectedAmount > dueAmount) selectedAmount = dueAmount;
            if (selectedChargeIds.length === 0) return;
            var $btn = $(this);
            $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');
            $.ajax({
                url: '/api/ipd/payments', method: 'POST', contentType: 'application/json',
                data: JSON.stringify({
                    billId: bill.billId, admissionId: admission ? admission.admissionId : bill.admissionId,
                    mrn: bill.mrn || (admission ? admission.mrn : ''), amount: selectedAmount,
                    paymentMode: $('#ipdPaymentMode').val(), reference: $('#ipdPaymentReference').val(),
                    notes: $('#ipdPaymentNotes').val(), chargeIds: selectedChargeIds
                }),
                success: function(resp) {
                    var updatedBill = resp.bill || bill;
                    var idx = bills.findIndex(function(b) { return b.billId === bill.billId; });
                    if (idx !== -1) bills[idx] = updatedBill;
                    var aIdx = admissions.findIndex(function(a) { return a.admissionId === (admission ? admission.admissionId : bill.admissionId); });
                    if (aIdx !== -1) admissions[aIdx].paymentStatus = updatedBill.paymentStatus;
                    renderBillingTab();
                    renderIpdBillingDetailContent(admission, patient, updatedBill);
                    showToast('Payment recorded successfully', 'success');
                },
                error: function(xhr) {
                    showToast(xhr.responseJSON ? xhr.responseJSON.error : 'Failed to save payment', 'error');
                    $btn.prop('disabled', false).html('<i data-lucide="check" style="width:14px;height:14px"></i> Save Payment');
                    lucide.createIcons();
                }
            });
        });
    }

    function renderIpdCorrectionEditView(admission, patient, bill) {
        var patientName = patient ? patient.name : (bill ? bill.patientName : 'Unknown');
        var initials = getInitials(patientName);
        var currency = hospitalInfo.currency || 'PKR';
        var admissionId = admission ? admission.admissionId : (bill ? bill.admissionId : '');

        var allCharges = [];
        var correctedFields = bill ? (bill.correctedFields || []) : [];
        if (bill) {
            if (Number(bill.doctorFee) > 0) {
                var alreadyRemoved = correctedFields.some(function(f) { return f.indexOf('doctorFee') >= 0 && f.indexOf('Removed') >= 0; });
                allCharges.push({ type: 'doctor_fee', field: 'doctorFee', chargeId: null, description: 'Consultant Doctor Fee — ' + esc(admission ? admission.doctorName : ''), category: 'Doctor Fee', amount: Number(bill.doctorFee), removed: alreadyRemoved });
            }
            if (bill.chargeIds && bill.chargeIds.length > 0) {
                bill.chargeIds.forEach(function(cid) {
                    var mc = masterCharges.find(function(m) { return String(m.chargeId || m.id) === String(cid); });
                    if (mc) {
                        var alreadyRemoved = correctedFields.some(function(f) { return f.indexOf('charge_' + cid) >= 0 && f.indexOf('Removed') >= 0; });
                        allCharges.push({ type: 'master_charge', field: 'charge_' + cid, chargeId: cid, description: esc(mc.name), category: mc.category || 'Hospital Charges', amount: Number(mc.amount), removed: alreadyRemoved });
                    }
                });
            } else if (Number(bill.roomCharges) > 0) {
                var alreadyRemoved = correctedFields.some(function(f) { return f.indexOf('roomCharges') >= 0 && f.indexOf('Removed') >= 0; });
                allCharges.push({ type: 'room', field: 'roomCharges', chargeId: null, description: 'Room Charges', category: 'Room Charges', amount: Number(bill.roomCharges), removed: alreadyRemoved });
            }
        }

        var addlCharges = bill.additionalCharges || [];

        var body = '' +
            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div style="flex:1"><h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                        '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(admissionId) + '</span>' +
                        '<span style="font-size:12px;background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;padding:2px 8px;border-radius:4px;font-weight:600">CORRECTION MODE</span>' +
                    '</div></div></div>' +
            '<div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:8px">' +
                '<i data-lucide="alert-triangle" style="width:16px;height:16px;color:#92400E;flex-shrink:0"></i>' +
                '<span style="font-size:13px;color:#92400E;font-weight:500">Select charges to remove from this bill. Removed charges will show as excluded with zero amount. Any payments against removed charges will be automatically refunded.</span></div>';

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
            '<h4 style="margin:0 0 16px;font-size:15px;font-weight:700"><i data-lucide="receipt" style="width:16px;height:16px;margin-right:6px;vertical-align:-2px"></i> Detailed Charges</h4>' +
            '<table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid var(--color-border)">' +
                '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue)">Description</th>' +
                '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue);width:100px">Amount</th>' +
                '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue);width:100px">Action</th>' +
            '</tr></thead><tbody>';

        allCharges.forEach(function(ci, idx) {
            var isRemoved = ci.removed;
            var rowStyle = isRemoved ? 'border-bottom:1px solid var(--color-border);opacity:0.5;text-decoration:line-through' : 'border-bottom:1px solid var(--color-border)';
            body += '<tr style="' + rowStyle + '">' +
                '<td style="padding:10px 4px;font-size:13px;font-weight:500">' + ci.description + ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#F1F5F9;color:#475569;border:1px solid #E2E8F0;margin-left:6px">' + ci.category + '</span>' +
                (isRemoved ? ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:rgba(234,88,12,0.1);color:#ea580c;border:1px solid rgba(234,88,12,0.2);margin-left:4px">Already Removed</span>' : '') + '</td>' +
                '<td style="padding:10px 4px;text-align:center;font-size:13px;font-family:monospace;font-weight:600">' + (isRemoved ? '<span style="color:#dc2626">0</span>' : currency + ' ' + Number(ci.amount).toLocaleString()) + '</td>' +
                '<td style="padding:10px 4px;text-align:center">' +
                (isRemoved ? '<span style="font-size:11px;color:var(--color-muted-foreground);font-style:italic">Excluded</span>' :
                    '<button class="ipd-btn-remove-charge" data-idx="' + idx + '" data-type="detailed" style="background:#FEF2F2;color:#dc2626;border:1px solid #FECACA;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px"><i data-lucide="x-circle" style="width:13px;height:13px"></i> Remove</button>') + '</td></tr>';
        });
        body += '</tbody></table></div>';

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
            '<h4 style="margin:0 0 16px;font-size:15px;font-weight:700"><i data-lucide="plus-circle" style="width:16px;height:16px;margin-right:6px;vertical-align:-2px"></i> Additional Charges</h4>';

        if (addlCharges.length === 0) {
            body += '<p style="text-align:center;color:var(--color-muted-foreground);font-size:13px;padding:16px 0">No additional charges</p>';
        } else {
            body += '<table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid var(--color-border)">' +
                '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue)">Description</th>' +
                '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue);width:100px">Amount</th>' +
                '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue);width:100px">Action</th></tr></thead><tbody>';
            addlCharges.forEach(function(ac, idx) {
                var desc = ac.name || 'Additional Charge';
                if (ac.type === 'doctor_fee' && ac.doctorName) desc += ' — ' + ac.doctorName;
                var cat = ac.type === 'doctor_fee' ? 'Doctor Fee' : (ac.category || 'Hospital Charges');
                var acName = ac.name || 'Additional Charge';
                var isRemoved = correctedFields.some(function(f) { return f.indexOf(acName) >= 0 && f.indexOf('Removed') >= 0; });
                var rowStyle = isRemoved ? 'border-bottom:1px solid var(--color-border);opacity:0.5;text-decoration:line-through' : 'border-bottom:1px solid var(--color-border)';
                body += '<tr style="' + rowStyle + '">' +
                    '<td style="padding:10px 4px;font-size:13px;font-weight:500">' + esc(desc) + ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#F1F5F9;color:#475569;border:1px solid #E2E8F0;margin-left:6px">' + cat + '</span>' +
                    (isRemoved ? ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:rgba(234,88,12,0.1);color:#ea580c;border:1px solid rgba(234,88,12,0.2);margin-left:4px">Already Removed</span>' : '') + '</td>' +
                    '<td style="padding:10px 4px;text-align:center;font-size:13px;font-family:monospace;font-weight:600">' + (isRemoved ? '<span style="color:#dc2626">0</span>' : currency + ' ' + Number(ac.net || 0).toLocaleString()) + '</td>' +
                    '<td style="padding:10px 4px;text-align:center">' +
                    (isRemoved ? '<span style="font-size:11px;color:var(--color-muted-foreground);font-style:italic">Excluded</span>' :
                        '<button class="ipd-btn-remove-charge" data-idx="' + idx + '" data-type="additional" style="background:#FEF2F2;color:#dc2626;border:1px solid #FECACA;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px"><i data-lucide="x-circle" style="width:13px;height:13px"></i> Remove</button>') + '</td></tr>';
            });
            body += '</tbody></table>';
        }
        body += '</div>';

        body += '<div id="ipdCorrectionRemoveList" style="display:none;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px 24px;margin-bottom:20px">' +
            '<h4 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#dc2626"><i data-lucide="trash-2" style="width:16px;height:16px;margin-right:6px;vertical-align:-2px"></i> Charges to Remove</h4>' +
            '<div id="ipdCorrectionRemoveItems"></div></div>';

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border)">' +
            '<h4 style="margin:0 0 12px;font-size:15px;font-weight:700"><i data-lucide="message-square" style="width:16px;height:16px;margin-right:6px;vertical-align:-2px"></i> Correction Reason</h4>' +
            '<textarea class="form-control" id="ipdCorrectionReason" rows="3" placeholder="Enter the reason for this correction (optional)" style="font-size:13px;resize:vertical"></textarea></div>';

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" id="btnIpdCorrectionBack"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button>' +
            '<button class="btn-primary" id="btnIpdSaveCorrection" style="font-size:13px;background:#ea580c;border-color:#ea580c" disabled><i data-lucide="check" style="width:14px;height:14px"></i> Save Corrections</button></div>';

        $('#billingDetailBody').html(body);
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();

        var removals = [];
        function updateRemoveList() {
            if (removals.length === 0) { $('#ipdCorrectionRemoveList').hide(); $('#btnIpdSaveCorrection').prop('disabled', true); return; }
            var html = '';
            removals.forEach(function(r, ri) {
                html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#fff;border-radius:6px;border:1px solid #FECACA;margin-bottom:6px">' +
                    '<div style="font-size:13px;font-weight:500;color:#dc2626"><i data-lucide="minus-circle" style="width:14px;height:14px;margin-right:6px;vertical-align:-2px"></i>' + r.description + ' <span style="font-family:monospace;font-size:12px">(' + currency + ' ' + Number(r.amount).toLocaleString() + ')</span></div>' +
                    '<button class="ipd-btn-undo-remove" data-ri="' + ri + '" style="background:none;border:1px solid #93C5FD;color:#2563EB;border-radius:4px;padding:2px 10px;font-size:11px;font-weight:600;cursor:pointer">Undo</button></div>';
            });
            $('#ipdCorrectionRemoveItems').html(html);
            $('#ipdCorrectionRemoveList').show();
            $('#btnIpdSaveCorrection').prop('disabled', false);
            lucide.createIcons();
        }

        $(document).off('click.ipdCorrRemove').on('click.ipdCorrRemove', '.ipd-btn-remove-charge', function() {
            var idx = Number($(this).data('idx')), type = $(this).data('type'), item;
            if (type === 'detailed') {
                item = allCharges[idx];
                removals.push({ type: 'detailed', idx: idx, field: item.field, chargeId: item.chargeId, description: item.description, category: item.category, amount: item.amount, chargeType: item.type });
            } else {
                item = addlCharges[idx];
                var desc = item.name || 'Additional Charge';
                if (item.type === 'doctor_fee' && item.doctorName) desc += ' — ' + item.doctorName;
                removals.push({ type: 'additional', idx: idx, description: desc, name: item.name || 'Additional Charge', amount: Number(item.net || 0) });
            }
            $(this).closest('tr').css({ opacity: '0.5', textDecoration: 'line-through' });
            $(this).replaceWith('<span style="font-size:11px;color:#dc2626;font-weight:600">Marked for removal</span>');
            updateRemoveList();
        });

        $(document).off('click.ipdCorrUndo').on('click.ipdCorrUndo', '.ipd-btn-undo-remove', function() {
            removals.splice(Number($(this).data('ri')), 1);
            renderIpdCorrectionEditView(admission, patient, bill);
        });

        $('#btnIpdCorrectionBack').off('click').on('click', function() {
            $(document).off('click.ipdCorrRemove');
            $(document).off('click.ipdCorrUndo');
            renderIpdBillingDetailContent(admission, patient, bill);
        });

        $('#btnIpdSaveCorrection').off('click').on('click', function() {
            if (removals.length === 0) { showToast('No charges selected for removal', 'info'); return; }
            var corrections = [], removeChargeIds = [], newDoctorFee = null, newRoomCharges = null, updatedAdditional = null, hasAddlChanges = false;
            var addlCopy = JSON.parse(JSON.stringify(addlCharges));
            removals.forEach(function(r) {
                if (r.type === 'detailed') {
                    corrections.push({ section: 'Detailed Charges', fieldName: r.field + ' (Removed)', oldValue: String(r.amount), newValue: '0' });
                    if (r.chargeType === 'doctor_fee') newDoctorFee = 0;
                    else if (r.chargeType === 'master_charge' && r.chargeId) removeChargeIds.push(r.chargeId);
                    else if (r.chargeType === 'room') newRoomCharges = 0;
                } else {
                    corrections.push({ section: 'Additional Charges', fieldName: r.name + ' (Removed)', oldValue: String(r.amount), newValue: '0' });
                    addlCopy[r.idx].net = 0; addlCopy[r.idx].amount = 0; addlCopy[r.idx].removed = true; hasAddlChanges = true;
                }
            });
            if (hasAddlChanges) updatedAdditional = addlCopy;
            var payload = { corrections: corrections, reason: ($('#ipdCorrectionReason').val() || '').trim() };
            if (newDoctorFee !== null) payload.doctorFee = newDoctorFee;
            if (newRoomCharges !== null) payload.roomCharges = newRoomCharges;
            if (removeChargeIds.length > 0) payload.removeChargeIds = removeChargeIds;
            if (updatedAdditional !== null) payload.additionalCharges = updatedAdditional;

            var $btn = $('#btnIpdSaveCorrection');
            $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');
            $.ajax({
                url: '/api/ipd/bills/' + encodeURIComponent(bill.billId) + '/corrections',
                method: 'POST', contentType: 'application/json', data: JSON.stringify(payload),
                success: function(resp) {
                    $(document).off('click.ipdCorrRemove');
                    $(document).off('click.ipdCorrUndo');
                    showToast('Charges removed successfully', 'success');
                    if (resp.bill) {
                        var idx = bills.findIndex(function(b) { return b.billId === bill.billId; });
                        if (idx >= 0) bills[idx] = resp.bill;
                        var aIdx = admissions.findIndex(function(a) { return a.admissionId === (admission ? admission.admissionId : bill.admissionId); });
                        if (aIdx >= 0 && resp.bill.paymentStatus) admissions[aIdx].paymentStatus = resp.bill.paymentStatus;
                        renderBillingTab();
                        renderIpdBillingDetailContent(admission, patient, resp.bill);
                    } else { renderIpdBillingDetailContent(admission, patient, bill); }
                },
                error: function(xhr) {
                    showToast(xhr.responseJSON ? xhr.responseJSON.error : 'Failed to save corrections', 'error');
                    $btn.prop('disabled', false).html('<i data-lucide="check" style="width:14px;height:14px"></i> Save Corrections');
                    lucide.createIcons();
                }
            });
        });
    }

    function renderIpdCorrectionLogView(admission, patient, bill) {
        var patientName = patient ? patient.name : (bill ? bill.patientName : 'Unknown');
        var initials = getInitials(patientName);

        var body = '' +
            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div style="flex:1"><h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                        '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(bill.billId) + '</span>' +
                        '<span style="font-size:12px;background:#EDE9FE;color:#6D28D9;border:1px solid #DDD6FE;padding:2px 8px;border-radius:4px;font-weight:600">CORRECTION LOG</span>' +
                    '</div></div></div>' +
            '<div id="ipdCorrectionLogContent" style="min-height:100px;display:flex;align-items:center;justify-content:center"><span class="spinner-border spinner-border-sm"></span>&nbsp; Loading correction history...</div>';

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" id="btnIpdCorrectionLogBack"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button><div></div></div>';

        $('#billingDetailBody').html(body);
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();

        $('#btnIpdCorrectionLogBack').off('click').on('click', function() { renderIpdBillingDetailContent(admission, patient, bill); });

        $.get('/api/ipd/bills/' + encodeURIComponent(bill.billId) + '/corrections', function(data) {
            var $container = $('#ipdCorrectionLogContent');
            if (!data || data.length === 0) {
                $container.html('<div style="text-align:center;padding:40px 20px"><i data-lucide="file-check" style="width:48px;height:48px;color:var(--color-muted-foreground);margin-bottom:12px"></i>' +
                    '<h4 style="margin:0 0 8px;font-size:16px;font-weight:600">No Corrections</h4><p style="margin:0;font-size:14px;color:var(--color-muted-foreground)">No corrections have been made to this bill yet.</p></div>');
                lucide.createIcons();
                return;
            }
            var grouped = {};
            data.forEach(function(c) {
                var dt = new Date(c.createdAt);
                var key = dt.toISOString().slice(0, 19);
                if (!grouped[key]) grouped[key] = { date: dt, reason: c.reason, correctedBy: c.correctedBy, items: [] };
                grouped[key].items.push(c);
            });
            var groups = Object.keys(grouped).sort(function(a, b) { return b.localeCompare(a); }).map(function(k) { return grouped[k]; });
            var h = '';
            groups.forEach(function(g, gi) {
                var dateStr = g.date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + g.date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
                h += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:16px">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
                        '<div style="display:flex;align-items:center;gap:10px">' +
                            '<div style="width:32px;height:32px;border-radius:50%;background:#FEF3C7;display:flex;align-items:center;justify-content:center"><i data-lucide="pencil-line" style="width:14px;height:14px;color:#92400E"></i></div>' +
                            '<div><div style="font-size:14px;font-weight:600">Correction #' + (groups.length - gi) + '</div>' +
                                '<div style="font-size:12px;color:var(--color-muted-foreground)">' + dateStr + ' &bull; by ' + esc(g.correctedBy) + '</div></div>' +
                        '</div>' +
                        '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(234,88,12,0.08);color:#ea580c">' + g.items.length + ' change' + (g.items.length > 1 ? 's' : '') + '</span>' +
                    '</div>';
                if (g.reason) h += '<div style="background:#F8FAFC;border:1px solid var(--color-border);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#475569"><strong>Reason:</strong> ' + esc(g.reason) + '</div>';
                h += '<table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:2px solid var(--color-border)">' +
                    '<th style="text-align:left;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Section</th>' +
                    '<th style="text-align:left;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Field</th>' +
                    '<th style="text-align:right;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">Previous</th>' +
                    '<th style="text-align:center;padding:8px 4px;width:30px"></th>' +
                    '<th style="text-align:right;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase">New</th>' +
                '</tr></thead><tbody>';
                g.items.forEach(function(item) {
                    h += '<tr style="border-bottom:1px solid var(--color-border)">' +
                        '<td style="padding:10px 4px;font-size:13px"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#F1F5F9;color:#475569;border:1px solid #E2E8F0">' + esc(item.section) + '</span></td>' +
                        '<td style="padding:10px 4px;font-size:13px;font-weight:500">' + esc(item.fieldName) + '</td>' +
                        '<td style="padding:10px 4px;font-size:13px;text-align:right;font-family:monospace;color:#dc2626;text-decoration:line-through">' + esc(item.oldValue) + '</td>' +
                        '<td style="padding:10px 4px;text-align:center"><i data-lucide="arrow-right" style="width:14px;height:14px;color:var(--color-muted-foreground)"></i></td>' +
                        '<td style="padding:10px 4px;font-size:13px;text-align:right;font-family:monospace;color:#16a34a;font-weight:600">' + esc(item.newValue) + '</td></tr>';
                });
                h += '</tbody></table></div>';
            });
            $container.html(h);
            lucide.createIcons();
        }).fail(function() {
            $('#ipdCorrectionLogContent').html('<div style="text-align:center;padding:40px 20px;color:var(--color-destructive)"><i data-lucide="alert-circle" style="width:32px;height:32px;margin-bottom:8px"></i><p style="font-size:14px;font-weight:500">Failed to load correction log</p></div>');
            lucide.createIcons();
        });
    }

    function generateIpdBillPrint(admission, patient, bill, chargeItems, addlItems) {
        var currency = hospitalInfo.currency || 'PKR';
        var patientName = patient ? patient.name : (bill ? bill.patientName : 'Unknown');
        var admDate = admission ? new Date(admission.admissionDate) : new Date(bill.createdAt);
        var billDate = new Date(bill.createdAt);

        var activeCharges = chargeItems.filter(function(ci) { return ci.removed !== true && ci.chargeId !== 'total'; });
        var activeAddl = (addlItems || []).filter(function(ai) { return ai.removed !== true; });

        var chargesRows = '';
        var chargeSubtotal = 0;
        var sn = 1;
        activeCharges.forEach(function(ci) {
            var lineTotal = ci.amount * (ci.qty || 1);
            chargeSubtotal += lineTotal;
            chargesRows += '<tr><td style="text-align:center">' + sn + '</td><td>' + esc(ci.description) + '</td><td style="text-align:center">' + esc(ci.category) + '</td><td style="text-align:center">' + (ci.qty || 1) + '</td><td style="text-align:right">' + currency + ' ' + Number(ci.amount).toLocaleString() + '</td><td style="text-align:right">' + currency + ' ' + lineTotal.toLocaleString() + '</td></tr>';
            sn++;
        });
        activeAddl.forEach(function(ai) {
            var lineTotal = ai.amount * (ai.qty || 1);
            chargeSubtotal += lineTotal;
            chargesRows += '<tr><td style="text-align:center">' + sn + '</td><td>' + esc(ai.description) + '</td><td style="text-align:center">' + esc(ai.category) + '</td><td style="text-align:center">' + (ai.qty || 1) + '</td><td style="text-align:right">' + currency + ' ' + Number(ai.amount).toLocaleString() + '</td><td style="text-align:right">' + currency + ' ' + lineTotal.toLocaleString() + '</td></tr>';
            sn++;
        });
        if (sn === 1) chargesRows = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">No charges</td></tr>';

        var totalAmount = Number(bill.totalAmount);
        var paidAmount = Number(bill.paidAmount || 0);
        var dueAmount = Math.max(0, totalAmount - paidAmount);
        var statusLabel = bill.paymentStatus || 'Pending';
        var statusColor = statusLabel === 'Paid' ? '#16a34a' : (statusLabel === 'Partial' ? '#d97706' : '#dc2626');

        var html = '<!DOCTYPE html><html><head><title>Bill - ' + esc(bill.billId) + '</title><style>' +
            '@page { size: A4; margin: 12mm; } * { margin: 0; padding: 0; box-sizing: border-box; } ' +
            'body { font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; padding: 20px; } ' +
            '.header { text-align: center; border-bottom: 3px double #060740; padding-bottom: 12px; margin-bottom: 8px; } ' +
            '.header h1 { font-size: 22px; color: #060740; margin-bottom: 2px; } .header p { font-size: 11px; color: #555; } ' +
            '.bill-title { text-align: center; margin: 8px 0 12px; } .bill-title h2 { font-size: 16px; color: #060740; text-transform: uppercase; letter-spacing: 2px; } ' +
            '.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 30px; font-size: 12px; margin-bottom: 14px; padding: 10px; background: #f8f9fa; border-radius: 6px; } ' +
            '.info-grid .label { color: #666; font-weight: 600; } ' +
            '.charges-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 14px; } ' +
            '.charges-table th { background: #060740; color: white; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; } ' +
            '.charges-table td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; } ' +
            '.summary-box { margin-left: auto; width: 280px; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; } ' +
            '.summary-row { display: flex; justify-content: space-between; padding: 6px 14px; font-size: 12px; } ' +
            '.summary-row.total { background: #060740; color: white; font-weight: 700; font-size: 14px; padding: 10px 14px; } ' +
            '.summary-row.paid { background: #f0fdf4; color: #16a34a; font-weight: 600; } ' +
            '.summary-row.due { background: #fef2f2; color: #dc2626; font-weight: 600; } ' +
            '.status-badge { display: inline-block; padding: 3px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; color: white; } ' +
            '.footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; } ' +
            '.footer .signature { border-top: 1px solid #333; padding-top: 4px; min-width: 180px; text-align: center; } ' +
            '@media print { body { padding: 0; } .no-print { display: none; } }' +
            '</style></head><body>' +
            '<div class="header"><h1>' + esc(hospitalInfo.name || 'Hospital Name') + '</h1><p>' + esc(hospitalInfo.address || '') + (hospitalInfo.phone ? ' | Phone: ' + esc(hospitalInfo.phone) : '') + '</p></div>' +
            '<div class="bill-title"><h2>IPD Bill / Invoice</h2></div>' +
            '<div class="info-grid">' +
                '<div><span class="label">Patient Name:</span> ' + esc(patientName) + '</div>' +
                '<div><span class="label">Bill #:</span> ' + esc(bill.billId) + '</div>' +
                '<div><span class="label">MRN:</span> ' + esc(bill.mrn || (admission ? admission.mrn : '')) + '</div>' +
                '<div><span class="label">Admission ID:</span> ' + esc(admission ? admission.admissionId : bill.admissionId) + '</div>' +
                '<div><span class="label">Age/Gender:</span> ' + (patient ? patient.age : '-') + ' yrs / ' + (patient ? patient.gender : '-') + '</div>' +
                '<div><span class="label">Bill Date:</span> ' + billDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) + '</div>' +
                '<div><span class="label">Doctor:</span> Dr. ' + esc(admission ? admission.doctorName : '') + '</div>' +
                '<div><span class="label">Ward/Bed:</span> ' + esc(admission ? (admission.ward || '') : '') + ' / ' + esc(admission ? (admission.bed || '') : '') + '</div>' +
            '</div>' +
            '<table class="charges-table"><thead><tr><th style="text-align:center;width:40px">#</th><th>Description</th><th style="text-align:center">Category</th><th style="text-align:center;width:50px">Qty</th><th style="text-align:right;width:100px">Rate</th><th style="text-align:right;width:110px">Amount</th></tr></thead><tbody>' +
            chargesRows + '</tbody></table>' +
            '<div class="summary-box">' +
                '<div class="summary-row total"><span>Total Amount</span><span>' + currency + ' ' + totalAmount.toLocaleString() + '</span></div>' +
                '<div class="summary-row paid"><span>Paid Amount</span><span>' + currency + ' ' + paidAmount.toLocaleString() + '</span></div>' +
                (dueAmount > 0 ? '<div class="summary-row due"><span>Balance Due</span><span>' + currency + ' ' + dueAmount.toLocaleString() + '</span></div>' : '') +
                '<div class="summary-row" style="justify-content:center;padding:8px"><span class="status-badge" style="background:' + statusColor + '">' + statusLabel + '</span></div>' +
            '</div>' +
            '<div class="footer"><div><p style="font-size:10px;color:#999;">Printed on: ' + new Date().toLocaleString() + '</p></div><div class="signature"><p style="font-size:10px;color:#666;margin-bottom:2px">Authorized Signature</p></div></div>' +
            '<div class="no-print" style="text-align:center;margin-top:20px;"><button onclick="window.print()" style="padding:10px 30px;font-size:14px;background:#060740;color:white;border:none;border-radius:6px;cursor:pointer;">Print Bill</button></div>' +
            '</body></html>';

        var printWindow = window.open('', '_blank', 'width=800,height=1100');
        if (printWindow) { printWindow.document.write(html); printWindow.document.close(); }
    }

    $(document).on('click', '.payment-mode-option', function() { $('.payment-mode-option').removeClass('active'); $(this).addClass('active'); $(this).find('input').prop('checked', true); });

    // ===== TAB 3: CLINICAL ORDERS =====
    function _ipdOrdBuildData() {
        return admissions.map(function(a) {
            var admDate = a.admissionDate ? new Date(a.admissionDate) : null;
            var daysAdm = admDate ? Math.max(1, Math.floor((Date.now() - admDate.getTime()) / 86400000)) : 1;
            return {
                admissionId: a.admissionId,
                mrn: a.mrn,
                patientName: a.patientName,
                department: a.department || '',
                doctorName: a.doctorName || '',
                ward: a.ward || '',
                bed: a.bed || '-',
                initialDiagnosis: a.initialDiagnosis || '',
                status: a.status || 'Active',
                admissionDate: a.admissionDate || '',
                daysAdmitted: daysAdm
            };
        });
    }

    function _ipdOrdRenderPagination(source) {
        /* Sort: most recently created order first */
        var sorted = source.slice().sort(function(a, b) {
            return new Date(b.createdAt || b.orderedAt || b.admissionDate || 0) - new Date(a.createdAt || a.orderedAt || a.admissionDate || 0);
        });
        var total = sorted.length;
        var pages = Math.max(1, Math.ceil(total / ipdOrdPerPageVal));
        ipdOrdCurrentPage = Math.min(ipdOrdCurrentPage, pages);
        var start = (ipdOrdCurrentPage - 1) * ipdOrdPerPageVal;
        var slice = sorted.slice(start, start + ipdOrdPerPageVal);
        var end = Math.min(start + ipdOrdPerPageVal, total);

        /* Update stats from full source */
        var activeCount = source.filter(function(a) { return a.status === 'Active'; }).length;
        $('#statPendingOrders').text(activeCount > 0 ? activeCount : 0);
        $('#statActiveMeds').text(activeCount > 0 ? activeCount * 2 : 0);

        var html = '';
        if (slice.length === 0) {
            html = '<tr><td colspan="12"><div class="empty-state"><i data-lucide="clipboard-list"></i><p>No admitted patients found</p><p class="empty-sub">Admit a patient from the Registration tab to create clinical orders</p></div></td></tr>';
        } else {
            slice.forEach(function(a) {
                var wardBed = (a.ward || '-') + (a.bed && a.bed !== '-' ? ', ' + a.bed : '');
                var shortId = a.admissionId.replace(a.mrn + '-', '');
                var admDate = a.admissionDate ? new Date(a.admissionDate) : null;
                var admFormatted = admDate ? admDate.toLocaleDateString() + ', ' + admDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-';
                var lastOrder = 'Day ' + a.daysAdmitted;
                var statusClass = a.status === 'Active' ? 'badge-success' : (a.status === 'Discharged' ? 'badge-secondary' : 'badge-warning');
                html += '<tr class="clickable-row orders-row" data-admission-id="' + esc(a.admissionId) + '">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(a.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(a.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(shortId) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(a.department || '-') + '</td>' +
                    '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(a.doctorName || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(wardBed) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(a.initialDiagnosis || '') + '">' + esc(a.initialDiagnosis || '-') + '</td>' +
                    '<td class="text-center"><span style="font-size:12px;color:var(--color-muted-foreground)">-</span></td>' +
                    '<td class="text-center" style="font-size:12px;font-weight:500;color:var(--color-muted-foreground)">-</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(lastOrder) + '</td>' +
                    '<td><span class="badge ' + statusClass + '" style="font-size:10px;text-transform:uppercase">' + esc(a.status) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(admFormatted) + '</td>' +
                    '</tr>';
            });
        }
        $('#ordersTableBody').html(html);
        $('#ordersTableInfo').text(total === 0 ? 'No results' : 'Showing ' + (start + 1) + '–' + end + ' of ' + total + ' records');
        var nums = '';
        for (var p = 1; p <= pages; p++) nums += '<button class="opd-page-num' + (p === ipdOrdCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        $('#ipdOrdPageNums').html(nums);
        $('#ipdOrdPrevPage').prop('disabled', ipdOrdCurrentPage <= 1);
        $('#ipdOrdNextPage').prop('disabled', ipdOrdCurrentPage >= pages);
        lucide.createIcons();
    }

    function renderOrdersTab() {
        var search = ($('#ordersSearch').val() || '').toLowerCase();
        var ordData = _ipdOrdBuildData();
        var base = ipdOrdFiltered !== null ? ipdOrdFiltered : ordData;
        var filtered = base.filter(function(a) {
            return !search ||
                (a.patientName || '').toLowerCase().indexOf(search) > -1 ||
                (a.admissionId || '').toLowerCase().indexOf(search) > -1 ||
                (a.mrn || '').toLowerCase().indexOf(search) > -1 ||
                (a.doctorName || '').toLowerCase().indexOf(search) > -1;
        });
        _ipdOrdRenderPagination(filtered);
    }

    $(document).on('click', '#ipdOrdPageNums .opd-page-num', function() { ipdOrdCurrentPage = parseInt($(this).data('p')); renderOrdersTab(); });
    $('#ipdOrdPrevPage').on('click', function() { if (ipdOrdCurrentPage > 1) { ipdOrdCurrentPage--; renderOrdersTab(); } });
    $('#ipdOrdNextPage').on('click', function() { ipdOrdCurrentPage++; renderOrdersTab(); });
    $('#ordersSearch').on('input', function() { ipdOrdCurrentPage = 1; renderOrdersTab(); });
    $(document).on('click', '.orders-row', function() { openOrdersDetail($(this).data('admission-id')); });
    $('#btnNewOrder').on('click', function() {
        var activeAdm = admissions.filter(function(a) { return a.status === 'Active'; });
        if (activeAdm.length > 0) {
            openOrdersDetail(activeAdm[0].admissionId);
        } else {
            showToast('No active admissions found. Please admit a patient first.', 'error');
        }
    });

    var selectedOrderAdmission = null;
    var orderActiveSection = 'medication';
    var ipdPrescriptionsList = [];
    var ipdInvestigationsList = [];
    var ipdIVFluidsList = [];
    var ipdDietOrdersList = [];
    var ipdNursingOrdersList = [];
    var ipdProcedureOrdersList = [];
    var ipdExistingOrders = [];
    var ipdFormSections = [];
    var ipdCustomOrderData = {};
    var ipdPharmRxConfig = { units: ['mg', 'ml', 'g', 'IU'], routes: ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaler'], frequencies: ['OD', 'BD', 'TDS', 'QID', 'PRN', 'SOS'] };

    function loadIpdPharmRxConfig() {
        $.when(
            $.get('/api/pharmacy-config/rx_unit'),
            $.get('/api/pharmacy-config/rx_route'),
            $.get('/api/pharmacy-config/rx_frequency')
        ).done(function(unitRes, routeRes, freqRes) {
            var units  = unitRes[0]  || [];
            var routes = routeRes[0] || [];
            var freqs  = freqRes[0]  || [];
            if (units.length)  ipdPharmRxConfig.units       = units;
            if (routes.length) ipdPharmRxConfig.routes      = routes;
            if (freqs.length)  ipdPharmRxConfig.frequencies = freqs;
            var firstUnit  = ipdPharmRxConfig.units[0]  || 'mg';
            var firstRoute = ipdPharmRxConfig.routes[0] || 'Oral';
            var firstFreq  = ipdPharmRxConfig.frequencies[0];
            var firstFreqName = firstFreq ? (typeof firstFreq === 'object' ? firstFreq.name : firstFreq) : 'OD';
            ipdRxForm.unit      = ipdRxForm.unit      || firstUnit;
            ipdRxForm.route     = ipdRxForm.route     || firstRoute;
            ipdRxForm.frequency = ipdRxForm.frequency || firstFreqName;
        });
    }

    function getIpdFreqTimesPerDay(freqName) {
        var f = ipdPharmRxConfig.frequencies.find(function(x) { return (typeof x === 'object' ? x.name : x) === freqName; });
        if (!f) return null;
        var tpd = typeof f === 'object' ? f.timesPerDay : null;
        return (tpd !== null && tpd !== undefined) ? tpd : null;
    }

    function buildIpdRxOptions(items, selected) {
        return items.map(function(v) {
            var label = $('<span>').text(v).html();
            return '<option value="' + label + '"' + (v === selected ? ' selected' : '') + '>' + label + '</option>';
        }).join('');
    }

    function buildIpdFreqOptions(items, selected) {
        return items.map(function(v) {
            var name  = (typeof v === 'object') ? v.name : v;
            var label = $('<span>').text(name).html();
            return '<option value="' + label + '"' + (name === selected ? ' selected' : '') + '>' + label + '</option>';
        }).join('');
    }

    var ipdRxForm = { medicine: '', medicineId: '', strength: '', dose: '', unit: 'mg', route: 'Oral', frequency: 'OD', duration: '' };
    var ipdInvForm = { type: 'Laboratory', test: '', testCode: '', price: '', dept: '', sample: '', priority: 'Routine' };
    var ipdLabTestSearchTimer = null;
    var ipdIVForm = { fluidType: '', volume: '1000', rateMethod: 'rate', rate: '125', additives: [], ivAccess: 'Peripheral IV (existing)', site: '', startTime: 'now', frequency: 'continuous', dailyFluidGoal: '', monitorIO: true, checkSite: true, watchOverload: true, specialInstructions: '' };
    var ipdDietForm = { dietType: 'Regular Diet', restrictions: [], foodAllergies: '', foodPreferences: '', feedingRoute: 'Oral Feeding', mealFrequency: '3 Main Meals + 2 Snacks', fluidRestriction: 'none', fluidRestrictAmount: '', startTime: 'next_meal', duration: 'until_further', durationDays: '', specialInstructions: '' };
    var ipdNursingForm = { orderType: '', vitals: ['Blood Pressure', 'Heart Rate/Pulse', 'Respiratory Rate', 'Temperature', 'Oxygen Saturation (SpO2)'], frequency: 'Q4H', duration: 'until_further', durationHours: '', alertBPLow: '90/60', alertBPHigh: '180/100', alertHRLow: '50', alertHRHigh: '120', alertRRLow: '12', alertRRHigh: '24', alertTempLow: '35.5', alertTempHigh: '38.5', alertSpO2: '90', specialInstructions: '' };
    var ipdProcForm = { procedure: '', indication: '', diagnosis: '', priority: 'Emergency', location: 'Bedside', consentObtained: false, consentBy: '', consentDate: '', consentWitness: '', preProc: [], specialInstructions: '', estimatedDuration: '', estimatedCost: '' };
    var ipdNursingVitalForm = { temperature: '', systolic: '', diastolic: '', heartRate: '', spO2: '', respiratoryRate: '', weight: '', height: '', bloodSugar: '', painScale: null, notes: '' };

    var ipdLabTests = [
        'CBC (Complete Blood Count)', 'ESR', 'CRP', 'Blood Sugar (Fasting)', 'Blood Sugar (Random)',
        'HbA1c', 'Lipid Profile', 'Liver Function Test (LFT)', 'Renal Function Test (RFT)',
        'Thyroid Profile (TFT)', 'Urine Routine', 'Urine Culture', 'Blood Culture',
        'Serum Electrolytes', 'Serum Uric Acid', 'Serum Calcium', 'Serum Iron',
        'Vitamin D', 'Vitamin B12', 'Widal Test', 'Dengue NS1', 'Dengue IgG/IgM',
        'Malaria Parasite', 'HIV Test', 'HBsAg', 'Anti-HCV', 'PT/INR', 'APTT',
        'D-Dimer', 'Troponin I', 'BNP/NT-proBNP', 'Blood Group', 'Cross Match',
        'Sputum AFB', 'Sputum Culture', 'Stool Routine', 'PSA', 'CA-125',
        'Procalcitonin', 'Ferritin', 'LDH', 'CPK', 'Amylase', 'Lipase'
    ];
    var ipdRadiologyTests = [
        'X-Ray Chest PA', 'X-Ray Abdomen', 'X-Ray Spine', 'X-Ray Pelvis',
        'X-Ray Knee', 'X-Ray Shoulder', 'X-Ray Hand', 'X-Ray Foot',
        'Ultrasound Abdomen', 'Ultrasound Pelvis', 'Ultrasound KUB', 'Ultrasound Thyroid',
        'CT Scan Brain', 'CT Scan Chest', 'CT Scan Abdomen', 'CT Scan Spine',
        'MRI Brain', 'MRI Spine', 'MRI Knee', 'MRI Shoulder',
        'ECG', 'Echocardiography', 'TMT (Treadmill Test)', 'Holter Monitor',
        'Doppler (Venous)', 'Doppler (Arterial)', 'HRCT Chest', 'Mammography',
        'Bone Densitometry (DEXA)', 'PFT (Pulmonary Function Test)'
    ];
    var ipdInventoryMedicines = [];
    var ipdMedicinesLoaded = false;
    var _ipdMedLoading = false;
    var _ipdMedCallbacks = [];

    function loadIpdInventoryMedicines(cb) {
        if (ipdMedicinesLoaded) { if (cb) cb(ipdInventoryMedicines); return; }
        if (cb) _ipdMedCallbacks.push(cb);
        if (_ipdMedLoading) return;
        _ipdMedLoading = true;
        $.get('/api/inventory/medicines', function(data) {
            ipdInventoryMedicines = (data || []).map(function(m) {
                return {
                    id: m.medicineId,
                    name: m.name,
                    generic: m.genericName || '',
                    strength: m.strength || '',
                    form: m.form || '',
                    stock: m.currentStock || 0,
                    label: m.name + (m.strength ? ' ' + m.strength : '') + (m.form ? ' (' + m.form + ')' : '')
                };
            });
            ipdMedicinesLoaded = true;
            _ipdMedLoading = false;
            var cbs = _ipdMedCallbacks.slice(); _ipdMedCallbacks = [];
            cbs.forEach(function(fn) { fn(ipdInventoryMedicines); });
        }).fail(function() {
            _ipdMedLoading = false;
            _ipdMedCallbacks = [];
        });
    }

    loadIpdInventoryMedicines();
    loadIpdPharmRxConfig();

    function openOrdersDetail(admissionId) {
        var adm = admissions.find(function(a) { return a.admissionId === admissionId; });
        if (!adm) { showToast('Admission not found', 'error'); return; }
        selectedOrderAdmission = admissionId;
        ipdCustomOrderData = {};
        var avail = getAvailableIpdSections();
        orderActiveSection = avail.length > 0 ? avail[0].id : 'medication';
        ipdPrescriptionsList = [];
        ipdInvestigationsList = [];
        ipdIVFluidsList = [];
        ipdDietOrdersList = [];
        ipdNursingOrdersList = [];
        ipdProcedureOrdersList = [];
        var _ru = ipdPharmRxConfig.units[0] || 'mg';
        var _rr = ipdPharmRxConfig.routes[0] || 'Oral';
        var _rf = ipdPharmRxConfig.frequencies[0];
        var _rfn = _rf ? (typeof _rf === 'object' ? _rf.name : _rf) : 'OD';
        ipdRxForm = { medicine: '', medicineId: '', dose: '', unit: _ru, route: _rr, frequency: _rfn, duration: '' };
        ipdInvForm = { type: 'Laboratory', test: '', priority: 'Routine' };

        var ordersReq = $.get('/api/ipd/clinical-orders/' + admissionId);
        var admReq    = $.get('/api/ipd/admissions');
        ordersReq.done(function(orders) {
            ipdExistingOrders = orders || [];
            orders.forEach(function(o) {
                if (o.status !== 'Active') return;
                var md = o.metadata || {};
                if (o.type === 'Medication') {
                    ipdPrescriptionsList.push({ medicine: md.medicine || o.details || '', dose: md.dose || '', unit: md.unit || 'mg', route: md.route || 'Oral', frequency: md.frequency || 'OD', duration: md.duration || '', orderId: o.orderId });
                } else if (o.type === 'Investigation') {
                    ipdInvestigationsList.push({ type: md.investigationType || 'Laboratory', test: md.test || o.details || '', priority: o.priority || 'Routine', orderId: o.orderId });
                } else if (o.type === 'IV Fluids') {
                    ipdIVFluidsList.push($.extend({ orderId: o.orderId }, md.fluidType ? md : { fluidType: o.details || '', volume: '', rate: '' }));
                } else if (o.type === 'Diet') {
                    ipdDietOrdersList.push($.extend({ orderId: o.orderId }, md.dietType ? md : { dietType: o.details || '' }));
                } else if (o.type === 'Nursing') {
                    ipdNursingOrdersList.push($.extend({ orderId: o.orderId }, md.orderType ? md : { orderType: o.details || '' }));
                } else if (o.type === 'Procedure') {
                    ipdProcedureOrdersList.push($.extend({ orderId: o.orderId }, md.procedure ? md : { procedure: o.details || '' }));
                }
            });
        }).fail(function() { ipdExistingOrders = []; });

        admReq.done(function(allAdms) {
            var a = (allAdms || []).find(function(x) { return x.admissionId === admissionId; });
            ipdCustomOrderData = (a && a.customOrderData) ? a.customOrderData : {};
        }).fail(function() { ipdCustomOrderData = {}; });

        $.when(ordersReq, admReq).always(function() {
            renderOrdersSheet();
            new bootstrap.Offcanvas(document.getElementById('ordersDetailSheet')).show();
        });
    }

    function renderOrdersSheet() {
        var adm = admissions.find(function(a) { return a.admissionId === selectedOrderAdmission; });
        if (!adm) return;
        var patient = patients.find(function(p) { return p.mrn === adm.mrn; });
        var pName = adm.patientName || 'Unknown';
        var pAge = patient ? patient.age : '';
        var pGender = patient ? patient.gender : '';
        var pInitials = getInitials(pName);
        var shortId = adm.admissionId.replace(adm.mrn + '-', '');
        var ageGenderStr = (pAge ? pAge + ' yrs' : '') + (pGender ? ', ' + pGender : '');

        var body = '<div style="padding:24px">';

        body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:16px">' +
            '<div style="display:flex;align-items:center;gap:16px">' +
                '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff;font-size:16px;font-weight:700">' + pInitials + '</div>' +
                '<div style="flex:1">' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="font-size:16px;font-weight:600;margin:0">' + esc(pName) + '</h3>' +
                        '<span class="badge badge-outline" style="font-size:10px">' + esc(shortId) + '</span>' +
                        '<span class="badge badge-success" style="font-size:10px">ACTIVE</span>' +
                    '</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:4px">' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(ageGenderStr) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground);font-family:monospace">' + esc(adm.mrn) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">Dr. ' + esc(adm.doctorName) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">Ward: ' + esc(adm.ward) + ' | Bed: ' + esc(adm.bed) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div></div>';

        var availSections = getAvailableIpdSections();
        body += '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:24px">';
        availSections.forEach(function(sec) {
            body += '<button class="consult-section-btn ipd-order-section-btn' + (orderActiveSection === sec.id ? ' active' : '') + '" data-section="' + sec.id + '"><i data-lucide="' + sec.icon + '"></i> ' + esc(sec.label) + '</button>';
        });
        body += '</div>';

        var activeSec = availSections.find(function(s) { return s.id === orderActiveSection; }) || availSections[0];
        var sectionTitles = { medication: 'Prescription', investigation: 'Investigation Orders', ivfluids: 'IV Fluid Order', diet: 'Diet Order', nursing: 'Nursing Care Order', procedure: 'Procedure Order', ordersummary: 'All Orders Summary' };
        var sectionTitle = activeSec ? (sectionTitles[activeSec.id] || activeSec.label) : 'Orders';

        body += '<div style="display:grid;grid-template-columns:2fr 1fr;gap:24px">';

        body += '<div><div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">';
        body += '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px;display:flex;align-items:center;justify-content:space-between">';
        body += '<h3 style="font-size:16px;font-weight:600;margin:0">' + esc(sectionTitle) + '</h3>';
        body += '</div>';
        body += '<div style="padding:20px">';

        if (orderActiveSection === 'medication') {
            body += renderIpdPrescriptionSection();
        } else if (orderActiveSection === 'investigation') {
            body += renderIpdInvestigationsSection();
        } else if (orderActiveSection === 'ivfluids') {
            body += renderIpdIVFluidsSection();
        } else if (orderActiveSection === 'diet') {
            body += renderIpdDietSection();
        } else if (orderActiveSection === 'nursing') {
            body += renderIpdNursingSection();
        } else if (orderActiveSection === 'procedure') {
            body += renderIpdProcedureSection();
        } else if (orderActiveSection === 'ordersummary') {
            body += renderIpdOrderSummarySection();
        } else if (activeSec && !activeSec.isDefault) {
            body += renderIpdCustomSection(activeSec);
        }

        body += '</div></div></div>';

        body += '<div>';
        body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:16px">' +
            '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h3 style="font-size:16px;font-weight:600;margin:0">Order Summary</h3></div>' +
            '<div style="padding:16px">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Medications</p><p style="font-size:16px;font-weight:700;margin:0">' + ipdPrescriptionsList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Investigations</p><p style="font-size:16px;font-weight:700;margin:0">' + ipdInvestigationsList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">IV Fluids</p><p style="font-size:16px;font-weight:700;margin:0">' + ipdIVFluidsList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Diet</p><p style="font-size:16px;font-weight:700;margin:0">' + ipdDietOrdersList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Nursing</p><p style="font-size:16px;font-weight:700;margin:0">' + ipdNursingOrdersList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Procedures</p><p style="font-size:16px;font-weight:700;margin:0">' + ipdProcedureOrdersList.length + '</p></div>' +
                '</div>' +
            '</div></div>';

        if (ipdExistingOrders.length > 0) {
            body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h3 style="font-size:16px;font-weight:600;margin:0">All Orders</h3></div>' +
                '<div style="padding:16px;max-height:300px;overflow-y:auto">';
            ipdExistingOrders.forEach(function(o) {
                var sCls = o.status === 'Active' ? 'badge-success' : o.status === 'Discontinued' ? 'badge-destructive' : 'badge-info';
                var pCls = o.priority === 'STAT' ? 'color:var(--color-destructive)' : o.priority === 'Urgent' ? 'color:#F59E0B' : 'color:var(--color-muted-foreground)';
                body += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--color-border)">' +
                    '<div style="flex:1"><span class="badge badge-outline" style="font-size:10px;margin-right:4px">' + esc(o.type) + '</span><span style="font-size:13px;font-weight:500">' + esc(o.details) + '</span></div>' +
                    '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:10px;font-weight:600;text-transform:uppercase;' + pCls + '">' + esc(o.priority) + '</span><span class="badge ' + sCls + '" style="font-size:10px">' + esc(o.status) + '</span>' +
                    (o.status === 'Active' ? '<button class="btn-ghost ipd-discontinue-order" data-order-id="' + esc(o.orderId) + '" style="font-size:10px;color:var(--color-destructive);padding:2px 6px">Discontinue</button>' : '') +
                    '</div></div>';
            });
            body += '</div></div>';
        }
        body += '</div></div>';

        body += '<div style="display:flex;justify-content:flex-end;gap:12px;padding-top:16px;border-top:1px solid var(--color-border);margin-top:24px">' +
            '<button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>' +
            '<button class="btn-primary" id="btnSaveIpdOrders"><i data-lucide="send" style="width:16px;height:16px"></i> Save Orders</button>' +
        '</div></div>';

        $('#ordersDetailBody').html(body);
        lucide.createIcons();
        bindOrdersEvents();
    }

    function renderIpdPrescriptionSection() {
        var html = '';
        /* 8-column grid: Medicine | Strength | Dose | Unit | Route | Frequency | Duration | Add */
        html += '<div style="display:grid;grid-template-columns:2fr 1fr 0.6fr 0.7fr 0.8fr 1fr 0.8fr auto;gap:8px;align-items:end;margin-bottom:16px">' +

            /* Medicine — search icon + chevron */
            '<div class="form-group">' +
                '<label style="font-size:12px;color:var(--color-muted-foreground)">Medicine</label>' +
                '<div style="position:relative">' +
                    '<input type="text" class="form-control" id="ipdRxMedInput" autocomplete="off"' +
                        ' placeholder="Search medicine..." value="' + esc(ipdRxForm.medicine) + '"' +
                        ' style="padding-right:52px;color:#1e293b">' +
                    '<button type="button" id="ipdRxMedChevron"' +
                        ' style="position:absolute;right:0;top:0;height:100%;padding:0 10px;border:none;' +
                        'background:transparent;cursor:pointer;display:flex;align-items:center;gap:2px;border-radius:0 6px 6px 0">' +
                        '<i data-lucide="search" style="width:13px;height:13px;color:#94a3b8"></i>' +
                        '<i data-lucide="chevron-down" style="width:13px;height:13px;color:#94a3b8"></i>' +
                    '</button>' +
                    '<div id="ipdRxMedDropdown" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:9999;' +
                        'background:#fff;border:1px solid #e2e8f0;border-radius:8px;' +
                        'box-shadow:0 8px 24px rgba(0,0,0,0.12);max-height:200px;overflow-y:auto;margin-top:2px"></div>' +
                '</div>' +
            '</div>' +

            /* Strength — readonly auto-fill */
            '<div class="form-group">' +
                '<label style="font-size:12px;color:var(--color-muted-foreground)">Strength</label>' +
                '<input type="text" class="form-control" id="ipdRxStrength" readonly' +
                    ' value="' + esc(ipdRxForm.strength || '') + '"' +
                    ' style="background:#f8fafc;color:#64748b;cursor:not-allowed" placeholder="Auto">' +
            '</div>' +

            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Dose</label><input type="text" class="form-control" id="ipdRxDose" placeholder="500" value="' + esc(ipdRxForm.dose) + '"></div>' +
            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Unit</label><select class="form-select" id="ipdRxUnit">' + buildIpdRxOptions(ipdPharmRxConfig.units, ipdRxForm.unit) + '</select></div>' +
            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Route</label><select class="form-select" id="ipdRxRoute">' + buildIpdRxOptions(ipdPharmRxConfig.routes, ipdRxForm.route) + '</select></div>' +
            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Frequency</label><select class="form-select" id="ipdRxFrequency">' + buildIpdFreqOptions(ipdPharmRxConfig.frequencies, ipdRxForm.frequency) + '</select></div>' +
            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration</label><input type="text" class="form-control" id="ipdRxDuration" placeholder="5 days" value="' + esc(ipdRxForm.duration) + '"></div>' +
            '<button class="btn-primary btn-sm" id="btnAddIpdRx" style="height:38px"><i data-lucide="plus" style="width:14px;height:14px"></i></button>' +
        '</div>';

        if (ipdPrescriptionsList.length > 0) {
            html += '<div style="border-radius:8px;border:1px solid var(--color-border);overflow:hidden">' +
                '<table class="data-table"><thead><tr>' +
                '<th style="font-size:12px">#</th>' +
                '<th style="font-size:12px">Medicine</th>' +
                '<th style="font-size:12px">Strength</th>' +
                '<th style="font-size:12px">Dose</th>' +
                '<th style="font-size:12px">Route</th>' +
                '<th style="font-size:12px">Frequency</th>' +
                '<th style="font-size:12px">Duration</th>' +
                '<th style="width:40px"></th>' +
                '</tr></thead><tbody>';
            ipdPrescriptionsList.forEach(function(rx, i) {
                html += '<tr>' +
                    '<td style="font-size:12px;font-weight:500">' + (i+1) + '</td>' +
                    '<td style="font-size:14px;font-weight:500">' + esc(rx.medicine) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(rx.strength || '-') + '</td>' +
                    '<td style="font-size:12px">' + esc(rx.dose) + ' ' + esc(rx.unit) + '</td>' +
                    '<td style="font-size:12px">' + esc(rx.route) + '</td>' +
                    '<td><span class="badge badge-outline" style="font-size:10px">' + esc(rx.frequency) + '</span></td>' +
                    '<td style="font-size:12px">' + esc(rx.duration) + '</td>' +
                    '<td><button class="btn-ghost ipd-remove-rx" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td>' +
                '</tr>';
            });
            html += '</tbody></table></div>';
        } else {
            html += '<p style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">No prescriptions added yet</p>';
        }
        return html;
    }

    function renderIpdInvestigationsSection() {
        var html = '';
        html += '<div style="display:grid;grid-template-columns:1fr 2fr 1fr auto;gap:8px;align-items:end;margin-bottom:16px">' +

            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Type</label>' +
            '<select class="form-select" id="ipdInvType">' +
                '<option value="Laboratory"' + (ipdInvForm.type === 'Laboratory' ? ' selected' : '') + '>Laboratory</option>' +
                '<option value="Radiology"' + (ipdInvForm.type === 'Radiology' ? ' selected' : '') + '>Radiology</option>' +
            '</select></div>' +

            /* Test Name — search icon + chevron */
            '<div class="form-group">' +
                '<label style="font-size:12px;color:var(--color-muted-foreground)">Test Name</label>' +
                '<div style="position:relative">' +
                    '<input type="text" class="form-control" id="ipdInvTestInput" autocomplete="off"' +
                        ' placeholder="Click or type to search..." value="' + esc(ipdInvForm.test) + '"' +
                        ' style="padding-right:52px;color:#1e293b">' +
                    '<button type="button" id="ipdInvChevron"' +
                        ' style="position:absolute;right:0;top:0;height:100%;padding:0 10px;border:none;' +
                        'background:transparent;cursor:pointer;display:flex;align-items:center;gap:2px;border-radius:0 6px 6px 0">' +
                        '<i data-lucide="search" style="width:13px;height:13px;color:#94a3b8"></i>' +
                        '<i data-lucide="chevron-down" style="width:13px;height:13px;color:#94a3b8"></i>' +
                    '</button>' +
                    '<div id="ipdInvTestDropdown" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:9999;' +
                        'background:#fff;border:1px solid #e2e8f0;border-radius:8px;' +
                        'box-shadow:0 8px 24px rgba(0,0,0,0.12);max-height:200px;overflow-y:auto;margin-top:2px"></div>' +
                '</div>' +
            '</div>' +

            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Priority</label>' +
            '<select class="form-select" id="ipdInvPriority">' +
                '<option value="Routine"' + (ipdInvForm.priority === 'Routine' ? ' selected' : '') + '>Routine</option>' +
                '<option value="Urgent"'  + (ipdInvForm.priority === 'Urgent'  ? ' selected' : '') + '>Urgent</option>' +
                '<option value="STAT"'    + (ipdInvForm.priority === 'STAT'    ? ' selected' : '') + '>STAT</option>' +
            '</select></div>' +

            '<button class="btn-primary btn-sm" id="btnAddIpdInv" style="height:38px">' +
                '<i data-lucide="plus" style="width:14px;height:14px"></i> Add' +
            '</button>' +
        '</div>';

        if (ipdInvestigationsList.length > 0) {
            html += '<div style="border-radius:8px;border:1px solid var(--color-border);overflow:hidden">' +
                '<table class="data-table"><thead><tr>' +
                '<th style="font-size:12px">Type</th>' +
                '<th style="font-size:12px">Test</th>' +
                '<th style="font-size:12px">Code</th>' +
                '<th style="font-size:12px">Priority</th>' +
                '<th style="width:40px"></th>' +
                '</tr></thead><tbody>';
            ipdInvestigationsList.forEach(function(inv, i) {
                var prioClass = inv.priority === 'STAT' ? 'color:var(--color-destructive)' : (inv.priority === 'Urgent' ? 'color:var(--color-warning)' : 'color:var(--color-muted-foreground)');
                html += '<tr>' +
                    '<td style="font-size:12px">' + esc(inv.type) + '</td>' +
                    '<td style="font-size:14px;font-weight:500">' + esc(inv.test) + '</td>' +
                    '<td style="font-size:11px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(inv.testCode || '-') + '</td>' +
                    '<td><span style="font-size:10px;font-weight:600;text-transform:uppercase;' + prioClass + '">' + esc(inv.priority) + '</span></td>' +
                    '<td><button class="btn-ghost ipd-remove-inv" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td>' +
                '</tr>';
            });
            html += '</tbody></table></div>';
        } else {
            html += '<p style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">No investigations added yet</p>';
        }
        return html;
    }

    function renderIpdIVFluidsSection() {
        var f = ipdIVForm;
        var fluidTypes = ['Normal Saline (0.9% NaCl)', "Ringer's Lactate", '5% Dextrose in Water (D5W)', '5% Dextrose in Normal Saline (D5NS)', '5% Dextrose in Half Normal Saline (D5 1/2 NS)', '10% Dextrose', 'Plasma Expanders (Dextran, Gelatin)', 'Blood Products (Whole blood, Packed cells)', 'Other'];
        var html = '';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Fluid Type <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="ipdIVFluidType">';
        fluidTypes.forEach(function(ft) { html += '<option value="' + esc(ft) + '"' + (f.fluidType === ft ? ' selected' : '') + '>' + esc(ft) + '</option>'; });
        html += '</select></div>';
        if (f.fluidType === 'Other') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Specify Fluid</label><input type="text" class="form-control" id="ipdIVOtherFluid" value="' + esc(f.otherFluid || '') + '" placeholder="Specify fluid type"></div>';
        }
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Volume (mL) <span style="color:var(--color-destructive)">*</span></label><input type="number" class="form-control" id="ipdIVVolume" value="' + esc(f.volume) + '" placeholder="1000"></div>';
        html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
        ['500', '1000', '1500', '2000'].forEach(function(v) {
            html += '<button class="btn-outline btn-sm ipd-iv-quick-vol" data-vol="' + v + '" style="font-size:11px">' + v + ' mL</button>';
        });
        html += '</div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Infusion Rate</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Method <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="ipdIVRateMethod">';
        [{ v: 'rate', l: 'Rate (mL/hour)' }, { v: 'drops', l: 'Drops per minute' }, { v: 'duration', l: 'Duration (hours)' }].forEach(function(m) {
            html += '<option value="' + m.v + '"' + (f.rateMethod === m.v ? ' selected' : '') + '>' + m.l + '</option>';
        });
        html += '</select></div>';
        var rateLabel = f.rateMethod === 'rate' ? 'Rate (mL/hr)' : f.rateMethod === 'drops' ? 'Drops/min' : 'Duration (hours)';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">' + rateLabel + '</label><input type="number" class="form-control" id="ipdIVRate" value="' + esc(f.rate) + '" placeholder="125"></div>';
        if (f.rateMethod === 'rate' && f.rate && f.volume) {
            var hrs = Math.round(parseInt(f.volume) / parseInt(f.rate) * 10) / 10;
            html += '<p style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:12px"><i data-lucide="clock" style="width:12px;height:12px;display:inline"></i> Auto-calculated duration: ' + hrs + ' hours</p>';
        }
        html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
        ['50', '100', '125', '150'].forEach(function(r) {
            html += '<button class="btn-outline btn-sm ipd-iv-quick-rate" data-rate="' + r + '" style="font-size:11px">' + r + ' mL/hr</button>';
        });
        html += '</div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Additives <span style="font-weight:400;font-size:12px;color:var(--color-muted-foreground)">(Optional)</span></h4>';
        if (f.additives && f.additives.length > 0) {
            f.additives.forEach(function(ad, ai) {
                html += '<div style="display:flex;gap:8px;align-items:end;margin-bottom:8px"><div class="form-group" style="flex:2"><label style="font-size:11px;color:var(--color-muted-foreground)">Drug</label><input type="text" class="form-control ipd-iv-additive-drug" data-idx="' + ai + '" value="' + esc(ad.drug) + '" placeholder="e.g. KCl"></div><div class="form-group" style="flex:1"><label style="font-size:11px;color:var(--color-muted-foreground)">Dose</label><input type="text" class="form-control ipd-iv-additive-dose" data-idx="' + ai + '" value="' + esc(ad.dose) + '" placeholder="20 mEq"></div><button class="btn-ghost ipd-iv-remove-additive" data-idx="' + ai + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></div>';
            });
        }
        html += '<button class="btn-outline btn-sm" id="btnAddIVAdditive" style="font-size:11px;margin-bottom:8px"><i data-lucide="plus" style="width:12px;height:12px"></i> Add Additive</button>';
        if (f.additives && f.additives.length > 0) {
            html += '<p style="font-size:11px;color:var(--color-warning);margin-bottom:8px"><i data-lucide="alert-triangle" style="width:12px;height:12px;display:inline"></i> WARNING: Verify compatibility of additives</p>';
        }
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">IV Site & Access</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">IV Access</label><select class="form-select" id="ipdIVAccess">';
        ['Peripheral IV (existing)', 'Peripheral IV (new - to be inserted)', 'Central Line', 'PICC Line'].forEach(function(a) {
            html += '<option value="' + esc(a) + '"' + (f.ivAccess === a ? ' selected' : '') + '>' + esc(a) + '</option>';
        });
        html += '</select></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Site</label><input type="text" class="form-control" id="ipdIVSite" value="' + esc(f.site) + '" placeholder="e.g. Right Subclavian"></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Schedule</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Start Time</label><select class="form-select" id="ipdIVStartTime"><option value="now"' + (f.startTime === 'now' ? ' selected' : '') + '>Now (Immediate)</option><option value="scheduled"' + (f.startTime === 'scheduled' ? ' selected' : '') + '>Scheduled</option></select></div>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Frequency / Continuation</label><select class="form-select" id="ipdIVFrequency">';
        [{ v: 'single', l: 'Single bag/bottle only' }, { v: 'continuous', l: 'Continuous (Replace when empty)' }, { v: 'repeat', l: 'Repeat for specified bags' }, { v: 'timed', l: 'Run for specified hours then stop' }].forEach(function(fr) {
            html += '<option value="' + fr.v + '"' + (f.frequency === fr.v ? ' selected' : '') + '>' + fr.l + '</option>';
        });
        html += '</select></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Total Daily Fluid Goal (mL)</label><input type="number" class="form-control" id="ipdIVDailyGoal" value="' + esc(f.dailyFluidGoal) + '" placeholder="3000"></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Monitoring</h4>';
        html += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">';
        html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" id="ipdIVMonitorIO"' + (f.monitorIO ? ' checked' : '') + '> Monitor fluid input/output</label>';
        html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" id="ipdIVCheckSite"' + (f.checkSite ? ' checked' : '') + '> Check IV site every 4 hours</label>';
        html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" id="ipdIVWatchOverload"' + (f.watchOverload ? ' checked' : '') + '> Watch for signs of fluid overload</label>';
        html += '</div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Special Instructions</label><textarea class="form-control" id="ipdIVSpecialInst" rows="2" placeholder="e.g. Slow rate if patient develops SOB">' + esc(f.specialInstructions) + '</textarea></div>';
        html += '<button class="btn-primary" id="btnAddIVFluid"><i data-lucide="plus" style="width:14px;height:14px"></i> Add to Order List</button>';
        if (ipdIVFluidsList.length > 0) {
            html += '<div style="margin-top:16px;border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Fluid</th><th style="font-size:12px">Volume</th><th style="font-size:12px">Rate</th><th style="font-size:12px">Access</th><th style="width:40px"></th></tr></thead><tbody>';
            ipdIVFluidsList.forEach(function(iv, i) {
                html += '<tr><td>' + (i + 1) + '</td><td style="font-size:13px;font-weight:500">' + esc(iv.fluidType || '') + '</td><td style="font-size:12px">' + esc(iv.volume || '') + ' mL</td><td style="font-size:12px">' + esc(iv.rate || '') + ' mL/hr</td><td style="font-size:12px">' + esc(iv.ivAccess || '') + '</td><td><button class="btn-ghost ipd-remove-iv" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderIpdDietSection() {
        var f = ipdDietForm;
        var dietTypes = ['NPO (Nothing Per Oral - Fasting)', 'Clear Liquid Diet', 'Full Liquid Diet', 'Soft Diet', 'Regular Diet', 'Diabetic Diet', 'Low Sodium Diet (Cardiac)', 'Renal Diet (Low protein, Low K+, Low Na+)', 'High Protein Diet', 'High Fiber Diet', 'Low Residue Diet', 'BRAT Diet (Banana, Rice, Applesauce, Toast)', 'Other'];
        var restrictions = ['Low Salt (Sodium restricted)', 'Low Sugar (Diabetic)', 'Low Fat', 'Low Cholesterol', 'Gluten Free', 'Lactose Free', 'No Red Meat', 'Vegetarian', 'Halal'];
        var html = '';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Diet Type <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="ipdDietType">';
        dietTypes.forEach(function(dt) { html += '<option value="' + esc(dt) + '"' + (f.dietType === dt ? ' selected' : '') + '>' + esc(dt) + '</option>'; });
        html += '</select></div>';
        if (f.dietType === 'Other') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Specify Diet</label><input type="text" class="form-control" id="ipdDietOther" value="' + esc(f.otherDiet || '') + '" placeholder="Specify diet type"></div>';
        }
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Restrictions / Modifications</h4>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
        restrictions.forEach(function(r) {
            var checked = f.restrictions && f.restrictions.indexOf(r) > -1 ? ' checked' : '';
            html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" class="ipd-diet-restriction" value="' + esc(r) + '"' + checked + '> ' + esc(r) + '</label>';
        });
        html += '</div>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Food Allergies</label><textarea class="form-control" id="ipdDietAllergies" rows="2" placeholder="e.g. Peanuts, Shellfish">' + esc(f.foodAllergies) + '</textarea></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Food Preferences / Dislikes</label><textarea class="form-control" id="ipdDietPreferences" rows="2" placeholder="e.g. No spicy food">' + esc(f.foodPreferences) + '</textarea></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Feeding Route</h4>';
        html += '<div class="form-group" style="margin-bottom:16px"><select class="form-select" id="ipdDietRoute">';
        ['Oral Feeding', 'Nasogastric Tube (NGT) Feeding', 'Gastrostomy Tube (G-tube) Feeding', 'Total Parenteral Nutrition (TPN)'].forEach(function(r) {
            html += '<option value="' + esc(r) + '"' + (f.feedingRoute === r ? ' selected' : '') + '>' + esc(r) + '</option>';
        });
        html += '</select></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Meal Frequency</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><select class="form-select" id="ipdDietMealFreq">';
        ['3 Main Meals + 2 Snacks', '3 Main Meals', '6 Small Frequent Meals', 'Custom'].forEach(function(mf) {
            html += '<option value="' + esc(mf) + '"' + (f.mealFrequency === mf ? ' selected' : '') + '>' + esc(mf) + '</option>';
        });
        html += '</select></div>';
        html += '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:16px;padding:8px;background:var(--color-background);border-radius:6px">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">' +
            '<span>Breakfast: 08:00 AM</span><span>Lunch: 01:00 PM</span><span>Dinner: 07:00 PM</span>' +
            '</div><span>Snacks: 10:00 AM, 04:00 PM</span></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Fluid Restriction</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><select class="form-select" id="ipdDietFluidRestrict">';
        [{ v: 'none', l: 'No fluid restriction' }, { v: 'restricted', l: 'Fluid restricted (specify mL/day)' }, { v: 'encourage', l: 'Free fluids (encourage)' }].forEach(function(fr) {
            html += '<option value="' + fr.v + '"' + (f.fluidRestriction === fr.v ? ' selected' : '') + '>' + fr.l + '</option>';
        });
        html += '</select></div>';
        if (f.fluidRestriction === 'restricted') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Fluid Limit (mL/day)</label><input type="number" class="form-control" id="ipdDietFluidAmount" value="' + esc(f.fluidRestrictAmount) + '" placeholder="1500"></div>';
        }
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
        html += '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Start</label><select class="form-select" id="ipdDietStart"><option value="next_meal"' + (f.startTime === 'next_meal' ? ' selected' : '') + '>Next Meal</option><option value="scheduled"' + (f.startTime === 'scheduled' ? ' selected' : '') + '>Scheduled</option></select></div>';
        html += '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration</label><select class="form-select" id="ipdDietDuration"><option value="until_further"' + (f.duration === 'until_further' ? ' selected' : '') + '>Until further orders</option><option value="days"' + (f.duration === 'days' ? ' selected' : '') + '>For specified days</option></select></div>';
        html += '</div>';
        if (f.duration === 'days') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Number of Days</label><input type="number" class="form-control" id="ipdDietDays" value="' + esc(f.durationDays) + '" placeholder="3"></div>';
        }
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Special Instructions</label><textarea class="form-control" id="ipdDietSpecialInst" rows="2" placeholder="e.g. Patient may need assistance with meals">' + esc(f.specialInstructions) + '</textarea></div>';
        html += '<button class="btn-primary" id="btnAddDietOrder"><i data-lucide="plus" style="width:14px;height:14px"></i> Add to Order List</button>';
        if (ipdDietOrdersList.length > 0) {
            html += '<div style="margin-top:16px;border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Diet Type</th><th style="font-size:12px">Route</th><th style="font-size:12px">Frequency</th><th style="font-size:12px">Restrictions</th><th style="width:40px"></th></tr></thead><tbody>';
            ipdDietOrdersList.forEach(function(d, i) {
                var rest = d.restrictions && d.restrictions.length > 0 ? d.restrictions.join(', ') : 'None';
                html += '<tr><td>' + (i + 1) + '</td><td style="font-size:13px;font-weight:500">' + esc(d.dietType || '') + '</td><td style="font-size:12px">' + esc(d.feedingRoute || 'Oral') + '</td><td style="font-size:12px">' + esc(d.mealFrequency || '') + '</td><td style="font-size:11px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(rest) + '">' + esc(rest) + '</td><td><button class="btn-ghost ipd-remove-diet" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderIpdNursingSection() {
        var f = ipdNursingForm;
        var orderTypes = ['Vital Signs Monitoring', 'Intake/Output Monitoring', 'Wound Care', 'Position Changes/Turning', 'Oxygen Therapy', 'Nebulization', 'Catheter Care', 'IV Line Care', 'Other'];
        var allVitals = ['Blood Pressure', 'Heart Rate/Pulse', 'Respiratory Rate', 'Temperature', 'Oxygen Saturation (SpO2)', 'Blood Glucose', 'Pain Score', 'GCS (Glasgow Coma Scale)'];
        var frequencies = [{ v: 'Continuous', l: 'Continuous (Cardiac monitor)' }, { v: 'Q15min', l: 'Q15 min (Every 15 minutes)' }, { v: 'Q30min', l: 'Q30 min (Every 30 minutes)' }, { v: 'Q1H', l: 'Q1H (Hourly)' }, { v: 'Q2H', l: 'Q2H (Every 2 hours)' }, { v: 'Q4H', l: 'Q4H (Every 4 hours)' }, { v: 'Q6H', l: 'Q6H (Every 6 hours)' }, { v: 'Q8H', l: 'Q8H (Every 8 hours)' }, { v: 'Daily', l: 'Daily' }, { v: 'Custom', l: 'Custom' }];
        var html = '';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Order Type <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="ipdNursingType">';
        html += '<option value="">-- Select --</option>';
        orderTypes.forEach(function(ot) { html += '<option value="' + esc(ot) + '"' + (f.orderType === ot ? ' selected' : '') + '>' + esc(ot) + '</option>'; });
        html += '</select></div>';
        if (f.orderType === 'Other') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Specify Order Type</label><input type="text" class="form-control" id="ipdNursingOther" value="' + esc(f.otherType || '') + '" placeholder="Specify nursing order type"></div>';
        }
        if (f.orderType === 'Vital Signs Monitoring' || f.orderType === '') {
            html += '<hr style="border-color:var(--color-border);margin:16px 0">';
            html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Vital Signs to Monitor</h4>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
            allVitals.forEach(function(v) {
                var checked = f.vitals && f.vitals.indexOf(v) > -1 ? ' checked' : '';
                html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" class="ipd-nursing-vital" value="' + esc(v) + '"' + checked + '> ' + esc(v) + '</label>';
            });
            html += '</div>';
        }
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Frequency <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="ipdNursingFreq">';
        frequencies.forEach(function(fr) { html += '<option value="' + esc(fr.v) + '"' + (f.frequency === fr.v ? ' selected' : '') + '>' + esc(fr.l) + '</option>'; });
        html += '</select></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration</label><select class="form-select" id="ipdNursingDuration"><option value="until_further"' + (f.duration === 'until_further' ? ' selected' : '') + '>Until further orders</option><option value="specified"' + (f.duration === 'specified' ? ' selected' : '') + '>For specified hours/days</option></select></div>';
        if (f.duration === 'specified') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration (hours/days)</label><input type="text" class="form-control" id="ipdNursingDurationVal" value="' + esc(f.durationHours) + '" placeholder="e.g. 24 hours"></div>';
        }
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Alert Parameters <span style="font-weight:400;font-size:12px;color:var(--color-muted-foreground)">(Notify doctor if:)</span></h4>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;font-size:12px">';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">BP:</span>< <input type="text" class="form-control" id="ipdAlertBPLow" value="' + esc(f.alertBPLow) + '" style="width:70px;font-size:12px;padding:4px 6px"> or > <input type="text" class="form-control" id="ipdAlertBPHigh" value="' + esc(f.alertBPHigh) + '" style="width:70px;font-size:12px;padding:4px 6px"> mmHg</div>';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">HR:</span>< <input type="text" class="form-control" id="ipdAlertHRLow" value="' + esc(f.alertHRLow) + '" style="width:50px;font-size:12px;padding:4px 6px"> or > <input type="text" class="form-control" id="ipdAlertHRHigh" value="' + esc(f.alertHRHigh) + '" style="width:50px;font-size:12px;padding:4px 6px"> bpm</div>';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">RR:</span>< <input type="text" class="form-control" id="ipdAlertRRLow" value="' + esc(f.alertRRLow) + '" style="width:50px;font-size:12px;padding:4px 6px"> or > <input type="text" class="form-control" id="ipdAlertRRHigh" value="' + esc(f.alertRRHigh) + '" style="width:50px;font-size:12px;padding:4px 6px"> /min</div>';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">Temp:</span>< <input type="text" class="form-control" id="ipdAlertTempLow" value="' + esc(f.alertTempLow) + '" style="width:50px;font-size:12px;padding:4px 6px"> or > <input type="text" class="form-control" id="ipdAlertTempHigh" value="' + esc(f.alertTempHigh) + '" style="width:50px;font-size:12px;padding:4px 6px"> C</div>';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">SpO2:</span>< <input type="text" class="form-control" id="ipdAlertSpO2" value="' + esc(f.alertSpO2) + '" style="width:50px;font-size:12px;padding:4px 6px"> %</div>';
        html += '</div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Special Instructions</label><textarea class="form-control" id="ipdNursingSpecialInst" rows="2" placeholder="e.g. Call if BP drops below 90 systolic">' + esc(f.specialInstructions) + '</textarea></div>';
        html += '<button class="btn-primary" id="btnAddNursingOrder"><i data-lucide="plus" style="width:14px;height:14px"></i> Add to Order List</button>';
        if (ipdNursingOrdersList.length > 0) {
            html += '<div style="margin-top:16px;border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Order Type</th><th style="font-size:12px">Frequency</th><th style="font-size:12px">Duration</th><th style="width:40px"></th></tr></thead><tbody>';
            ipdNursingOrdersList.forEach(function(n, i) {
                html += '<tr><td>' + (i + 1) + '</td><td style="font-size:13px;font-weight:500">' + esc(n.orderType || '') + '</td><td style="font-size:12px">' + esc(n.frequency || '') + '</td><td style="font-size:12px">' + esc(n.duration === 'until_further' ? 'Until further orders' : n.durationHours || '') + '</td><td><button class="btn-ghost ipd-remove-nursing" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderIpdProcedureSection() {
        var f = ipdProcForm;
        var procedures = ['Wound Debridement', 'Chest Tube Insertion', 'Central Line Insertion', 'Lumbar Puncture', 'Pleural Tap', 'Ascitic Tap', 'Urinary Catheterization', 'Nasogastric Tube Insertion', 'Arterial Line Insertion', 'Endotracheal Intubation', 'Other'];
        var html = '';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Procedure <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="ipdProcProcedure"><option value="">-- Select --</option>';
        procedures.forEach(function(p) { html += '<option value="' + esc(p) + '"' + (f.procedure === p ? ' selected' : '') + '>' + esc(p) + '</option>'; });
        html += '</select></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Clinical Indication</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Indication <span style="color:var(--color-destructive)">*</span></label><textarea class="form-control" id="ipdProcIndication" rows="2" placeholder="e.g. Respiratory failure, unable to maintain airway">' + esc(f.indication) + '</textarea></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Diagnosis</label><input type="text" class="form-control" id="ipdProcDiagnosis" value="' + esc(f.diagnosis) + '" placeholder="e.g. Acute Respiratory Distress Syndrome"></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Scheduling</h4>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        html += '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Priority</label><select class="form-select" id="ipdProcPriority">';
        [{ v: 'Emergency', l: 'Emergency (STAT)' }, { v: 'Urgent', l: 'Urgent' }, { v: 'Elective', l: 'Elective / Scheduled' }].forEach(function(p) {
            html += '<option value="' + p.v + '"' + (f.priority === p.v ? ' selected' : '') + '>' + p.l + '</option>';
        });
        html += '</select></div>';
        html += '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Location</label><select class="form-select" id="ipdProcLocation">';
        ['Bedside', 'Procedure Room', 'Operating Theater', 'ICU'].forEach(function(loc) {
            html += '<option value="' + esc(loc) + '"' + (f.location === loc ? ' selected' : '') + '>' + esc(loc) + '</option>';
        });
        html += '</select></div></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Consent</h4>';
        html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px;margin-bottom:12px"><input type="checkbox" id="ipdProcConsent"' + (f.consentObtained ? ' checked' : '') + '> Informed consent obtained</label>';
        if (f.consentObtained) {
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
            html += '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground)">Signed by</label><select class="form-select" id="ipdProcConsentBy" style="font-size:12px"><option value="Patient"' + (f.consentBy === 'Patient' ? ' selected' : '') + '>Patient</option><option value="Guardian"' + (f.consentBy === 'Guardian' ? ' selected' : '') + '>Guardian</option></select></div>';
            html += '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground)">Date/Time</label><input type="datetime-local" class="form-control" id="ipdProcConsentDate" value="' + esc(f.consentDate) + '" style="font-size:12px"></div>';
            html += '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground)">Witness</label><input type="text" class="form-control" id="ipdProcConsentWitness" value="' + esc(f.consentWitness) + '" placeholder="e.g. Nurse Sara" style="font-size:12px"></div>';
            html += '</div>';
        }
        html += '<button class="btn-primary" id="btnAddProcOrder" style="margin-top:16px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add to Order List</button>';
        if (ipdProcedureOrdersList.length > 0) {
            html += '<div style="margin-top:16px;border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Procedure</th><th style="font-size:12px">Priority</th><th style="font-size:12px">Location</th><th style="font-size:12px">Consent</th><th style="width:40px"></th></tr></thead><tbody>';
            ipdProcedureOrdersList.forEach(function(pr, i) {
                var prioCls = pr.priority === 'Emergency' ? 'color:var(--color-destructive)' : pr.priority === 'Urgent' ? 'color:#F59E0B' : '';
                html += '<tr><td>' + (i + 1) + '</td><td style="font-size:13px;font-weight:500">' + esc(pr.procedure || '') + '</td><td><span style="font-size:11px;font-weight:600;text-transform:uppercase;' + prioCls + '">' + esc(pr.priority || '') + '</span></td><td style="font-size:12px">' + esc(pr.location || '') + '</td><td style="font-size:12px">' + (pr.consentObtained ? '<span style="color:var(--aqua-mint)">Yes</span>' : '<span style="color:var(--color-muted-foreground)">No</span>') + '</td><td><button class="btn-ghost ipd-remove-proc" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function buildOrderDetailFields(type, data) {
        var fields = [];
        if (!data) return fields;
        if (type === 'Medication') {
            if (data.medicine) fields.push({ label: 'Medicine', value: data.medicine });
            if (data.dose) fields.push({ label: 'Dose', value: data.dose + ' ' + (data.unit || '') });
            if (data.route) fields.push({ label: 'Route', value: data.route });
            if (data.frequency) fields.push({ label: 'Frequency', value: data.frequency });
            if (data.duration) fields.push({ label: 'Duration', value: data.duration });
        } else if (type === 'Investigation') {
            if (data.investigationType || data.type) fields.push({ label: 'Type', value: data.investigationType || data.type });
            if (data.test) fields.push({ label: 'Test', value: data.test });
            if (data.priority) fields.push({ label: 'Priority', value: data.priority });
        } else if (type === 'IV Fluids') {
            if (data.fluidType) fields.push({ label: 'Fluid Type', value: data.fluidType });
            if (data.volume) fields.push({ label: 'Volume', value: data.volume + ' mL' });
            if (data.rate) fields.push({ label: 'Rate', value: data.rate + ' mL/hr' });
            if (data.rateMethod) fields.push({ label: 'Rate Method', value: data.rateMethod });
            if (data.additives && data.additives.length) fields.push({ label: 'Additives', value: data.additives.join(', ') });
            if (data.ivAccess) fields.push({ label: 'IV Access', value: data.ivAccess });
            if (data.site) fields.push({ label: 'Site', value: data.site });
            if (data.frequency) fields.push({ label: 'Frequency', value: data.frequency });
            if (data.startTime) fields.push({ label: 'Start Time', value: data.startTime });
            if (data.dailyFluidGoal) fields.push({ label: 'Daily Fluid Goal', value: data.dailyFluidGoal + ' mL' });
            if (data.monitorIO) fields.push({ label: 'Monitor I/O', value: 'Yes' });
            if (data.checkSite) fields.push({ label: 'Check Site Q4H', value: 'Yes' });
            if (data.watchOverload) fields.push({ label: 'Watch for Overload', value: 'Yes' });
            if (data.specialInstructions) fields.push({ label: 'Instructions', value: data.specialInstructions });
        } else if (type === 'Diet') {
            if (data.dietType) fields.push({ label: 'Diet Type', value: data.dietType });
            if (data.restrictions && data.restrictions.length) fields.push({ label: 'Restrictions', value: data.restrictions.join(', ') });
            if (data.foodAllergies) fields.push({ label: 'Food Allergies', value: data.foodAllergies });
            if (data.foodPreferences) fields.push({ label: 'Preferences', value: data.foodPreferences });
            if (data.feedingRoute) fields.push({ label: 'Feeding Route', value: data.feedingRoute });
            if (data.mealFrequency) fields.push({ label: 'Meal Frequency', value: data.mealFrequency });
            if (data.fluidRestriction && data.fluidRestriction !== 'none') fields.push({ label: 'Fluid Restriction', value: data.fluidRestriction === 'restricted' ? (data.fluidRestrictAmount || '') + ' mL/day' : data.fluidRestriction });
            if (data.startTime) fields.push({ label: 'Start', value: data.startTime });
            if (data.duration) fields.push({ label: 'Duration', value: data.duration === 'specified' ? (data.durationDays || '') + ' days' : data.duration });
            if (data.specialInstructions) fields.push({ label: 'Instructions', value: data.specialInstructions });
        } else if (type === 'Nursing') {
            if (data.orderType) fields.push({ label: 'Order Type', value: data.orderType });
            if (data.otherType) fields.push({ label: 'Specify', value: data.otherType });
            if (data.vitals && data.vitals.length) fields.push({ label: 'Vital Signs', value: data.vitals.join(', ') });
            if (data.frequency) fields.push({ label: 'Frequency', value: data.frequency });
            if (data.duration) fields.push({ label: 'Duration', value: data.duration === 'specified' ? (data.durationHours || '') + ' hours' : data.duration });
            var alerts = [];
            if (data.alertBPLow || data.alertBPHigh) alerts.push('BP: ' + (data.alertBPLow || '') + ' - ' + (data.alertBPHigh || ''));
            if (data.alertHRLow || data.alertHRHigh) alerts.push('HR: ' + (data.alertHRLow || '') + ' - ' + (data.alertHRHigh || ''));
            if (data.alertRRLow || data.alertRRHigh) alerts.push('RR: ' + (data.alertRRLow || '') + ' - ' + (data.alertRRHigh || ''));
            if (data.alertTempLow || data.alertTempHigh) alerts.push('Temp: ' + (data.alertTempLow || '') + ' - ' + (data.alertTempHigh || ''));
            if (data.alertSpO2) alerts.push('SpO2 < ' + data.alertSpO2 + '%');
            if (alerts.length) fields.push({ label: 'Alert Parameters', value: alerts.join(' | ') });
            if (data.specialInstructions) fields.push({ label: 'Instructions', value: data.specialInstructions });
        } else if (type === 'Procedure') {
            if (data.procedure) fields.push({ label: 'Procedure', value: data.procedure });
            if (data.indication) fields.push({ label: 'Clinical Indication', value: data.indication });
            if (data.diagnosis) fields.push({ label: 'Diagnosis', value: data.diagnosis });
            if (data.priority) fields.push({ label: 'Priority', value: data.priority });
            if (data.location) fields.push({ label: 'Location', value: data.location });
            fields.push({ label: 'Consent', value: data.consentObtained ? 'Yes' : 'No' });
            if (data.consentObtained) {
                if (data.consentBy) fields.push({ label: 'Consent By', value: data.consentBy });
                if (data.consentDate) fields.push({ label: 'Consent Date', value: data.consentDate });
                if (data.consentWitness) fields.push({ label: 'Witness', value: data.consentWitness });
            }
        }
        return fields;
    }

    function renderIpdOrderSummarySection() {
        var html = '';
        var allOrders = [];

        ipdPrescriptionsList.forEach(function(o) {
            allOrders.push({ type: 'Medication', icon: 'pill', detail: (o.medicine || 'Unnamed') + (o.dose ? ' ' + o.dose + ' ' + (o.unit || '') : '') + (o.route ? ' | ' + o.route : '') + (o.frequency ? ' | ' + o.frequency : ''), priority: 'Routine', status: o.orderId ? 'Saved' : 'Pending', orderId: o.orderId || null, source: 'current', rawData: o });
        });
        ipdInvestigationsList.forEach(function(o) {
            allOrders.push({ type: 'Investigation', icon: 'flask-conical', detail: (o.type || 'Lab') + ': ' + (o.test || ''), priority: o.priority || 'Routine', status: o.orderId ? 'Saved' : 'Pending', orderId: o.orderId || null, source: 'current', rawData: o });
        });
        ipdIVFluidsList.forEach(function(o) {
            allOrders.push({ type: 'IV Fluids', icon: 'droplets', detail: (o.fluidType || '') + (o.volume ? ' ' + o.volume + ' mL' : '') + (o.rate ? ' @ ' + o.rate + ' mL/hr' : ''), priority: 'Routine', status: o.orderId ? 'Saved' : 'Pending', orderId: o.orderId || null, source: 'current', rawData: o });
        });
        ipdDietOrdersList.forEach(function(o) {
            allOrders.push({ type: 'Diet', icon: 'utensils', detail: (o.dietType || '') + (o.feedingRoute ? ' | ' + o.feedingRoute : ''), priority: 'Routine', status: o.orderId ? 'Saved' : 'Pending', orderId: o.orderId || null, source: 'current', rawData: o });
        });
        ipdNursingOrdersList.forEach(function(o) {
            allOrders.push({ type: 'Nursing', icon: 'heart-pulse', detail: (o.orderType || '') + (o.frequency ? ' | ' + o.frequency : ''), priority: 'Routine', status: o.orderId ? 'Saved' : 'Pending', orderId: o.orderId || null, source: 'current', rawData: o });
        });
        ipdProcedureOrdersList.forEach(function(o) {
            allOrders.push({ type: 'Procedure', icon: 'stethoscope', detail: o.procedure || '', priority: o.priority || 'Routine', status: o.orderId ? 'Saved' : 'Pending', orderId: o.orderId || null, source: 'current', rawData: o });
        });

        ipdExistingOrders.forEach(function(o) {
            var alreadyInList = allOrders.some(function(a) { return a.orderId && a.orderId === o.orderId; });
            if (!alreadyInList) {
                var iconMap = { 'Medication': 'pill', 'Investigation': 'flask-conical', 'IV Fluids': 'droplets', 'Diet': 'utensils', 'Nursing': 'heart-pulse', 'Procedure': 'stethoscope' };
                allOrders.push({ type: o.type, icon: iconMap[o.type] || 'file-text', detail: o.details || '', priority: o.priority || 'Routine', status: o.status || 'Active', orderId: o.orderId, source: 'existing', rawData: o.metadata || {} });
            }
        });

        var totalOrders = allOrders.length;
        var savedCount = allOrders.filter(function(o) { return o.status === 'Saved' || o.status === 'Active'; }).length;
        var pendingCount = allOrders.filter(function(o) { return o.status === 'Pending'; }).length;
        var discontinuedCount = allOrders.filter(function(o) { return o.status === 'Discontinued'; }).length;
        var completedCount = allOrders.filter(function(o) { return o.status === 'Completed'; }).length;

        html += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px">';
        html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:12px;text-align:center"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Total Orders</p><p style="font-size:20px;font-weight:700;margin:0">' + totalOrders + '</p></div>';
        html += '<div style="border:1px solid var(--aqua-mint);border-radius:8px;padding:12px;text-align:center;background:rgba(127,255,212,0.06)"><p style="font-size:10px;color:var(--aqua-mint);margin:0 0 4px">Active / Saved</p><p style="font-size:20px;font-weight:700;margin:0;color:var(--aqua-mint)">' + savedCount + '</p></div>';
        html += '<div style="border:1px solid #F59E0B;border-radius:8px;padding:12px;text-align:center;background:rgba(245,158,11,0.06)"><p style="font-size:10px;color:#F59E0B;margin:0 0 4px">Pending Save</p><p style="font-size:20px;font-weight:700;margin:0;color:#F59E0B">' + pendingCount + '</p></div>';
        html += '<div style="border:1px solid var(--color-primary);border-radius:8px;padding:12px;text-align:center;background:rgba(0,51,102,0.04)"><p style="font-size:10px;color:var(--color-primary);margin:0 0 4px">Completed</p><p style="font-size:20px;font-weight:700;margin:0;color:var(--color-primary)">' + completedCount + '</p></div>';
        html += '<div style="border:1px solid var(--color-destructive);border-radius:8px;padding:12px;text-align:center;background:rgba(239,68,68,0.06)"><p style="font-size:10px;color:var(--color-destructive);margin:0 0 4px">Discontinued</p><p style="font-size:20px;font-weight:700;margin:0;color:var(--color-destructive)">' + discontinuedCount + '</p></div>';
        html += '</div>';

        var typeGroups = {};
        allOrders.forEach(function(o) {
            if (!typeGroups[o.type]) typeGroups[o.type] = [];
            typeGroups[o.type].push(o);
        });

        if (totalOrders === 0) {
            html += '<div style="text-align:center;padding:40px 20px;color:var(--color-muted-foreground)"><i data-lucide="clipboard-list" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i><p style="font-size:14px;margin:0">No orders have been added yet</p><p style="font-size:12px;margin:4px 0 0">Use the order type tabs above to add clinical orders</p></div>';
        } else {
            var typeOrder = ['Medication', 'Investigation', 'IV Fluids', 'Diet', 'Nursing', 'Procedure'];
            var typeIcons = { 'Medication': 'pill', 'Investigation': 'flask-conical', 'IV Fluids': 'droplets', 'Diet': 'utensils', 'Nursing': 'heart-pulse', 'Procedure': 'stethoscope' };
            var typeColors = { 'Medication': '#7FFFD4', 'Investigation': '#60A5FA', 'IV Fluids': '#A78BFA', 'Diet': '#F59E0B', 'Nursing': '#F472B6', 'Procedure': '#34D399' };

            typeOrder.forEach(function(typeName) {
                var items = typeGroups[typeName];
                if (!items || items.length === 0) return;
                var tc = typeColors[typeName] || '#7FFFD4';
                html += '<div style="margin-bottom:16px;border:1px solid var(--color-border);border-radius:10px;overflow:hidden">';
                html += '<div style="padding:12px 16px;background:rgba(' + hexToRgb(tc) + ',0.08);border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between">';
                html += '<div style="display:flex;align-items:center;gap:8px"><i data-lucide="' + (typeIcons[typeName] || 'file-text') + '" style="width:16px;height:16px;color:' + tc + '"></i><span style="font-size:14px;font-weight:600">' + esc(typeName) + '</span></div>';
                html += '<span class="badge" style="background:' + tc + ';color:#003366;font-size:10px;font-weight:700">' + items.length + '</span>';
                html += '</div>';
                html += '<div style="padding:0">';

                items.forEach(function(item, idx) {
                    var statusBadge = '';
                    if (item.status === 'Active' || item.status === 'Saved') {
                        statusBadge = '<span class="badge badge-success" style="font-size:10px">' + esc(item.status) + '</span>';
                    } else if (item.status === 'Pending') {
                        statusBadge = '<span class="badge" style="font-size:10px;background:#FEF3C7;color:#92400E">Unsaved</span>';
                    } else if (item.status === 'Discontinued') {
                        statusBadge = '<span class="badge badge-destructive" style="font-size:10px">Discontinued</span>';
                    } else if (item.status === 'Completed') {
                        statusBadge = '<span class="badge badge-info" style="font-size:10px">Completed</span>';
                    } else {
                        statusBadge = '<span class="badge badge-outline" style="font-size:10px">' + esc(item.status) + '</span>';
                    }

                    var prioCls = item.priority === 'STAT' || item.priority === 'Emergency' ? 'color:var(--color-destructive)' : item.priority === 'Urgent' ? 'color:#F59E0B' : 'color:var(--color-muted-foreground)';
                    var borderBot = idx < items.length - 1 ? 'border-bottom:1px solid var(--color-border);' : '';
                    var accId = 'osAcc_' + typeName.replace(/\s/g, '') + '_' + idx;

                    var detailFields = buildOrderDetailFields(item.type, item.rawData);

                    html += '<div style="' + borderBot + '">';
                    html += '<div class="ipd-os-accordion-header" data-target="' + accId + '" style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'rgba(' + hexToRgb(tc) + ',0.04)\'" onmouseout="this.style.background=\'transparent\'">';
                    html += '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0"><i data-lucide="chevron-right" class="ipd-os-acc-chevron" style="width:14px;height:14px;color:var(--color-muted-foreground);transition:transform 0.2s;flex-shrink:0"></i><span style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(item.detail) + '</span></div>';
                    html += '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">';
                    if (item.priority && item.priority !== 'Routine') {
                        html += '<span style="font-size:10px;font-weight:600;text-transform:uppercase;' + prioCls + '">' + esc(item.priority) + '</span>';
                    }
                    html += statusBadge;
                    if ((item.status === 'Active' || item.status === 'Saved') && item.orderId) {
                        html += '<button class="btn-ghost ipd-discontinue-order" data-order-id="' + esc(item.orderId) + '" style="font-size:10px;color:var(--color-destructive);padding:2px 6px" title="Discontinue">Discontinue</button>';
                    }
                    html += '</div></div>';

                    html += '<div id="' + accId + '" class="ipd-os-accordion-body" style="display:none;padding:0 16px 12px 38px">';
                    if (detailFields.length > 0) {
                        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px">';
                        detailFields.forEach(function(f) {
                            html += '<div style="padding:4px 0"><span style="font-size:10px;color:var(--color-muted-foreground);display:block;margin-bottom:1px">' + esc(f.label) + '</span><span style="font-size:12px;font-weight:500;color:var(--color-foreground)">' + esc(f.value) + '</span></div>';
                        });
                        html += '</div>';
                    } else {
                        html += '<p style="font-size:12px;color:var(--color-muted-foreground);margin:0">No additional details available</p>';
                    }
                    html += '</div>';

                    html += '</div>';
                });

                html += '</div></div>';
            });
        }

        return html;
    }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        return r + ',' + g + ',' + b;
    }

    function renderIpdCustomSection(sec) {
        var secKey = sec.id;
        var fields = sec.fields || [];
        var savedValues = (ipdCustomOrderData && ipdCustomOrderData[secKey]) ? ipdCustomOrderData[secKey] : {};
        if (fields.length === 0) {
            return '<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="layout-panel-left" style="width:40px;height:40px;margin:0 auto 12px;display:block;opacity:0.3"></i><p style="font-weight:500">No fields defined</p><p style="font-size:13px">Edit this section in IPD Configuration to add fields.</p></div>';
        }
        var html = '<div style="display:flex;flex-direction:column;gap:16px" id="ipdCustomSectionForm" data-section-key="' + esc(secKey) + '">';
        fields.forEach(function(f) {
            var fid  = 'ipdf_' + esc(f.id || f.label);
            var val  = savedValues[f.id] !== undefined ? savedValues[f.id] : (savedValues[f.label] !== undefined ? savedValues[f.label] : '');
            var opts = Array.isArray(f.options) ? f.options : [];
            html += '<div class="form-group" style="margin:0">';
            html += '<label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;display:block">' + esc(f.label) + '</label>';
            if (f.type === 'text' || f.type === 'email' || f.type === 'password' || f.type === 'number') {
                html += '<input type="' + f.type + '" class="form-control ipd-custom-field" data-field-id="' + esc(f.id || f.label) + '" placeholder="Enter ' + esc(f.label.toLowerCase()) + '..." value="' + esc(String(val)) + '">';
            } else if (f.type === 'textarea') {
                html += '<textarea class="form-control ipd-custom-field" data-field-id="' + esc(f.id || f.label) + '" rows="3" placeholder="Enter ' + esc(f.label.toLowerCase()) + '...">' + esc(String(val)) + '</textarea>';
            } else if (f.type === 'date') {
                html += '<input type="date" class="form-control ipd-custom-field" data-field-id="' + esc(f.id || f.label) + '" value="' + esc(String(val)) + '">';
            } else if (f.type === 'time') {
                html += '<input type="time" class="form-control ipd-custom-field" data-field-id="' + esc(f.id || f.label) + '" value="' + esc(String(val)) + '">';
            } else if (f.type === 'dropdown') {
                html += '<select class="form-select ipd-custom-field" data-field-id="' + esc(f.id || f.label) + '"><option value="">-- Select --</option>';
                opts.forEach(function(o) { html += '<option value="' + esc(o) + '"' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; });
                html += '</select>';
            } else if (f.type === 'multi-select') {
                var selArr = Array.isArray(val) ? val : (val ? [val] : []);
                html += '<div class="ipd-custom-field-multisel" data-field-id="' + esc(f.id || f.label) + '" style="display:flex;flex-wrap:wrap;gap:8px">';
                opts.forEach(function(o) {
                    var checked = selArr.indexOf(o) > -1;
                    html += '<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;background:' + (checked ? 'rgba(127,255,212,0.15)' : 'var(--color-muted)') + ';border:1px solid ' + (checked ? 'var(--aquamint)' : 'var(--color-border)') + ';border-radius:6px;padding:5px 10px">' +
                        '<input type="checkbox" value="' + esc(o) + '"' + (checked ? ' checked' : '') + ' style="margin:0"> ' + esc(o) + '</label>';
                });
                html += '</div>';
            } else if (f.type === 'radio') {
                var radioVal = Array.isArray(val) ? val[0] : val;
                html += '<div style="display:flex;flex-wrap:wrap;gap:12px">';
                opts.forEach(function(o) {
                    html += '<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer">' +
                        '<input type="radio" name="' + fid + '" class="ipd-custom-field-radio" data-field-id="' + esc(f.id || f.label) + '" value="' + esc(o) + '"' + (radioVal === o ? ' checked' : '') + '> ' + esc(o) + '</label>';
                });
                html += '</div>';
            } else if (f.type === 'checkbox') {
                var chkArr = Array.isArray(val) ? val : (val ? [val] : []);
                html += '<div style="display:flex;flex-wrap:wrap;gap:12px">';
                opts.forEach(function(o) {
                    html += '<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer">' +
                        '<input type="checkbox" class="ipd-custom-field-checkbox" data-field-id="' + esc(f.id || f.label) + '" value="' + esc(o) + '"' + (chkArr.indexOf(o) > -1 ? ' checked' : '') + '> ' + esc(o) + '</label>';
                });
                html += '</div>';
            }
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    function saveIpdCustomFormValues() {
        var $form = $('#ipdCustomSectionForm');
        if ($form.length === 0) return;
        var secKey = $form.data('section-key');
        if (!secKey) return;
        if (!ipdCustomOrderData) ipdCustomOrderData = {};
        var values = {};
        $form.find('.ipd-custom-field').each(function() {
            values[$(this).data('field-id')] = $(this).val();
        });
        $form.find('.ipd-custom-field-radio:checked').each(function() {
            values[$(this).data('field-id')] = $(this).val();
        });
        var chkGroups = {};
        $form.find('.ipd-custom-field-checkbox').each(function() {
            var fid = $(this).data('field-id');
            if (!chkGroups[fid]) chkGroups[fid] = [];
            if ($(this).is(':checked')) chkGroups[fid].push($(this).val());
        });
        $.extend(values, chkGroups);
        $form.find('.ipd-custom-field-multisel').each(function() {
            var fid = $(this).data('field-id');
            var selected = [];
            $(this).find('input[type=checkbox]:checked').each(function() { selected.push($(this).val()); });
            values[fid] = selected;
        });
        ipdCustomOrderData[secKey] = values;
    }

    function bindOrdersEvents() {
        $(document).off('click.ipdOrderSection').on('click.ipdOrderSection', '.ipd-order-section-btn', function() {
            saveIpdCustomFormValues();
            orderActiveSection = $(this).data('section');
            renderOrdersSheet();
        });

        $(document).off('click.ipdOsAccordion').on('click.ipdOsAccordion', '.ipd-os-accordion-header', function(e) {
            if ($(e.target).closest('.ipd-discontinue-order').length) return;
            var targetId = $(this).data('target');
            var $body = $('#' + targetId);
            var $chevron = $(this).find('.ipd-os-acc-chevron');
            if ($body.is(':visible')) {
                $body.slideUp(200);
                $chevron.css('transform', 'rotate(0deg)');
            } else {
                $body.slideDown(200);
                $chevron.css('transform', 'rotate(90deg)');
            }
        });

        /* ── helpers for IPD medicine dropdown ── */
        function _ipdRxItemStr(item) { return typeof item === 'object' ? (item.name || '') : (item || ''); }
        function _ipdRxUnitFromStrength(str) {
            if (!str) return null;
            var m = str.match(/([a-zA-Z%\/]+)\s*$/);
            return m ? m[1].toLowerCase() : null;
        }
        function _ipdRxMatchOption(unitStr, $sel) {
            if (!unitStr) return;
            var u = unitStr.toLowerCase();
            var matched = null;
            $sel.find('option').each(function() {
                var v = $(this).val().toLowerCase();
                if (v === u) { matched = $(this).val(); return false; }
            });
            if (!matched) {
                $sel.find('option').each(function() {
                    var v = $(this).val().toLowerCase();
                    if (v.indexOf(u) === 0 || u.indexOf(v) === 0) { matched = $(this).val(); return false; }
                });
            }
            if (matched) $sel.val(matched);
        }
        function _ipdRxRefreshDropdown() {
            var q = ($('#ipdRxMedInput').val() || '').toLowerCase();
            if (ipdInventoryMedicines.length === 0) {
                $('#ipdRxMedDropdown').html(
                    '<div style="padding:12px;text-align:center;font-size:12px;color:#94a3b8">No medicines found</div>'
                ).show(); return;
            }
            var list = q ? ipdInventoryMedicines.filter(function(m) {
                return m.label.toLowerCase().indexOf(q) > -1 || m.generic.toLowerCase().indexOf(q) > -1;
            }) : ipdInventoryMedicines;
            if (list.length === 0) {
                $('#ipdRxMedDropdown').html(
                    '<div style="padding:12px;text-align:center;font-size:12px;color:#94a3b8">No medicines found</div>'
                ).show(); return;
            }
            var dh = '';
            list.slice(0, 20).forEach(function(m) {
                dh += '<div class="ipd-add-rx-med" data-name="' + esc(m.name) + '" data-strength="' + esc(m.strength) + '"' +
                    ' data-medid="' + esc(m.id) + '"' +
                    ' style="padding:8px 12px;cursor:pointer;border-bottom:1px solid #f1f5f9">' +
                    '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' +
                        esc(m.name) +
                        (m.strength ? ' <span style="font-weight:400;color:#94a3b8">' + esc(m.strength) + '</span>' : '') +
                    '</div>' +
                    (m.generic ? '<div style="font-size:11px;color:#94a3b8">' + esc(m.generic) + '</div>' : '') +
                    '</div>';
            });
            $('#ipdRxMedDropdown').html(dh).show();
        }

        $('#ipdRxMedInput').off('input.ipdRx focus.ipdRx').on('input.ipdRx focus.ipdRx', function() {
            if (!ipdMedicinesLoaded) {
                $('#ipdRxMedDropdown').html(
                    '<div style="padding:12px;text-align:center;font-size:12px;color:#94a3b8">Loading medicines…</div>'
                ).show();
                loadIpdInventoryMedicines(function() { _ipdRxRefreshDropdown(); });
                return;
            }
            _ipdRxRefreshDropdown();
        });
        $('#ipdRxMedChevron').off('mousedown.ipdRxChev').on('mousedown.ipdRxChev', function(e) {
            e.preventDefault();
            if ($('#ipdRxMedDropdown').is(':visible')) { $('#ipdRxMedDropdown').hide(); return; }
            $('#ipdRxMedInput').focus();
            _ipdRxRefreshDropdown();
        });
        $('#ipdRxMedInput').off('blur.ipdRxDrop').on('blur.ipdRxDrop', function() {
            setTimeout(function() { $('#ipdRxMedDropdown').hide(); }, 250);
        });
        /* Prevent blur when clicking inside medicine dropdown */
        $(document).off('mousedown.ipdRxDropPrev').on('mousedown.ipdRxDropPrev', '#ipdRxMedDropdown', function(e) {
            e.preventDefault();
        });
        $(document).off('click.ipdAddRxMed').on('click.ipdAddRxMed', '.ipd-add-rx-med', function() {
            var name     = $(this).data('name');
            var strength = $(this).data('strength') || '';
            ipdRxForm.medicine   = name + (strength ? ' ' + strength : '');
            ipdRxForm.medicineId = $(this).data('medid') || '';
            ipdRxForm.strength   = strength;
            $('#ipdRxMedInput').val(ipdRxForm.medicine);
            $('#ipdRxStrength').val(strength);
            $('#ipdRxMedDropdown').hide();
            /* Auto-fill unit from strength */
            var unitStr = _ipdRxUnitFromStrength(strength);
            if (unitStr) _ipdRxMatchOption(unitStr, $('#ipdRxUnit'));
        });
        $(document).off('mouseover.ipdRxMedOpt').on('mouseover.ipdRxMedOpt', '.ipd-add-rx-med', function() {
            $(this).css('background', 'rgba(127,255,212,0.07)');
        }).off('mouseout.ipdRxMedOpt').on('mouseout.ipdRxMedOpt', '.ipd-add-rx-med', function() {
            $(this).css('background', '');
        });

        $('#btnAddIpdRx').off('click').on('click', function() {
            if (!$('#ipdRxMedInput').val().trim()) return;
            var _firstUnit  = ipdPharmRxConfig.units[0]  || 'mg';
            var _firstRoute = ipdPharmRxConfig.routes[0] || 'Oral';
            var _firstFreq  = ipdPharmRxConfig.frequencies[0];
            var _firstFreqName = _firstFreq ? (typeof _firstFreq === 'object' ? _firstFreq.name : _firstFreq) : 'OD';
            ipdPrescriptionsList.push({
                medicine:   $('#ipdRxMedInput').val().trim(),
                medicineId: ipdRxForm.medicineId || '',
                strength:   ipdRxForm.strength   || '',
                dose:       $('#ipdRxDose').val()      || '',
                unit:       $('#ipdRxUnit').val()      || _firstUnit,
                route:      $('#ipdRxRoute').val()     || 'Oral',
                frequency:  $('#ipdRxFrequency').val() || 'OD',
                duration:   $('#ipdRxDuration').val()  || ''
            });
            ipdRxForm = { medicine: '', medicineId: '', strength: '', dose: '', unit: _firstUnit, route: _firstRoute, frequency: _firstFreqName, duration: '' };
            renderOrdersSheet();
        });

        $(document).off('click.ipdRemoveRx').on('click.ipdRemoveRx', '.ipd-remove-rx', function() {
            var idx = $(this).data('idx');
            var rx = ipdPrescriptionsList[idx];
            if (rx && rx.orderId) {
                $.ajax({ url: '/api/ipd/clinical-orders/' + rx.orderId + '/discontinue', method: 'PATCH' });
            }
            ipdPrescriptionsList.splice(idx, 1);
            renderOrdersSheet();
        });

        /* ── helpers for IPD investigation dropdown ── */
        function _ipdInvSearchLab(q) {
            if (ipdInvForm.type !== 'Laboratory') {
                var filtered = ipdRadiologyTests.filter(function(t) { return t.toLowerCase().indexOf((q||'').toLowerCase()) > -1; });
                var dh = '';
                filtered.slice(0, 15).forEach(function(t) {
                    dh += '<div class="ipd-add-inv-test" data-test="' + esc(t) + '" data-code=""' +
                        ' style="padding:8px 12px;cursor:pointer;border-bottom:1px solid #f1f5f9">' +
                        '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(t) + '</div>' +
                        '</div>';
                });
                $('#ipdInvTestDropdown').html(dh.length ? dh :
                    '<div style="padding:12px;text-align:center;font-size:12px;color:#94a3b8">No tests found</div>'
                ).show();
                return;
            }
            if (!q || q.length < 1) { $('#ipdInvTestDropdown').hide(); return; }
            $('#ipdInvTestDropdown').html(
                '<div style="padding:10px;text-align:center;font-size:12px;color:#94a3b8">Searching…</div>'
            ).show();
            clearTimeout(ipdLabTestSearchTimer);
            ipdLabTestSearchTimer = setTimeout(function() {
                $.get('/api/test-master/search', { q: q }, function(tests) {
                    if (!tests || tests.length === 0) {
                        $('#ipdInvTestDropdown').html(
                            '<div style="padding:12px;text-align:center;font-size:12px;color:#94a3b8">No tests found</div>'
                        ).show(); return;
                    }
                    var dh = '';
                    tests.forEach(function(t) {
                        var name = t.testName || t.test_name || '';
                        var code = t.testCode || t.test_code || '';
                        var dept = t.department || '';
                        var sample = t.sampleType || t.sample_type || '';
                        var price = t.standardPrice || t.standard_price || 0;
                        dh += '<div class="ipd-add-inv-test"' +
                            ' data-test="' + esc(name) + '"' +
                            ' data-code="' + esc(code) + '"' +
                            ' data-price="' + price + '"' +
                            ' data-dept="' + esc(dept) + '"' +
                            ' data-sample="' + esc(sample) + '"' +
                            ' style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;cursor:pointer;border-bottom:1px solid #f1f5f9">' +
                            '<div style="min-width:0;flex:1">' +
                                '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(name) +
                                    (code ? ' <span style="font-weight:400;font-family:monospace;font-size:11px;color:#94a3b8">(' + esc(code) + ')</span>' : '') +
                                '</div>' +
                                (dept || sample ? '<div style="font-size:11px;color:#94a3b8">' + esc(dept) + (sample ? ' &middot; ' + esc(sample) : '') + '</div>' : '') +
                            '</div>' +
                            (price ? '<div style="font-size:12px;font-weight:600;font-family:monospace;color:var(--aqua-mint);margin-left:10px;white-space:nowrap">PKR ' + Number(price).toLocaleString() + '</div>' : '') +
                            '</div>';
                    });
                    $('#ipdInvTestDropdown').html(dh).show();
                }).fail(function() {
                    $('#ipdInvTestDropdown').html(
                        '<div style="padding:12px;text-align:center;font-size:12px;color:#94a3b8">Search failed</div>'
                    ).show();
                });
            }, 250);
        }

        $(document).off('mouseover.ipdInvOpt').on('mouseover.ipdInvOpt', '.ipd-add-inv-test', function() {
            $(this).css('background', 'rgba(127,255,212,0.07)');
        }).off('mouseout.ipdInvOpt').on('mouseout.ipdInvOpt', '.ipd-add-inv-test', function() {
            $(this).css('background', '');
        });

        $('#ipdInvType').off('change.ipdInv').on('change.ipdInv', function() {
            ipdInvForm.type = $(this).val();
            ipdInvForm.test = ''; ipdInvForm.testCode = '';
            ipdInvForm.price = ''; ipdInvForm.dept = ''; ipdInvForm.sample = '';
            $('#ipdInvTestInput').val('');
            $('#ipdInvTestDropdown').hide();
        });

        $('#ipdInvTestInput').off('input.ipdInv focus.ipdInv').on('input.ipdInv focus.ipdInv', function() {
            _ipdInvSearchLab($(this).val());
        });
        $('#ipdInvChevron').off('mousedown.ipdInvChev').on('mousedown.ipdInvChev', function(e) {
            e.preventDefault();
            if ($('#ipdInvTestDropdown').is(':visible')) { $('#ipdInvTestDropdown').hide(); return; }
            $('#ipdInvTestInput').focus();
            _ipdInvSearchLab($('#ipdInvTestInput').val());
        });
        $('#ipdInvTestInput').off('blur.ipdInvDrop').on('blur.ipdInvDrop', function() {
            setTimeout(function() { $('#ipdInvTestDropdown').hide(); }, 250);
        });

        /* Prevent blur when clicking inside investigation dropdown */
        $(document).off('mousedown.ipdInvDropPrev').on('mousedown.ipdInvDropPrev', '#ipdInvTestDropdown', function(e) {
            e.preventDefault();
        });
        $(document).off('click.ipdAddInvTest').on('click.ipdAddInvTest', '.ipd-add-inv-test', function() {
            ipdInvForm.test     = $(this).data('test')   || '';
            ipdInvForm.testCode = $(this).data('code')   || '';
            ipdInvForm.price    = $(this).data('price')  || '';
            ipdInvForm.dept     = $(this).data('dept')   || '';
            ipdInvForm.sample   = $(this).data('sample') || '';
            $('#ipdInvTestInput').val(ipdInvForm.test);
            $('#ipdInvTestDropdown').hide();
        });

        $('#ipdInvPriority').off('change.ipdInv').on('change.ipdInv', function() { ipdInvForm.priority = $(this).val(); });

        $('#btnAddIpdInv').off('click').on('click', function() {
            if (!$('#ipdInvTestInput').val().trim()) return;
            ipdInvestigationsList.push({
                type: ipdInvForm.type, test: $('#ipdInvTestInput').val().trim(),
                testCode: ipdInvForm.testCode, price: ipdInvForm.price,
                dept: ipdInvForm.dept, sample: ipdInvForm.sample, priority: ipdInvForm.priority
            });
            ipdInvForm.test = ''; ipdInvForm.testCode = '';
            ipdInvForm.price = ''; ipdInvForm.dept = ''; ipdInvForm.sample = '';
            renderOrdersSheet();
        });

        $(document).off('click.ipdRemoveInv').on('click.ipdRemoveInv', '.ipd-remove-inv', function() {
            var idx = $(this).data('idx');
            var inv = ipdInvestigationsList[idx];
            if (inv && inv.orderId) {
                $.ajax({ url: '/api/ipd/clinical-orders/' + inv.orderId + '/discontinue', method: 'PATCH' });
            }
            ipdInvestigationsList.splice(idx, 1);
            renderOrdersSheet();
        });

        // IV Fluids events
        $(document).off('click.ipdIVQuickVol').on('click.ipdIVQuickVol', '.ipd-iv-quick-vol', function() {
            ipdIVForm.volume = $(this).data('vol').toString();
            $('#ipdIVVolume').val(ipdIVForm.volume);
            renderOrdersSheet();
        });
        $(document).off('click.ipdIVQuickRate').on('click.ipdIVQuickRate', '.ipd-iv-quick-rate', function() {
            ipdIVForm.rate = $(this).data('rate').toString();
            ipdIVForm.rateMethod = 'rate';
            renderOrdersSheet();
        });
        $('#ipdIVFluidType').off('change').on('change', function() { ipdIVForm.fluidType = $(this).val(); renderOrdersSheet(); });
        $('#ipdIVOtherFluid').off('input').on('input', function() { ipdIVForm.otherFluid = $(this).val(); });
        $('#ipdIVVolume').off('input').on('input', function() { ipdIVForm.volume = $(this).val(); });
        $('#ipdIVRateMethod').off('change').on('change', function() { ipdIVForm.rateMethod = $(this).val(); renderOrdersSheet(); });
        $('#ipdIVRate').off('input').on('input', function() { ipdIVForm.rate = $(this).val(); });
        $('#ipdIVAccess').off('change').on('change', function() { ipdIVForm.ivAccess = $(this).val(); });
        $('#ipdIVSite').off('input').on('input', function() { ipdIVForm.site = $(this).val(); });
        $('#ipdIVStartTime').off('change').on('change', function() { ipdIVForm.startTime = $(this).val(); });
        $('#ipdIVFrequency').off('change').on('change', function() { ipdIVForm.frequency = $(this).val(); });
        $('#ipdIVDailyGoal').off('input').on('input', function() { ipdIVForm.dailyFluidGoal = $(this).val(); });
        $('#ipdIVMonitorIO').off('change').on('change', function() { ipdIVForm.monitorIO = $(this).is(':checked'); });
        $('#ipdIVCheckSite').off('change').on('change', function() { ipdIVForm.checkSite = $(this).is(':checked'); });
        $('#ipdIVWatchOverload').off('change').on('change', function() { ipdIVForm.watchOverload = $(this).is(':checked'); });
        $('#ipdIVSpecialInst').off('input').on('input', function() { ipdIVForm.specialInstructions = $(this).val(); });
        $('#btnAddIVAdditive').off('click').on('click', function() {
            if (!ipdIVForm.additives) ipdIVForm.additives = [];
            ipdIVForm.additives.push({ drug: '', dose: '' });
            renderOrdersSheet();
        });
        $(document).off('click.ipdIVRemoveAdditive').on('click.ipdIVRemoveAdditive', '.ipd-iv-remove-additive', function() {
            ipdIVForm.additives.splice($(this).data('idx'), 1);
            renderOrdersSheet();
        });
        $(document).off('input.ipdIVAdditiveDrug').on('input.ipdIVAdditiveDrug', '.ipd-iv-additive-drug', function() { ipdIVForm.additives[$(this).data('idx')].drug = $(this).val(); });
        $(document).off('input.ipdIVAdditiveDose').on('input.ipdIVAdditiveDose', '.ipd-iv-additive-dose', function() { ipdIVForm.additives[$(this).data('idx')].dose = $(this).val(); });
        $('#btnAddIVFluid').off('click').on('click', function() {
            if (!$('#ipdIVFluidType').val()) { showToast('Please select a fluid type', 'error'); return; }
            ipdIVFluidsList.push($.extend({}, ipdIVForm, { fluidType: $('#ipdIVFluidType').val() }));
            ipdIVForm = { fluidType: '', volume: '1000', rateMethod: 'rate', rate: '125', additives: [], ivAccess: 'Peripheral IV (existing)', site: '', startTime: 'now', frequency: 'continuous', dailyFluidGoal: '', monitorIO: true, checkSite: true, watchOverload: true, specialInstructions: '' };
            renderOrdersSheet();
        });
        $(document).off('click.ipdRemoveIV').on('click.ipdRemoveIV', '.ipd-remove-iv', function() {
            var idx = $(this).data('idx');
            var iv = ipdIVFluidsList[idx];
            if (iv && iv.orderId) { $.ajax({ url: '/api/ipd/clinical-orders/' + iv.orderId + '/discontinue', method: 'PATCH' }); }
            ipdIVFluidsList.splice(idx, 1);
            renderOrdersSheet();
        });

        // Diet events
        $('#ipdDietType').off('change').on('change', function() { ipdDietForm.dietType = $(this).val(); renderOrdersSheet(); });
        $('#ipdDietOther').off('input').on('input', function() { ipdDietForm.otherDiet = $(this).val(); });
        $(document).off('change.ipdDietRestriction').on('change.ipdDietRestriction', '.ipd-diet-restriction', function() {
            ipdDietForm.restrictions = [];
            $('.ipd-diet-restriction:checked').each(function() { ipdDietForm.restrictions.push($(this).val()); });
        });
        $('#ipdDietAllergies').off('input').on('input', function() { ipdDietForm.foodAllergies = $(this).val(); });
        $('#ipdDietPreferences').off('input').on('input', function() { ipdDietForm.foodPreferences = $(this).val(); });
        $('#ipdDietRoute').off('change').on('change', function() { ipdDietForm.feedingRoute = $(this).val(); });
        $('#ipdDietMealFreq').off('change').on('change', function() { ipdDietForm.mealFrequency = $(this).val(); });
        $('#ipdDietFluidRestrict').off('change').on('change', function() { ipdDietForm.fluidRestriction = $(this).val(); renderOrdersSheet(); });
        $('#ipdDietFluidAmount').off('input').on('input', function() { ipdDietForm.fluidRestrictAmount = $(this).val(); });
        $('#ipdDietStart').off('change').on('change', function() { ipdDietForm.startTime = $(this).val(); });
        $('#ipdDietDuration').off('change').on('change', function() { ipdDietForm.duration = $(this).val(); renderOrdersSheet(); });
        $('#ipdDietDays').off('input').on('input', function() { ipdDietForm.durationDays = $(this).val(); });
        $('#ipdDietSpecialInst').off('input').on('input', function() { ipdDietForm.specialInstructions = $(this).val(); });
        $('#btnAddDietOrder').off('click').on('click', function() {
            if (!$('#ipdDietType').val()) { showToast('Please select a diet type', 'error'); return; }
            ipdDietOrdersList.push($.extend({}, ipdDietForm));
            ipdDietForm = { dietType: 'Regular Diet', restrictions: [], foodAllergies: '', foodPreferences: '', feedingRoute: 'Oral Feeding', mealFrequency: '3 Main Meals + 2 Snacks', fluidRestriction: 'none', fluidRestrictAmount: '', startTime: 'next_meal', duration: 'until_further', durationDays: '', specialInstructions: '' };
            renderOrdersSheet();
        });
        $(document).off('click.ipdRemoveDiet').on('click.ipdRemoveDiet', '.ipd-remove-diet', function() {
            var idx = $(this).data('idx');
            var d = ipdDietOrdersList[idx];
            if (d && d.orderId) { $.ajax({ url: '/api/ipd/clinical-orders/' + d.orderId + '/discontinue', method: 'PATCH' }); }
            ipdDietOrdersList.splice(idx, 1);
            renderOrdersSheet();
        });

        // Nursing events
        $('#ipdNursingType').off('change').on('change', function() { ipdNursingForm.orderType = $(this).val(); renderOrdersSheet(); });
        $('#ipdNursingOther').off('input').on('input', function() { ipdNursingForm.otherType = $(this).val(); });
        $(document).off('change.ipdNursingVital').on('change.ipdNursingVital', '.ipd-nursing-vital', function() {
            ipdNursingForm.vitals = [];
            $('.ipd-nursing-vital:checked').each(function() { ipdNursingForm.vitals.push($(this).val()); });
        });
        $('#ipdNursingFreq').off('change').on('change', function() { ipdNursingForm.frequency = $(this).val(); });
        $('#ipdNursingDuration').off('change').on('change', function() { ipdNursingForm.duration = $(this).val(); renderOrdersSheet(); });
        $('#ipdNursingDurationVal').off('input').on('input', function() { ipdNursingForm.durationHours = $(this).val(); });
        $('#ipdAlertBPLow').off('input').on('input', function() { ipdNursingForm.alertBPLow = $(this).val(); });
        $('#ipdAlertBPHigh').off('input').on('input', function() { ipdNursingForm.alertBPHigh = $(this).val(); });
        $('#ipdAlertHRLow').off('input').on('input', function() { ipdNursingForm.alertHRLow = $(this).val(); });
        $('#ipdAlertHRHigh').off('input').on('input', function() { ipdNursingForm.alertHRHigh = $(this).val(); });
        $('#ipdAlertRRLow').off('input').on('input', function() { ipdNursingForm.alertRRLow = $(this).val(); });
        $('#ipdAlertRRHigh').off('input').on('input', function() { ipdNursingForm.alertRRHigh = $(this).val(); });
        $('#ipdAlertTempLow').off('input').on('input', function() { ipdNursingForm.alertTempLow = $(this).val(); });
        $('#ipdAlertTempHigh').off('input').on('input', function() { ipdNursingForm.alertTempHigh = $(this).val(); });
        $('#ipdAlertSpO2').off('input').on('input', function() { ipdNursingForm.alertSpO2 = $(this).val(); });
        $('#ipdNursingSpecialInst').off('input').on('input', function() { ipdNursingForm.specialInstructions = $(this).val(); });
        $('#btnAddNursingOrder').off('click').on('click', function() {
            if (!$('#ipdNursingType').val()) { showToast('Please select a nursing order type', 'error'); return; }
            ipdNursingOrdersList.push($.extend({}, ipdNursingForm, { vitals: ipdNursingForm.vitals.slice() }));
            ipdNursingForm = { orderType: '', vitals: ['Blood Pressure', 'Heart Rate/Pulse', 'Respiratory Rate', 'Temperature', 'Oxygen Saturation (SpO2)'], frequency: 'Q4H', duration: 'until_further', durationHours: '', alertBPLow: '90/60', alertBPHigh: '180/100', alertHRLow: '50', alertHRHigh: '120', alertRRLow: '12', alertRRHigh: '24', alertTempLow: '35.5', alertTempHigh: '38.5', alertSpO2: '90', specialInstructions: '' };
            renderOrdersSheet();
        });
        $(document).off('click.ipdRemoveNursing').on('click.ipdRemoveNursing', '.ipd-remove-nursing', function() {
            var idx = $(this).data('idx');
            var n = ipdNursingOrdersList[idx];
            if (n && n.orderId) { $.ajax({ url: '/api/ipd/clinical-orders/' + n.orderId + '/discontinue', method: 'PATCH' }); }
            ipdNursingOrdersList.splice(idx, 1);
            renderOrdersSheet();
        });

        // Procedure events
        $('#ipdProcProcedure').off('change').on('change', function() { ipdProcForm.procedure = $(this).val(); });
        $('#ipdProcIndication').off('input').on('input', function() { ipdProcForm.indication = $(this).val(); });
        $('#ipdProcDiagnosis').off('input').on('input', function() { ipdProcForm.diagnosis = $(this).val(); });
        $('#ipdProcPriority').off('change').on('change', function() { ipdProcForm.priority = $(this).val(); });
        $('#ipdProcLocation').off('change').on('change', function() { ipdProcForm.location = $(this).val(); });
        $('#ipdProcConsent').off('change').on('change', function() { ipdProcForm.consentObtained = $(this).is(':checked'); renderOrdersSheet(); });
        $('#ipdProcConsentBy').off('change').on('change', function() { ipdProcForm.consentBy = $(this).val(); });
        $('#ipdProcConsentDate').off('change').on('change', function() { ipdProcForm.consentDate = $(this).val(); });
        $('#ipdProcConsentWitness').off('input').on('input', function() { ipdProcForm.consentWitness = $(this).val(); });
        $('#btnAddProcOrder').off('click').on('click', function() {
            if (!$('#ipdProcProcedure').val()) { showToast('Please select a procedure', 'error'); return; }
            if (!$('#ipdProcIndication').val().trim()) { showToast('Clinical indication is required', 'error'); return; }
            ipdProcedureOrdersList.push($.extend({}, ipdProcForm, { preProc: ipdProcForm.preProc.slice() }));
            ipdProcForm = { procedure: '', indication: '', diagnosis: '', priority: 'Emergency', location: 'Bedside', consentObtained: false, consentBy: '', consentDate: '', consentWitness: '', preProc: [], specialInstructions: '', estimatedDuration: '', estimatedCost: '' };
            renderOrdersSheet();
        });
        $(document).off('click.ipdRemoveProc').on('click.ipdRemoveProc', '.ipd-remove-proc', function() {
            var idx = $(this).data('idx');
            var pr = ipdProcedureOrdersList[idx];
            if (pr && pr.orderId) { $.ajax({ url: '/api/ipd/clinical-orders/' + pr.orderId + '/discontinue', method: 'PATCH' }); }
            ipdProcedureOrdersList.splice(idx, 1);
            renderOrdersSheet();
        });

        $(document).off('click.ipdDiscontinue').on('click.ipdDiscontinue', '.ipd-discontinue-order', function() {
            var orderId = $(this).data('order-id');
            $.ajax({ url: '/api/ipd/clinical-orders/' + orderId + '/discontinue', method: 'PATCH' }).done(function() {
                showToast('Order discontinued', 'success');
                openOrdersDetail(selectedOrderAdmission);
            }).fail(function() { showToast('Failed to discontinue order', 'error'); });
        });

        $('#btnSaveIpdOrders').off('click').on('click', function() {
            var adm = admissions.find(function(a) { return a.admissionId === selectedOrderAdmission; });
            if (!adm) return;
            var btn = $(this);
            btn.prop('disabled', true).text('Saving...');

            saveIpdCustomFormValues();

            var newMeds = ipdPrescriptionsList.filter(function(rx) { return !rx.orderId; });
            var newInvs = ipdInvestigationsList.filter(function(inv) { return !inv.orderId; });
            var newIVs = ipdIVFluidsList.filter(function(iv) { return !iv.orderId; });
            var newDiets = ipdDietOrdersList.filter(function(d) { return !d.orderId; });
            var newNursing = ipdNursingOrdersList.filter(function(n) { return !n.orderId; });
            var newProcs = ipdProcedureOrdersList.filter(function(p) { return !p.orderId; });

            var hasCustomData = ipdCustomOrderData && Object.keys(ipdCustomOrderData).length > 0;

            if (newMeds.length === 0 && newInvs.length === 0 && newIVs.length === 0 && newDiets.length === 0 && newNursing.length === 0 && newProcs.length === 0 && !hasCustomData) {
                showToast('No new orders to save', 'info');
                btn.prop('disabled', false).html('<i data-lucide="send" style="width:16px;height:16px"></i> Save Orders');
                lucide.createIcons();
                return;
            }

            var requests = [];
            newMeds.forEach(function(rx) {
                requests.push($.ajax({
                    url: '/api/ipd/clinical-orders',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        mrn: adm.mrn,
                        admissionId: adm.admissionId,
                        type: 'Medication',
                        priority: 'Routine',
                        details: rx.medicine + ' ' + rx.dose + rx.unit + ' - ' + rx.route + ' - ' + rx.frequency,
                        orderedBy: adm.doctorName,
                        metadata: { medicine: rx.medicine, dose: rx.dose, unit: rx.unit, route: rx.route, frequency: rx.frequency, duration: rx.duration }
                    })
                }));
            });
            newInvs.forEach(function(inv) {
                requests.push($.ajax({
                    url: '/api/ipd/clinical-orders',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        mrn: adm.mrn,
                        admissionId: adm.admissionId,
                        type: 'Investigation',
                        priority: inv.priority,
                        details: inv.type + ': ' + inv.test,
                        orderedBy: adm.doctorName,
                        metadata: { investigationType: inv.type, test: inv.test, testCode: inv.testCode || '', price: inv.price || '', dept: inv.dept || '', sample: inv.sample || '' }
                    })
                }));
            });
            newIVs.forEach(function(iv) {
                requests.push($.ajax({
                    url: '/api/ipd/clinical-orders',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        mrn: adm.mrn,
                        admissionId: adm.admissionId,
                        type: 'IV Fluids',
                        priority: 'Routine',
                        details: iv.fluidType + ' ' + iv.volume + 'mL @ ' + iv.rate + ' mL/hr',
                        orderedBy: adm.doctorName,
                        metadata: iv
                    })
                }));
            });
            newDiets.forEach(function(d) {
                requests.push($.ajax({
                    url: '/api/ipd/clinical-orders',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        mrn: adm.mrn,
                        admissionId: adm.admissionId,
                        type: 'Diet',
                        priority: 'Routine',
                        details: d.dietType + ' - ' + d.feedingRoute,
                        orderedBy: adm.doctorName,
                        metadata: d
                    })
                }));
            });
            newNursing.forEach(function(n) {
                requests.push($.ajax({
                    url: '/api/ipd/clinical-orders',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        mrn: adm.mrn,
                        admissionId: adm.admissionId,
                        type: 'Nursing',
                        priority: 'Routine',
                        details: n.orderType + ' - ' + n.frequency,
                        orderedBy: adm.doctorName,
                        metadata: n
                    })
                }));
            });
            newProcs.forEach(function(p) {
                requests.push($.ajax({
                    url: '/api/ipd/clinical-orders',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        mrn: adm.mrn,
                        admissionId: adm.admissionId,
                        type: 'Procedure',
                        priority: p.priority === 'Emergency' ? 'STAT' : (p.priority === 'Urgent' ? 'Urgent' : 'Routine'),
                        details: p.procedure + ' - ' + p.indication,
                        orderedBy: adm.doctorName,
                        metadata: p
                    })
                }));
            });

            if (hasCustomData) {
                requests.push($.ajax({
                    url: '/api/ipd/admissions/' + adm.admissionId + '/custom-order-data',
                    method: 'PATCH',
                    contentType: 'application/json',
                    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                    data: JSON.stringify({ customOrderData: ipdCustomOrderData })
                }));
            }

            $.when.apply($, requests).done(function() {
                showToast('Orders saved successfully', 'success');
                openOrdersDetail(selectedOrderAdmission);
                loadIpdInvestigations();
            }).fail(function(xhr) {
                showToast(xhr.responseJSON?.error || 'Failed to save orders', 'error');
            }).always(function() {
                btn.prop('disabled', false).html('<i data-lucide="send" style="width:16px;height:16px"></i> Save Orders');
                lucide.createIcons();
            });
        });

        $(document).off('click.ipdCloseDropdowns').on('click.ipdCloseDropdowns', function(e) {
            if (!$(e.target).closest('#ipdRxMedInput, #ipdRxMedDropdown, #ipdRxMedChevron').length) $('#ipdRxMedDropdown').hide();
            if (!$(e.target).closest('#ipdInvTestInput, #ipdInvTestDropdown, #ipdInvChevron').length) $('#ipdInvTestDropdown').hide();
        });
    }

    // ===== TAB 4: MEDICATION MAR =====
    var marTaskStatuses = {};
    var marSelectedDate = new Date().toISOString().split('T')[0];

    function freqPerDay(freq) {
        var tpd = getIpdFreqTimesPerDay(freq);
        if (tpd !== null && tpd !== undefined) return tpd;
        var map = { 'OD': 1, 'BD': 2, 'TDS': 3, 'QID': 4, 'PRN': 1, 'SOS': 1 };
        return map[freq] || 1;
    }

    function parseDurationDays(dur) {
        if (!dur) return 1;
        var m = dur.match(/(\d+)/);
        return m ? parseInt(m[1]) : 1;
    }

    function getTimeSlots(freq) {
        var map = {
            'OD': [{ slot: 'Morning', time: '08:00 AM' }],
            'BD': [{ slot: 'Morning', time: '08:00 AM' }, { slot: 'Night', time: '08:00 PM' }],
            'TDS': [{ slot: 'Morning', time: '08:00 AM' }, { slot: 'Afternoon', time: '02:00 PM' }, { slot: 'Night', time: '08:00 PM' }],
            'QID': [{ slot: 'Morning', time: '06:00 AM' }, { slot: 'Morning', time: '12:00 PM' }, { slot: 'Afternoon', time: '06:00 PM' }, { slot: 'Night', time: '12:00 AM' }],
            'PRN': [{ slot: 'Morning', time: 'As Needed' }],
            'SOS': [{ slot: 'Morning', time: 'Emergency' }]
        };
        return map[freq] || map['OD'];
    }

    function buildMarTasks(orders, admissionId) {
        var tasks = [];
        var medOrders = orders.filter(function(o) {
            return o.type === 'Medication' && o.status === 'Active' && o.admissionId === admissionId;
        });

        medOrders.forEach(function(order) {
            var md = order.metadata || {};
            var medicine = md.medicine || order.details || '';
            var dose = md.dose || '';
            var unit = md.unit || '';
            var route = md.route || 'Oral';
            var frequency = md.frequency || 'OD';
            var duration = md.duration || '1 day';
            var durationDays = parseDurationDays(duration);
            var perDay = freqPerDay(frequency);
            var totalTasks = parseInt(dose || 1) * perDay * durationDays;
            var slots = getTimeSlots(frequency);
            var orderDate = order.orderedAt ? new Date(order.orderedAt) : new Date();
            var orderDateStr = orderDate.toISOString().split('T')[0];

            for (var day = 0; day < durationDays; day++) {
                var taskDate = new Date(orderDate);
                taskDate.setDate(taskDate.getDate() + day);
                var dateStr = taskDate.toISOString().split('T')[0];

                slots.forEach(function(s, slotIdx) {
                    var taskId = order.orderId + '_d' + day + '_s' + slotIdx;
                    var savedStatus = marTaskStatuses[taskId];
                    tasks.push({
                        taskId: taskId,
                        orderId: order.orderId,
                        medicine: medicine,
                        dose: dose + ' ' + unit,
                        route: route,
                        frequency: frequency,
                        slot: s.slot,
                        time: s.time,
                        date: dateStr,
                        day: day + 1,
                        totalDays: durationDays,
                        totalTasks: totalTasks,
                        status: savedStatus || 'pending',
                        givenAt: savedStatus === 'given' ? (marTaskStatuses[taskId + '_time'] || '') : ''
                    });
                });
            }
        });
        return tasks;
    }

    function renderMARTab() {
        $.get('/api/ipd/clinical-orders').done(function(allOrders) {
            allOrders = allOrders || [];
            var medOrders = allOrders.filter(function(o) { return o.type === 'Medication' && o.status === 'Active'; });

            var admissionIds = {};
            medOrders.forEach(function(o) { admissionIds[o.admissionId] = true; });

            marPatients = [];
            admissions.forEach(function(adm) {
                if (admissionIds[adm.admissionId] && (adm.status === 'Active' || adm.status === 'Admitted')) {
                    var tasks = buildMarTasks(allOrders, adm.admissionId);
                    var todayTasks = tasks.filter(function(t) { return t.date === marSelectedDate; });
                    var pending = todayTasks.filter(function(t) { return t.status === 'pending'; }).length;
                    var given = todayTasks.filter(function(t) { return t.status === 'given'; }).length;
                    marPatients.push({
                        admissionId: adm.admissionId,
                        name: adm.patientName,
                        mrn: adm.mrn,
                        bed: adm.bedNumber || adm.wardName || '-',
                        due: pending,
                        completed: given,
                        total: todayTasks.length,
                        allTasks: tasks
                    });
                }
            });

            renderMARPatientList();
            renderMARContent(allOrders);
        }).fail(function() {
            marPatients = [];
            renderMARPatientList();
            $('#marMainContent').html('<div class="empty-state"><i data-lucide="pill"></i><p>Failed to load medication orders</p></div>');
            lucide.createIcons();
        });
    }

    function renderMARPatientList() {
        /* update stat tiles */
        var totalPending = 0, totalGiven = 0, totalDoses = 0;
        marPatients.forEach(function(p) { totalPending += (p.due || 0); totalGiven += (p.completed || 0); totalDoses += (p.total || 0); });
        var setEl = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
        setEl('marStatPatients', marPatients.length);
        setEl('marStatPending',  totalPending);
        setEl('marStatGiven',    totalGiven);
        setEl('marStatTotal',    totalDoses);

        if (marPatients.length === 0) {
            $('#marPatientList').html('<div style="padding:24px;text-align:center;color:var(--color-muted-foreground);font-size:14px"><i data-lucide="pill" style="width:32px;height:32px;opacity:0.3;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto"></i>No patients with active medications</div>');
            $('#marMainContent').html('<div class="empty-state"><i data-lucide="pill"></i><p>No medication records</p><p class="empty-sub">Admit patients and add medication orders first</p></div>');
            lucide.createIcons();
            return;
        }

        var search = ($('#marPatientSearch').val() || '').toLowerCase();
        var html = '';
        marPatients.forEach(function(p, i) {
            if (search && p.name.toLowerCase().indexOf(search) === -1 && p.mrn.toLowerCase().indexOf(search) === -1) return;
            var activeClass = selectedMarPatient === i ? ' active' : '';
            var overdueClass = p.due > 0 ? ' overdue' : '';
            html += '<button class="mar-patient-btn' + activeClass + overdueClass + '" data-index="' + i + '">' +
                '<div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + esc(getInitials(p.name)) + '</div>' +
                '<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(p.name) + '</span><span class="badge badge-outline" style="font-size:10px;flex-shrink:0">' + esc(p.bed) + '</span></div>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-top:2px">' +
                    (p.due > 0 ? '<span style="font-size:10px;font-weight:500;color:#F59E0B">' + p.due + ' Pending</span>' : '') +
                    (p.completed > 0 ? '<span style="font-size:10px;font-weight:500;color:var(--color-success)">' + p.completed + ' Given</span>' : '') +
                    (p.due === 0 && p.completed === 0 ? '<span style="font-size:10px;font-weight:500;color:var(--color-muted-foreground)">No tasks today</span>' : '') +
                    (p.due === 0 && p.total > 0 ? '<span style="font-size:10px;font-weight:500;color:var(--color-success)">All Clear</span>' : '') +
                '</div></div></button>';
        });
        $('#marPatientList').html(html);
        lucide.createIcons();
    }

    function renderMARContent(allOrders) {
        var selected = marPatients[selectedMarPatient];
        if (!selected) {
            $('#marMainContent').html('<div class="empty-state"><i data-lucide="pill"></i><p>Select a patient</p><p class="empty-sub">Choose a patient from the list to view their medication schedule</p></div>');
            lucide.createIcons();
            return;
        }

        var tasks = selected.allTasks || [];
        var todayTasks = tasks.filter(function(t) { return t.date === marSelectedDate; });

        var dateObj = new Date(marSelectedDate + 'T00:00:00');
        var dateDisplay = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        var totalToday = todayTasks.length;
        var givenToday = todayTasks.filter(function(t) { return t.status === 'given'; }).length;
        var pendingToday = totalToday - givenToday;
        var progressPct = totalToday > 0 ? Math.round((givenToday / totalToday) * 100) : 0;

        var mainHtml = '<div style="display:flex;flex-direction:column;gap:16px">';

        mainHtml += '<div style="display:flex;align-items:center;justify-content:space-between;border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="display:flex;align-items:center;gap:12px"><div class="avatar" style="width:40px;height:40px;background:var(--midnight-blue);color:#fff;font-size:12px;font-weight:700">' + esc(getInitials(selected.name)) + '</div><div><h3 style="font-size:16px;font-weight:600;margin:0">' + esc(selected.name) + '</h3><span style="font-size:12px;color:var(--color-muted-foreground)">MRN: ' + esc(selected.mrn) + ' | Bed: ' + esc(selected.bed) + '</span></div></div>' +
            '<div style="display:flex;align-items:center;gap:12px">' +
                '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:var(--midnight-blue)">' + givenToday + '/' + totalToday + '</div><div style="font-size:10px;color:var(--color-muted-foreground)">Completed</div></div>' +
                '<div style="width:48px;height:48px;border-radius:50%;background:conic-gradient(var(--color-success) ' + progressPct + '%, #e2e8f0 0);display:flex;align-items:center;justify-content:center"><div style="width:38px;height:38px;border-radius:50%;background:var(--color-card);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">' + progressPct + '%</div></div>' +
            '</div>' +
        '</div>';

        var allDates = {};
        tasks.forEach(function(t) { allDates[t.date] = true; });
        var dateKeys = Object.keys(allDates).sort();
        var todayStr = new Date().toISOString().split('T')[0];
        if (dateKeys.indexOf(todayStr) === -1) dateKeys.push(todayStr);
        dateKeys.sort();
        if (dateKeys.indexOf(marSelectedDate) === -1) dateKeys.push(marSelectedDate);
        dateKeys.sort();

        mainHtml += '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);padding:12px 8px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="display:flex;align-items:center;gap:6px">' +
                '<button class="mar-date-nav" data-dir="-1" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--color-border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i data-lucide="chevron-left" style="width:14px;height:14px"></i></button>' +
                '<div style="display:flex;gap:6px;overflow-x:auto;flex:1;padding:2px 0;scrollbar-width:none" id="marDateStrip">';

        dateKeys.forEach(function(d) {
            var dObj = new Date(d + 'T00:00:00');
            var dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
            var dayNum = dObj.getDate();
            var monthName = dObj.toLocaleDateString('en-US', { month: 'short' });
            var isSelected = d === marSelectedDate;
            var isToday = d === todayStr;
            var dayTasks = tasks.filter(function(t) { return t.date === d; });
            var dayGiven = dayTasks.filter(function(t) { return t.status === 'given'; }).length;
            var dayTotal = dayTasks.length;
            var allDone = dayTotal > 0 && dayGiven === dayTotal;
            var hasTasks = dayTotal > 0;

            var bgColor = isSelected ? 'var(--midnight-blue)' : 'transparent';
            var textColor = isSelected ? '#fff' : 'var(--color-foreground)';
            var borderColor = isSelected ? 'var(--midnight-blue)' : isToday ? 'var(--aqua-mint)' : 'var(--color-border)';
            var borderWidth = isToday && !isSelected ? '2px' : '1px';

            mainHtml += '<button class="mar-date-jump" data-date="' + d + '" style="min-width:58px;padding:6px 8px;border-radius:10px;border:' + borderWidth + ' solid ' + borderColor + ';background:' + bgColor + ';color:' + textColor + ';cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;transition:all 0.15s;position:relative">' +
                '<span style="font-size:9px;font-weight:500;text-transform:uppercase;opacity:0.7">' + dayName + '</span>' +
                '<span style="font-size:18px;font-weight:700;line-height:1">' + dayNum + '</span>' +
                '<span style="font-size:9px;opacity:0.7">' + monthName + '</span>';
            if (hasTasks) {
                var dotColor = allDone ? 'var(--color-success)' : (dayGiven > 0 ? '#F59E0B' : 'var(--color-muted-foreground)');
                if (isSelected) dotColor = allDone ? '#86efac' : (dayGiven > 0 ? '#fde68a' : 'rgba(255,255,255,0.5)');
                mainHtml += '<div style="display:flex;gap:2px;margin-top:1px">';
                for (var di = 0; di < Math.min(dayTotal, 5); di++) {
                    var taskDone = di < dayGiven;
                    mainHtml += '<span style="width:4px;height:4px;border-radius:50%;background:' + (taskDone ? dotColor : (isSelected ? 'rgba(255,255,255,0.3)' : '#e2e8f0')) + '"></span>';
                }
                if (dayTotal > 5) mainHtml += '<span style="font-size:7px;color:' + (isSelected ? 'rgba(255,255,255,0.6)' : 'var(--color-muted-foreground)') + '">+</span>';
                mainHtml += '</div>';
            }
            mainHtml += '</button>';
        });

        mainHtml += '</div>' +
                '<button class="mar-date-nav" data-dir="1" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--color-border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i data-lucide="chevron-right" style="width:14px;height:14px"></i></button>' +
            '</div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:0 4px">' +
                '<span style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + dateDisplay + '</span>' +
                '<div style="display:flex;gap:6px">' +
                    '<span class="badge badge-outline" style="font-size:10px"><i data-lucide="circle" style="width:8px;height:8px;fill:#F59E0B;color:#F59E0B"></i> ' + pendingToday + ' Pending</span>' +
                    '<span class="badge badge-outline" style="font-size:10px"><i data-lucide="circle" style="width:8px;height:8px;fill:var(--color-success);color:var(--color-success)"></i> ' + givenToday + ' Given</span>' +
                '</div>' +
            '</div>' +
        '</div>';

        var shifts = ['Morning', 'Afternoon', 'Night'];
        var shiftIcons = { 'Morning': 'sunrise', 'Afternoon': 'sun', 'Night': 'moon' };
        var shiftColors = { 'Morning': '#F59E0B', 'Afternoon': '#F97316', 'Night': '#6366F1' };

        shifts.forEach(function(shift) {
            var shiftTasks = todayTasks.filter(function(t) { return t.slot === shift; });
            if (shiftTasks.length === 0) return;

            var shiftGiven = shiftTasks.filter(function(t) { return t.status === 'given'; }).length;

            mainHtml += '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);box-shadow:0 1px 3px rgba(0,0,0,0.04);overflow:hidden">' +
                '<div style="border-bottom:1px solid var(--color-border);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;background:' + shiftColors[shift] + '10">' +
                    '<div style="display:flex;align-items:center;gap:8px"><i data-lucide="' + shiftIcons[shift] + '" style="width:18px;height:18px;color:' + shiftColors[shift] + '"></i><h4 style="font-size:14px;font-weight:600;margin:0">' + shift + '</h4></div>' +
                    '<span style="font-size:12px;color:var(--color-muted-foreground)">' + shiftGiven + '/' + shiftTasks.length + ' done</span>' +
                '</div>';

            shiftTasks.forEach(function(task) {
                var isGiven = task.status === 'given';
                var checkColor = isGiven ? 'var(--color-success)' : 'var(--color-border)';
                var bgStyle = isGiven ? 'background:rgba(34,197,94,0.04)' : '';
                var textDecor = isGiven ? 'text-decoration:line-through;opacity:0.6' : '';

                mainHtml += '<div class="med-schedule-row" style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--color-border);' + bgStyle + '">' +
                    '<div style="display:flex;align-items:center;gap:12px">' +
                        '<button class="mar-check-btn" data-task-id="' + esc(task.taskId) + '" data-patient-idx="' + selectedMarPatient + '" style="width:24px;height:24px;border-radius:6px;border:2px solid ' + checkColor + ';background:' + (isGiven ? 'var(--color-success)' : 'transparent') + ';cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s">' +
                            (isGiven ? '<i data-lucide="check" style="width:14px;height:14px;color:#fff"></i>' : '') +
                        '</button>' +
                        '<div style="display:flex;align-items:center;gap:8px;width:70px"><i data-lucide="clock" style="width:12px;height:12px;color:var(--color-muted-foreground)"></i><span style="font-size:13px;font-weight:600;' + textDecor + '">' + esc(task.time) + '</span></div>' +
                        '<div style="' + textDecor + '"><p style="font-size:14px;font-weight:500;margin:0">' + esc(task.medicine) + '</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">' + esc(task.dose) + ' - ' + esc(task.route) + ' | Day ' + task.day + '/' + task.totalDays + '</p></div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:8px">' +
                        '<span class="badge ' + (isGiven ? 'badge-success' : 'badge-outline') + '" style="font-size:10px">' + esc(task.frequency) + '</span>' +
                        (isGiven ? '<span style="font-size:10px;color:var(--color-success)"><i data-lucide="check-circle-2" style="width:10px;height:10px"></i> ' + esc(task.givenAt) + '</span>' : '<button class="btn-primary btn-sm mar-give-btn" data-task-id="' + esc(task.taskId) + '">Administer</button>') +
                    '</div>' +
                '</div>';
            });

            mainHtml += '</div>';
        });

        if (todayTasks.length === 0) {
            mainHtml += '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);padding:40px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                '<i data-lucide="calendar-x" style="width:36px;height:36px;color:var(--color-muted-foreground);opacity:0.4;margin:0 auto 12px;display:block"></i>' +
                '<p style="font-size:14px;font-weight:500;color:var(--color-muted-foreground);margin:0">No medication tasks scheduled for this date</p>' +
                '<p style="font-size:12px;color:var(--color-muted-foreground);margin:4px 0 0">Try navigating to a different date or check the orders</p>' +
            '</div>';
        }

        mainHtml += '</div>';
        $('#marMainContent').html(mainHtml);
        lucide.createIcons();
        setTimeout(function() {
            var strip = document.getElementById('marDateStrip');
            if (strip) {
                var activeBtn = strip.querySelector('.mar-date-jump[data-date="' + marSelectedDate + '"]');
                if (activeBtn) {
                    activeBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
                }
            }
        }, 50);
    }

    $(document).on('click', '.mar-patient-btn', function() {
        selectedMarPatient = $(this).data('index');
        renderMARTab();
    });

    $(document).on('input', '#marPatientSearch', function() {
        renderMARPatientList();
    });

    /* sync toolbar search → existing patient list search */
    $(document).on('input', '#marToolbarSearch', function() {
        $('#marPatientSearch').val($(this).val());
        renderMARPatientList();
    });

    window.toggleMarFilter = function() {
        var pane = document.getElementById('marFilterPane');
        if (pane) pane.style.display = pane.style.display === 'none' ? 'block' : 'none';
    };

    window.applyMarFilters = function() {
        var statusF  = (document.getElementById('marStatusFilter') || {value:'all'}).value;
        var dateFrom = (document.getElementById('marDateFrom')     || {value:''}).value;
        var dateTo   = (document.getElementById('marDateTo')       || {value:''}).value;
        var activeCount = [(statusF !== 'all' ? statusF : ''), dateFrom, dateTo].filter(Boolean).length;
        var badge = document.getElementById('marFilterBadge');
        if (badge) { badge.textContent = activeCount; badge.style.display = activeCount > 0 ? 'flex' : 'none'; }
        /* visual feedback — full MAR filter wiring can be extended here */
        renderMARPatientList();
    };

    window.resetMarFilters = function() {
        var s = document.getElementById('marStatusFilter'); if (s) s.value = 'all';
        ['marDpDateFrom','marDpDateTo'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        ['marDateFrom','marDateTo'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
        var badge = document.getElementById('marFilterBadge');
        if (badge) { badge.textContent='0'; badge.style.display='none'; }
        renderMARPatientList();
    };

    window.toggleMarExportMenu = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('marExportMenu');
        var isOpen = menu && menu.classList.contains('open');
        document.querySelectorAll('.opd-col-vis-menu.open,.opd-rows-menu.open,.opd-export-menu.open').forEach(function(m){ m.classList.remove('open'); });
        if (!isOpen && menu) menu.classList.add('open');
    };

    window.exportMar = function(type) {
        var menu = document.getElementById('marExportMenu'); if (menu) menu.classList.remove('open');
        if (type === 'print') { window.print(); return; }
        if (type === 'pdf') {
            var w = window.open('','_blank'); if (!w) return;
            var content = document.querySelector('.mar-layout');
            w.document.write('<html><head><title>Medication MAR</title><style>body{font-family:sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px;font-size:12px}th{background:#f0f0f0}</style></head><body>');
            w.document.write('<h2 style="margin-bottom:16px">Medication Administration Record</h2>');
            if (content) w.document.write(content.innerHTML);
            w.document.write('</body></html>'); w.document.close(); w.print();
        }
    };

    $(document).on('click', '.mar-date-nav', function() {
        var strip = document.getElementById('marDateStrip');
        if (strip) {
            var dir = parseInt($(this).data('dir'));
            strip.scrollBy({ left: dir * 200, behavior: 'smooth' });
        }
    });

    $(document).on('click', '.mar-date-jump', function() {
        marSelectedDate = $(this).data('date');
        renderMARTab();
    });

    $(document).on('click', '.mar-check-btn', function() {
        var taskId = $(this).data('task-id');
        if (marTaskStatuses[taskId] === 'given') {
            delete marTaskStatuses[taskId];
            delete marTaskStatuses[taskId + '_time'];
        } else {
            marTaskStatuses[taskId] = 'given';
            marTaskStatuses[taskId + '_time'] = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        renderMARTab();
    });

    $(document).on('click', '.mar-give-btn', function() {
        var taskId = $(this).data('task-id');
        var selected = marPatients[selectedMarPatient];
        if (!selected) return;
        var task = (selected.allTasks || []).find(function(t) { return t.taskId === taskId; });
        if (!task) return;

        var html = '<div style="display:flex;flex-direction:column;gap:16px">' +
            '<div style="border-radius:8px;border:1px solid var(--color-border);background:var(--color-muted);padding:12px"><p style="font-size:16px;font-weight:600;margin:0">' + esc(task.medicine) + '</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:4px 0 0">' + esc(task.dose) + ' - ' + esc(task.route) + ' | Scheduled: ' + esc(task.time) + ' | Day ' + task.day + '/' + task.totalDays + '</p></div>' +
            '<div style="display:flex;flex-direction:column;gap:6px"><label style="font-size:12px;font-weight:500;color:var(--color-muted-foreground)">Administration Status</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label class="payment-mode-option active"><input type="radio" name="adminStatus" value="given" checked style="display:none"><i data-lucide="check-circle-2" style="width:16px;height:16px;color:var(--color-success)"></i><span>Given</span></label><label class="payment-mode-option"><input type="radio" name="adminStatus" value="refused" style="display:none"><i data-lucide="x-circle" style="width:16px;height:16px;color:var(--color-destructive)"></i><span>Refused</span></label><label class="payment-mode-option"><input type="radio" name="adminStatus" value="na" style="display:none"><i data-lucide="alert-triangle" style="width:16px;height:16px;color:#F59E0B"></i><span>Not Available</span></label><label class="payment-mode-option"><input type="radio" name="adminStatus" value="npo" style="display:none"><i data-lucide="x-circle" style="width:16px;height:16px;color:var(--color-muted-foreground)"></i><span>Patient NPO</span></label></div></div>' +
            '<div style="display:flex;flex-direction:column;gap:6px"><label style="font-size:12px;font-weight:500;color:var(--color-muted-foreground)">Remarks (optional)</label><textarea class="form-control" rows="2" style="resize:none;font-size:14px" placeholder="Any additional notes..."></textarea></div>' +
        '</div>';
        $('#marAdminModalBody').html(html);
        $('#marAdminModal').attr('data-task-id', taskId);
        new bootstrap.Modal(document.getElementById('marAdminModal')).show();
        lucide.createIcons();
    });

    $(document).on('click', '#btnConfirmAdmin', function() {
        var taskId = $('#marAdminModal').attr('data-task-id');
        if (taskId) {
            marTaskStatuses[taskId] = 'given';
            marTaskStatuses[taskId + '_time'] = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        bootstrap.Modal.getInstance(document.getElementById('marAdminModal')).hide();
        renderMARTab();
    });

    $(document).on('click', '.mar-shift-btn', function() { $('.mar-shift-btn').removeClass('active'); $(this).addClass('active'); });

    // ===== TAB 5: INVESTIGATIONS =====
    function loadIpdInvestigations(callback) {
        $.get('/api/ipd/clinical-orders/investigations', function(data) {
            masterInvestigations = data.all || [];
            groupedInvestigations = data.grouped || [];
            renderInvestigationsTab();
            if (typeof callback === 'function') callback();
        });
    }

    /* ── Investigations: flat data builder ───────────────────────────────────── */
    function _ipdInvBuildData() {
        return groupedInvestigations.map(function(group) {
            var invs = group.investigations || [];
            var labCount = invs.filter(function(i) { return i.type === 'lab'; }).length;
            var radCount = invs.filter(function(i) { return i.type !== 'lab'; }).length;
            var hasStat   = invs.some(function(i) { return i.priority === 'stat'; });
            var hasUrgent = invs.some(function(i) { return i.priority === 'urgent'; });
            var pendingN   = invs.filter(function(i) { return i.status === 'pending'; }).length;
            var inProgN    = invs.filter(function(i) { return i.status === 'in-progress'; }).length;
            var completedN = invs.filter(function(i) { return i.status === 'completed'; }).length;
            /* look up admission for extra fields */
            var adm = admissions.find(function(a) { return a.admissionId === group.admissionId; }) || {};
            var pat = patients.find(function(p) { return p.mrn === group.mrn; }) || {};
            return {
                mrn: group.mrn || '',
                patientName: group.patient || '',
                admissionId: group.admissionId || '',
                department: adm.department || '',
                gender: pat.gender || adm.gender || '',
                ward: adm.ward || '',
                bed: adm.bed || '',
                initialDiagnosis: adm.initialDiagnosis || '',
                labCount: labCount,
                radCount: radCount,
                testCount: invs.length,
                orderedBy: invs[0] ? (invs[0].orderedBy || '') : '',
                topPriority: hasStat ? 'STAT' : hasUrgent ? 'Urgent' : 'Routine',
                pendingN: pendingN,
                inProgN: inProgN,
                completedN: completedN,
                date: invs[0] ? (invs[0].date || '') : '',
                groupKey: group.mrn + '|' + group.admissionId
            };
        });
    }

    /* ── Investigations: paginated render ────────────────────────────────────── */
    function _ipdInvRenderPagination(source) {
        var total = source.length;
        var totalPages = Math.max(1, Math.ceil(total / ipdInvPerPageVal));
        if (ipdInvCurrentPage > totalPages) ipdInvCurrentPage = 1;
        var start = (ipdInvCurrentPage - 1) * ipdInvPerPageVal;
        var slice = source.slice(start, start + ipdInvPerPageVal);

        var html = '';
        if (slice.length === 0) {
            html = '<tr><td colspan="13"><div class="empty-state"><i data-lucide="flask-conical"></i><p>No investigations found</p></div></td></tr>';
        } else {
            slice.forEach(function(g) {
                var typeBadges = '';
                if (g.labCount > 0) typeBadges += '<span class="badge badge-outline" style="font-size:10px;color:#3B82F6;border-color:rgba(59,130,246,0.3);margin-right:4px">Lab &times;' + g.labCount + '</span>';
                if (g.radCount > 0) typeBadges += '<span class="badge badge-outline" style="font-size:10px;color:#F59E0B;border-color:rgba(245,158,11,0.3)">Radiology &times;' + g.radCount + '</span>';

                var statusSummary = '';
                if (g.pendingN > 0)   statusSummary += '<span style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:4px;margin-right:4px">' + g.pendingN + ' Pending</span>';
                if (g.inProgN > 0)    statusSummary += '<span style="font-size:10px;font-weight:600;color:#3B82F6;background:rgba(59,130,246,0.08);padding:2px 6px;border-radius:4px;margin-right:4px">' + g.inProgN + ' In Progress</span>';
                if (g.completedN > 0) statusSummary += '<span style="font-size:10px;font-weight:600;color:#10B981;background:rgba(16,185,129,0.08);padding:2px 6px;border-radius:4px">' + g.completedN + ' Completed</span>';

                var pCls = g.topPriority === 'STAT' ? 'color:var(--color-destructive)' : g.topPriority === 'Urgent' ? 'color:#F59E0B' : 'color:var(--color-muted-foreground)';
                var shortId = g.admissionId.replace(g.mrn + '-', '');
                var wardBed = (g.ward || '-') + (g.bed && g.bed !== '-' ? ', ' + g.bed : '');

                html += '<tr class="clickable-row inv-group-row" data-group-key="' + esc(g.groupKey) + '">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(g.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(g.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(shortId) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(g.department || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(g.gender || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(wardBed) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(g.initialDiagnosis || '') + '">' + esc(g.initialDiagnosis || '-') + '</td>' +
                    '<td>' + (typeBadges || '<span style="font-size:12px;color:var(--color-muted-foreground)">-</span>') + '</td>' +
                    '<td><span style="font-size:13px;font-weight:600;color:var(--midnight-blue)">' + g.testCount + '</span><span style="font-size:12px;color:var(--color-muted-foreground)"> test' + (g.testCount !== 1 ? 's' : '') + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(g.orderedBy || '-') + '</td>' +
                    '<td><span style="font-size:11px;font-weight:600;text-transform:uppercase;' + pCls + '">' + esc(g.topPriority) + '</span></td>' +
                    '<td>' + (statusSummary || '<span style="font-size:12px;color:var(--color-muted-foreground)">-</span>') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(g.date) + '</td>' +
                '</tr>';
            });
        }
        $('#invTableBody').html(html);
        lucide.createIcons();

        /* pagination info */
        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + ipdInvPerPageVal, total);
        $('#invTableInfo').text('Showing ' + from + '–' + to + ' of ' + total + ' investigations');

        /* page buttons */
        var numsHtml = '';
        for (var p = 1; p <= totalPages; p++) {
            numsHtml += '<button class="opd-page-num' + (p === ipdInvCurrentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        $('#ipdInvPageNums').html(numsHtml);
        $('#ipdInvPrevPage').prop('disabled', ipdInvCurrentPage === 1);
        $('#ipdInvNextPage').prop('disabled', ipdInvCurrentPage === totalPages);
    }

    function renderInvestigationsTab() {
        /* update stat tiles */
        var pendingCount   = masterInvestigations.filter(function(i){ return i.status === 'pending'; }).length;
        var inProgressCount= masterInvestigations.filter(function(i){ return i.status === 'in-progress'; }).length;
        var completedCount = masterInvestigations.filter(function(i){ return i.status === 'completed'; }).length;
        var criticalCount  = masterInvestigations.filter(function(i){ return i.priority === 'stat' || i.priority === 'critical'; }).length;
        var set = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
        set('invStatPending', pendingCount);
        set('invStatInProgress', inProgressCount);
        set('invStatCompleted', completedCount);
        set('invStatCritical', criticalCount);

        var src = ipdInvFiltered !== null ? ipdInvFiltered : _ipdInvBuildData();
        _ipdInvRenderPagination(src);
    }

    function showInvGroupDetail(groupKey) {
        var parts = groupKey.split('|');
        var mrn = parts[0], admissionId = parts[1];
        var group = groupedInvestigations.find(function(g) { return g.mrn === mrn && g.admissionId === admissionId; });
        if (!group) return;

        var invs = group.investigations || [];
        var statusSteps = ['Ordered', 'Collected', 'In Progress', 'Completed'];
        function getStep(status) {
            if (status === 'pending') return -1; if (status === 'ordered') return 0; if (status === 'collected') return 1; if (status === 'in-progress') return 2; if (status === 'completed') return 3; return -1;
        }

        var labCount = invs.filter(function(i) { return i.type === 'lab'; }).length;
        var radCount = invs.filter(function(i) { return i.type !== 'lab'; }).length;
        var pendingC = invs.filter(function(i) { return i.status === 'pending'; }).length;
        var orderedC = invs.filter(function(i) { return i.status === 'ordered'; }).length;
        var completedC = invs.filter(function(i) { return i.status === 'completed'; }).length;
        var pendingLabIds = invs.filter(function(i) { return i.status === 'pending' && i.type === 'lab'; }).map(function(i) { return i.id; });

        var bedText = (group.bed && group.bed.trim() && group.bed.trim() !== '/') ? group.bed.trim() : '';

        var html = '';
        html += '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-muted);padding:16px;margin-bottom:20px">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">';
        html += '<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--aqua-mint),var(--midnight-blue));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px">' + esc((group.patient || '?').charAt(0).toUpperCase()) + '</div>';
        html += '<div>';
        html += '<div style="font-size:16px;font-weight:700;color:var(--color-foreground)">' + esc(group.patient) + '</div>';
        html += '<div style="font-size:12px;color:var(--color-muted-foreground)">' + esc(group.mrn) + ' &middot; ' + esc(group.admissionId) + (bedText ? ' &middot; ' + esc(bedText) : '') + '</div>';
        html += '</div></div>';
        html += '<div style="display:flex;gap:12px;flex-wrap:wrap">';
        html += '<div style="border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);padding:8px 14px;text-align:center"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">Total Tests</p><p style="font-size:18px;font-weight:700;color:var(--aqua-mint);margin:0">' + invs.length + '</p></div>';
        if (labCount > 0) html += '<div style="border-radius:8px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.04);padding:8px 14px;text-align:center"><p style="font-size:10px;color:#3B82F6;margin:0">Laboratory</p><p style="font-size:18px;font-weight:700;color:#3B82F6;margin:0">' + labCount + '</p></div>';
        if (radCount > 0) html += '<div style="border-radius:8px;border:1px solid rgba(245,158,11,0.2);background:rgba(245,158,11,0.04);padding:8px 14px;text-align:center"><p style="font-size:10px;color:#F59E0B;margin:0">Radiology</p><p style="font-size:18px;font-weight:700;color:#F59E0B;margin:0">' + radCount + '</p></div>';
        if (pendingC > 0) html += '<div style="border-radius:8px;border:1px solid rgba(234,179,8,0.2);background:rgba(234,179,8,0.04);padding:8px 14px;text-align:center"><p style="font-size:10px;color:#EAB308;margin:0">Pending</p><p style="font-size:18px;font-weight:700;color:#EAB308;margin:0">' + pendingC + '</p></div>';
        if (orderedC > 0) html += '<div style="border-radius:8px;border:1px solid rgba(99,102,241,0.2);background:rgba(99,102,241,0.04);padding:8px 14px;text-align:center"><p style="font-size:10px;color:#6366F1;margin:0">Ordered</p><p style="font-size:18px;font-weight:700;color:#6366F1;margin:0">' + orderedC + '</p></div>';
        if (completedC > 0) html += '<div style="border-radius:8px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.04);padding:8px 14px;text-align:center"><p style="font-size:10px;color:#10B981;margin:0">Completed</p><p style="font-size:18px;font-weight:700;color:#10B981;margin:0">' + completedC + '</p></div>';
        html += '</div></div>';

        currentPassToLabIds = pendingLabIds;
        var labBtnLabel = pendingLabIds.length > 0
            ? 'Pass Order to Lab (' + pendingLabIds.length + ' test' + (pendingLabIds.length > 1 ? 's' : '') + ')'
            : 'All Orders Sent to Lab';
        var labBtnDisabled = pendingLabIds.length === 0 ? ' disabled' : '';
        var labBtnBg = pendingLabIds.length > 0 ? 'background:linear-gradient(135deg,#00D4AA,#0A2540)' : 'background:#ccc';
        html += '<div style="margin-bottom:16px">';
        html += '<button class="inv-pass-to-lab-btn" data-group-key="' + esc(groupKey) + '" style="width:100%;padding:12px 16px;border-radius:8px;' + labBtnBg + ';color:#fff;font-weight:600;font-size:14px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px"' + labBtnDisabled + '>';
        html += '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> ' + labBtnLabel;
        html += '</button></div>';

        html += '<h6 style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-bottom:12px"><i data-lucide="list" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i>Investigation Orders</h6>';

        invs.forEach(function(inv, idx) {
            var step = getStep(inv.status);
            var typeBadge = inv.type === 'lab'
                ? '<span class="badge badge-outline" style="font-size:10px;color:#3B82F6;border-color:rgba(59,130,246,0.3)">Laboratory</span>'
                : '<span class="badge badge-outline" style="font-size:10px;color:#F59E0B;border-color:rgba(245,158,11,0.3)">Radiology</span>';
            var pCls = inv.priority === 'stat' ? 'color:var(--color-destructive)' : inv.priority === 'urgent' ? 'color:#F59E0B' : 'color:var(--color-muted-foreground)';

            var statusLabel = inv.status === 'pending' ? 'Not Sent to Lab' : inv.status.replace('-', ' ');
            var statusColor = inv.status === 'pending' ? '#EAB308' : inv.status === 'ordered' ? '#6366F1' : 'var(--color-muted-foreground)';
            var dotsHtml = '<div class="inv-status-dots" style="margin-top:6px">';
            if (step < 0) {
                statusSteps.forEach(function(s, si) {
                    dotsHtml += '<div class="dot inactive"></div>';
                    if (si < statusSteps.length - 1) dotsHtml += '<div class="line inactive"></div>';
                });
            } else {
                statusSteps.forEach(function(s, si) {
                    dotsHtml += '<div class="dot ' + (si <= step ? 'active' : 'inactive') + '"></div>';
                    if (si < statusSteps.length - 1) dotsHtml += '<div class="line ' + (si < step ? 'active' : 'inactive') + '"></div>';
                });
            }
            dotsHtml += '<span style="margin-left:4px;font-size:10px;font-weight:600;color:' + statusColor + ';text-transform:capitalize">' + statusLabel + '</span></div>';

            html += '<div style="border-radius:10px;border:1px solid var(--color-border);background:var(--color-card);padding:14px 16px;margin-bottom:10px">';
            html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
            html += '<div style="display:flex;align-items:center;gap:8px">';
            html += '<span style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);background:var(--color-muted);width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center">' + (idx + 1) + '</span>';
            html += '<span style="font-size:15px;font-weight:600;color:var(--color-foreground)">' + esc(inv.name) + '</span>';
            html += '</div>';
            html += typeBadge;
            html += '</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:16px;font-size:12px;color:var(--color-muted-foreground);margin-bottom:6px">';
            html += '<span><i data-lucide="calendar" style="width:12px;height:12px;display:inline;vertical-align:-2px;margin-right:3px"></i>' + esc(inv.date) + '</span>';
            html += '<span><i data-lucide="user" style="width:12px;height:12px;display:inline;vertical-align:-2px;margin-right:3px"></i>' + esc(inv.orderedBy) + '</span>';
            html += '<span style="text-transform:uppercase;font-weight:600;' + pCls + '">' + esc(inv.priority) + '</span>';
            html += '</div>';
            html += dotsHtml;
            html += '</div>';
        });

        $('#invDetailBody').html(html);
        var el = document.getElementById('invDetailSheet');
        var existing = bootstrap.Offcanvas.getInstance(el);
        if (existing) existing.hide();
        new bootstrap.Offcanvas(el).show();
        lucide.createIcons();
    }

    $('#invSearch').on('input', function() { ipdInvCurrentPage = 1; ipdInvFiltered = null; renderInvestigationsTab(); });

    /* Investigations pagination clicks */
    $(document).on('click', '#ipdInvPageNums .opd-page-num', function() { ipdInvCurrentPage = parseInt($(this).data('page')); renderInvestigationsTab(); });
    $('#ipdInvPrevPage').on('click', function() { if (ipdInvCurrentPage > 1) { ipdInvCurrentPage--; renderInvestigationsTab(); } });
    $('#ipdInvNextPage').on('click', function() { ipdInvCurrentPage++; renderInvestigationsTab(); });

    /* Nursing tiles search / pagination */
    $('#nurTilesSearch').on('input', function() { nurTilesCurrentPage = 1; renderNursingOrderTiles(); });
    $(document).on('click', '#nurTilesPageNums .opd-page-num', function() { nurTilesCurrentPage = parseInt($(this).data('p')); renderNursingOrderTiles(); });
    $('#nurTilesPrevPage').on('click', function() { if (nurTilesCurrentPage > 1) { nurTilesCurrentPage--; renderNursingOrderTiles(); } });
    $('#nurTilesNextPage').on('click', function() { nurTilesCurrentPage++; renderNursingOrderTiles(); });

    /* Nursing search / pagination */
    $('#nurSearch').on('input', function() {
        ipdNurCurrentPage = 1;
        var search = ($(this).val() || '').toLowerCase();
        var base = _ipdNurBuildData();
        ipdNurFiltered = search ? base.filter(function(a) {
            return a.mrn.toLowerCase().indexOf(search) > -1 ||
                   a.patientName.toLowerCase().indexOf(search) > -1 ||
                   a.wardBed.toLowerCase().indexOf(search) > -1 ||
                   a.doctorName.toLowerCase().indexOf(search) > -1;
        }) : null;
        _ipdNurRenderPagination(ipdNurFiltered !== null ? ipdNurFiltered : base);
    });
    $(document).on('click', '#ipdNurPageNums .opd-page-num', function() { ipdNurCurrentPage = parseInt($(this).data('p')); _ipdNurRenderPagination(ipdNurFiltered !== null ? ipdNurFiltered : _ipdNurBuildData()); });
    $('#ipdNurPrevPage').on('click', function() { if (ipdNurCurrentPage > 1) { ipdNurCurrentPage--; _ipdNurRenderPagination(ipdNurFiltered !== null ? ipdNurFiltered : _ipdNurBuildData()); } });
    $('#ipdNurNextPage').on('click', function() { ipdNurCurrentPage++; _ipdNurRenderPagination(ipdNurFiltered !== null ? ipdNurFiltered : _ipdNurBuildData()); });

    $(document).on('click', '.inv-view-group', function(e) {
        e.stopPropagation();
        showInvGroupDetail($(this).data('group-key'));
    });
    $(document).on('click', '.inv-group-row', function() {
        showInvGroupDetail($(this).data('group-key'));
    });

    $(document).on('click', '.inv-view-results', function(e) {
        e.stopPropagation();
        showLabResults();
    });

    var currentPassToLabIds = [];

    $(document).on('click', '.inv-pass-to-lab-btn', function(e) {
        e.stopPropagation();
        var btn = $(this);
        var orderIds = currentPassToLabIds;
        var groupKey = btn.attr('data-group-key');
        btn.prop('disabled', true).html('<i data-lucide="loader-2" style="width:16px;height:16px" class="spin"></i> Sending to Lab...');
        lucide.createIcons();
        $.ajax({
            url: '/api/ipd/clinical-orders/pass-to-lab',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ orderIds: orderIds }),
            success: function(res) {
                if (res.success) {
                    showToast(res.message || 'Orders passed to Laboratory successfully!', 'success');
                    loadIpdInvestigations(function() {
                        showInvGroupDetail(groupKey);
                    });
                } else {
                    showToast(res.error || 'Failed to pass orders.', 'error');
                    btn.prop('disabled', false).html('<i data-lucide="send" style="width:16px;height:16px"></i> Pass Order to Lab');
                    lucide.createIcons();
                }
            },
            error: function(xhr) {
                var msg = xhr.responseJSON ? xhr.responseJSON.error : 'Failed to pass orders to lab.';
                showToast(msg, 'error');
                btn.prop('disabled', false).html('<i data-lucide="send" style="width:16px;height:16px"></i> Pass Order to Lab');
                lucide.createIcons();
            }
        });
    });

    function showLabResults() {
        $('#labResultsTitle').text('Lab Results - CBC + ESR');
        var html = '<p style="font-size:14px;color:var(--color-muted-foreground);margin-bottom:16px">Patient: Muhammad Rashid Ahmed | Report Date: 15 Feb, 11:00 AM</p>' +
            '<div style="border-radius:8px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.05);padding:12px;margin-bottom:16px"><div style="display:flex;align-items:center;gap:8px"><i data-lucide="alert-triangle" style="width:16px;height:16px;color:var(--color-destructive)"></i><span style="font-size:12px;font-weight:600;color:var(--color-destructive)">Critical Value: WBC Count significantly elevated</span></div></div>' +
            '<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Parameter</th><th class="text-right">Result</th><th>Unit</th><th>Normal Range</th><th class="text-center">Flag</th></tr></thead><tbody>';
        cbcResults.forEach(function(r) {
            var rowBg = r.flag === 'high' && r.param === 'WBC Count' ? ' style="background:rgba(239,68,68,0.05)"' : '';
            var resultColor = r.flag === 'high' ? 'color:var(--color-destructive)' : r.flag === 'low' ? 'color:#3B82F6' : '';
            var flagIcon = r.flag === 'high' ? '<i data-lucide="arrow-up" style="width:16px;height:16px;color:var(--color-destructive)"></i>' : r.flag === 'low' ? '<i data-lucide="arrow-down" style="width:16px;height:16px;color:#3B82F6"></i>' : '<i data-lucide="check" style="width:16px;height:16px;color:var(--color-success)"></i>';
            html += '<tr' + rowBg + '><td style="font-size:14px;font-weight:500">' + esc(r.param) + '</td><td class="text-right font-mono" style="font-size:14px;font-weight:600;' + resultColor + '">' + esc(r.result) + '</td><td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(r.unit) + '</td><td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(r.range) + '</td><td class="text-center">' + flagIcon + '</td></tr>';
        });
        html += '</tbody></table></div>' +
            '<div style="border-radius:8px;border:1px solid var(--color-border);background:var(--color-muted);padding:12px;margin-top:16px"><p style="font-size:12px;font-weight:600;margin:0 0 4px">Interpretation</p><p style="font-size:12px;color:var(--color-muted-foreground);line-height:1.6;margin:0">Elevated WBC with neutrophilia suggests active bacterial infection. Low hemoglobin indicates mild anemia. Elevated ESR correlates with ongoing inflammatory process. Recommend monitoring and correlation with clinical findings.</p></div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px"><button class="btn-secondary btn-sm"><i data-lucide="download" style="width:12px;height:12px"></i> Download PDF</button><button class="btn-secondary btn-sm"><i data-lucide="printer" style="width:12px;height:12px"></i> Print</button><button class="btn-primary btn-sm"><i data-lucide="file-text" style="width:12px;height:12px"></i> Add to Discharge Summary</button></div>';
        $('#labResultsBody').html(html);
        new bootstrap.Modal(document.getElementById('labResultsModal')).show();
        lucide.createIcons();
    }

    // ===== TAB 6: NURSING STATION =====
    function _ipdNurBuildData() {
        return admissions.slice().sort(function(a, b) {
            return new Date(b.createdAt || b.admissionDate || 0) - new Date(a.createdAt || a.admissionDate || 0);
        }).map(function(a) {
            var shortId     = a.admissionId.replace(a.mrn + '-', '');
            var wardBed     = (a.ward || '-') + (a.bed && a.bed !== '-' ? ', ' + a.bed : '');
            var admDate     = a.admissionDate ? new Date(a.admissionDate) : null;
            var admFormatted= admDate ? admDate.toLocaleDateString() + ', ' + admDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-';
            var pending     = nursingTasks.filter(function(t){ return t.admissionId === a.admissionId && !t.done; }).length;
            return {
                admissionId : a.admissionId,
                mrn         : a.mrn,
                patientName : a.patientName,
                shortId     : shortId,
                wardBed     : wardBed,
                ward        : a.ward || '',
                doctorName  : a.doctorName || '',
                department  : a.department || '',
                pendingTasks: pending,
                status      : a.status || 'Active',
                admissionDate: a.admissionDate || '',
                admFormatted: admFormatted
            };
        });
    }

    function _ipdNurRenderPagination(source) {
        var total  = source.length;
        var pages  = Math.max(1, Math.ceil(total / ipdNurPerPageVal));
        ipdNurCurrentPage = Math.min(ipdNurCurrentPage, pages);
        var start  = (ipdNurCurrentPage - 1) * ipdNurPerPageVal;
        var slice  = source.slice(start, start + ipdNurPerPageVal);
        var end    = Math.min(start + ipdNurPerPageVal, total);
        var html   = '';
        if (slice.length === 0) {
            html = '<tr><td colspan="9"><div class="empty-state"><i data-lucide="heart-pulse"></i><p>No nursing records found</p><p class="empty-sub">Admit patients to start nursing management</p></div></td></tr>';
        } else {
            slice.forEach(function(a) {
                var statusClass = a.status === 'Active' ? 'badge-success' : a.status === 'Discharged' ? 'badge-info' : 'badge-outline';
                html += '<tr class="clickable-row nur-row" data-admission-id="' + esc(a.admissionId) + '">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(a.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(a.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(a.shortId) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(a.wardBed) + '</td>' +
                    '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(a.doctorName || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(a.department || '-') + '</td>' +
                    '<td class="text-center" style="font-size:12px">' + (a.pendingTasks > 0 ? '<span style="color:#F59E0B;font-weight:600">' + a.pendingTasks + ' pending</span>' : '<span style="color:#10B981">—</span>') + '</td>' +
                    '<td><span class="badge ' + statusClass + '">' + esc(a.status).toUpperCase() + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(a.admFormatted) + '</td>' +
                    '</tr>';
            });
        }
        $('#nurTableBody').html(html);
        $('#nurTableInfo').text(total === 0 ? 'No results' : 'Showing ' + (start + 1) + '–' + end + ' of ' + total + ' records');
        var nums = '';
        for (var p = 1; p <= pages; p++) nums += '<button class="opd-page-num' + (p === ipdNurCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        $('#ipdNurPageNums').html(nums);
        $('#ipdNurPrevPage').prop('disabled', ipdNurCurrentPage <= 1);
        $('#ipdNurNextPage').prop('disabled', ipdNurCurrentPage >= pages);
        lucide.createIcons();
    }

    function ipdNurPopulateFilterOptions() {
        var data = _ipdNurBuildData();
        var mrns  = [], names = [], doctors = [], wards = [];
        data.forEach(function(a) {
            if (a.mrn && mrns.indexOf(a.mrn) < 0) mrns.push(a.mrn);
            if (a.patientName && names.indexOf(a.patientName) < 0) names.push(a.patientName);
            if (a.doctorName && doctors.indexOf(a.doctorName) < 0) doctors.push(a.doctorName);
            if (a.ward && wards.indexOf(a.ward) < 0) wards.push(a.ward);
        });
        var fillCs = function(id, opts) {
            var list = document.querySelector('#' + id + ' .opd-cs-list');
            if (!list) return;
            list.innerHTML = opts.map(function(o){ return '<div class="opd-cs-opt" data-val="' + esc(o) + '">' + esc(o) + '</div>'; }).join('');
        };
        fillCs('ipdNurCsMrn', mrns);
        fillCs('ipdNurCsPatName', names);
        fillCs('ipdNurCsDoctor', doctors);
        var wardSel = document.getElementById('ipdNurWardFilter');
        if (wardSel) {
            var cur = wardSel.value;
            wardSel.innerHTML = '<option value="all">All Wards</option>' + wards.map(function(w){ return '<option value="' + esc(w) + '">' + esc(w) + '</option>'; }).join('');
            wardSel.value = cur;
        }
    }

    function renderNursingTab() {
        /* tiles */
        var occupied      = admissions.filter(function(a){ return a.status === 'Active'; }).length;
        var critical      = wardPatients.filter(function(p){ return p.status === 'critical'; }).length;
        var tasksComplete = nursingTasks.filter(function(t){ return t.done; }).length;
        var pendingTasks  = nursingTasks.length - tasksComplete;
        var set = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
        set('nurStatOccupied', occupied);
        set('nurStatCritical', critical);
        set('nurStatPending',  pendingTasks);
        set('nurStatDone',     tasksComplete);
        /* table */
        ipdNurPopulateFilterOptions();
        var src = ipdNurFiltered !== null ? ipdNurFiltered : _ipdNurBuildData();
        _ipdNurRenderPagination(src);
        /* clinical order tiles */
        renderNursingOrderTiles();
    }

    function _nurTilesBuildCard(adm) {
        var initials = (adm.patientName || adm.mrn || '?').split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();
        var admDate  = adm.admissionDate ? new Date(adm.admissionDate) : null;
        var dateStr  = admDate ? admDate.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '';
        var timeStr  = admDate ? admDate.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '';
        return '<button class="nursing-order-tile" data-admission-id="' + esc(adm.admissionId) + '" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:0;text-align:left;cursor:pointer;transition:box-shadow 0.2s,border-color 0.2s;overflow:hidden" onmouseover="this.style.boxShadow=\'0 4px 16px rgba(0,0,0,0.10)\';this.style.borderColor=\'var(--aqua-mint)\'" onmouseout="this.style.boxShadow=\'\';this.style.borderColor=\'var(--color-border)\'">' +
            '<div style="background:var(--midnight-blue);padding:12px 14px">' +
                '<div style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(adm.patientName || adm.mrn) + '</div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:2px">' + esc(adm.mrn) + ' &bull; ' + esc(adm.admissionId) + '</div>' +
            '</div>' +
            '<div style="padding:12px 14px;display:flex;flex-direction:column;gap:5px">' +
                '<div style="font-size:12px;color:var(--color-muted-foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc((adm.ward||'') + (adm.bed ? ' \u2014 Bed ' + adm.bed : '')) + '</div>' +
                '<div style="font-size:12px;color:var(--color-muted-foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(adm.doctorName||'') + (adm.department ? ' &bull; ' + esc(adm.department) : '') + '</div>' +
                (dateStr ? '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(dateStr) + (timeStr ? ' ' + esc(timeStr) : '') + '</div>' : '') +
            '</div>' +
            '<div style="border-top:1px solid var(--color-border);padding:8px 14px;display:flex;align-items:center;justify-content:space-between">' +
                '<div style="display:flex;gap:6px">' +
                    '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:999px;background:#EFF6FF;color:#2563EB">IV</span>' +
                    '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:999px;background:#F0FDF4;color:#16A34A">Diet</span>' +
                    '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:999px;background:#FAF5FF;color:#7C3AED">Nursing</span>' +
                '</div>' +
                '<span style="font-size:11px;color:var(--aqua-mint);font-weight:600;display:flex;align-items:center;gap:4px">View <i data-lucide="chevron-right" style="width:11px;height:11px"></i></span>' +
            '</div>' +
        '</button>';
    }

    function renderNursingOrderTiles() {
        var search = ($('#nurTilesSearch').val() || '').toLowerCase();
        var base   = nurTilesFiltered !== null ? nurTilesFiltered : admissions.filter(function(a){ return a.status === 'Active'; });

        /* populate filter dropdowns once */
        var wards = [], docs = [];
        admissions.forEach(function(a){
            if (a.ward && wards.indexOf(a.ward) < 0) wards.push(a.ward);
            if (a.doctorName && docs.indexOf(a.doctorName) < 0) docs.push(a.doctorName);
        });
        var wSel = document.getElementById('nurTilesWardFilter');
        var dSel = document.getElementById('nurTilesDoctorFilter');
        if (wSel && wSel.options.length <= 1) wards.forEach(function(w){ var o=document.createElement('option'); o.value=w; o.textContent=w; wSel.appendChild(o); });
        if (dSel && dSel.options.length <= 1) docs.forEach(function(d){ var o=document.createElement('option'); o.value=d; o.textContent=d; dSel.appendChild(o); });

        /* apply inline search */
        var filtered = search ? base.filter(function(adm){
            return adm.patientName.toLowerCase().indexOf(search) > -1 ||
                   adm.mrn.toLowerCase().indexOf(search) > -1 ||
                   (adm.doctorName||'').toLowerCase().indexOf(search) > -1;
        }) : base;

        /* sort latest / most-recent first */
        filtered = filtered.slice().sort(function(a, b) {
            return new Date(b.createdAt || b.admissionDate || 0) - new Date(a.createdAt || a.admissionDate || 0);
        });

        var total  = filtered.length;
        var pages  = Math.max(1, Math.ceil(total / nurTilesPerPageVal));
        nurTilesCurrentPage = Math.min(nurTilesCurrentPage, pages);
        var start  = (nurTilesCurrentPage - 1) * nurTilesPerPageVal;
        var slice  = filtered.slice(start, start + nurTilesPerPageVal);
        var end    = Math.min(start + nurTilesPerPageVal, total);

        var $grid = $('#nursingOrderTilesGrid');
        if (slice.length === 0) {
            $grid.html('<div style="grid-column:1/-1;padding:32px;text-align:center;border:1px dashed var(--color-border);border-radius:12px;color:var(--color-muted-foreground);font-size:13px"><i data-lucide="bed-double" style="width:24px;height:24px;margin-bottom:8px;display:block;margin-inline:auto;opacity:0.4"></i>No patients found</div>');
        } else {
            var html = '';
            slice.forEach(function(adm){ html += _nurTilesBuildCard(adm); });
            $grid.html(html);
        }

        /* pagination controls */
        $('#nurTilesInfo').text(total === 0 ? 'No patients found' : 'Showing ' + (start + 1) + '\u2013' + end + ' of ' + total + ' patients');
        var nums = '';
        for (var p = 1; p <= pages; p++) nums += '<button class="opd-page-num' + (p === nurTilesCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        $('#nurTilesPageNums').html(nums);
        $('#nurTilesPrevPage').prop('disabled', nurTilesCurrentPage <= 1);
        $('#nurTilesNextPage').prop('disabled', nurTilesCurrentPage >= pages);
        lucide.createIcons();
    }

    $(document).on('click', '.nursing-order-tile', function() {
        var admissionId = $(this).data('admission-id');
        var adm = admissions.find(function(a) { return a.admissionId === admissionId; });
        if (!adm) return;

        ipdNursingVitalForm = { temperature: '', systolic: '', diastolic: '', heartRate: '', spO2: '', respiratoryRate: '', weight: '', height: '', bloodSugar: '', painScale: null, notes: '' };

        $('#clinicalOrdersTitle').text(adm.patientName || adm.mrn);
        $('#clinicalOrdersSubtitle').text((adm.admissionId || '') + (adm.bed ? ' \u2022 Bed ' + adm.bed : '') + (adm.ward ? ' \u2022 ' + adm.ward : ''));
        $('#clinicalOrdersBody').html('<div style="padding:60px;text-align:center;color:var(--color-muted-foreground)"><div style="display:inline-flex;flex-direction:column;align-items:center;gap:10px"><i data-lucide="loader-2" style="width:24px;height:24px;animation:spin 1s linear infinite"></i><span style="font-size:13px">Loading orders...</span></div></div>');
        lucide.createIcons();

        var sheet = new bootstrap.Offcanvas(document.getElementById('clinicalOrdersSheet'));
        sheet.show();

        $.get('/api/ipd/clinical-orders/' + admissionId).done(function(orders) {
            var ivOrders      = orders.filter(function(o) { return o.type === 'IV Fluids';  });
            var dietOrders    = orders.filter(function(o) { return o.type === 'Diet';       });
            var nursingOrders = orders.filter(function(o) { return o.type === 'Nursing';    });

            var html = buildClinicalOrdersBody(adm, ivOrders, dietOrders, nursingOrders);
            $('#clinicalOrdersBody').html(html);
            lucide.createIcons();

            $.get('/api/ipd/nursing-records/by-admission/' + admissionId).done(function(rec) {
                $('#ipdVitalHistoryWrap').html(buildIpdVitalHistoryBlock(rec.entries || []));
                lucide.createIcons();
            });
        }).fail(function() {
            $('#clinicalOrdersBody').html('<div style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:13px">Failed to load orders. Please try again.</div>');
        });
    });

    function fmtOrderDate(str) {
        if (!str) return '';
        var d = new Date(str);
        if (isNaN(d)) return str;
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }

    function buildClinicalOrdersBody(adm, ivOrders, dietOrders, nursingOrders) {
        var admId = adm.admissionId;
        var initials = (adm.patientName || adm.mrn || '?').split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();

        var html = '';

        html += '<div style="background:var(--color-muted);border-radius:10px;padding:14px 16px;margin-bottom:20px;display:flex;flex-wrap:wrap;gap:16px;align-items:center">' +
            '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:200px">' +
                '<div class="avatar" style="width:40px;height:40px;min-width:40px;background:var(--midnight-blue);color:#fff;font-size:14px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div><div style="font-size:14px;font-weight:600">' + esc(adm.patientName || adm.mrn) + '</div>' +
                '<div style="font-size:12px;color:var(--color-muted-foreground)">' + esc(adm.mrn) + ' &bull; ' + esc(adm.admissionId) + '</div></div>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:16px">' +
                (adm.doctorName ? '<div style="font-size:12px;color:var(--color-muted-foreground)"><span style="font-weight:600;color:var(--color-foreground)">' + esc(adm.doctorName) + '</span><br>' + esc(adm.department || '') + '</div>' : '') +
                (adm.bed ? '<div style="font-size:12px;color:var(--color-muted-foreground)">Bed<br><span style="font-weight:600;color:var(--color-foreground)">' + esc(adm.bed) + '</span></div>' : '') +
                (adm.ward ? '<div style="font-size:12px;color:var(--color-muted-foreground)">Ward<br><span style="font-weight:600;color:var(--color-foreground)">' + esc(adm.ward) + '</span></div>' : '') +
            '</div>' +
            '<div style="display:flex;gap:10px;align-self:flex-end">' +
                '<div style="text-align:center;padding:6px 12px;border-radius:8px;background:#EFF6FF"><div style="font-size:16px;font-weight:700;color:#2563EB">' + ivOrders.length + '</div><div style="font-size:10px;color:#2563EB;font-weight:600">IV Fluids</div></div>' +
                '<div style="text-align:center;padding:6px 12px;border-radius:8px;background:#F0FDF4"><div style="font-size:16px;font-weight:700;color:#16A34A">' + dietOrders.length + '</div><div style="font-size:10px;color:#16A34A;font-weight:600">Diet</div></div>' +
                '<div style="text-align:center;padding:6px 12px;border-radius:8px;background:#FAF5FF"><div style="font-size:16px;font-weight:700;color:#7C3AED">' + nursingOrders.length + '</div><div style="font-size:10px;color:#7C3AED;font-weight:600">Nursing</div></div>' +
            '</div>' +
        '</div>';

        html += '<div style="display:flex;gap:8px;margin-bottom:16px">' +
            '<button class="ipd-section-tab active" data-tab="orders" style="display:flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;border:1px solid var(--color-border);background:var(--midnight-blue);color:#fff;font-size:13px;font-weight:600;cursor:pointer">' +
                '<i data-lucide="clipboard-list" style="width:14px;height:14px"></i> Nursing Orders' +
            '</button>' +
            '<button class="ipd-section-tab" data-tab="vitals" style="display:flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);color:var(--color-foreground);font-size:13px;font-weight:600;cursor:pointer">' +
                '<i data-lucide="thermometer" style="width:14px;height:14px"></i> Vital Recording' +
            '</button>' +
        '</div>';

        html += '<div id="ipdSectionOrders">' +
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px;display:flex;align-items:center;gap:8px">' +
                    '<i data-lucide="clipboard-list" style="width:16px;height:16px;color:var(--midnight-blue)"></i>' +
                    '<h4 style="font-size:14px;font-weight:600;margin:0">Nursing Orders</h4>' +
                '</div>' +
                '<div style="padding:16px">' +
                    buildOrdersAccordion(admId, ivOrders, dietOrders, nursingOrders) +
                '</div>' +
            '</div>' +
        '</div>';

        html += '<div id="ipdSectionVitals" style="display:none">' +
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px;display:flex;align-items:center;gap:8px">' +
                    '<i data-lucide="thermometer" style="width:16px;height:16px;color:var(--color-destructive)"></i>' +
                    '<h4 style="font-size:14px;font-weight:600;margin:0">Record Vital Signs</h4>' +
                '</div>' +
                '<div style="padding:20px">' +
                    buildIpdVitalInputs() +
                    '<div style="margin-top:14px" class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Notes</label><textarea class="form-control ipd-vital-field" data-field="notes" rows="2">' + esc(ipdNursingVitalForm.notes) + '</textarea></div>' +
                    '<div style="margin-top:14px;display:flex;justify-content:flex-end"><button class="btn-primary" id="btnSaveIpdVital" data-admission="' + esc(admId) + '"><i data-lucide="save"></i> Save Vitals</button></div>' +
                '</div>' +
            '</div>' +
            '<div id="ipdVitalHistoryWrap" style="margin-top:16px"></div>' +
        '</div>';

        return html;
    }

    function buildOrdersAccordion(admId, ivOrders, dietOrders, nursingOrders) {
        var sections = [
            { title: 'IV Fluids',      icon: 'droplets',    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', type: 'IV Fluids', orders: ivOrders },
            { title: 'Diet Orders',    icon: 'utensils',    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', type: 'Diet',      orders: dietOrders },
            { title: 'Nursing Orders', icon: 'heart-pulse', color: '#7C3AED', bg: '#FAF5FF', border: '#E9D5FF', type: 'Nursing',   orders: nursingOrders },
        ];
        var safeId = admId.replace(/[^a-zA-Z0-9]/g, '');
        var html = '<div class="accordion" id="acc' + safeId + '">';

        sections.forEach(function(sec, idx) {
            var collapseId = 'accCollapse' + safeId + idx;
            var headId     = 'accHead' + safeId + idx;
            var isOpen     = (idx === 0);

            html += '<div class="accordion-item" style="border:1px solid ' + sec.border + ';border-radius:8px;margin-bottom:8px;overflow:hidden">' +
                '<h2 class="accordion-header" id="' + headId + '">' +
                    '<button class="accordion-button' + (isOpen ? '' : ' collapsed') + '" type="button" data-bs-toggle="collapse" data-bs-target="#' + collapseId + '" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="' + collapseId + '" style="background:' + sec.bg + ';padding:10px 14px;font-size:13px;font-weight:700;color:' + sec.color + ';border-radius:0;box-shadow:none">' +
                        '<i data-lucide="' + sec.icon + '" style="width:14px;height:14px;color:' + sec.color + ';margin-right:8px;flex-shrink:0"></i>' +
                        sec.title +
                        '<span style="margin-left:8px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:' + sec.color + ';color:#fff">' + sec.orders.length + '</span>' +
                    '</button>' +
                '</h2>' +
                '<div id="' + collapseId + '" class="accordion-collapse collapse' + (isOpen ? ' show' : '') + '" aria-labelledby="' + headId + '">' +
                    '<div class="accordion-body" style="padding:0">';

            if (sec.orders.length === 0) {
                html += '<div style="padding:16px;text-align:center;font-size:12px;color:var(--color-muted-foreground)">No orders added</div>';
            } else {
                sec.orders.forEach(function(o, i) {
                    var md = {};
                    try { md = typeof o.metadata === 'string' ? JSON.parse(o.metadata) : (o.metadata || {}); } catch(e) {}
                    var orderType    = o.type === 'IV Fluids' ? 'IV Fluids' : (o.type === 'Diet' ? 'Diet' : 'Nursing');
                    var fields       = buildOrderDetailFields(orderType, md);
                    var isDiscontinued = (o.status === 'Discontinued');
                    var isLast       = (i === sec.orders.length - 1);

                    html += '<div style="padding:14px 16px;' + (isLast ? '' : 'border-bottom:1px solid ' + sec.border + ';') + (isDiscontinued ? 'opacity:0.5;' : '') + '">' +
                        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">' +
                            '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(o.details || (md.fluidType || md.dietType || md.orderType || '\u2014')) + '</div>' +
                            '<div style="display:flex;gap:6px;flex-shrink:0">' +
                                (o.priority ? '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:999px;background:' + (o.priority === 'STAT' || o.priority === 'Urgent' ? '#FEE2E2' : '#F3F4F6') + ';color:' + (o.priority === 'STAT' || o.priority === 'Urgent' ? '#DC2626' : '#6B7280') + '">' + esc(o.priority) + '</span>' : '') +
                                '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:999px;background:' + (isDiscontinued ? '#F3F4F6' : sec.bg) + ';color:' + (isDiscontinued ? '#6B7280' : sec.color) + '">' + esc(o.status || 'Active') + '</span>' +
                            '</div>' +
                        '</div>';

                    if (fields.length > 0) {
                        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;margin-bottom:8px">';
                        fields.forEach(function(f) {
                            html += '<div style="background:var(--color-muted);border-radius:6px;padding:6px 8px">' +
                                '<div style="font-size:10px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase;margin-bottom:2px">' + esc(f.label) + '</div>' +
                                '<div style="font-size:12px;color:var(--color-foreground);font-weight:500">' + esc(f.value) + '</div>' +
                            '</div>';
                        });
                        html += '</div>';
                    }

                    html += '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--color-muted-foreground)">' +
                        '<i data-lucide="clock" style="width:11px;height:11px"></i>' +
                        '<span>' + esc(fmtOrderDate(o.orderedAt)) + '</span>' +
                        (o.orderedBy ? '<span>&bull;</span><span>By: <strong>' + esc(o.orderedBy) + '</strong></span>' : '') +
                        (o.orderId ? '<span style="margin-left:auto;font-size:10px;color:var(--color-muted-foreground)">' + esc(o.orderId) + '</span>' : '') +
                    '</div>';

                    html += '</div>';
                });
            }

            html += '</div></div></div>';
        });

        html += '</div>';
        return html;
    }

    function buildIpdVitalInputs() {
        function ipdVitalInput(field, label, icon, step) {
            var iconColor = (icon === 'thermometer' || icon === 'heart') ? 'var(--color-destructive)' : (icon === 'activity' ? 'var(--color-info)' : 'var(--color-muted-foreground)');
            return '<div class="form-group"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="' + icon + '" style="width:12px;height:12px;color:' + iconColor + '"></i> ' + label + '</label><input type="number" class="form-control ipd-vital-field" data-field="' + field + '"' + (step ? ' step="' + step + '"' : '') + ' value="' + esc(ipdNursingVitalForm[field] || '') + '"></div>';
        }

        var html = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">' +
            ipdVitalInput('temperature', 'Temperature (\u00b0F)', 'thermometer', '0.1') +
            '<div class="form-group"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="heart" style="width:12px;height:12px;color:var(--color-destructive)"></i> Blood Pressure</label><div style="display:flex;gap:4px"><input type="number" class="form-control ipd-vital-field" data-field="systolic" value="' + esc(ipdNursingVitalForm.systolic) + '"><span style="display:flex;align-items:center;font-size:12px;color:var(--color-muted-foreground)">/</span><input type="number" class="form-control ipd-vital-field" data-field="diastolic" value="' + esc(ipdNursingVitalForm.diastolic) + '"></div></div>' +
            ipdVitalInput('heartRate', 'Heart Rate / Pulse (bpm)', 'activity') +
            ipdVitalInput('respiratoryRate', 'Respiratory Rate (/min)', 'wind') +
            ipdVitalInput('spO2', 'SpO2 (%)', 'droplets') +
            ipdVitalInput('bloodSugar', 'Blood Sugar (mg/dL)', 'droplets') +
            ipdVitalInput('weight', 'Weight (kg)', 'scale', '0.1') +
            ipdVitalInput('height', 'Height (cm)', 'ruler', '0.1') +
        '</div>';

        html += '<div style="margin-top:14px"><label style="font-size:12px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Pain Scale (0-10)</label><div class="pain-scale-btns">';
        for (var pi = 0; pi <= 10; pi++) {
            html += '<button class="pain-scale-btn ipd-pain-btn' + (ipdNursingVitalForm.painScale === pi ? ' active' : '') + '" data-pain="' + pi + '">' + pi + '</button>';
        }
        html += '</div></div>';

        return html;
    }

    function buildIpdVitalHistoryBlock(entries) {
        if (!entries || entries.length === 0) {
            return '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);padding:24px;text-align:center">' +
                '<i data-lucide="thermometer" style="width:28px;height:28px;color:var(--color-muted-foreground);opacity:0.3;display:block;margin:0 auto 8px"></i>' +
                '<p style="font-size:12px;color:var(--color-muted-foreground);margin:0">No vitals recorded yet</p>' +
            '</div>';
        }
        var html = '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
            '<div style="border-bottom:1px solid var(--color-border);padding:14px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Vital History (' + entries.length + ')</h4></div>' +
            '<div style="overflow-x:auto"><table class="data-table"><thead><tr>' +
                '<th>Date/Time</th><th>Temp</th><th>BP</th><th>Pulse</th><th>SpO2</th><th>RR</th><th>Sugar</th><th>Pain</th><th>By</th>' +
            '</tr></thead><tbody>';
        entries.forEach(function(e) {
            html += '<tr>' +
                '<td style="font-size:11px;font-family:monospace">' + new Date(e.recordedAt).toLocaleString() + '</td>' +
                '<td style="font-size:12px;font-family:monospace">' + (e.temperature || '-') + '</td>' +
                '<td style="font-size:12px;font-family:monospace">' + (e.bpSystolic && e.bpDiastolic ? e.bpSystolic + '/' + e.bpDiastolic : '-') + '</td>' +
                '<td style="font-size:12px;font-family:monospace">' + (e.pulse || '-') + '</td>' +
                '<td style="font-size:12px;font-family:monospace">' + (e.spO2 || '-') + '</td>' +
                '<td style="font-size:12px;font-family:monospace">' + (e.respiration || '-') + '</td>' +
                '<td style="font-size:12px;font-family:monospace">' + (e.bloodSugar || '-') + '</td>' +
                '<td style="font-size:12px">' + (e.painScale != null ? e.painScale + '/10' : '-') + '</td>' +
                '<td style="font-size:11px;color:var(--color-muted-foreground)">' + esc(e.recordedBy || '-') + '</td>' +
            '</tr>';
        });
        html += '</tbody></table></div></div>';
        return html;
    }

    $(document).on('click', '.ipd-section-tab', function() {
        var tab = $(this).data('tab');
        $('.ipd-section-tab').each(function() {
            var isActive = $(this).data('tab') === tab;
            $(this).css({
                background: isActive ? 'var(--midnight-blue)' : 'var(--color-card)',
                color: isActive ? '#fff' : 'var(--color-foreground)'
            });
            if (isActive) $(this).addClass('active'); else $(this).removeClass('active');
        });
        if (tab === 'orders') {
            $('#ipdSectionOrders').show();
            $('#ipdSectionVitals').hide();
        } else {
            $('#ipdSectionOrders').hide();
            $('#ipdSectionVitals').show();
        }
        lucide.createIcons();
    });

    $(document).on('input', '.ipd-vital-field', function() {
        var field = $(this).data('field');
        if (field) ipdNursingVitalForm[field] = $(this).val();
    });

    $(document).on('click', '.ipd-pain-btn', function() {
        var val = parseInt($(this).data('pain'));
        ipdNursingVitalForm.painScale = val;
        $('.ipd-pain-btn').removeClass('active');
        $(this).addClass('active');
    });

    var $pendingIpdVitalBtn = null;
    var _ipdVitalAdmId = null;

    function _showIpdVitalConfirm(admId, btn) {
        var f = ipdNursingVitalForm;
        var rows = '';
        function vrow(label, val) { if (val !== '' && val !== null && val !== undefined) rows += '<tr><td style="font-size:13px;color:#64748b;padding:6px 12px 6px 0;width:55%">' + label + '</td><td style="font-size:13px;font-weight:600;color:#1e293b;padding:6px 0;font-family:monospace">' + val + '</td></tr>'; }
        vrow('Temperature (°F)', f.temperature);
        if (f.systolic || f.diastolic) vrow('Blood Pressure', (f.systolic || '-') + ' / ' + (f.diastolic || '-'));
        vrow('Heart Rate / Pulse (bpm)', f.heartRate);
        vrow('Respiratory Rate (/min)', f.respiratoryRate);
        vrow('SpO2 (%)', f.spO2);
        vrow('Blood Sugar (mg/dL)', f.bloodSugar);
        vrow('Weight (kg)', f.weight);
        vrow('Height (cm)', f.height);
        if (f.painScale !== null) vrow('Pain Scale', f.painScale + ' / 10');
        if (f.notes) vrow('Notes', f.notes);

        if (!rows) { showToast('Please enter at least one vital sign.', 'error'); return; }

        $pendingIpdVitalBtn = btn;
        _ipdVitalAdmId = admId;

        var html =
            '<div class="modal fade" id="ipdVitalConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:440px">' +
            '<div class="modal-content" style="border-radius:16px;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18)">' +
            '<div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);border-radius:16px 16px 0 0;padding:20px 24px;display:flex;align-items:center;gap:12px">' +
                '<div style="width:38px;height:38px;background:rgba(127,255,212,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center">' +
                    '<i data-lucide="thermometer" style="width:20px;height:20px;color:#7fffd4"></i>' +
                '</div>' +
                '<div><h5 style="margin:0;font-size:16px;font-weight:700;color:#fff">Confirm Vital Signs</h5>' +
                '<p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6)">Review before saving</p></div>' +
            '</div>' +
            '<div style="padding:20px 24px">' +
                '<table style="width:100%;border-collapse:collapse">' + rows + '</table>' +
            '</div>' +
            '<div style="padding:16px 24px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:10px">' +
                '<button class="btn-secondary" data-bs-dismiss="modal" style="min-width:90px">Cancel</button>' +
                '<button class="btn-primary" id="btnIpdVitalConfirmOk" style="min-width:120px;background:linear-gradient(135deg,#7fffd4,#00bcd4);color:#0f172a;font-weight:700">' +
                    '<i data-lucide="save" style="width:14px;height:14px"></i> Save Vitals' +
                '</button>' +
            '</div>' +
            '</div></div></div>';

        $('#ipdVitalConfirmModal').remove();
        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('ipdVitalConfirmModal'), { backdrop: true });

        $('#ipdVitalConfirmModal').on('hidden.bs.modal', function() {
            $(this).remove();
            if ($pendingIpdVitalBtn) { _doSaveIpdVital(_ipdVitalAdmId, $pendingIpdVitalBtn); $pendingIpdVitalBtn = null; }
        });
        $('#btnIpdVitalConfirmOk').off('click').on('click', function() {
            modal.hide();
        });
        modal.show();
    }

    function _doSaveIpdVital(admId, btn) {
        btn.prop('disabled', true).html('<i data-lucide="loader-2"></i> Saving...');
        lucide.createIcons();
        $.get('/api/ipd/nursing-records/by-admission/' + admId)
            .then(function(rec) {
                var f = ipdNursingVitalForm;
                var payload = { category: 'Routine' };
                if (f.temperature)     payload.temperature  = parseFloat(f.temperature);
                if (f.systolic)        payload.bpSystolic   = parseInt(f.systolic);
                if (f.diastolic)       payload.bpDiastolic  = parseInt(f.diastolic);
                if (f.heartRate)       payload.pulse        = parseInt(f.heartRate);
                if (f.spO2)            payload.spO2         = parseInt(f.spO2);
                if (f.respiratoryRate) payload.respiration  = parseInt(f.respiratoryRate);
                if (f.weight)          payload.weight       = parseFloat(f.weight);
                if (f.height)          payload.height       = parseFloat(f.height);
                if (f.bloodSugar)      payload.bloodSugar   = parseFloat(f.bloodSugar);
                if (f.painScale !== null) payload.painScale = f.painScale;
                if (f.notes)           payload.notes        = f.notes;
                return $.ajax({ url: '/api/ipd/nursing-records/' + rec.recordId + '/vitals', method: 'POST', contentType: 'application/json', data: JSON.stringify(payload) });
            })
            .then(function() {
                ipdNursingVitalForm = { temperature: '', systolic: '', diastolic: '', heartRate: '', spO2: '', respiratoryRate: '', weight: '', height: '', bloodSugar: '', painScale: null, notes: '' };
                $('.ipd-vital-field').val('');
                $('textarea.ipd-vital-field').val('');
                $('.ipd-pain-btn').removeClass('active');
                btn.prop('disabled', false).html('<i data-lucide="save"></i> Save Vitals');
                lucide.createIcons();
                $.get('/api/ipd/nursing-records/by-admission/' + admId).done(function(rec) {
                    $('#ipdVitalHistoryWrap').html(buildIpdVitalHistoryBlock(rec.entries || []));
                    lucide.createIcons();
                });
                _showIpdVitalSuccess();
            })
            .catch(function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error) ? xhr.responseJSON.error : 'Failed to save vitals.';
                showToast(msg, 'error');
                btn.prop('disabled', false).html('<i data-lucide="save"></i> Save Vitals');
                lucide.createIcons();
            });
    }

    function _showIpdVitalSuccess() {
        var now = new Date();
        var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + now.toLocaleDateString();
        var html =
            '<div class="modal fade" id="ipdVitalSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:400px">' +
            '<div class="modal-content" style="border-radius:16px;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.18);overflow:hidden">' +
            '<div style="background:linear-gradient(135deg,#00b894,#00cec9);padding:28px 24px;text-align:center">' +
                '<div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">' +
                    '<i data-lucide="check-circle-2" style="width:30px;height:30px;color:#fff"></i>' +
                '</div>' +
                '<h4 style="margin:0;font-size:18px;font-weight:700;color:#fff">Vitals Saved!</h4>' +
                '<p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85)">Vital signs recorded successfully</p>' +
            '</div>' +
            '<div style="padding:20px 24px;text-align:center">' +
                '<p style="font-size:13px;color:#64748b;margin:0 0 16px">' +
                    '<i data-lucide="clock" style="width:13px;height:13px;display:inline;vertical-align:middle;color:#94a3b8"></i>&nbsp;Recorded at: <strong style="color:#1e293b">' + timeStr + '</strong>' +
                '</p>' +
                '<button class="btn-primary" data-bs-dismiss="modal" style="width:100%;background:linear-gradient(135deg,#00b894,#00cec9);color:#fff;font-weight:600">Done</button>' +
            '</div>' +
            '</div></div></div>';

        $('#ipdVitalSuccessModal').remove();
        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('ipdVitalSuccessModal'), { backdrop: true });
        $('#ipdVitalSuccessModal').on('hidden.bs.modal', function() { $(this).remove(); });
        modal.show();
    }

    $(document).on('click', '#btnSaveIpdVital', function() {
        var admId = $(this).data('admission');
        var btn   = $(this);
        _showIpdVitalConfirm(admId, btn);
    });

    $(document).on('click', '.nursing-bed-card:not(.disabled)', function() {
        var bed = $(this).data('bed');
        var patient = wardPatients.find(function(p) { return p.bed === bed; });
        if (!patient) return;
        $('.nursing-bed-card').removeClass('selected');
        $(this).addClass('selected');
        openNursingDetail(patient);
    });

    function openNursingDetail(patient) {
        $('#nursingDetailTitle').text('Patient Details: ' + patient.bed);
        var tasksComplete = nursingTasks.filter(function(t) { return t.done; }).length;
        var tasksPct = Math.round((tasksComplete / nursingTasks.length) * 100);
        var initials = patient.name.split(' ').map(function(n) { return n[0]; }).join('');

        var html = '<div style="display:grid;gap:24px;grid-template-columns:2fr 1fr">' +
            '<div style="display:flex;flex-direction:column;gap:24px">' +
                '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                    '<div style="display:flex;align-items:center;gap:16px"><div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700">' + esc(initials) + '</div><div style="flex:1"><div style="display:flex;align-items:center;gap:8px"><h3 style="font-size:16px;font-weight:600;margin:0">' + esc(patient.name) + '</h3>' + (patient.status === 'critical' ? '<span class="badge badge-destructive" style="font-size:10px">CRITICAL</span>' : '') + '</div><div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:4px"><span style="font-size:12px;color:var(--color-muted-foreground)">' + patient.age + ' yrs, ' + (patient.gender === 'M' ? 'Male' : 'Female') + '</span><span style="font-size:12px;color:var(--color-muted-foreground)">Bed: ' + esc(patient.bed) + '</span><span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(patient.diagnosis) + '</span></div></div></div>' +
                '</div>' +
                '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);box-shadow:0 1px 3px rgba(0,0,0,0.04)"><div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Record Vital Signs</h4></div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:20px">' +
                    '<div style="display:flex;flex-direction:column;gap:6px"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="thermometer" style="width:12px;height:12px;color:var(--color-destructive)"></i> Temperature (F)</label><input type="number" class="form-control" placeholder="98.6" step="0.1" style="font-size:14px"></div>' +
                    '<div style="display:flex;flex-direction:column;gap:6px"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="heart" style="width:12px;height:12px;color:var(--color-destructive)"></i> Blood Pressure</label><div style="display:flex;gap:4px"><input type="number" class="form-control" placeholder="120" style="font-size:14px"><span style="display:flex;align-items:center;font-size:12px;color:var(--color-muted-foreground)">/</span><input type="number" class="form-control" placeholder="80" style="font-size:14px"></div></div>' +
                    '<div style="display:flex;flex-direction:column;gap:6px"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="activity" style="width:12px;height:12px;color:#3B82F6"></i> Pulse (bpm)</label><input type="number" class="form-control" placeholder="72" style="font-size:14px"></div>' +
                    '<div style="display:flex;flex-direction:column;gap:6px"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="wind" style="width:12px;height:12px;color:#3B82F6"></i> Resp. Rate</label><input type="number" class="form-control" placeholder="16" style="font-size:14px"></div>' +
                    '<div style="display:flex;flex-direction:column;gap:6px"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="droplets" style="width:12px;height:12px;color:#3B82F6"></i> SPO2 (%)</label><input type="number" class="form-control" placeholder="98" style="font-size:14px"></div>' +
                    '<div style="display:flex;flex-direction:column;gap:6px"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="droplets" style="width:12px;height:12px;color:#F59E0B"></i> Blood Sugar (mg/dL)</label><input type="number" class="form-control" placeholder="120" style="font-size:14px"></div>' +
                    '<div style="display:flex;flex-direction:column;gap:6px"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="scale" style="width:12px;height:12px;color:var(--color-muted-foreground)"></i> Weight (kg)</label><input type="number" class="form-control" placeholder="70" style="font-size:14px"></div>' +
                    '<div style="display:flex;flex-direction:column;gap:6px"><label style="font-size:12px;color:var(--color-muted-foreground)">Pain Scale (0-10)</label><div style="display:flex;gap:2px">';
        for (var n = 0; n <= 10; n++) {
            var pcls = n <= 3 ? 'low' : n <= 6 ? 'mid' : 'high';
            html += '<button class="pain-scale-btn ' + pcls + '">' + n + '</button>';
        }
        html += '</div></div></div><div style="display:flex;justify-content:flex-end;border-top:1px solid var(--color-border);padding:12px 20px"><button class="btn-primary btn-sm"><i data-lucide="save" style="width:14px;height:14px"></i> Save Vitals</button></div></div>' +
                '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);box-shadow:0 1px 3px rgba(0,0,0,0.04)"><div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Nursing Notes</h4></div><div style="padding:20px;display:flex;flex-direction:column;gap:16px"><textarea class="form-control" rows="3" style="resize:none;font-size:14px" placeholder="Enter nursing note..."></textarea><div style="display:flex;align-items:center;justify-content:space-between"><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Nurse Saba Khan | 15 Feb 2026</p><button class="btn-primary btn-sm">Save Note</button></div><div style="border-top:1px solid var(--color-border);padding-top:16px;display:flex;flex-direction:column;gap:12px">';
        nursingNotes.forEach(function(note) {
            html += '<div style="border-radius:8px;border:1px solid var(--color-border);background:var(--color-muted);padding:12px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;font-weight:600">' + esc(note.nurse) + '</span><span class="badge badge-outline" style="font-size:10px">' + esc(note.type) + '</span></div><span style="font-size:10px;color:var(--color-muted-foreground)">' + esc(note.time) + '</span></div><p style="font-size:12px;color:var(--color-muted-foreground);line-height:1.6;margin:0">' + esc(note.note) + '</p></div>';
        });
        html += '</div></div></div></div>' +
            '<div style="display:flex;flex-direction:column;gap:24px">' +
                '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);box-shadow:0 1px 3px rgba(0,0,0,0.04)"><div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--color-border);padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Today\'s Tasks</h4><span style="font-size:12px;font-weight:500;color:var(--color-muted-foreground)">' + tasksComplete + '/' + nursingTasks.length + '</span></div><div style="padding:16px">' +
                '<div style="height:8px;border-radius:999px;background:var(--color-muted);overflow:hidden;margin-bottom:12px"><div style="height:100%;border-radius:999px;background:var(--aquamint);width:' + tasksPct + '%"></div></div>';
        nursingTasks.forEach(function(task) {
            html += '<label style="display:flex;align-items:flex-start;gap:12px;border-radius:8px;padding:8px;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'var(--color-muted)\'" onmouseout="this.style.background=\'transparent\'">' +
                '<input type="checkbox" class="form-check-input" ' + (task.done ? 'checked' : '') + ' style="margin-top:2px">' +
                '<div style="flex:1"><p style="font-size:12px;font-weight:500;margin:0;' + (task.done ? 'color:var(--color-muted-foreground);text-decoration:line-through' : '') + '">' + esc(task.task) + '</p><p style="font-size:10px;color:var(--color-muted-foreground);margin:0">' + esc(task.time) + '</p></div>' +
                (task.done ? '<i data-lucide="check-circle-2" style="width:14px;height:14px;color:var(--color-success);flex-shrink:0"></i>' : '') +
            '</label>';
        });
        html += '</div></div>' +
                '<div style="border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);box-shadow:0 1px 3px rgba(0,0,0,0.04)"><div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Quick Actions</h4></div><div style="padding:16px;display:flex;flex-direction:column;gap:8px">' +
                    '<button style="display:flex;width:100%;align-items:center;gap:12px;border-radius:8px;border:1px solid var(--color-border);padding:12px;text-align:left;background:transparent;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'var(--color-muted)\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="phone" style="width:16px;height:16px;color:var(--midnight-blue)"></i><span style="font-size:14px;font-weight:500;flex:1">Call Doctor</span><i data-lucide="chevron-right" style="width:16px;height:16px;color:var(--color-muted-foreground)"></i></button>' +
                    '<button style="display:flex;width:100%;align-items:center;gap:12px;border-radius:8px;border:1px solid var(--color-border);padding:12px;text-align:left;background:transparent;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'var(--color-muted)\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="pill" style="width:16px;height:16px;color:var(--midnight-blue)"></i><span style="font-size:14px;font-weight:500;flex:1">Request Pharmacy</span><i data-lucide="chevron-right" style="width:16px;height:16px;color:var(--color-muted-foreground)"></i></button>' +
                    '<button style="display:flex;width:100%;align-items:center;gap:12px;border-radius:8px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.05);padding:12px;text-align:left;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'rgba(239,68,68,0.1)\'" onmouseout="this.style.background=\'rgba(239,68,68,0.05)\'"><i data-lucide="bell" style="width:16px;height:16px;color:var(--color-destructive)"></i><span style="font-size:14px;font-weight:500;color:var(--color-destructive);flex:1">Emergency Alert</span><i data-lucide="chevron-right" style="width:16px;height:16px;color:rgba(239,68,68,0.5)"></i></button>' +
                    '<button style="display:flex;width:100%;align-items:center;gap:12px;border-radius:8px;border:1px solid var(--color-border);padding:12px;text-align:left;background:transparent;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'var(--color-muted)\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="file-text" style="width:16px;height:16px;color:var(--midnight-blue)"></i><span style="font-size:14px;font-weight:500;flex:1">Patient Handover</span><i data-lucide="chevron-right" style="width:16px;height:16px;color:var(--color-muted-foreground)"></i></button>' +
                '</div></div>' +
            '</div></div>';
        $('#nursingDetailBody').html(html);
        new bootstrap.Offcanvas(document.getElementById('nursingDetailSheet')).show();
        lucide.createIcons();
    }

    $(document).on('click', '.nursing-shift-btn', function() { $('.nursing-shift-btn').removeClass('active'); $(this).addClass('active'); });

    // ===== TAB 7: DISCHARGE — DOCTOR VIEW =====
    var _dischAdmId = null;
    var _dischStep3Interval    = null;
    var _dischClearanceSettings = null;  // cached from /api/hospital-info/settings/ipd_discharge

    // Navigate to discharge tab and jump to a step (from admissions dropdown)
    window.ipdGoToDischarge = function(admissionId, jumpToWaiting) {
        _dischAdmId = admissionId;
        // Switch to discharge tab
        $('.module-tab[data-tab="discharge"]').click();
        if (jumpToWaiting) {
            showDischStep(3, admissionId);
        } else {
            showDischStep(2, admissionId);
        }
    };

    window.showDischStep = function showDischStep(n, admId) {
        if (admId) _dischAdmId = admId;
        if (_dischStep3Interval) { clearInterval(_dischStep3Interval); _dischStep3Interval = null; }

        if (n === 1) {
            // Close the offcanvas and return to the patient list in the tab
            var oc = bootstrap.Offcanvas.getInstance(document.getElementById('dischargeStepSheet'));
            if (oc) oc.hide();
            renderDischargeTab();
            lucide.createIcons();
            return;
        }

        // Resolve patient info for the offcanvas header
        var adm = _dischAdmId ? admissions.find(function(a) { return a.admissionId === _dischAdmId; }) : null;
        var patientName = adm ? (adm.patientName || 'Patient') : 'Patient';
        var stepLabels = { 2: 'Initiate Discharge', 3: 'Awaiting Clearance', 4: 'Final Discharge', 5: 'Discharge Complete' };
        $('#dischargeStepTitle').text(patientName);
        $('#dischargeStepSubtitle').text(stepLabels[n] || '');

        // Show the correct step inside the offcanvas
        [2, 3, 4, 5].forEach(function(i) { $('#dischStep' + i).hide(); });
        $('#dischStep' + n).show();

        // Update breadcrumb dots
        [2, 3, 4, 5].forEach(function(i) {
            var $dot = $('#dischStepDot' + i);
            $dot.removeClass('active done');
            if (i < n) $dot.addClass('done');
            else if (i === n) $dot.addClass('active');
        });
        [[2,3],[3,4],[4,5]].forEach(function(pair) {
            var $line = $('#dischStepLine' + pair[0] + '' + pair[1]);
            if (pair[0] < n) $line.addClass('done'); else $line.removeClass('done');
        });

        // Render step content
        if (n === 2) { renderDischStep2(); }
        else if (n === 3) { renderDischStep3(); startStep3Polling(); }
        else if (n === 4) { renderDischStep4(); }

        // Open the offcanvas
        bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('dischargeStepSheet')).show();
        lucide.createIcons();
    }

    /* ── Discharge: flat data builder ───────────────────────────────────────── */
    function _ipdDischBuildData() {
        return admissions.slice().sort(function(a, b) {
            return new Date(b.createdAt || b.admissionDate || 0) - new Date(a.createdAt || a.admissionDate || 0);
        }).map(function(a) {
            var admDate = a.admissionDate ? new Date(a.admissionDate) : null;
            var los = admDate ? Math.max(0, Math.floor((Date.now() - admDate.getTime()) / 86400000)) + ' days' : '-';
            var ds = a.dischargeStatus || '';
            var displayStatus;
            if (a.status === 'Discharged' || ds === 'discharged') {
                displayStatus = 'Discharged';
            } else if (ds === 'all_cleared') {
                displayStatus = 'All Cleared';
            } else if (ds === 'pending_clearance') {
                displayStatus = 'Awaiting Clearance';
            } else {
                displayStatus = a.status || 'Active';
            }
            var admId = a.admissionId || '';
            var shortId = admId.replace((a.mrn || '') + '-', '');
            var dateStr = admDate ? admDate.toLocaleDateString() + ', ' + admDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-';
            return {
                mrn: a.mrn || '',
                patientName: a.patientName || '',
                admissionId: admId,
                shortId: shortId,
                department: a.department || '',
                doctorName: a.doctorName || '',
                ward: a.ward || '',
                bed: a.bed || '',
                initialDiagnosis: a.initialDiagnosis || '',
                los: los,
                dischargeStatus: ds,
                admissionStatus: a.status || '',
                displayStatus: displayStatus,
                dateStr: dateStr,
                admissionDate: a.admissionDate || ''
            };
        });
    }

    /* ── Discharge: paginated render ─────────────────────────────────────────── */
    function _ipdDischRenderPagination(source) {
        /* live search */
        var search = ($('#dischargeSearch').val() || '').toLowerCase();
        if (search) {
            source = source.filter(function(d) {
                return d.mrn.toLowerCase().indexOf(search) > -1 ||
                       d.patientName.toLowerCase().indexOf(search) > -1 ||
                       d.admissionId.toLowerCase().indexOf(search) > -1;
            });
        }
        var total = source.length;
        var totalPages = Math.max(1, Math.ceil(total / ipdDischPerPageVal));
        if (ipdDischCurrentPage > totalPages) ipdDischCurrentPage = 1;
        var start = (ipdDischCurrentPage - 1) * ipdDischPerPageVal;
        var slice = source.slice(start, start + ipdDischPerPageVal);

        var html = '';
        if (slice.length === 0) {
            html = '<tr><td colspan="10"><div class="empty-state"><i data-lucide="log-out"></i><p>No admissions found</p></div></td></tr>';
        } else {
            slice.forEach(function(d) {
                var wardBed = (d.ward || '-') + (d.bed && d.bed !== '-' ? ', ' + d.bed : '');
                var statusBadge = '';
                if (d.displayStatus === 'Discharged') {
                    statusBadge = '<span class="badge badge-info" style="font-size:10px">DISCHARGED</span>';
                } else if (d.displayStatus === 'All Cleared') {
                    statusBadge = '<span class="badge badge-success" style="font-size:10px">ALL CLEARED</span>';
                } else if (d.displayStatus === 'Awaiting Clearance') {
                    statusBadge = '<span class="badge badge-warning" style="font-size:10px">AWAITING CLEARANCE</span>';
                } else {
                    statusBadge = '<span class="badge badge-outline" style="font-size:10px">' + esc(d.displayStatus.toUpperCase()) + '</span>';
                }
                var stepTarget = d.dischargeStatus === 'pending_clearance' ? 3 : d.dischargeStatus === 'all_cleared' ? 4 : (d.displayStatus === 'Discharged') ? 5 : 2;
                html += '<tr class="clickable-row disch-table-row" onclick="showDischStep(' + stepTarget + ', \'' + esc(d.admissionId) + '\')">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(d.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(d.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(d.shortId) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(d.department || '-') + '</td>' +
                    '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(d.doctorName || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(wardBed) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(d.initialDiagnosis || '') + '">' + esc(d.initialDiagnosis || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(d.los) + '</td>' +
                    '<td>' + statusBadge + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(d.dateStr) + '</td>' +
                    '</tr>';
            });
        }
        $('#dischargeTableBody').html(html);
        lucide.createIcons();

        /* pagination info */
        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + ipdDischPerPageVal, total);
        $('#dischargeTableInfo').text('Showing ' + from + '–' + to + ' of ' + total + ' admissions');

        /* page buttons */
        $('#ipdDischPrevPage').prop('disabled', ipdDischCurrentPage <= 1);
        $('#ipdDischNextPage').prop('disabled', ipdDischCurrentPage >= totalPages);
        var numsHtml = '';
        var startP = Math.max(1, ipdDischCurrentPage - 2);
        var endP   = Math.min(totalPages, startP + 4);
        if (startP > 1) numsHtml += '<button class="opd-page-num" onclick="ipdDischGoPage(1)">1</button>' + (startP > 2 ? '<span class="opd-page-ellipsis">…</span>' : '');
        for (var p = startP; p <= endP; p++) {
            numsHtml += '<button class="opd-page-num' + (p === ipdDischCurrentPage ? ' active' : '') + '" onclick="ipdDischGoPage(' + p + ')">' + p + '</button>';
        }
        if (endP < totalPages) numsHtml += (endP < totalPages - 1 ? '<span class="opd-page-ellipsis">…</span>' : '') + '<button class="opd-page-num" onclick="ipdDischGoPage(' + totalPages + ')">' + totalPages + '</button>';
        $('#ipdDischPageNums').html(numsHtml);
    }

    window.ipdDischGoPage = function(p) { ipdDischCurrentPage = p; _ipdDischRenderPagination(ipdDischFiltered !== null ? ipdDischFiltered : _ipdDischBuildData()); };
    $('#ipdDischPrevPage').on('click', function() { if (ipdDischCurrentPage > 1) { ipdDischCurrentPage--; _ipdDischRenderPagination(ipdDischFiltered !== null ? ipdDischFiltered : _ipdDischBuildData()); } });
    $('#ipdDischNextPage').on('click', function() { ipdDischCurrentPage++; _ipdDischRenderPagination(ipdDischFiltered !== null ? ipdDischFiltered : _ipdDischBuildData()); });
    $('#dischargeSearch').on('input', function() { ipdDischCurrentPage = 1; _ipdDischRenderPagination(ipdDischFiltered !== null ? ipdDischFiltered : _ipdDischBuildData()); });

    function renderDischargeTab() {
        /* update stat tiles */
        var data = _ipdDischBuildData();
        var setEl = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
        setEl('dischStatTotal',     admissions.length);
        setEl('dischStatAwaiting',  data.filter(function(d){ return d.displayStatus === 'Awaiting Clearance'; }).length);
        setEl('dischStatCleared',   data.filter(function(d){ return d.displayStatus === 'All Cleared'; }).length);
        setEl('dischStatDischarged',data.filter(function(d){ return d.displayStatus === 'Discharged'; }).length);

        var src = ipdDischFiltered !== null ? ipdDischFiltered : data;
        _ipdDischRenderPagination(src);
    }

    // Stop step-3 polling when the discharge offcanvas is closed; reset settings cache
    document.getElementById('dischargeStepSheet').addEventListener('hidden.bs.offcanvas', function() {
        if (_dischStep3Interval) { clearInterval(_dischStep3Interval); _dischStep3Interval = null; }
        _dischClearanceSettings = null;  // reset so next open fetches fresh settings
    });
    // Re-initialize icons after the offcanvas finishes opening
    document.getElementById('dischargeStepSheet').addEventListener('shown.bs.offcanvas', function() {
        lucide.createIcons();
    });

    function renderDischStep2() {
        var adm = admissions.find(function(a) { return a.admissionId === _dischAdmId; });
        if (!adm) return;
        var admDate = adm.admissionDate ? new Date(adm.admissionDate) : null;
        var los = admDate ? Math.max(0, Math.floor((Date.now() - admDate.getTime()) / 86400000)) : 0;
        var today = new Date().toISOString().split('T')[0];

        var medItems = ['Vital signs within acceptable range', 'Afebrile for last 24 hours', 'Pain controlled adequately'];
        var clinItems = ['Wound/site reviewed and stable', 'All procedures documented', 'Follow-up plan established'];

        var checklistHtml = function(items, prefix) {
            return items.map(function(item, i) {
                var id = prefix + i;
                return '<div class="disch-checklist-item" data-check="' + id + '" onclick="toggleDischCheck(this)">' +
                    '<div class="disch-check-box"><i data-lucide="check" style="width:13px;height:13px;color:var(--midnight-blue);display:none"></i></div>' +
                    '<span style="font-size:13px">' + esc(item) + '</span>' +
                '</div>';
            }).join('');
        };

        var html = '<div style="max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:20px">' +
            // Patient banner
            '<div style="display:flex;align-items:center;gap:16px;background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:18px 22px">' +
                '<div class="avatar" style="width:50px;height:50px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;flex-shrink:0">' + getInitials(adm.patientName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="font-size:17px;font-weight:700">' + esc(adm.patientName) + '</div>' +
                    '<div style="display:flex;gap:10px;margin-top:5px;flex-wrap:wrap">' +
                        '<span class="badge badge-outline" style="font-size:10px">' + esc(adm.admissionId) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(adm.mrn) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(adm.ward) + ' / ' + esc(adm.bed) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">Dr. ' + esc(adm.doctorName) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="text-align:center;padding:10px 20px;background:var(--color-muted);border-radius:10px">' +
                    '<div style="font-size:28px;font-weight:800;color:var(--midnight-blue)">' + los + '</div>' +
                    '<div style="font-size:10px;color:var(--color-muted-foreground);font-weight:600">DAYS LOS</div>' +
                '</div>' +
            '</div>' +
            // Readiness checklist
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden">' +
                '<div style="padding:16px 22px;border-bottom:1px solid var(--color-border);background:var(--color-muted)">' +
                    '<div style="font-size:15px;font-weight:700;color:var(--midnight-blue)">Discharge Readiness Checklist</div>' +
                    '<div style="font-size:12px;color:var(--color-muted-foreground);margin-top:2px">Complete all items before initiating discharge</div>' +
                '</div>' +
                '<div style="padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
                    '<div>' +
                        '<div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px">Medical Status</div>' +
                        '<div style="display:flex;flex-direction:column;gap:8px" id="medChecklist">' + checklistHtml(medItems, 'med') + '</div>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px">Clinical Clearance</div>' +
                        '<div style="display:flex;flex-direction:column;gap:8px" id="clinChecklist">' + checklistHtml(clinItems, 'clin') + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            // Discharge details
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden">' +
                '<div style="padding:16px 22px;border-bottom:1px solid var(--color-border);background:var(--color-muted)">' +
                    '<div style="font-size:15px;font-weight:700;color:var(--midnight-blue)">Discharge Details</div>' +
                '</div>' +
                '<div style="padding:20px;display:flex;flex-direction:column;gap:16px">' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
                        '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Planned Discharge Date</label>' +
                            '<input type="date" id="dischPlanDate" class="form-control" style="margin-top:6px" value="' + today + '"></div>' +
                        '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Planned Discharge Time</label>' +
                            '<input type="time" id="dischPlanTime" class="form-control" style="margin-top:6px" value="12:00"></div>' +
                    '</div>' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:10px;display:block">Discharge Type</label>' +
                        '<div style="display:flex;gap:8px;flex-wrap:wrap" id="dischTypeGroup">' +
                            ['Routine','DAMA','Transfer','Death','Absconded'].map(function(t) {
                                return '<button class="disch-type-btn' + (t === 'Routine' ? ' active' : '') + '" data-type="' + t + '" onclick="toggleDischType(this)">' + t + '</button>';
                            }).join('') +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            // Info banner
            '<div style="display:flex;align-items:flex-start;gap:14px;background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:16px 18px">' +
                '<i data-lucide="info" style="width:18px;height:18px;color:#3B82F6;flex-shrink:0;margin-top:2px"></i>' +
                '<div style="font-size:13px;color:#1D4ED8"><strong>What happens next:</strong> The Billing Department will be notified and will collect payment for Hospital, Pharmacy, and Laboratory charges. You will be notified here once all 3 departments have cleared. You can then complete the final discharge form.</div>' +
            '</div>' +
            // Action buttons
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<button class="btn-outline" onclick="showDischStep(1)"><i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back to Patient List</button>' +
                '<button class="btn-primary" style="background:var(--aquamint);color:var(--midnight-blue);border-color:var(--aquamint);font-weight:700;padding:12px 28px;font-size:14px" onclick="submitDischStep2()"><i data-lucide="send" style="width:16px;height:16px"></i> Initiate Discharge &amp; Notify Billing</button>' +
            '</div>' +
        '</div>';
        $('#dischStep2Content').html(html);
        lucide.createIcons();
    }

    window.toggleDischCheck = function(el) {
        var $el = $(el);
        $el.toggleClass('checked');
        var icon = $el.find('i');
        if ($el.hasClass('checked')) icon.show(); else icon.hide();
    };

    window.toggleDischType = function(el) {
        $(el).closest('#dischTypeGroup').find('.disch-type-btn').removeClass('active');
        $(el).addClass('active');
    };

    window.toggleDischCondition = function(el) {
        $(el).closest('.disch-condition-group').find('.disch-condition-btn').removeClass('active');
        $(el).addClass('active');
    };

    window.submitDischStep2 = function() {
        var checkedMed = $('#medChecklist .disch-checklist-item.checked').length;
        var checkedClin = $('#clinChecklist .disch-checklist-item.checked').length;
        var planDate = $('#dischPlanDate').val();
        var planTime = $('#dischPlanTime').val();
        var dischType = $('#dischTypeGroup .disch-type-btn.active').data('type') || 'Routine';

        if (checkedMed < 3 || checkedClin < 3) {
            if (!confirm('Not all readiness items are checked. Initiate discharge anyway?')) return;
        }

        var $btn = $('[onclick="submitDischStep2()"]').prop('disabled', true).text('Initiating...');
        $.ajax({
            url: '/api/ipd/discharge/' + _dischAdmId + '/initiate',
            type: 'POST', contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                plannedDischargeDate: planDate,
                plannedDischargeTime: planTime,
                dischargeType: dischType,
                readinessChecklist: { medical: checkedMed, clinical: checkedClin }
            })
        }).done(function() {
            loadAllData();
            showDischStep(3, _dischAdmId);
        }).fail(function() {
            $btn.prop('disabled', false).text('Initiate Discharge & Notify Billing');
            HMS.toast('Failed to initiate discharge. Please try again.', 'error');
        });
    };

    function renderDischStep3() {
        var adm = admissions.find(function(a) { return a.admissionId === _dischAdmId; });
        if (!adm) return;

        $('#dischStep3Content').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="loader" style="width:20px;height:20px;animation:spin 1s linear infinite"></i> Checking hospital billing...</div>');
        lucide.createIcons();

        var duesData = null;
        var duesReq = $.get('/api/ipd/discharge/' + _dischAdmId + '/clearance-dues')
            .done(function(d) { duesData = d; });

        // Fetch clearance settings only once; reuse cache on subsequent renders (polling)
        var settingsReq = _dischClearanceSettings !== null
            ? $.Deferred().resolve().promise()
            : $.get('/api/hospital-info/settings/ipd_discharge')
                .done(function(res) { _dischClearanceSettings = (res && res.settings) || {}; })
                .fail(function()    { _dischClearanceSettings = {}; });

        $.when(duesReq, settingsReq).always(function() {
            $.get('/api/ipd/admissions')
                .done(function(admData) {
                    if (admData && admData.length) admissions = admData;
                    adm = admissions.find(function(a) { return a.admissionId === _dischAdmId; }) || adm;
                })
                .always(function() {
                    _buildDischStep3(adm, duesData, _dischClearanceSettings || {});
                });
        });
    }

    function _buildDischStep3(adm, dues, clearSettings) {
        var di    = adm.dischargeInfo || {};
        var dHosp = (dues && dues.hospital) || {};
        var dPhrm = (dues && dues.pharmacy) || {};
        var dLab  = (dues && dues.lab)      || {};

        var hospCleared  = dues ? !!dHosp.cleared  : !!(di.hospital || {}).paid;
        var pharmCleared = dues ? !!dPhrm.cleared   : !!(di.pharmacy || {}).paid;
        var labCleared   = dues ? !!dLab.cleared    : !!(di.lab      || {}).paid;

        // ── Which clearances are actually required (from IPD Configuration) ──
        var cs           = clearSettings || {};
        var needHosp     = cs.discharge_require_hospital_clearance  !== '0';
        var needPhrm     = cs.discharge_require_pharmacy_clearance  !== '0';
        var needLab      = cs.discharge_require_lab_clearance       !== '0';

        var required     = [needHosp, needPhrm, needLab];
        var statuses     = [hospCleared, pharmCleared, labCleared];
        var totalRequired = required.filter(Boolean).length;
        var clearedCount  = required.reduce(function(n, req, i) { return n + (req && statuses[i] ? 1 : 0); }, 0);
        var allCleared    = totalRequired === 0 || clearedCount === totalRequired;
        var estimatedTotal= (needHosp ? dHosp.total || 0 : 0) + (needPhrm ? dPhrm.total || 0 : 0) + (needLab ? dLab.total || 0 : 0);

        // ── helpers ────────────────────────────────────────────────────────
        function statusBadge(isCleared) {
            return isCleared
                ? '<span class="clearance-status-badge clearance-cleared" style="white-space:nowrap">✅ Cleared</span>'
                : '<span class="clearance-status-badge clearance-pending"  style="white-space:nowrap">⏳ Pending</span>';
        }

        function fmt(n) { return 'PKR ' + Number(n || 0).toLocaleString(); }

        function breakdownTable(items, cleared, pendingAmt, paidAmt) {
            if (!items || !items.length) {
                return cleared
                    ? '<div style="margin-top:8px;padding:8px 12px;border-radius:6px;background:rgba(16,185,129,0.07);font-size:11px;color:#065F46">No charges on record — cleared automatically</div>'
                    : '<div style="margin-top:8px;padding:8px 12px;border-radius:6px;background:rgba(245,158,11,0.07);font-size:11px;color:#B45309">No detailed breakdown available yet</div>';
            }
            var rows = '';
            items.forEach(function(it) {
                var isPaid = (it.status && it.status === 'Paid') || cleared;
                rows += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--color-border);gap:8px">' +
                    '<span style="font-size:11px;color:var(--color-muted-foreground);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(it.label) + '">' + esc(it.label) + '</span>' +
                    '<span style="font-size:11px;font-weight:600;white-space:nowrap;color:' + (isPaid ? '#10B981' : 'var(--midnight-blue)') + '">' + fmt(it.amount) + '</span>' +
                    (isPaid ? '<span style="font-size:9px;padding:1px 6px;border-radius:10px;background:rgba(16,185,129,0.12);color:#10B981;white-space:nowrap">Paid</span>'
                            : '<span style="font-size:9px;padding:1px 6px;border-radius:10px;background:rgba(239,68,68,0.1);color:#DC2626;white-space:nowrap">Due</span>') +
                '</div>';
            });
            // Footer totals
            if (paidAmt > 0 && pendingAmt > 0) {
                rows += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(16,185,129,0.3)">' +
                    '<span style="font-size:11px;color:#10B981">Amount Paid</span>' +
                    '<span style="font-size:11px;font-weight:700;color:#10B981">− ' + fmt(paidAmt) + '</span></div>';
            }
            if (!cleared && pendingAmt > 0) {
                rows += '<div style="display:flex;justify-content:space-between;padding:5px 0">' +
                    '<span style="font-size:12px;font-weight:700;color:#B45309">Outstanding</span>' +
                    '<span style="font-size:12px;font-weight:800;color:#DC2626">' + fmt(pendingAmt) + '</span></div>';
            }
            var bg = cleared ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.04)';
            var br = cleared ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(239,68,68,0.15)';
            return '<div style="margin-top:10px;padding:10px 12px;background:' + bg + ';border:' + br + ';border-radius:8px">' + rows + '</div>';
        }

        function clearRow(icon, label, sub, isCleared, dept) {
            var items    = dept.breakdown || [];
            var pending  = dept.pending  || 0;
            var paid     = dept.paid     || 0;
            var total    = dept.total    || 0;
            return '<div class="billing-clearance-row ' + (isCleared ? 'cleared' : '') + '" style="flex-direction:column;align-items:stretch;gap:0">' +
                '<div style="display:flex;align-items:center;gap:12px">' +
                    '<span style="font-size:22px;flex-shrink:0">' + icon + '</span>' +
                    '<div style="flex:1">' +
                        '<div style="font-size:14px;font-weight:600">' + label + '</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground)">' + sub +
                            (total > 0 ? ' · <strong style="color:var(--midnight-blue)">' + fmt(total) + '</strong>' : '') +
                        '</div>' +
                    '</div>' +
                    statusBadge(isCleared) +
                '</div>' +
                breakdownTable(items, isCleared, pending, paid) +
            '</div>';
        }

        var progressPct   = totalRequired > 0 ? Math.round((clearedCount / totalRequired) * 100) : 100;
        var progressColor = allCleared ? '#10B981' : '#F59E0B';

        var html = '<div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:20px">' +
            // Patient strip
            '<div style="display:flex;align-items:center;gap:14px;background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px 20px">' +
                '<div class="avatar" style="width:42px;height:42px;background:var(--midnight-blue);color:#fff;font-size:16px;font-weight:700;flex-shrink:0">' + getInitials(adm.patientName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="font-size:15px;font-weight:700">' + esc(adm.patientName) + '</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(adm.admissionId) + ' · ' + esc(adm.ward) + ' / ' + esc(adm.bed) + '</div>' +
                '</div>' +
                '<span class="badge" style="font-size:12px;padding:6px 14px;background:' + (allCleared ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)') + ';color:' + (allCleared ? '#065F46' : '#B45309') + ';font-weight:700">' +
                    (totalRequired === 0 ? 'No Clearance Required' : allCleared ? 'All Cleared' : 'Awaiting Clearance (' + clearedCount + '/' + totalRequired + ')') +
                '</span>' +
            '</div>' +
            // Progress bar
            (totalRequired > 0
                ? '<div>' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Clearance Progress</span><span style="font-size:12px;font-weight:700;color:' + progressColor + '">' + progressPct + '%</span></div>' +
                    '<div style="height:10px;background:var(--color-muted);border-radius:10px;overflow:hidden"><div style="height:100%;width:' + progressPct + '%;background:' + progressColor + ';border-radius:10px;transition:width 0.5s"></div></div>' +
                  '</div>'
                : '') +
            // Clearance card with breakdowns
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden">' +
                '<div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:var(--color-muted)">' +
                    '<div style="font-size:14px;font-weight:700;color:var(--midnight-blue)">Billing Department Clearances</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">' + (totalRequired === 0 ? 'No approvals configured — discharge can proceed directly.' : 'Itemized dues from each department') + '</div>' +
                '</div>' +
                '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +
                    (needHosp ? clearRow('🏥', 'Hospital Charges',    'Room · Nursing · Procedures', hospCleared, dHosp) : '') +
                    (needPhrm ? clearRow('💊', 'Pharmacy Charges',    'Medications dispensed',        pharmCleared, dPhrm) : '') +
                    (needLab  ? clearRow('🔬', 'Laboratory Charges',  'Tests &amp; investigations',   labCleared,  dLab)  : '') +
                    (totalRequired === 0
                        ? '<div style="padding:12px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No clearance approvals are required per current configuration.</div>'
                        : '') +
                '</div>' +
                (estimatedTotal > 0
                    ? '<div style="padding:12px 20px;border-top:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center">' +
                        '<span style="font-size:13px;color:var(--color-muted-foreground)">Grand Total</span>' +
                        '<strong style="font-size:15px;color:var(--midnight-blue)">' + fmt(estimatedTotal) + '</strong>' +
                      '</div>'
                    : '') +
            '</div>' +
            // Status banner
            (allCleared
                ? '<div style="background:rgba(16,185,129,0.08);border:2px solid #10B981;border-radius:12px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px">' +
                    '<div><div style="font-size:15px;font-weight:700;color:#10B981">' + (totalRequired === 0 ? 'No Approvals Required!' : totalRequired === 1 ? '1 Department Cleared!' : 'All ' + totalRequired + ' Departments Cleared!') + '</div><div style="font-size:12px;color:var(--color-muted-foreground);margin-top:4px">You can now complete the final discharge form.</div></div>' +
                    '<button class="btn-primary" style="background:var(--aquamint);color:var(--midnight-blue);border-color:var(--aquamint);font-weight:700;font-size:14px;padding:12px 24px;white-space:nowrap;flex-shrink:0" onclick="showDischStep(4)">Complete Discharge <i data-lucide="arrow-right" style="width:16px;height:16px"></i></button>' +
                  '</div>'
                : '<div style="display:flex;align-items:flex-start;gap:14px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:16px 18px">' +
                    '<i data-lucide="clock" style="width:18px;height:18px;color:#F59E0B;flex-shrink:0;margin-top:2px"></i>' +
                    '<div style="font-size:13px;color:#B45309"><strong>Waiting for Billing Department</strong><br>Pending dues must be settled before discharge can proceed. This page auto-refreshes every 15 seconds.</div>' +
                  '</div>') +
            '<div><button class="btn-outline" onclick="showDischStep(1)"><i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back to Patient List</button></div>' +
        '</div>';
        $('#dischStep3Content').html(html);
        lucide.createIcons();
    }

    function startStep3Polling() {
        _dischStep3Interval = setInterval(function() {
            if ($('#dischStep3').is(':visible')) {
                // Refresh admission data silently
                var safeGet = function(url) { return $.get(url).then(function(d) { return d; }, function() { return $.Deferred().resolve([]); }); };
                safeGet('/api/ipd/admissions').done(function(data) {
                    if (data && data.length) {
                        admissions = data;
                        var adm = admissions.find(function(a) { return a.admissionId === _dischAdmId; });
                        if (adm) {
                            renderDischStep3();
                            lucide.createIcons();
                        }
                    }
                });
            } else {
                clearInterval(_dischStep3Interval);
                _dischStep3Interval = null;
            }
        }, 15000);
    }

    function renderDischStep4() {
        var adm = admissions.find(function(a) { return a.admissionId === _dischAdmId; });
        if (!adm) return;
        var di = adm.dischargeInfo || {};
        var totalPaid = parseFloat((di.hospital || {}).paid_amount || 0) + parseFloat((di.pharmacy || {}).paid_amount || 0) + parseFloat((di.lab || {}).paid_amount || 0);
        var today = new Date().toISOString().split('T')[0];
        var now = new Date().toTimeString().slice(0,5);

        var html = '<div style="max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:20px">' +
            // Green clearance banner
            '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(16,185,129,0.08);border:2px solid #10B981;border-radius:12px;padding:16px 22px">' +
                '<div><div style="font-size:14px;font-weight:700;color:#10B981">All Clearances Obtained</div><div style="font-size:12px;color:var(--color-muted-foreground);margin-top:4px">Patient is authorized to be discharged.</div></div>' +
                '<div style="text-align:right"><div style="font-size:11px;color:var(--color-muted-foreground)">Total Paid</div><div style="font-size:22px;font-weight:800;color:var(--midnight-blue)">PKR ' + totalPaid.toLocaleString() + '</div></div>' +
            '</div>' +
            // Discharge date/time and type
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:22px;display:flex;flex-direction:column;gap:16px">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Discharge Date</label><input type="date" id="finalDischDate" class="form-control" style="margin-top:6px" value="' + today + '"></div>' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Discharge Time</label><input type="time" id="finalDischTime" class="form-control" style="margin-top:6px" value="' + now + '"></div>' +
                '</div>' +
                '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:10px;display:block">Discharge Type</label>' +
                    '<div style="display:flex;gap:8px;flex-wrap:wrap" id="finalDischTypeGroup">' +
                        ['Routine','DAMA','Transfer','Death','Absconded'].map(function(t) {
                            var active = (di.discharge_type || 'Routine') === t;
                            return '<button class="disch-type-btn' + (active ? ' active' : '') + '" data-type="' + t + '" onclick="toggleDischType(this)">' + t + '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Final Diagnosis</label><textarea id="finalDiagnosis" class="form-control" rows="2" style="margin-top:6px;font-size:14px;resize:vertical" placeholder="Enter the final confirmed diagnosis...">' + esc(di.final_diagnosis || '') + '</textarea></div>' +
                '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:10px;display:block">Condition at Discharge</label>' +
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:600px" class="disch-condition-group">' +
                        [['😊','Improved'],['😐','Same'],['😔','Deteriorated'],['🕊️','Expired']].map(function(c) {
                            return '<button class="disch-condition-btn" onclick="toggleDischCondition(this)">' + c[0] + '<br><span style="font-size:11px;margin-top:4px;display:block">' + c[1] + '</span></button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
            '</div>' +
            // Follow-up
            '<div style="background:#F8F9FA;border:1px solid var(--color-border);border-radius:12px;padding:20px">' +
                '<div style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px">Follow-up Plan</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Doctor Name</label><input type="text" id="fuDoctor" class="form-control" style="margin-top:6px" placeholder="Dr. Name" value="' + esc(adm.doctorName || '') + '"></div>' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Follow-up Date</label><input type="date" id="fuDate" class="form-control" style="margin-top:6px"></div>' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Location / Clinic</label><input type="text" id="fuLocation" class="form-control" style="margin-top:6px" placeholder="OPD Room, Clinic..."></div>' +
                '</div>' +
            '</div>' +
            // Special instructions
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:20px">' +
                '<label style="font-size:14px;font-weight:700;color:var(--midnight-blue)">Special Instructions</label>' +
                '<textarea id="specialInstructions" class="form-control" rows="3" style="margin-top:10px;font-size:14px;resize:vertical" placeholder="Medication instructions, activity restrictions, dietary advice...">' + esc(di.special_instructions || '') + '</textarea>' +
            '</div>' +
            // Action buttons
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<button class="btn-outline" onclick="showDischStep(3)"><i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back</button>' +
                '<div style="display:flex;gap:10px">' +
                    '<button class="btn-outline" onclick="bdPreviewSummary()"><i data-lucide="eye" style="width:15px;height:15px"></i> Preview Summary</button>' +
                    '<button class="btn-primary" id="btnCompleteDischarge" style="background:var(--midnight-blue);color:var(--aquamint);border-color:var(--midnight-blue);font-weight:700;padding:12px 28px;font-size:14px" onclick="submitFinalDischarge()"><i data-lucide="check-circle-2" style="width:16px;height:16px"></i> Complete Discharge</button>' +
                '</div>' +
            '</div>' +
        '</div>';
        $('#dischStep4Content').html(html);
        lucide.createIcons();
    }

    window.submitFinalDischarge = function() {
        var condition = $('.disch-condition-btn.active').text().trim();
        var dischType = $('#finalDischTypeGroup .disch-type-btn.active').data('type') || 'Routine';
        var $btn = $('#btnCompleteDischarge').prop('disabled', true).html('<i data-lucide="loader-2" style="width:16px;height:16px"></i> Completing...');
        $.ajax({
            url: '/api/ipd/discharge/' + _dischAdmId + '/complete',
            type: 'POST', contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                dischargeDate: $('#finalDischDate').val(),
                dischargeTime: $('#finalDischTime').val(),
                dischargeType: dischType,
                finalDiagnosis: $('#finalDiagnosis').val(),
                conditionAtDischarge: condition,
                followUpInfo: { doctor: $('#fuDoctor').val(), date: $('#fuDate').val(), location: $('#fuLocation').val() },
                specialInstructions: $('#specialInstructions').val(),
                dischargedBy: 'Doctor'
            })
        }).done(function(res) {
            loadAllData();
            renderDischStep5(res);
            showDischStep(5);
        }).fail(function() {
            $btn.prop('disabled', false).html('<i data-lucide="check-circle-2"></i> Complete Discharge');
            HMS.toast('Failed to complete discharge. Please try again.', 'error');
        });
    };

    function renderDischStep5(res) {
        var adm = admissions.find(function(a) { return a.admissionId === _dischAdmId; }) || {};
        var di = (res && res.dischargeInfo) ? res.dischargeInfo : (adm.dischargeInfo || {});
        var admDate = adm.admissionDate ? new Date(adm.admissionDate) : null;
        var los = admDate ? Math.max(0, Math.floor((Date.now() - admDate.getTime()) / 86400000)) : '-';
        var totalPaid = res && res.totalPaid ? res.totalPaid : (parseFloat((di.hospital || {}).paid_amount || 0) + parseFloat((di.pharmacy || {}).paid_amount || 0) + parseFloat((di.lab || {}).paid_amount || 0));

        var html = '<div style="max-width:660px;margin:40px auto;background:var(--midnight-blue);border-radius:20px;padding:40px;color:#fff;text-align:center;box-shadow:0 20px 60px rgba(0,51,102,0.3)">' +
            '<div style="font-size:52px;margin-bottom:16px">🎉</div>' +
            '<div style="font-size:24px;font-weight:800;color:var(--aquamint);margin-bottom:8px">Patient Discharged Successfully</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:28px">Discharge has been completed and all records have been updated.</div>' +
            // Summary table
            '<div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:24px;text-align:left">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
                    [['Patient', esc(adm.patientName || '-')],
                     ['IPD No', esc(adm.admissionId || '-')],
                     ['Length of Stay', los + ' days'],
                     ['Discharge Date', esc(di.discharge_date || new Date().toLocaleDateString())],
                     ['Discharge Type', esc(di.discharge_type || '-')],
                     ['Total Paid', 'PKR ' + totalPaid.toLocaleString()]
                    ].map(function(row) {
                        return '<div style="font-size:11px;color:rgba(255,255,255,0.5)">' + row[0] + '</div><div style="font-size:13px;font-weight:600;color:var(--aquamint)">' + row[1] + '</div>';
                    }).join('') +
                '</div>' +
            '</div>' +
            // Status chips
            '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:28px">' +
                ['✅ Bed Released','✅ Summary Finalized','✅ SMS Sent','✅ Follow-up Scheduled'].map(function(chip) {
                    return '<span style="background:rgba(127,255,212,0.15);color:var(--aquamint);border:1px solid rgba(127,255,212,0.3);border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600">' + chip + '</span>';
                }).join('') +
            '</div>' +
            // Print buttons
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
                [['file-text','Discharge Summary'],['pill','Medication List'],['flask-conical','Lab Reports'],['folder-open','Full Discharge Packet']].map(function(btn) {
                    return '<button style="display:flex;align-items:center;gap:8px;justify-content:center;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:12px;color:#fff;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.2s" onmouseover="this.style.background=\'rgba(127,255,212,0.15)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.1)\'"><i data-lucide="' + btn[0] + '" style="width:15px;height:15px"></i>' + btn[1] + '</button>';
                }).join('') +
            '</div>' +
            '<button class="btn-outline" style="margin-top:24px;color:#fff;border-color:rgba(255,255,255,0.3);width:100%" onclick="showDischStep(1)"><i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back to Patient List</button>' +
        '</div>';
        $('#dischStep5Content').html(html);
        lucide.createIcons();
    }

    window.bdPreviewSummary = function () { HMS.toast('Discharge summary preview will be available in the print module.', 'info'); };

    // ===== IPD REG TOOLBAR FUNCTIONS =====
    /* ── IPD Billing toolbar functions ──────────────────────────────────── */
    window.toggleIpdBillFilter = function() {
        var pane = document.getElementById('ipdBillFilterPane');
        var btn  = document.getElementById('btnIpdBillFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : '';
        btn && btn.classList.toggle('filter-active', !open);
        if (!open && window.lucide) lucide.createIcons();
    };

    window.applyIpdBillFilters = function() {
        var mrn    = (document.getElementById('ipdBillMrnFilter')     || {value:''}).value.toLowerCase().trim();
        var name   = (document.getElementById('ipdBillPatNameFilter') || {value:''}).value.toLowerCase().trim();
        var doctor = (document.getElementById('ipdBillDoctorFilter')  || {value:''}).value.toLowerCase().trim();
        var dept   = (document.getElementById('ipdBillDeptFilter')    || {value:''}).value.toLowerCase().trim();
        var status = (document.getElementById('ipdBillStatusFilter')  || {value:'all'}).value;
        var dateFrom = (document.getElementById('ipdBillDateFrom')    || {value:''}).value;
        var dateTo   = (document.getElementById('ipdBillDateTo')      || {value:''}).value;

        var active = 0;
        if (mrn) active++; if (name) active++; if (doctor) active++; if (dept) active++;
        if (status !== 'all') active++; if (dateFrom) active++; if (dateTo) active++;
        var badge = document.getElementById('ipdBillFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }

        var billData = _ipdBuildBillData();
        ipdBillFiltered = billData.filter(function(b) {
            var pass = true;
            if (mrn    && (b.mrn||'').toLowerCase().indexOf(mrn) === -1)             pass = false;
            if (name   && (b.patientName||'').toLowerCase().indexOf(name) === -1)   pass = false;
            if (doctor && (b.doctorName||'').toLowerCase().indexOf(doctor) === -1)  pass = false;
            if (dept   && (b.department||'').toLowerCase().indexOf(dept) === -1)    pass = false;
            if (status !== 'all' && (b.paymentStatus||'') !== status)               pass = false;
            if (dateFrom) { var d = new Date(b.admissionDate); if (d < new Date(dateFrom)) pass = false; }
            if (dateTo)   { var d = new Date(b.admissionDate); if (d > new Date(dateTo + 'T23:59:59')) pass = false; }
            return pass;
        });
        ipdBillCurrentPage = 1;
        renderBillingTab();
    };

    window.resetIpdBillFilters = function() {
        ['ipdBillMrnFilter','ipdBillPatNameFilter','ipdBillDoctorFilter','ipdBillDeptFilter'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
        var s = document.getElementById('ipdBillStatusFilter'); if (s) s.value = 'all';
        ['ipdBillDpDateFrom','ipdBillDpDateTo'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        ['ipdBillCsMrn','ipdBillCsPatName','ipdBillCsDoctor','ipdBillCsDept'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        var badge = document.getElementById('ipdBillFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        ipdBillFiltered = null; ipdBillCurrentPage = 1;
        renderBillingTab();
    };

    window.toggleIpdBillRowsMenu = function(e) {
        e && e.stopPropagation();
        var menu = document.getElementById('ipdBillRowsMenu'); if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };
    window.setIpdBillRowsPer = function(n) {
        var menu = document.getElementById('ipdBillRowsMenu'); if (menu) menu.classList.remove('open');
        ipdBillPerPageVal = n; ipdBillCurrentPage = 1; renderBillingTab();
    };

    window.toggleIpdBillColVis = function(e) {
        e && e.stopPropagation();
        var menu = document.getElementById('ipdBillColVisMenu'); if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };
    window.ipdBillColVisSelectAll = function() {
        document.querySelectorAll('#ipdBillColVisList input[type=checkbox]').forEach(function(cb){cb.checked=true;});
    };
    window.applyIpdBillColVis = function() {
        var menu = document.getElementById('ipdBillColVisMenu'); if (menu) menu.classList.remove('open');
        var table = document.getElementById('billTable'); if (!table) return;
        document.querySelectorAll('#ipdBillColVisList input[type=checkbox]').forEach(function(cb) {
            var col = parseInt(cb.dataset.col), show = cb.checked;
            table.querySelectorAll('tr').forEach(function(row) { var cell = row.cells[col]; if (cell) cell.style.display = show ? '' : 'none'; });
        });
    };

    window.toggleIpdBillExportMenu = function(e) {
        e && e.stopPropagation();
        var menu = document.getElementById('ipdBillExportMenu'); if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };
    window.exportIpdBill = function(type) {
        var menu = document.getElementById('ipdBillExportMenu'); if (menu) menu.classList.remove('open');
        var src = ipdBillFiltered !== null ? ipdBillFiltered : _ipdBuildBillData();
        var hdrs = ['MRN','Patient Name','Admission ID','Department','Doctor','Adm. Source','Ward/Bed','Initial Diagnosis','Total Charges','Paid','Balance','Payment Status','Date/Time'];
        var rows = src.map(function(b) {
            var wardBed = (b.ward||'-') + (b.bed&&b.bed!=='-' ? ', '+b.bed : '');
            var dateStr = b.admissionDate ? new Date(b.admissionDate).toLocaleString() : '-';
            var shortId = b.admissionId.replace(b.mrn+'-','');
            return [b.mrn, b.patientName, shortId, b.department||'-', b.doctorName||'-', b.admissionSource||'-', wardBed, b.initialDiagnosis||'-', hospitalInfo.currency+' '+b.totalAmount.toLocaleString(), hospitalInfo.currency+' '+b.paidAmount.toLocaleString(), hospitalInfo.currency+' '+b.balance.toLocaleString(), b.paymentStatus||'-', dateStr];
        });
        if (type === 'csv') {
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(','));});
            var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href=url; a.download='ipd-billing.csv'; a.click(); URL.revokeObjectURL(url);
        }
    };

    window.ipdBillPopulateFilterOptions = function() {
        var billData = _ipdBuildBillData();
        var mrns=[],names=[],doctors=[],depts=[];
        billData.forEach(function(b) {
            if (b.mrn && mrns.indexOf(b.mrn)===-1) mrns.push(b.mrn);
            if (b.patientName && names.indexOf(b.patientName)===-1) names.push(b.patientName);
            if (b.doctorName && doctors.indexOf(b.doctorName)===-1) doctors.push(b.doctorName);
            if (b.department && depts.indexOf(b.department)===-1) depts.push(b.department);
        });
        var set = function(id,opts){var w=document.getElementById(id);if(w&&w.setOptions)w.setOptions(opts.sort());};
        set('ipdBillCsMrn',mrns); set('ipdBillCsPatName',names); set('ipdBillCsDoctor',doctors); set('ipdBillCsDept',depts);
    };

    /* ===== CLINICAL ORDERS TOOLBAR FUNCTIONS ===== */
    window.toggleIpdOrdFilter = function() {
        var pane = document.getElementById('ipdOrdFilterPane');
        var btn  = document.getElementById('btnIpdOrdFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : '';
        btn && btn.classList.toggle('filter-active', !open);
        if (!open) lucide.createIcons();
    };

    window.applyIpdOrdFilters = function() {
        var mrn     = ($('#ipdOrdMrnFilter').val()     || '').toLowerCase().trim();
        var name    = ($('#ipdOrdPatNameFilter').val() || '').toLowerCase().trim();
        var doctor  = ($('#ipdOrdDoctorFilter').val()  || '').toLowerCase().trim();
        var dept    = ($('#ipdOrdDeptFilter').val()    || '').toLowerCase().trim();
        var status  = ($('#ipdOrdStatusFilter').val()  || 'all');
        var dateFrom= ($('#ipdOrdDateFrom').val()      || '');
        var dateTo  = ($('#ipdOrdDateTo').val()        || '');
        var dfTs    = dateFrom ? new Date(dateFrom).setHours(0,0,0,0) : null;
        var dtTs    = dateTo   ? new Date(dateTo).setHours(23,59,59,999) : null;

        var active = [mrn,name,doctor,dept].filter(Boolean).length + (status !== 'all' ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);
        var badge = document.getElementById('ipdOrdFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }

        var ordData = _ipdOrdBuildData();
        ipdOrdFiltered = ordData.filter(function(a) {
            var pass = true;
            if (mrn    && (a.mrn||'').toLowerCase().indexOf(mrn) === -1)          pass = false;
            if (name   && (a.patientName||'').toLowerCase().indexOf(name) === -1) pass = false;
            if (doctor && (a.doctorName||'').toLowerCase().indexOf(doctor) === -1) pass = false;
            if (dept   && (a.department||'').toLowerCase().indexOf(dept) === -1)   pass = false;
            if (status !== 'all' && (a.status||'') !== status)                    pass = false;
            if (dfTs) { var d = a.admissionDate ? new Date(a.admissionDate).getTime() : 0; if (d < dfTs) pass = false; }
            if (dtTs) { var d = a.admissionDate ? new Date(a.admissionDate).getTime() : 0; if (d > dtTs) pass = false; }
            return pass;
        });
        ipdOrdCurrentPage = 1;
        renderOrdersTab();
        toggleIpdOrdFilter();
    };

    window.resetIpdOrdFilters = function() {
        $('#ipdOrdMrnFilter,#ipdOrdPatNameFilter,#ipdOrdDoctorFilter,#ipdOrdDeptFilter,#ipdOrdDateFrom,#ipdOrdDateTo').val('');
        $('#ipdOrdStatusFilter').val('all');
        ['ipdOrdCsMrn','ipdOrdCsPatName','ipdOrdCsDoctor','ipdOrdCsDept'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w.reset) w.reset();
        });
        ['ipdOrdDpDateFrom','ipdOrdDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w.reset) w.reset();
        });
        var badge = document.getElementById('ipdOrdFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        ipdOrdFiltered = null;
        ipdOrdCurrentPage = 1;
        renderOrdersTab();
    };

    window.toggleIpdOrdRowsMenu = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdOrdRowsMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };

    window.setIpdOrdRowsPer = function(n) {
        ipdOrdPerPageVal = n; ipdOrdCurrentPage = 1;
        var menu = document.getElementById('ipdOrdRowsMenu'); if (menu) menu.classList.remove('open');
        renderOrdersTab();
    };

    window.toggleIpdOrdColVis = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdOrdColVisMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };

    window.ipdOrdColVisSelectAll = function() {
        document.querySelectorAll('#ipdOrdColVisList input[type=checkbox]').forEach(function(cb){cb.checked=true;});
    };

    window.applyIpdOrdColVis = function() {
        var tbl = document.getElementById('ordersTable');
        if (!tbl) return;
        document.querySelectorAll('#ipdOrdColVisList input[type=checkbox]').forEach(function(cb) {
            var idx = parseInt(cb.getAttribute('data-col'));
            var visible = cb.checked;
            tbl.querySelectorAll('tr').forEach(function(row) {
                var cell = row.children[idx];
                if (cell) cell.style.display = visible ? '' : 'none';
            });
        });
        var menu = document.getElementById('ipdOrdColVisMenu'); if (menu) menu.classList.remove('open');
    };

    window.toggleIpdOrdExportMenu = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdOrdExportMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };

    window.exportIpdOrd = function(type) {
        var menu = document.getElementById('ipdOrdExportMenu'); if (menu) menu.classList.remove('open');
        var src = ipdOrdFiltered !== null ? ipdOrdFiltered : _ipdOrdBuildData();
        var hdrs = ['MRN','Patient Name','Visit ID','Department','Doctor','Ward/Bed','Initial Diagnosis','Pending Orders','Active Meds','Last Order','Status','Date/Time'];
        var rows = src.map(function(a) {
            var wardBed = (a.ward||'-') + (a.bed&&a.bed!=='-' ? ', '+a.bed : '');
            var shortId = a.admissionId.replace(a.mrn+'-','');
            var dateStr = a.admissionDate ? new Date(a.admissionDate).toLocaleString() : '-';
            return [a.mrn, a.patientName, shortId, a.department||'-', a.doctorName||'-', wardBed, a.initialDiagnosis||'-', '-', '-', 'Day '+a.daysAdmitted, a.status||'-', dateStr];
        });
        if (type === 'csv') {
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(','));});
            var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href=url; a.download='ipd-clinical-orders.csv'; a.click(); URL.revokeObjectURL(url);
        }
    };

    window.ipdOrdPopulateFilterOptions = function() {
        var ordData = _ipdOrdBuildData();
        var mrns=[],names=[],doctors=[],depts=[];
        ordData.forEach(function(a) {
            if (a.mrn && mrns.indexOf(a.mrn)===-1) mrns.push(a.mrn);
            if (a.patientName && names.indexOf(a.patientName)===-1) names.push(a.patientName);
            if (a.doctorName && doctors.indexOf(a.doctorName)===-1) doctors.push(a.doctorName);
            if (a.department && depts.indexOf(a.department)===-1) depts.push(a.department);
        });
        var set = function(id,opts){var w=document.getElementById(id);if(w&&w.setOptions)w.setOptions(opts.sort());};
        set('ipdOrdCsMrn',mrns); set('ipdOrdCsPatName',names); set('ipdOrdCsDoctor',doctors); set('ipdOrdCsDept',depts);
    };

    /* ══════════════════════ INVESTIGATIONS TOOLBAR FUNCTIONS ══════════════════ */

    window.toggleIpdInvFilter = function() {
        var pane = document.getElementById('ipdInvFilterPane');
        var btn  = document.getElementById('btnIpdInvFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : '';
        btn && btn.classList.toggle('filter-active', !open);
        if (!open && window.lucide) lucide.createIcons();
    };

    window.applyIpdInvFilters = function() {
        var mrn      = (document.getElementById('ipdInvMrnFilter')      || {value:''}).value.toLowerCase().trim();
        var patName  = (document.getElementById('ipdInvPatNameFilter')  || {value:''}).value.toLowerCase().trim();
        var typeF    = (document.getElementById('ipdInvTypeFilter')     || {value:'all'}).value;
        var priority = (document.getElementById('ipdInvPriorityFilter') || {value:'all'}).value;
        var status   = (document.getElementById('ipdInvStatusFilter')   || {value:'all'}).value;
        var dateFrom = (document.getElementById('ipdInvDateFrom')       || {value:''}).value;
        var dateTo   = (document.getElementById('ipdInvDateTo')         || {value:''}).value;

        var src = _ipdInvBuildData();
        var filtered = src.filter(function(g) {
            if (mrn     && g.mrn.toLowerCase().indexOf(mrn) === -1)         return false;
            if (patName && g.patientName.toLowerCase().indexOf(patName) === -1) return false;
            if (typeF !== 'all') {
                if (typeF === 'lab'       && g.labCount === 0)  return false;
                if (typeF === 'radiology' && g.radCount === 0)  return false;
            }
            if (priority !== 'all' && g.topPriority.toLowerCase() !== priority) return false;
            if (status !== 'all') {
                if (status === 'pending'     && g.pendingN === 0)   return false;
                if (status === 'in-progress' && g.inProgN === 0)    return false;
                if (status === 'completed'   && g.completedN === 0) return false;
            }
            if (dateFrom && g.date && g.date < dateFrom) return false;
            if (dateTo   && g.date && g.date > dateTo)   return false;
            return true;
        });

        /* search bar */
        var search = ($('#invSearch').val() || '').toLowerCase();
        if (search) {
            filtered = filtered.filter(function(g) {
                return g.mrn.toLowerCase().indexOf(search) > -1 ||
                       g.patientName.toLowerCase().indexOf(search) > -1 ||
                       g.admissionId.toLowerCase().indexOf(search) > -1;
            });
        }

        ipdInvFiltered = filtered;
        ipdInvCurrentPage = 1;
        _ipdInvRenderPagination(filtered);

        var activeCount = [mrn,patName,(typeF!=='all'?typeF:''),(priority!=='all'?priority:''),(status!=='all'?status:''),dateFrom,dateTo].filter(Boolean).length;
        var badge = document.getElementById('ipdInvFilterBadge');
        if (badge) { badge.textContent = activeCount; badge.style.display = activeCount > 0 ? '' : 'none'; }
    };

    window.resetIpdInvFilters = function() {
        ['ipdInvMrnFilter','ipdInvPatNameFilter'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
        ['ipdInvTypeFilter','ipdInvPriorityFilter','ipdInvStatusFilter'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value='all'; });
        ['ipdInvDpDateFrom','ipdInvDpDateTo'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        ['ipdInvCsMrn','ipdInvCsPatName'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        ipdInvFiltered = null; ipdInvCurrentPage = 1;
        var badge = document.getElementById('ipdInvFilterBadge');
        if (badge) { badge.textContent='0'; badge.style.display='none'; }
        renderInvestigationsTab();
    };

    window.toggleIpdInvRowsMenu = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdInvRowsMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };

    window.setIpdInvRowsPer = function(n) {
        ipdInvPerPageVal = n; ipdInvCurrentPage = 1;
        var menu = document.getElementById('ipdInvRowsMenu'); if (menu) menu.classList.remove('open');
        var src = ipdInvFiltered !== null ? ipdInvFiltered : _ipdInvBuildData();
        _ipdInvRenderPagination(src);
    };

    window.toggleIpdInvColVis = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdInvColVisMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };

    window.ipdInvColVisSelectAll = function() {
        document.querySelectorAll('#ipdInvColVisList input[type=checkbox]').forEach(function(cb){ cb.checked=true; });
    };

    window.applyIpdInvColVis = function() {
        document.querySelectorAll('#ipdInvColVisList input[type=checkbox]').forEach(function(cb) {
            var col = parseInt(cb.getAttribute('data-col'));
            var table = document.getElementById('invTable');
            if (!table) return;
            table.querySelectorAll('tr').forEach(function(row) {
                var cells = row.children;
                if (cells[col]) cells[col].style.display = cb.checked ? '' : 'none';
            });
        });
        var menu = document.getElementById('ipdInvColVisMenu'); if (menu) menu.classList.remove('open');
    };

    window.toggleIpdInvExportMenu = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdInvExportMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open,.opd-export-menu.open,.opd-col-vis-menu.open').forEach(function(m){m.classList.remove('open');});
        if (!isOpen) menu.classList.add('open');
    };

    window.exportIpdInv = function(type) {
        var menu = document.getElementById('ipdInvExportMenu'); if (menu) menu.classList.remove('open');
        var src = ipdInvFiltered !== null ? ipdInvFiltered : _ipdInvBuildData();
        var hdrs = ['MRN','Patient Name','Visit ID','Department','Gender','Ward/Bed','Initial Diagnosis','Type','Tests','Ordered By','Priority','Status','Date/Time'];
        var rows = src.map(function(g) {
            var wardBed = (g.ward||'-') + (g.bed&&g.bed!=='-' ? ', '+g.bed : '');
            var typeStr = (g.labCount > 0 ? 'Lab x'+g.labCount+' ' : '') + (g.radCount > 0 ? 'Radiology x'+g.radCount : '');
            var statusStr = (g.pendingN > 0 ? g.pendingN+' Pending ' : '') + (g.inProgN > 0 ? g.inProgN+' In Progress ' : '') + (g.completedN > 0 ? g.completedN+' Completed' : '');
            var shortId = g.admissionId.replace(g.mrn+'-','');
            return [g.mrn, g.patientName, shortId, g.department||'-', g.gender||'-', wardBed, g.initialDiagnosis||'-', typeStr.trim(), g.testCount, g.orderedBy||'-', g.topPriority, statusStr.trim(), g.date||'-'];
        });
        if (type === 'csv') {
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(','));});
            var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href=url; a.download='ipd-investigations.csv'; a.click(); URL.revokeObjectURL(url);
        }
    };

    window.ipdInvPopulateFilterOptions = function() {
        var invData = _ipdInvBuildData();
        var mrns=[], names=[];
        invData.forEach(function(g) {
            if (g.mrn && mrns.indexOf(g.mrn)===-1) mrns.push(g.mrn);
            if (g.patientName && names.indexOf(g.patientName)===-1) names.push(g.patientName);
        });
        var set = function(id,opts){var w=document.getElementById(id);if(w&&w.setOptions)w.setOptions(opts.sort());};
        set('ipdInvCsMrn',mrns); set('ipdInvCsPatName',names);
    };

    /* ══════════════════════ NURSING TILES TOOLBAR FUNCTIONS ════════════════════ */
    window.toggleNurTilesFilter = function() {
        var pane = document.getElementById('nurTilesFilterPane');
        var btn  = document.getElementById('btnNurTilesFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        if (btn) btn.classList.toggle('active', !open);
        lucide.createIcons();
    };
    window.toggleNurTilesCardsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('nurTilesCardsMenu'); if (m) m.classList.toggle('open');
    };
    window.setNurTilesCardsPer = function(n) {
        nurTilesPerPageVal = n; nurTilesCurrentPage = 1;
        var m = document.getElementById('nurTilesCardsMenu'); if (m) m.classList.remove('open');
        renderNursingOrderTiles();
    };
    window.toggleNurTilesExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('nurTilesExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportNurTiles = function(type) {
        var m = document.getElementById('nurTilesExportMenu'); if (m) m.classList.remove('open');
        var base = nurTilesFiltered !== null ? nurTilesFiltered : admissions.filter(function(a){ return a.status === 'Active'; });
        if (type === 'csv') {
            var hdrs = ['MRN','Patient Name','Admission ID','Ward','Bed','Doctor','Department','Admission Date'];
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            base.forEach(function(a){
                var row = [a.mrn, a.patientName, a.admissionId, a.ward||'', a.bed||'', a.doctorName||'', a.department||'', a.admissionDate ? new Date(a.admissionDate).toLocaleString() : ''];
                lines.push(row.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(','));
            });
            var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href=url; a.download='nursing-orders.csv'; a.click(); URL.revokeObjectURL(url);
        } else if (type === 'print') {
            window.print();
        }
    };
    window.applyNurTilesFilters = function() {
        var ward   = ($('#nurTilesWardFilter').val()   || 'all');
        var doctor = ($('#nurTilesDoctorFilter').val() || 'all');
        var status = ($('#nurTilesStatusFilter').val() || 'all');
        var all = admissions;
        nurTilesFiltered = all.filter(function(a) {
            if (ward   !== 'all' && (a.ward||'') !== ward)            return false;
            if (doctor !== 'all' && (a.doctorName||'') !== doctor)    return false;
            if (status !== 'all' && (a.status||'') !== status)        return false;
            return true;
        });
        var active = [ward !== 'all' ? ward : '', doctor !== 'all' ? doctor : '', status !== 'all' ? status : ''].filter(Boolean).length;
        var badge = document.getElementById('nurTilesFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
        nurTilesCurrentPage = 1;
        renderNursingOrderTiles();
        var pane = document.getElementById('nurTilesFilterPane'); if (pane) pane.style.display = 'none';
    };
    window.resetNurTilesFilters = function() {
        var wf = document.getElementById('nurTilesWardFilter');   if (wf) wf.value = 'all';
        var df = document.getElementById('nurTilesDoctorFilter'); if (df) df.value = 'all';
        var sf = document.getElementById('nurTilesStatusFilter'); if (sf) sf.value = 'all';
        var badge = document.getElementById('nurTilesFilterBadge'); if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        nurTilesFiltered = null; nurTilesCurrentPage = 1;
        renderNursingOrderTiles();
    };

    /* ══════════════════════ NURSING STATION TOOLBAR FUNCTIONS ══════════════════ */
    window.toggleIpdNurFilter = function() {
        var pane = document.getElementById('ipdNurFilterPane');
        var btn  = document.getElementById('btnIpdNurFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        if (btn) btn.classList.toggle('active', !open);
        lucide.createIcons();
    };

    window.applyIpdNurFilters = function() {
        var mrn     = ($('#ipdNurMrnFilter').val()     || '').toLowerCase().trim();
        var patName = ($('#ipdNurPatNameFilter').val() || '').toLowerCase().trim();
        var doctor  = ($('#ipdNurDoctorFilter').val()  || '').toLowerCase().trim();
        var ward    = ($('#ipdNurWardFilter').val()    || 'all');
        var status  = ($('#ipdNurStatusFilter').val()  || 'all');
        var dateFrom= ($('#ipdNurDateFrom').val()      || '');
        var dateTo  = ($('#ipdNurDateTo').val()        || '');

        var src = _ipdNurBuildData();
        var filtered = src.filter(function(a) {
            if (mrn     && a.mrn.toLowerCase().indexOf(mrn)             === -1) return false;
            if (patName && a.patientName.toLowerCase().indexOf(patName) === -1) return false;
            if (doctor  && a.doctorName.toLowerCase().indexOf(doctor)   === -1) return false;
            if (ward !== 'all' && a.ward !== ward)                              return false;
            if (status !== 'all' && a.status !== status)                        return false;
            if (dateFrom && a.admissionDate && a.admissionDate < dateFrom)      return false;
            if (dateTo   && a.admissionDate && a.admissionDate.split('T')[0] > dateTo) return false;
            return true;
        });

        var active = [mrn, patName, doctor, ward !== 'all' ? ward : '', status !== 'all' ? status : '', dateFrom, dateTo].filter(Boolean).length;
        var badge = document.getElementById('ipdNurFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
        ipdNurFiltered = filtered;
        ipdNurCurrentPage = 1;
        _ipdNurRenderPagination(filtered);
        var pane = document.getElementById('ipdNurFilterPane');
        if (pane) pane.style.display = 'none';
    };

    window.resetIpdNurFilters = function() {
        var resetCs = function(id){ var el=document.getElementById(id); if(el){ el.value=''; var v=el.parentElement&&el.parentElement.querySelector('.opd-cs-val'); if(v){ v.textContent=el.parentElement.getAttribute('data-placeholder')||''; v.classList.add('opd-ph'); } } };
        var resetDp = function(id){ var el=document.getElementById(id); if(el){ el.value=''; var v=el.parentElement&&el.parentElement.querySelector('.opd-dp-val'); if(v){ v.textContent=el.parentElement.getAttribute('data-placeholder')||''; v.classList.add('opd-ph'); } } };
        resetCs('ipdNurMrnFilter'); resetCs('ipdNurPatNameFilter'); resetCs('ipdNurDoctorFilter');
        resetDp('ipdNurDateFrom'); resetDp('ipdNurDateTo');
        var wf = document.getElementById('ipdNurWardFilter'); if(wf) wf.value='all';
        var sf = document.getElementById('ipdNurStatusFilter'); if(sf) sf.value='all';
        var badge = document.getElementById('ipdNurFilterBadge'); if(badge){ badge.textContent='0'; badge.style.display='none'; }
        ipdNurFiltered = null; ipdNurCurrentPage = 1;
        _ipdNurRenderPagination(_ipdNurBuildData());
    };

    window.toggleIpdNurRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('ipdNurRowsMenu'); if(m) m.classList.toggle('open');
    };
    window.setIpdNurRowsPer = function(n) {
        ipdNurPerPageVal = n; ipdNurCurrentPage = 1;
        var m = document.getElementById('ipdNurRowsMenu'); if(m) m.classList.remove('open');
        _ipdNurRenderPagination(ipdNurFiltered !== null ? ipdNurFiltered : _ipdNurBuildData());
    };

    window.toggleIpdNurColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('ipdNurColVisMenu'); if(m) m.classList.toggle('open');
    };
    window.ipdNurColVisSelectAll = function() {
        $('#ipdNurColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyIpdNurColVis = function() {
        var m = document.getElementById('ipdNurColVisMenu'); if(m) m.classList.remove('open');
        $('#ipdNurColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#nurTable thead tr th:eq(' + col + ')').toggle(show);
            $('#nurTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleIpdNurExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('ipdNurExportMenu'); if(m) m.classList.toggle('open');
    };
    window.exportIpdNur = function(type) {
        var menu = document.getElementById('ipdNurExportMenu'); if(menu) menu.classList.remove('open');
        var src = ipdNurFiltered !== null ? ipdNurFiltered : _ipdNurBuildData();
        var hdrs = ['MRN','Patient Name','Visit ID','Ward/Bed','Doctor','Department','Pending Tasks','Status','Date/Time'];
        var rows = src.map(function(a) {
            return [a.mrn, a.patientName, a.shortId, a.wardBed, a.doctorName||'-', a.department||'-', a.pendingTasks, a.status||'-', a.admFormatted];
        });
        if (type === 'csv') {
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(','));});
            var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href=url; a.download='ipd-nursing.csv'; a.click(); URL.revokeObjectURL(url);
        }
    };

    /* ══════════════════════ DISCHARGE TOOLBAR FUNCTIONS ══════════════════════ */
    window.toggleIpdDischFilter = function() {
        var pane = document.getElementById('ipdDischFilterPane');
        if (pane) pane.style.display = pane.style.display === 'none' ? 'block' : 'none';
    };

    window.applyIpdDischFilters = function() {
        var mrn     = (document.getElementById('ipdDischMrnFilter')     || {value:''}).value.toLowerCase().trim();
        var patName = (document.getElementById('ipdDischPatNameFilter') || {value:''}).value.toLowerCase().trim();
        var doctor  = (document.getElementById('ipdDischDoctorFilter')  || {value:''}).value.toLowerCase().trim();
        var dept    = (document.getElementById('ipdDischDeptFilter')    || {value:''}).value.toLowerCase().trim();
        var statusF = (document.getElementById('ipdDischStatusFilter')  || {value:'all'}).value;
        var dateFrom= (document.getElementById('ipdDischDateFrom')      || {value:''}).value;
        var dateTo  = (document.getElementById('ipdDischDateTo')        || {value:''}).value;

        var src = _ipdDischBuildData();
        var filtered = src.filter(function(d) {
            if (mrn     && d.mrn.toLowerCase().indexOf(mrn) === -1)             return false;
            if (patName && d.patientName.toLowerCase().indexOf(patName) === -1) return false;
            if (doctor  && d.doctorName.toLowerCase().indexOf(doctor) === -1)   return false;
            if (dept    && d.department.toLowerCase().indexOf(dept) === -1)     return false;
            if (statusF !== 'all' && d.displayStatus !== statusF)               return false;
            if (dateFrom && d.admissionDate && d.admissionDate < dateFrom)      return false;
            if (dateTo   && d.admissionDate && d.admissionDate.split('T')[0] > dateTo) return false;
            return true;
        });

        ipdDischFiltered = filtered;
        ipdDischCurrentPage = 1;
        _ipdDischRenderPagination(filtered);

        var activeCount = [mrn, patName, doctor, dept, (statusF !== 'all' ? statusF : ''), dateFrom, dateTo].filter(Boolean).length;
        var badge = document.getElementById('ipdDischFilterBadge');
        if (badge) { badge.textContent = activeCount; badge.style.display = activeCount > 0 ? 'flex' : 'none'; }
    };

    window.resetIpdDischFilters = function() {
        ['ipdDischMrnFilter','ipdDischPatNameFilter','ipdDischDoctorFilter','ipdDischDeptFilter','ipdDischDateFrom','ipdDischDateTo'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
        var s = document.getElementById('ipdDischStatusFilter'); if (s) s.value = 'all';
        ['ipdDischDpDateFrom','ipdDischDpDateTo'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        ['ipdDischCsMrn','ipdDischCsPatName','ipdDischCsDoctor','ipdDischCsDept'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        var badge = document.getElementById('ipdDischFilterBadge');
        if (badge) { badge.textContent='0'; badge.style.display='none'; }
        ipdDischFiltered = null; ipdDischCurrentPage = 1;
        _ipdDischRenderPagination(_ipdDischBuildData());
    };

    window.toggleIpdDischRowsMenu = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdDischRowsMenu');
        if (menu) menu.classList.toggle('open');
    };

    window.setIpdDischRowsPer = function(n) {
        ipdDischPerPageVal = n; ipdDischCurrentPage = 1;
        var menu = document.getElementById('ipdDischRowsMenu'); if (menu) menu.classList.remove('open');
        _ipdDischRenderPagination(ipdDischFiltered !== null ? ipdDischFiltered : _ipdDischBuildData());
    };

    window.toggleIpdDischColVis = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdDischColVisMenu');
        var isOpen = menu && menu.classList.contains('open');
        document.querySelectorAll('.opd-col-vis-menu.open,.opd-rows-menu.open,.opd-export-menu.open').forEach(function(m){ m.classList.remove('open'); });
        if (!isOpen && menu) menu.classList.add('open');
    };

    window.ipdDischColVisSelectAll = function() {
        document.querySelectorAll('#ipdDischColVisList input[type="checkbox"]').forEach(function(cb){ cb.checked = true; });
    };

    window.applyIpdDischColVis = function() {
        var table = document.getElementById('dischargeTable');
        if (!table) return;
        document.querySelectorAll('#ipdDischColVisList input[type="checkbox"]').forEach(function(cb) {
            var col = parseInt(cb.dataset.col);
            table.querySelectorAll('tr').forEach(function(row) {
                var cell = row.children[col];
                if (cell) cell.style.display = cb.checked ? '' : 'none';
            });
        });
        var menu = document.getElementById('ipdDischColVisMenu'); if (menu) menu.classList.remove('open');
    };

    window.toggleIpdDischExportMenu = function(e) {
        e.stopPropagation();
        var menu = document.getElementById('ipdDischExportMenu');
        var isOpen = menu && menu.classList.contains('open');
        document.querySelectorAll('.opd-col-vis-menu.open,.opd-rows-menu.open,.opd-export-menu.open').forEach(function(m){ m.classList.remove('open'); });
        if (!isOpen && menu) menu.classList.add('open');
    };

    window.exportIpdDisch = function(type) {
        var menu = document.getElementById('ipdDischExportMenu'); if (menu) menu.classList.remove('open');
        var src = ipdDischFiltered !== null ? ipdDischFiltered : _ipdDischBuildData();
        var hdrs = ['MRN','Patient Name','Visit ID','Department','Doctor','Ward/Bed','Initial Diagnosis','LOS','Discharge Status','Date/Time'];
        var rows = src.map(function(d) {
            var wardBed = (d.ward||'-') + (d.bed&&d.bed!=='-' ? ', '+d.bed : '');
            return [d.mrn, d.patientName, d.shortId, d.department||'-', d.doctorName||'-', wardBed, d.initialDiagnosis||'-', d.los, d.displayStatus, d.dateStr];
        });
        if (type === 'csv') {
            var csv = [hdrs.join(',')].concat(rows.map(function(r){ return r.map(function(c){ return '"'+(c+'').replace(/"/g,'""')+'"'; }).join(','); })).join('\n');
            var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'ipd_discharge.csv'; a.click();
        } else if (type === 'excel') {
            var xls = '<table><tr>' + hdrs.map(function(h){ return '<th>'+h+'</th>'; }).join('') + '</tr>' + rows.map(function(r){ return '<tr>'+r.map(function(c){ return '<td>'+c+'</td>'; }).join('')+'</tr>'; }).join('') + '</table>';
            var a = document.createElement('a'); a.href = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(xls); a.download = 'ipd_discharge.xls'; a.click();
        } else if (type === 'pdf') {
            var w = window.open('','_blank'); if (!w) return;
            w.document.write('<html><head><title>IPD Discharge</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px;font-size:12px}th{background:#f0f0f0}</style></head><body>');
            w.document.write('<h2 style="margin-bottom:12px">IPD Discharge</h2><table><tr>'+hdrs.map(function(h){ return '<th>'+h+'</th>'; }).join('')+'</tr>');
            rows.forEach(function(r){ w.document.write('<tr>'+r.map(function(c){ return '<td>'+c+'</td>'; }).join('')+'</tr>'); });
            w.document.write('</table></body></html>'); w.document.close(); w.print();
        } else if (type === 'print') {
            window.print();
        }
    };

    window.ipdDischPopulateFilterOptions = function() {
        var data = _ipdDischBuildData();
        var mrns=[], names=[], doctors=[], depts=[];
        data.forEach(function(d) {
            if (d.mrn && mrns.indexOf(d.mrn)===-1) mrns.push(d.mrn);
            if (d.patientName && names.indexOf(d.patientName)===-1) names.push(d.patientName);
            if (d.doctorName && doctors.indexOf(d.doctorName)===-1) doctors.push(d.doctorName);
            if (d.department && depts.indexOf(d.department)===-1) depts.push(d.department);
        });
        var set = function(id,opts){ var w=document.getElementById(id); if(w&&w.setOptions) w.setOptions(opts.sort()); };
        set('ipdDischCsMrn',mrns); set('ipdDischCsPatName',names); set('ipdDischCsDoctor',doctors); set('ipdDischCsDept',depts);
    };

    window.toggleIpdRegFilter = function() {
        var pane = document.getElementById('ipdRegFilterPane');
        var btn  = document.getElementById('btnIpdRegFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : '';
        btn && btn.classList.toggle('filter-active', !open);
        if (!open && window.lucide) lucide.createIcons();
    };

    window.applyIpdRegFilters = function() {
        var mrn       = (document.getElementById('ipdRegMrnFilter')       || {value:''}).value.toLowerCase().trim();
        var patName   = (document.getElementById('ipdRegPatNameFilter')   || {value:''}).value.toLowerCase().trim();
        var doctor    = (document.getElementById('ipdRegDoctorFilter')    || {value:''}).value.toLowerCase().trim();
        var dept      = (document.getElementById('ipdRegDeptFilter')      || {value:''}).value.toLowerCase().trim();
        var admSource = (document.getElementById('ipdRegAdmSourceFilter') || {value:''}).value.toLowerCase().trim();
        var ward      = (document.getElementById('ipdRegWardFilter')      || {value:'all'}).value;
        var status    = (document.getElementById('ipdRegStatusFilter')    || {value:'all'}).value;
        var dateFrom  = (document.getElementById('ipdRegDateFrom')        || {value:''}).value;
        var dateTo    = (document.getElementById('ipdRegDateTo')          || {value:''}).value;

        var active = 0;
        if (mrn) active++; if (patName) active++; if (doctor) active++;
        if (dept) active++; if (admSource) active++;
        if (ward !== 'all') active++; if (status !== 'all') active++;
        if (dateFrom) active++; if (dateTo) active++;
        var badge = document.getElementById('ipdRegFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }

        ipdRegFiltered = admissions.filter(function(a) {
            var pass = true;
            if (mrn       && a.mrn.toLowerCase().indexOf(mrn) === -1)                           pass = false;
            if (patName   && a.patientName.toLowerCase().indexOf(patName) === -1)               pass = false;
            if (doctor    && (a.doctorName || '').toLowerCase().indexOf(doctor) === -1)         pass = false;
            if (dept      && (a.department || '').toLowerCase().indexOf(dept) === -1)           pass = false;
            if (admSource && (a.admissionSource || '').toLowerCase().indexOf(admSource) === -1) pass = false;
            if (ward !== 'all' && (a.ward || '') !== ward)                                      pass = false;
            if (status !== 'all' && (a.status || '').toLowerCase() !== status)                 pass = false;
            if (dateFrom) { var d = new Date(a.admissionDate); if (d < new Date(dateFrom)) pass = false; }
            if (dateTo)   { var d = new Date(a.admissionDate); if (d > new Date(dateTo + 'T23:59:59')) pass = false; }
            return pass;
        });
        ipdRegCurrentPage = 1;
        renderRegistrationTab();
    };

    window.resetIpdRegFilters = function() {
        ['ipdRegMrnFilter','ipdRegPatNameFilter','ipdRegDoctorFilter','ipdRegDeptFilter','ipdRegAdmSourceFilter'].forEach(function(id) {
            var el = document.getElementById(id); if (el) el.value = '';
        });
        ['ipdRegWardFilter','ipdRegStatusFilter'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = 'all'; });
        ['ipdDpDateFrom','ipdDpDateTo'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        ['ipdCsMrn','ipdCsPatName','ipdCsDoctor','ipdCsDept','ipdCsAdmSource'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        var badge = document.getElementById('ipdRegFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        ipdRegFiltered = null;
        ipdRegCurrentPage = 1;
        renderRegistrationTab();
    };

    /* ── IPD Custom Date Picker & Searchable Select ──────────────────────── */
    (function() {
        var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        var DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

        function ipdCloseAll() {
            document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) { p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open'); });
            document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) { p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open'); });
        }
        document.addEventListener('click', ipdCloseAll);
        window.addEventListener('scroll', function() {
            document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
                if (!p._trigger) return;
                var r = p._trigger.getBoundingClientRect();
                p.style.top = (r.bottom + 6) + 'px'; p.style.left = r.left + 'px';
            });
        }, true);

        function initDp(wrapId) {
            var wrap = document.getElementById(wrapId); if (!wrap) return;
            var ph = wrap.dataset.placeholder || 'Select date';
            var trigger = wrap.querySelector('.opd-dp-trigger');
            var valEl   = wrap.querySelector('.opd-dp-val');
            var popup   = wrap.querySelector('.opd-dp-popup');
            var hidden  = document.getElementById(wrap.dataset.target);
            var selDate = null, viewYear = new Date().getFullYear(), viewMonth = new Date().getMonth();
            function render() {
                var firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
                var dim = new Date(viewYear, viewMonth + 1, 0).getDate();
                var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + MONTHS[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
                DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
                for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
                for (var d = 1; d <= dim; d++) {
                    var cur = new Date(viewYear, viewMonth, d);
                    var cls = 'opd-dp-day' + (selDate && cur.toDateString() === selDate.toDateString() ? ' selected' : '');
                    h += '<div class="' + cls + '" data-d="' + d + '">' + d + '</div>';
                }
                h += '</div>'; popup.innerHTML = h;
                popup.querySelectorAll('.opd-dp-nav').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (this.dataset.a === 'p') { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } }
                        else { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } }
                        render();
                    });
                });
                popup.querySelectorAll('.opd-dp-day:not(.empty)').forEach(function(el) {
                    el.addEventListener('click', function(e) {
                        e.stopPropagation();
                        selDate = new Date(viewYear, viewMonth, parseInt(this.dataset.d));
                        var dd = String(selDate.getDate()).padStart(2,'0'), mm = String(selDate.getMonth()+1).padStart(2,'0'), yyyy = selDate.getFullYear();
                        valEl.textContent = dd + '/' + mm + '/' + yyyy; valEl.classList.remove('opd-ph');
                        if (hidden) hidden.value = yyyy + '-' + mm + '-' + dd;
                        ipdCloseAll();
                    });
                });
            }
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                var isOpen = popup.classList.contains('open');
                ipdCloseAll();
                if (!isOpen) {
                    var rect = trigger.getBoundingClientRect();
                    popup.style.top = (rect.bottom + 6) + 'px'; popup.style.left = rect.left + 'px';
                    popup._trigger = trigger;
                    if (popup.parentNode !== document.body) document.body.appendChild(popup);
                    render(); popup.classList.add('open'); trigger.classList.add('open');
                }
            });
            wrap._reset = function() { selDate = null; viewYear = new Date().getFullYear(); viewMonth = new Date().getMonth(); valEl.textContent = ph; valEl.classList.add('opd-ph'); if (hidden) hidden.value = ''; };
        }

        function initCs(wrapId) {
            var wrap = document.getElementById(wrapId); if (!wrap) return;
            var ph      = wrap.dataset.placeholder || 'Select...';
            var trigger = wrap.querySelector('.opd-cs-trigger');
            var valEl   = wrap.querySelector('.opd-cs-val');
            var popup   = wrap.querySelector('.opd-cs-popup');
            var search  = wrap.querySelector('.opd-cs-search');
            var list    = wrap.querySelector('.opd-cs-list');
            var hidden  = document.getElementById(wrap.dataset.target);
            var options = [], selVal = '';
            if (valEl) { valEl.textContent = ph; valEl.classList.add('opd-ph'); }
            function renderList(q) {
                q = (q || '').toLowerCase();
                var filtered = q ? options.filter(function(o) { return o.toLowerCase().indexOf(q) > -1; }) : options;
                if (!filtered.length) { list.innerHTML = '<div class="opd-cs-empty">No options</div>'; return; }
                list.innerHTML = filtered.map(function(o) { return '<div class="opd-cs-option' + (o === selVal ? ' selected' : '') + '" data-v="' + o.replace(/"/g,'&quot;') + '">' + o + '</div>'; }).join('');
                list.querySelectorAll('.opd-cs-option').forEach(function(el) {
                    el.addEventListener('click', function(e) {
                        e.stopPropagation(); selVal = this.dataset.v;
                        valEl.textContent = selVal; valEl.classList.remove('opd-ph');
                        if (hidden) hidden.value = selVal;
                        ipdCloseAll();
                    });
                });
            }
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                var isOpen = popup.classList.contains('open');
                ipdCloseAll();
                if (!isOpen) {
                    var rect = trigger.getBoundingClientRect();
                    popup.style.top = (rect.bottom + 6) + 'px'; popup.style.left = rect.left + 'px'; popup.style.width = rect.width + 'px';
                    popup._trigger = trigger;
                    if (popup.parentNode !== document.body) document.body.appendChild(popup);
                    popup.classList.add('open'); trigger.classList.add('open');
                    search.value = ''; renderList('');
                    setTimeout(function() { search.focus(); }, 40);
                }
            });
            search.addEventListener('input', function(e) { e.stopPropagation(); renderList(this.value); });
            search.addEventListener('click', function(e) { e.stopPropagation(); });
            popup.addEventListener('click', function(e) { e.stopPropagation(); });
            wrap.setOptions = function(opts) { options = opts || []; };
            wrap._reset = function() { selVal = ''; valEl.textContent = ph; valEl.classList.add('opd-ph'); if (hidden) hidden.value = ''; };
        }

        window.initIpdDp = initDp;
        window.initIpdCs = initCs;

        $(function() {
            ['ipdDpDateFrom','ipdDpDateTo','ipdBillDpDateFrom','ipdBillDpDateTo','ipdOrdDpDateFrom','ipdOrdDpDateTo','ipdInvDpDateFrom','ipdInvDpDateTo','ipdNurDpDateFrom','ipdNurDpDateTo','ipdDischDpDateFrom','ipdDischDpDateTo','marDpDateFrom','marDpDateTo'].forEach(initDp);
            ['ipdCsMrn','ipdCsPatName','ipdCsDoctor','ipdCsDept','ipdCsAdmSource',
             'ipdBillCsMrn','ipdBillCsPatName','ipdBillCsDoctor','ipdBillCsDept',
             'ipdOrdCsMrn','ipdOrdCsPatName','ipdOrdCsDoctor','ipdOrdCsDept',
             'ipdInvCsMrn','ipdInvCsPatName',
             'ipdNurCsMrn','ipdNurCsPatName','ipdNurCsDoctor',
             'ipdDischCsMrn','ipdDischCsPatName','ipdDischCsDoctor','ipdDischCsDept'].forEach(initCs);
        });

        /* Populate searchable select options after data loads */
        window.ipdRegPopulateFilterOptions = function() {
            var mrns=[], names=[], doctors=[], depts=[], sources=[];
            admissions.forEach(function(a) {
                if (a.mrn && mrns.indexOf(a.mrn)===-1) mrns.push(a.mrn);
                if (a.patientName && names.indexOf(a.patientName)===-1) names.push(a.patientName);
                if (a.doctorName && doctors.indexOf(a.doctorName)===-1) doctors.push(a.doctorName);
                if (a.department && depts.indexOf(a.department)===-1) depts.push(a.department);
                if (a.admissionSource && sources.indexOf(a.admissionSource)===-1) sources.push(a.admissionSource);
            });
            var set = function(id,opts){var w=document.getElementById(id);if(w&&w.setOptions)w.setOptions(opts.sort());};
            set('ipdCsMrn',mrns); set('ipdCsPatName',names); set('ipdCsDoctor',doctors);
            set('ipdCsDept',depts); set('ipdCsAdmSource',sources);
        };
    })();

    window.toggleIpdRegRowsMenu = function(e) {
        e && e.stopPropagation();
        var menu = document.getElementById('ipdRegRowsMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open, .opd-export-menu.open, .opd-col-vis-menu.open').forEach(function(m) { m.classList.remove('open'); });
        if (!isOpen) menu.classList.add('open');
    };
    window.setIpdRegRowsPer = function(n) {
        var menu = document.getElementById('ipdRegRowsMenu');
        if (menu) menu.classList.remove('open');
        ipdRegPerPageVal = n;
        ipdRegCurrentPage = 1;
        renderRegistrationTab();
    };

    window.toggleIpdRegColVis = function(e) {
        e && e.stopPropagation();
        var menu = document.getElementById('ipdRegColVisMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open, .opd-export-menu.open, .opd-col-vis-menu.open').forEach(function(m) { m.classList.remove('open'); });
        if (!isOpen) menu.classList.add('open');
    };
    window.ipdRegColVisSelectAll = function() {
        document.querySelectorAll('#ipdRegColVisList input[type=checkbox]').forEach(function(cb) { cb.checked = true; });
    };
    window.applyIpdRegColVis = function() {
        var menu = document.getElementById('ipdRegColVisMenu');
        if (menu) menu.classList.remove('open');
        var table = document.getElementById('regTable');
        if (!table) return;
        document.querySelectorAll('#ipdRegColVisList input[type=checkbox]').forEach(function(cb) {
            var col = parseInt(cb.dataset.col);
            var show = cb.checked;
            table.querySelectorAll('tr').forEach(function(row) {
                var cell = row.cells[col];
                if (cell) cell.style.display = show ? '' : 'none';
            });
        });
    };

    window.toggleIpdRegExportMenu = function(e) {
        e && e.stopPropagation();
        var menu = document.getElementById('ipdRegExportMenu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        document.querySelectorAll('.opd-rows-menu.open, .opd-export-menu.open, .opd-col-vis-menu.open').forEach(function(m) { m.classList.remove('open'); });
        if (!isOpen) menu.classList.add('open');
    };
    window.exportIpdReg = function(type) {
        var menu = document.getElementById('ipdRegExportMenu');
        if (menu) menu.classList.remove('open');
        var src = ipdRegFiltered !== null ? ipdRegFiltered : admissions;
        var hdrs = ['MRN','Visit ID','Patient Name','Doctor','Ward / Bed','Admission Date','Status','Payment'];
        var rows = src.map(function(a) {
            var shortId = a.admissionId.replace(a.mrn + '-', '');
            return [a.mrn, shortId, a.patientName, a.doctorName || '', (a.ward || '') + (a.bed ? ' / ' + a.bed : ''), new Date(a.admissionDate).toLocaleDateString(), a.status || '', a.paymentStatus || ''];
        });
        if (type === 'csv') {
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c + '').replace(/"/g, '""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a'); a.href = url; a.download = 'ipd-admissions.csv'; a.click();
            URL.revokeObjectURL(url);
            return;
        }
        if (type === 'pdf' || type === 'print') {
            var now = new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'});
            var wv = window.open('', '_blank'); if (!wv) return;
            var hv = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IPD Admissions</title>'
                + '<style>body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:20px}'
                + 'h2{font-size:16px;margin:0 0 4px}p.sub{font-size:11px;color:#666;margin:0 0 14px}'
                + 'table{border-collapse:collapse;width:100%}'
                + 'th{background:#060740;color:#fff;padding:7px 8px;text-align:left;font-size:11px}'
                + 'td{padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px}'
                + 'tr:nth-child(even) td{background:#f9fafb}'
                + '@media print{@page{margin:15mm}body{margin:0}}</style></head><body>'
                + '<h2>IPD Patient Admissions</h2><p class="sub">Generated on ' + now + ' | ' + rows.length + ' record(s)</p>'
                + '<table><thead><tr>' + hdrs.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>'
                + rows.map(function(r) { return '<tr>' + r.map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('')
                + '</tbody></table><script>window.onload=function(){window.print();}<\/script></body></html>';
            wv.document.open(); wv.document.write(hv); wv.document.close();
        }
    };

    /* Close menus on outside click */
    $(document).on('click', function() {
        document.querySelectorAll('#ipdRegRowsMenu, #ipdRegColVisMenu, #ipdRegExportMenu').forEach(function(m) { m.classList.remove('open'); });
    });

    // ===== IPD REGISTRATION SLIP PRINT =====

    function printIpdRegistrationSlip(adm, patient, bill) {
        var currency = (hospitalInfo && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';
        $.when(
            $.get('/api/hospital-info/settings/letterhead'),
            $.get('/api/hospital-info/settings/footer'),
            $.get('/api/hospital-info/settings/basic'),
            $.get('/api/hospital-info/settings/doc_format_ipd_registration')
        ).done(function(lhRes, ftRes, prRes, fmtRes) {
            var savedFormat = (fmtRes[0].settings && fmtRes[0].settings['doc_format_ipd_registration']) || 'a4';
            if (savedFormat === 'thermal') {
                _printIpdThermal(adm, patient, bill);
                return;
            }
            var lh = lhRes[0].settings || {};
            var ft = ftRes[0].settings || {};
            var pr = prRes[0].settings || {};

            var color    = lh.lh_primary_color || '#003366';
            var font     = lh.lh_header_font   || 'Roobert';
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

            function e(v) { return (v || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
            function fmt(n) { return currency + '\u00a0' + Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
            function infoCell(label, val, borderRight, rowBg) {
                return '<td style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight?'border-right:1px solid #e8edf2;':'') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + e(label) + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + e(val) + '</div>'
                     + '</td>';
            }

            // ── Admission data ──
            var patientName  = patient ? (patient.name   || adm.patientName || '-') : (adm.patientName || '-');
            var mrn          = adm.mrn             || '-';
            var admissionId  = adm.admissionId     || '-';
            var billId       = bill ? (bill.billId  || '-') : '-';
            var doctorName   = adm.doctorName       || '-';
            var department   = adm.department       || '-';
            var wardBed      = (adm.ward || '-') + ' / ' + (adm.bed || '-');
            var admType      = adm.admissionType    || '-';
            var phone        = patient ? (patient.phone  || '-') : '-';
            var cnic         = patient ? (patient.cnic   || '-') : '-';
            var age          = patient ? (patient.age    || '-') : '-';
            var gender       = patient ? (patient.gender || '-') : '-';
            var admDateRaw   = adm.admissionDate ? new Date(adm.admissionDate) : null;
            var admDateStr   = admDateRaw ? admDateRaw.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) + ', ' + admDateRaw.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '-';
            var admSource    = adm.admissionSource  || '-';
            var diagnosis    = adm.initialDiagnosis || '-';
            var estStay      = adm.estimatedStay    || '-';
            var regBy        = adm.registeredBy || adm.createdByName || adm.createdBy || '';

            // ── Charges ──
            var roomCharges  = bill ? Number(bill.roomCharges  || 0) : 0;
            var otherCharges = bill ? Number(bill.otherCharges || bill.additionalCharges || 0) : 0;
            var netTotal     = bill ? Number(bill.totalAmount  || 0) : (roomCharges + otherCharges);
            var sno = 1;
            var chargeRows = '';
            if (roomCharges > 0) {
                chargeRows += '<tr style="background:#fff;border-top:1px solid #f1f5f9">'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b">' + sno + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#334155;font-weight:500">Room / Bed Charges</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">1</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">' + fmt(roomCharges) + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">\u2014</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + fmt(roomCharges) + '</td>'
                    + '</tr>';
                sno++;
            }
            if (otherCharges > 0) {
                var bg = sno % 2 === 0 ? '#f8fafc' : '#fff';
                chargeRows += '<tr style="background:' + bg + ';border-top:1px solid #f1f5f9">'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b">' + sno + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#334155;font-weight:500">Other / Additional Charges</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">1</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">' + fmt(otherCharges) + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">\u2014</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + fmt(otherCharges) + '</td>'
                    + '</tr>';
            }
            if (!chargeRows) {
                chargeRows = '<tr><td colspan="6" style="padding:14px 10px;font-size:10px;color:#94a3b8;text-align:center">No charges recorded</td></tr>';
            }

            // ── Footer meta ──
            var footerLines = [ft.footer_line1, ft.footer_line2, ft.footer_line3].filter(Boolean);
            var metaParts = [];
            if (ft.footer_show_page_number === '1') metaParts.push('Page 1 of 1');
            if (ft.footer_show_date === '1') {
                var _now = new Date();
                metaParts.push('Printed: ' + _now.toLocaleDateString('en-GB') + ', ' + _now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}));
            }
            if (ft.footer_show_disclaimer === '1') metaParts.push('Confidential \u2014 For medical use only');

            // ── Logo ──
            var logoHtml = '';
            if (lh.lh_show_logo !== '0') {
                logoHtml = '<div style="width:' + logoSize + ';height:' + logoSize + ';background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2e8f0;flex-shrink:0">'
                         + (logoPath ? '<img src="' + logoPath + '" style="max-width:100%;max-height:100%;object-fit:contain">' : '<span style="font-size:9px;color:#94a3b8">Logo</span>')
                         + '</div>';
            }

            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
                + '<title>IPD Admission Slip \u2014 ' + e(patientName) + '</title>'
                + '<style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:"SF Pro Text","Segoe UI",Arial,sans-serif; background:#fff; color:#1e293b; } @page { size:A4; margin:12mm 12mm 10mm 12mm; } @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } } table { border-collapse:collapse; width:100%; }</style>'
                + '</head><body>'
                + '<div style="max-width:740px;margin:0 auto;background:#fff">'
                + '<div style="height:4px;background:' + color + '"></div>'
                + '<div style="padding:24px 32px 16px">'
                + '<div style="display:flex;align-items:flex-start;gap:20px">'
                + logoHtml
                + '<div style="flex:1;min-width:0">'
                + (hospName ? '<div style="font-size:17px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;line-height:1.1">' + e(hospName) + '</div>' : '')
                + (tagline  ? '<div style="font-size:11px;color:#64748b;margin-top:4px;font-style:italic">' + e(tagline) + '</div>' : '')
                + (addrParts.length ? '<div style="font-size:10px;color:#475569;margin-top:5px">' + e(addrParts.join(', ')) + '</div>' : '')
                + (contactParts.length ? '<div style="font-size:10px;color:#475569;margin-top:4px;display:flex;gap:14px;flex-wrap:wrap;align-items:center">' + contactParts.map(function(p){return '<span style="display:inline-flex;align-items:center;gap:2px">'+p+'</span>';}).join('') + '</div>' : '')
                + '</div></div>'
                + '<div style="margin-top:16px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '</div>'
                + '<div style="padding:9px 32px;background:' + color + ';display:flex;align-items:center;justify-content:space-between">'
                + '<span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">IPD ADMISSION SLIP</span>'
                + '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:9px;font-weight:600;padding:2px 9px;border-radius:20px;letter-spacing:0.5px">ORIGINAL</span>'
                + '</div>'
                + '<div style="padding:16px 32px">'
                // Patient info grid
                + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '<table style="table-layout:fixed">'
                + '<tr style="border-bottom:1px solid #e8edf2">' + infoCell('PATIENT NAME',patientName,true,'#fff') + infoCell('MRN',mrn,true,'#fff') + infoCell('ADMISSION ID',admissionId,true,'#fff') + infoCell('BILL ID',billId,false,'#fff') + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">' + infoCell('CONSULTANT',doctorName,true,'#f8fafc') + infoCell('DEPARTMENT',department,true,'#f8fafc') + infoCell('WARD / BED',wardBed,true,'#f8fafc') + infoCell('ADMISSION TYPE',admType,false,'#f8fafc') + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">' + infoCell('PHONE NO.',phone,true,'#fff') + infoCell('CNIC',cnic,true,'#fff') + infoCell('AGE',(age!=='-'?age+' Years':'-'),true,'#fff') + infoCell('GENDER',gender,false,'#fff') + '</tr>'
                + '<tr>' + infoCell('ADMISSION DATE',admDateStr,true,'#f8fafc') + infoCell('ADMISSION SOURCE',admSource,true,'#f8fafc') + infoCell('INITIAL DIAGNOSIS',diagnosis,true,'#f8fafc') + infoCell('ESTIMATED STAY',estStay,false,'#f8fafc') + '</tr>'
                + '</table>'
                + '</div>'
                // Charges table
                + '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">'
                + '<table style="table-layout:fixed"><thead><tr style="background:' + color + '">'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;width:36px;text-align:left">S.NO</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:left">DESCRIPTION</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:50px">QTY</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:110px">RATE</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:60px">DISC.</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:110px">NET</th>'
                + '</tr></thead><tbody>' + chargeRows + '</tbody></table>'
                + '</div>'
                // Total bar
                + '<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 18px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                + '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</span>'
                + '<span style="font-size:16px;font-weight:800;color:#fff">' + fmt(netTotal) + '</span>'
                + '</div>'
                // Signature
                + '<div style="display:flex;justify-content:flex-end;margin-top:24px">'
                + '<div style="width:220px;text-align:center">'
                + (regBy ? '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">' + e(regBy) + '</div>' : '<div style="height:40px"></div>')
                + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                + '</div></div>'
                + '</div>'
                // Footer
                + '<div style="margin:0 32px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '<div style="padding:12px 32px;display:flex;justify-content:space-between;align-items:flex-start">'
                + '<div style="font-size:9px;color:#64748b;line-height:1.6">' + footerLines.map(function(l){return '<div>'+e(l)+'</div>';}).join('') + '</div>'
                + '<div style="font-size:9px;color:#64748b;text-align:right;line-height:1.6">' + metaParts.map(function(p){return '<div>'+e(p)+'</div>';}).join('') + '</div>'
                + '</div>'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '</div>'
                + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>'
                + '</body></html>';

            var w = window.open('', '_blank', 'width:900,height:700');
            if (w) { w.document.write(html); w.document.close(); }
        });
    }

    function _printIpdThermal(adm, patient, bill) {
        var currency = (hospitalInfo && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';
        var now      = new Date();
        var dateStr  = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
        var timeStr  = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });

        $.get('/api/hospital-info/settings/basic').done(function(prRes) {
            var pr          = prRes.settings || {};
            var hospName    = pr.basic_name      || 'Hospital';
            var phone       = pr.contact_phone   || '';
            var website     = pr.contact_website || '';
            var addrParts   = [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean);
            var addrStr     = addrParts.join(', ');

            function e(v) { return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
            function fmt(n) { return currency + ' ' + Number(n).toLocaleString(); }
            function row(label, val) {
                return '<tr><td style="color:#555;padding:2px 4px;white-space:nowrap">' + e(label) + '</td>'
                     + '<td style="font-weight:600;padding:2px 4px;text-align:right">' + e(val) + '</td></tr>';
            }
            function chargeRow(desc, qty, disc, net, total) {
                return '<tr>'
                     + '<td style="padding:2px 4px">' + e(desc) + '</td>'
                     + '<td style="text-align:center;padding:2px 4px">' + qty + '</td>'
                     + '<td style="text-align:right;padding:2px 4px">' + disc + '</td>'
                     + '<td style="text-align:right;padding:2px 4px">' + net + '</td>'
                     + '<td style="text-align:right;padding:2px 4px">' + total + '</td>'
                     + '</tr>';
            }

            var patientName  = patient ? (patient.name   || adm.patientName || '-') : (adm.patientName || '-');
            var mrn          = adm.mrn             || '\u2014';
            var admissionId  = adm.admissionId     || '\u2014';
            var billId       = bill ? (bill.billId  || '\u2014') : '\u2014';
            var doctorName   = adm.doctorName       || '\u2014';
            var department   = adm.department       || '\u2014';
            var wardBed      = (adm.ward || '-') + ' / ' + (adm.bed || '-');
            var admType      = adm.admissionType    || '\u2014';
            var patPhone     = patient ? (patient.phone  || '\u2014') : '\u2014';
            var cnic         = patient ? (patient.cnic   || '\u2014') : '\u2014';
            var age          = patient ? (patient.age    || '\u2014') : '\u2014';
            var gender       = patient ? (patient.gender || '\u2014') : '\u2014';
            var admDateRaw   = adm.admissionDate ? new Date(adm.admissionDate) : null;
            var admDateStr   = admDateRaw ? admDateRaw.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '\u2014';
            var admSource    = adm.admissionSource  || '\u2014';
            var diagnosis    = adm.initialDiagnosis || '\u2014';
            var createdBy    = adm.registeredBy || adm.createdByName || adm.createdBy || (bill && (bill.createdByName || bill.createdBy)) || 'Staff';

            var roomCharges  = bill ? Number(bill.roomCharges  || 0) : 0;
            var otherCharges = bill ? Number(bill.otherCharges || bill.additionalCharges || 0) : 0;
            var netTotal     = bill ? Number(bill.totalAmount  || 0) : (roomCharges + otherCharges);

            var thStyle = 'style="font-weight:700;padding:2px 4px;border-bottom:1px dashed #999"';
            var chargeRows = '<tr>'
                + '<th ' + thStyle + ' align="left">Description</th>'
                + '<th ' + thStyle + ' align="center">Qty</th>'
                + '<th ' + thStyle + ' align="right">Disc</th>'
                + '<th ' + thStyle + ' align="right">Net</th>'
                + '<th ' + thStyle + ' align="right">Total</th>'
                + '</tr>';
            if (roomCharges  > 0) chargeRows += chargeRow('Room/Bed Charges', 1, '0', fmt(roomCharges),  fmt(roomCharges));
            if (otherCharges > 0) chargeRows += chargeRow('Other Charges',     1, '0', fmt(otherCharges), fmt(otherCharges));
            if (!roomCharges && !otherCharges) chargeRows += '<tr><td colspan="5" style="padding:4px;color:#999;text-align:center">No charges</td></tr>';

            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IPD Slip</title>'
                + '<style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:monospace; font-size:12px; color:#111; background:#fff; width:80mm; margin:0 auto; } @page { size:80mm auto; margin:4mm; } table { width:100%; border-collapse:collapse; } .divider { border-top:1px dashed #999; margin:6px 0; } .center { text-align:center; } .no-print { text-align:center; margin:12px 0; } .no-print button { padding:6px 20px;font-size:12px;background:#060740;color:#fff;border:none;border-radius:6px;cursor:pointer } @media print { .no-print { display:none } }</style>'
                + '</head><body>'
                + '<div class="center" style="padding:8px 0 4px">'
                + '<div style="font-size:14px;font-weight:700">' + e(hospName) + '</div>'
                + (phone   ? '<div style="font-size:10px;color:#555">Tel: ' + e(phone) + '</div>' : '')
                + (website ? '<div style="font-size:10px;color:#555">' + e(website) + '</div>' : '')
                + '</div>'
                + '<div class="divider"></div>'
                + '<div class="center" style="font-size:11px;font-weight:700;letter-spacing:1px">IPD ADMISSION SLIP</div>'
                + '<div class="center" style="font-size:10px;color:#555">' + e(dateStr) + ' | ' + e(timeStr) + '</div>'
                + '<div class="divider"></div>'
                + '<table>'
                + row('Patient',    patientName)
                + row('MRN',        mrn)
                + row('Adm. ID',    admissionId)
                + row('Bill ID',    billId)
                + row('Doctor',     doctorName)
                + row('Dept',       department)
                + row('Ward/Bed',   wardBed)
                + row('Adm. Type',  admType)
                + row('Phone',      patPhone)
                + row('CNIC',       cnic)
                + row('Age/Gender', age + (gender !== '\u2014' ? ' / ' + gender : ''))
                + row('Adm. Date',  admDateStr)
                + row('Source',     admSource)
                + row('Diagnosis',  diagnosis)
                + '</table>'
                + '<div class="divider"></div>'
                + '<table>' + chargeRows + '</table>'
                + '<div class="divider"></div>'
                + '<table><tr><td style="font-weight:700;padding:2px 4px">TOTAL</td><td colspan="4" style="font-weight:700;text-align:right;padding:2px 4px">' + fmt(netTotal) + '</td></tr></table>'
                + '<div class="divider"></div>'
                + '<div class="center" style="margin-top:8px">'
                + (addrStr ? '<div style="font-size:9px;color:#555;margin-bottom:8px">' + e(addrStr) + '</div>' : '')
                + '<div style="width:120px;border-bottom:1px solid #333;margin:0 auto 4px"></div>'
                + '<div style="font-size:9px;color:#777;text-transform:uppercase;letter-spacing:0.5px">Receptionist / Cashier</div>'
                + '<div style="font-size:9px;color:#777;margin-top:3px">Created by: ' + e(createdBy) + '</div>'
                + '</div>'
                + '<div class="no-print"><button onclick="window.print()">&#128438; Print</button></div>'
                + '</body></html>';

            var win = window.open('', '_blank', 'width=340,height=700');
            if (win) { win.document.write(html); win.document.close(); }
        }).fail(function() {
            if (typeof showToast === 'function') showToast('Failed to load hospital settings', 'error');
        });
    }

    // ===== INIT =====
    loadAllData();
});
