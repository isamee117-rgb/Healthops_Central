$(document).ready(function() {
    var doctors = [];
    var editingDoctorId = null;

    // ── Toolbar state ─────────────────────────────────────────────────────────
    var drCurrentPage = 1;
    var drPerPageVal  = 10;
    var drFiltered    = null;

    function esc(s) { return $('<span>').text(s || '').html(); }
    function getInitials(first, last) { return ((first || '')[0] || '') + ((last || '')[0] || ''); }

    var departments = [];
    var specializations = [];
    var designations = [];
    var titles = ['Dr.','Prof. Dr.','Assoc. Prof. Dr.'];
    var employmentTypes = [];
    var subSpecializations = [];
    var statusOptions = ['ACTIVE','ON_LEAVE','INACTIVE','RETIRED'];
    var bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
    var degreeOptions = ['MBBS','BDS','FCPS','FRCS','MD','MS','MCPS','MPhil','PhD','Diploma','Fellowship','DCH','DTCD','DA','DMRD'];
    var provinces = ['Punjab','Sindh','KPK','Balochistan','Islamabad','AJK','Gilgit-Baltistan'];

    function safeGet(url) {
        return $.get(url).then(function(d) { return d; }, function() { return null; });
    }

    function loadHrConfig(callback) {
        $.get('/api/hr-config?active_only=true').done(function(data) {
            specializations = data.specialization || [];
            departments = data.department || [];
            designations = data.designation || [];
            employmentTypes = data.employment_type || [];
            subSpecializations = data.sub_specialization || [];

            specializations = specializations.map(function(i) { return i.name || i; });
            departments = departments.map(function(i) { return i.name || i; });
            designations = designations.map(function(i) { return i.name || i; });
            employmentTypes = employmentTypes.map(function(i) { return i.name || i; });
            subSpecializations = subSpecializations.map(function(i) { return i.name || i; });

            if (callback) callback();
        });
    }

    function loadAllData() {
        loadHrConfig(function() {
            safeGet('/api/doctors').done(function(data) {
                doctors = data || [];
                renderStats();
                renderTable();
                populateDeptFilter();
                populateFilterDropdowns();
            });
        });
    }

    function populateFilterDropdowns() {
        var typeWrap = document.getElementById('drCsType');
        if (typeWrap && typeWrap.setOptions) {
            typeWrap.setOptions(['All Employment'].concat(employmentTypes));
        }
    }

    function populateDeptFilter() {
        var depts = {};
        doctors.forEach(function(d) { if (d.department) depts[d.department] = true; });
        var deptWrap = document.getElementById('drCsDept');
        if (deptWrap && deptWrap.setOptions) {
            deptWrap.setOptions(['All Departments'].concat(Object.keys(depts).sort()));
        }
    }

    function renderStats() {
        var total = doctors.length;
        var specialists = doctors.filter(function(d) { return d.specialization && d.specialization !== 'General Physician'; }).length;
        var fulltime = doctors.filter(function(d) { return d.contractType === 'Full-time'; }).length;
        var now = new Date();
        var newThisMonth = doctors.filter(function(d) {
            if (!d.joiningDate) return false;
            var jd = new Date(d.joiningDate);
            return jd.getMonth() === now.getMonth() && jd.getFullYear() === now.getFullYear();
        }).length;
        $('#statTotal').text(total);
        $('#statSpecialists').text(specialists);
        $('#statFulltime').text(fulltime);
        $('#statNew').text(newThisMonth);
    }

    function getFilteredDoctors() {
        var search   = ($('#doctorSearch').val() || '').toLowerCase();
        var statusF  = ($('#drStatusFilter').val() || '').toLowerCase();
        var deptF    = ($('#drDeptFilter').val()   || '').toLowerCase();
        var typeF    = ($('#drTypeFilter').val()   || '').toLowerCase();

        var base = drFiltered !== null ? drFiltered : doctors;
        return base.filter(function(d) {
            var name = ((d.firstName || '') + ' ' + (d.lastName || '')).toLowerCase();
            if (search && name.indexOf(search) < 0 && (d.specialization || '').toLowerCase().indexOf(search) < 0 && (d.department || '').toLowerCase().indexOf(search) < 0 && (d.doctorId || '').toLowerCase().indexOf(search) < 0) return false;
            if (statusF && statusF !== 'all status'      && (d.status       || '').toLowerCase() !== statusF) return false;
            if (deptF   && deptF   !== 'all departments' && (d.department   || '').toLowerCase() !== deptF)   return false;
            if (typeF   && typeF   !== 'all employment'  && (d.contractType || '').toLowerCase() !== typeF)   return false;
            return true;
        });
    }

    function statusBadge(s) {
        if (s === 'ACTIVE') return '<span class="badge badge-success">ACTIVE</span>';
        if (s === 'ON_LEAVE') return '<span class="badge badge-warning">ON LEAVE</span>';
        if (s === 'INACTIVE') return '<span class="badge badge-outline">INACTIVE</span>';
        if (s === 'RETIRED') return '<span class="badge badge-info">RETIRED</span>';
        return '<span class="badge badge-outline">' + esc(s || 'N/A') + '</span>';
    }

    function empBadge(t) {
        if (t === 'Full-time') return '<span class="badge" style="background:rgba(22,163,74,0.1);color:#16a34a;font-size:10px">FULL-TIME</span>';
        if (t === 'Part-time') return '<span class="badge" style="background:rgba(37,99,235,0.1);color:#2563eb;font-size:10px">PART-TIME</span>';
        if (t === 'Visiting') return '<span class="badge" style="background:rgba(234,88,12,0.1);color:#ea580c;font-size:10px">VISITING</span>';
        if (t === 'Consultant') return '<span class="badge" style="background:rgba(147,51,234,0.1);color:#9333ea;font-size:10px">CONSULTANT</span>';
        if (t === 'Honorary') return '<span class="badge" style="background:rgba(107,114,128,0.1);color:#6b7280;font-size:10px">HONORARY</span>';
        return '<span class="badge badge-outline" style="font-size:10px">' + esc(t || 'N/A') + '</span>';
    }

    function specBadge(s) {
        return '<span class="badge" style="background:rgba(0,51,102,0.08);color:var(--midnight-blue);font-size:10px;font-weight:600">' + esc(s || 'N/A') + '</span>';
    }

    function renderTable() {
        _drRenderPagination(getFilteredDoctors());
    }

    function _drRenderPagination(source) {
        var total    = source.length;
        var totalPgs = Math.max(1, Math.ceil(total / drPerPageVal));
        if (drCurrentPage > totalPgs) drCurrentPage = totalPgs;
        var start = (drCurrentPage - 1) * drPerPageVal;
        var page  = source.slice(start, start + drPerPageVal);

        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="10"><div class="empty-state"><i data-lucide="stethoscope"></i><p>No doctors found</p><p class="empty-sub">Get started by adding your first doctor</p><button class="btn-primary" onclick="$(\'#btnAddDoctor\').click()"><i data-lucide="user-plus"></i> Add Doctor</button></div></td></tr>';
        } else {
            page.forEach(function(d) {
                var fullName = (d.firstName || '') + ' ' + (d.lastName || '');
                var initials = getInitials(d.firstName, d.lastName);
                var exp = d.workExperience ? d.workExperience + (d.workExperience == 1 ? ' Year' : ' Years') : '-';
                html += '<tr class="doctor-row" data-doctor-id="' + esc(d.doctorId) + '" style="cursor:pointer">' +
                    '<td><div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff;font-size:12px">' + esc(initials) + '</div></td>' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(d.doctorId) + '</td>' +
                    '<td><div><span style="font-weight:600;font-size:14px;color:var(--midnight-blue)">' + esc(fullName) + '</span>' +
                        (d.qualification ? '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">' + esc(d.qualification) + '</div>' : '') +
                    '</div></td>' +
                    '<td>' + specBadge(d.specialization) + '</td>' +
                    '<td style="font-size:13px">' + esc(d.department || '-') + '</td>' +
                    '<td style="font-size:13px">' + esc(exp) + '</td>' +
                    '<td>' + empBadge(d.contractType) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(d.phone || '-') + '</td>' +
                    '<td>' + statusBadge(d.status) + '</td>' +
                    '<td class="text-right"><div class="dropdown" onclick="event.stopPropagation()"><button class="btn-ghost btn-icon" data-bs-toggle="dropdown"><i data-lucide="more-vertical"></i></button>' +
                        '<ul class="dropdown-menu dropdown-menu-end">' +
                            '<li><a class="dropdown-item doc-action" data-action="view" data-id="' + esc(d.doctorId) + '"><i data-lucide="eye" style="width:14px;height:14px"></i> View Details</a></li>' +
                            '<li><a class="dropdown-item doc-action" data-action="edit" data-id="' + esc(d.doctorId) + '"><i data-lucide="pencil" style="width:14px;height:14px"></i> Edit</a></li>' +
                            '<li><hr class="dropdown-divider"></li>' +
                            (d.status === 'ACTIVE' ?
                                '<li><a class="dropdown-item doc-action" data-action="deactivate" data-id="' + esc(d.doctorId) + '"><i data-lucide="user-x" style="width:14px;height:14px"></i> Deactivate</a></li>' :
                                '<li><a class="dropdown-item doc-action" data-action="activate" data-id="' + esc(d.doctorId) + '"><i data-lucide="user-check" style="width:14px;height:14px"></i> Activate</a></li>') +
                        '</ul></div></td>' +
                    '</tr>';
            });
        }
        $('#doctorsTableBody').html(html);

        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + drPerPageVal, total);
        $('#drTableInfo').text('Showing ' + from + '\u2013' + to + ' of ' + total + ' records');

        var numsHtml = '';
        var maxBtns = 5, half = Math.floor(maxBtns / 2);
        var pStart = Math.max(1, drCurrentPage - half);
        var pEnd   = Math.min(totalPgs, pStart + maxBtns - 1);
        if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
        for (var pg = pStart; pg <= pEnd; pg++) {
            numsHtml += '<button class="opd-page-num' + (pg === drCurrentPage ? ' active' : '') + '" data-page="' + pg + '">' + pg + '</button>';
        }
        $('#drPageNums').html(numsHtml);
        $('#drPrevPage').prop('disabled', drCurrentPage <= 1);
        $('#drNextPage').prop('disabled', drCurrentPage >= totalPgs);

        lucide.createIcons();
    }

    $('#doctorSearch').on('input', function() { drCurrentPage = 1; renderTable(); });

    $(document).on('click', '#drPageNums .opd-page-num', function() {
        drCurrentPage = parseInt($(this).data('page')); renderTable();
    });
    $(document).on('click', '#drPrevPage', function() {
        if (drCurrentPage > 1) { drCurrentPage--; renderTable(); }
    });
    $(document).on('click', '#drNextPage', function() {
        drCurrentPage++; renderTable();
    });

    $(document).on('click', '.doctor-row', function() {
        var id = $(this).data('doctor-id');
        openDoctorDetail(id);
    });

    $(document).on('click', '.doc-action', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var action = $(this).data('action');
        var id = $(this).data('id');
        if (action === 'view') openDoctorDetail(id);
        else if (action === 'edit') openDoctorForm(id);
        else if (action === 'deactivate') toggleStatus(id, 'INACTIVE');
        else if (action === 'activate') toggleStatus(id, 'ACTIVE');
    });

    function toggleStatus(doctorId, newStatus) {
        $.ajax({
            url: '/api/doctors/' + doctorId,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ status: newStatus }),
            success: function() { loadAllData(); },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed to update status'); }
        });
    }

    function openDoctorDetail(doctorId) {
        var d = doctors.find(function(doc) { return doc.doctorId === doctorId; });
        if (!d) return;
        var fullName = (d.firstName || '') + ' ' + (d.lastName || '');
        var initials = getInitials(d.firstName, d.lastName);
        var exp = d.workExperience ? d.workExperience + ' Years' : '-';
        var joiningStr = d.joiningDate ? new Date(d.joiningDate).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '-';
        var dobStr = d.dob ? new Date(d.dob).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '-';

        var html = '<div style="background:linear-gradient(135deg,var(--midnight-blue),#004d99);color:#fff;padding:24px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:72px;height:72px;font-size:24px;background:var(--aqua-mint);color:var(--midnight-blue);flex-shrink:0">' + esc(initials) + '</div>' +
                '<div style="flex:1">' +
                    '<h4 style="margin:0;font-size:20px;font-weight:700">' + esc(fullName) + '</h4>' +
                    (d.qualification ? '<p style="margin:4px 0 0;font-size:13px;opacity:0.85">' + esc(d.qualification) + '</p>' : '') +
                    '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
                        specBadge(d.specialization).replace('color:var(--midnight-blue)', 'color:#fff').replace('background:rgba(0,51,102,0.08)', 'background:rgba(255,255,255,0.15)') +
                        statusBadge(d.status) +
                    '</div>' +
                '</div>' +
            '</div>';

        html += '<div style="padding:20px">';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">' +
            '<div class="stat-card" style="padding:12px;text-align:center"><div style="font-size:11px;color:var(--color-muted-foreground);text-transform:uppercase">Doctor ID</div><div style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-top:4px">' + esc(d.doctorId) + '</div></div>' +
            '<div class="stat-card" style="padding:12px;text-align:center"><div style="font-size:11px;color:var(--color-muted-foreground);text-transform:uppercase">Employee ID</div><div style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-top:4px">' + esc(d.employeeId || '-') + '</div></div>' +
            '<div class="stat-card" style="padding:12px;text-align:center"><div style="font-size:11px;color:var(--color-muted-foreground);text-transform:uppercase">Experience</div><div style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-top:4px">' + esc(exp) + '</div></div>' +
            '</div>';

        html += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)">Personal Information</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px">';
        html += detailRow('Full Name', fullName);
        html += detailRow('Gender', d.gender);
        html += detailRow('Date of Birth', dobStr);
        html += detailRow('Blood Group', d.bloodGroup);
        html += detailRow('CNIC', d.cnic);
        html += detailRow('Marital Status', d.maritalStatus);
        html += '</div>';

        html += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)">Contact Information</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px">';
        html += detailRow('Phone', d.phone);
        html += detailRow('Email', d.email);
        html += detailRow('Emergency Contact', d.emergencyContact);
        html += detailRow('Current Address', d.currentAddress);
        html += detailRow('Permanent Address', d.permanentAddress);
        html += '</div>';

        html += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)">Professional Information</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px">';
        html += detailRow('Department', d.department);
        html += detailRow('Specialization', d.specialization);
        html += detailRow('Designation', d.designation);
        html += detailRow('Specialist', d.specialist);
        html += detailRow('Qualification', d.qualification);
        html += detailRow('Work Experience', exp);
        html += '</div>';

        html += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)">Employment Details</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px">';
        html += detailRow('Employment Type', d.contractType);
        html += detailRow('Joining Date', joiningStr);
        html += detailRow('Work Shift', d.workShift);
        html += detailRow('Work Location', d.workLocation);
        html += detailRow('Duty Days', Array.isArray(d.dutyDays) ? d.dutyDays.join(', ') : d.dutyDays);
        html += detailRow('Duty Hours', (d.dutyFrom && d.dutyTo) ? d.dutyFrom + ' - ' + d.dutyTo : '-');
        html += '</div>';

        if (d.notes) {
            html += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)">Notes</div>';
            html += '<div style="padding:12px;background:var(--color-muted);border-radius:8px;font-size:13px;color:var(--color-muted-foreground);margin-bottom:20px">' + esc(d.notes) + '</div>';
        }

        html += '</div>';

        $('#doctorDetailTitle').text(fullName);
        $('#doctorDetailBody').html(html);
        $('#doctorDetailFooter').html(
            '<button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>' +
            '<div style="display:flex;gap:8px">' +
                '<button class="btn-outline" onclick="openDoctorForm(\'' + esc(d.doctorId) + '\')"><i data-lucide="pencil" style="width:14px;height:14px"></i> Edit</button>' +
                (d.status === 'ACTIVE' ? '<button class="btn-outline" style="color:var(--color-destructive);border-color:var(--color-destructive)" onclick="toggleStatusFromDetail(\'' + esc(d.doctorId) + '\',\'INACTIVE\')"><i data-lucide="user-x" style="width:14px;height:14px"></i> Deactivate</button>' :
                '<button class="btn-primary" onclick="toggleStatusFromDetail(\'' + esc(d.doctorId) + '\',\'ACTIVE\')"><i data-lucide="user-check" style="width:14px;height:14px"></i> Activate</button>') +
            '</div>'
        );
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('doctorDetailSheet')).show();
    }
    window.openDoctorDetail = openDoctorDetail;

    window.toggleStatusFromDetail = function(doctorId, newStatus) {
        try { bootstrap.Offcanvas.getInstance(document.getElementById('doctorDetailSheet'))?.hide(); } catch(e) {}
        toggleStatus(doctorId, newStatus);
    };

    function detailRow(label, value) {
        return '<div style="margin-bottom:4px"><div style="font-size:11px;color:var(--color-muted-foreground);text-transform:uppercase">' + esc(label) + '</div><div style="font-size:14px;font-weight:500;color:var(--color-foreground);margin-top:2px">' + esc(value || '-') + '</div></div>';
    }

    function buildFormHtml(d) {
        d = d || {};
        var h = '';

        h += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)"><i data-lucide="user" style="width:16px;height:16px;margin-right:6px"></i> Basic Information</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">';
        h += formSelect('Title', 'docTitle', titles, d.role || 'Dr.');
        h += formInput('First Name *', 'docFirstName', d.firstName, 'Enter first name');
        h += formInput('Last Name *', 'docLastName', d.lastName, 'Enter last name');
        h += formSelect('Gender', 'docGender', ['Male','Female','Other'], d.gender);
        h += formInput('Date of Birth', 'docDob', d.dob ? d.dob.substring(0, 10) : '', '', 'date');
        h += formSelect('Blood Group', 'docBloodGroup', bloodGroups, d.bloodGroup);
        h += formInput('CNIC', 'docCnic', d.cnic, '_____-_______-_');
        h += formSelect('Marital Status', 'docMaritalStatus', ['Single','Married','Widowed','Divorced'], d.maritalStatus);
        h += '</div>';

        h += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)"><i data-lucide="phone" style="width:16px;height:16px;margin-right:6px"></i> Contact Information</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">';
        h += formInput('Primary Phone *', 'docPhone', d.phone, '03XX-XXXXXXX');
        h += formInput('Email *', 'docEmail', d.email, 'email@example.com', 'email');
        h += formInput('Emergency Contact', 'docEmergencyContact', d.emergencyContact, 'Contact number');
        h += '</div>';
        h += '<div style="margin-bottom:24px">';
        h += formTextarea('Current Address', 'docCurrentAddress', d.currentAddress, 'Enter current address');
        h += '<div style="margin:8px 0"><label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="docSameAddress"> Same as current address</label></div>';
        h += formTextarea('Permanent Address', 'docPermanentAddress', d.permanentAddress, 'Enter permanent address');
        h += '</div>';

        h += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)"><i data-lucide="briefcase-medical" style="width:16px;height:16px;margin-right:6px"></i> Professional Information</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">';
        h += formSelect('Primary Specialization *', 'docSpecialization', specializations, d.specialization);
        h += formSelect('Sub-specialization', 'docSpecialist', subSpecializations, d.specialist);
        h += formSelect('Primary Department *', 'docDepartment', departments, d.department);
        h += formInput('Years of Experience', 'docWorkExperience', d.workExperience, 'e.g. 10', 'number');
        h += formSelect('Designation', 'docDesignation', designations, d.designation);
        h += '</div>';

        h += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)"><i data-lucide="graduation-cap" style="width:16px;height:16px;margin-right:6px"></i> Qualifications</div>';
        h += '<div style="margin-bottom:24px">';
        h += formInput('Qualifications / Degrees', 'docQualification', d.qualification, 'e.g. MBBS, FCPS (Cardiology)');
        h += '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">';
        degreeOptions.forEach(function(deg) {
            h += '<button type="button" class="btn-outline degree-chip" data-degree="' + deg + '" style="font-size:11px;padding:4px 10px;border-radius:20px">' + deg + '</button>';
        });
        h += '</div>';
        h += '</div>';

        h += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)"><i data-lucide="building" style="width:16px;height:16px;margin-right:6px"></i> Employment Details</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">';
        h += formSelect('Employment Type *', 'docContractType', employmentTypes, d.contractType);
        h += formSelect('Status', 'docStatus', statusOptions, d.status || 'ACTIVE');
        h += formInput('Joining Date', 'docJoiningDate', d.joiningDate ? d.joiningDate.substring(0, 10) : '', '', 'date');
        h += formInput('Work Shift', 'docWorkShift', d.workShift, 'e.g. Morning / Evening / Night');
        h += formInput('Work Location', 'docWorkLocation', d.workLocation, 'e.g. Main Campus');
        h += formInput('Duty From', 'docDutyFrom', d.dutyFrom, 'e.g. 08:00');
        h += formInput('Duty To', 'docDutyTo', d.dutyTo, 'e.g. 17:00');
        h += '</div>';

        h += '<div class="form-section-title" style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)"><i data-lucide="file-text" style="width:16px;height:16px;margin-right:6px"></i> Additional Information</div>';
        h += '<div style="margin-bottom:24px">';
        h += formTextarea('Notes / Professional Biography', 'docNotes', d.notes, 'Any additional notes about this doctor...');
        h += '</div>';

        return h;
    }

    function formInput(label, id, value, placeholder, type) {
        type = type || 'text';
        return '<div class="form-group"><label class="form-label" for="' + id + '">' + label + '</label><input type="' + type + '" class="form-control" id="' + id + '" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '') + '"></div>';
    }

    function formSelect(label, id, options, selected) {
        var h = '<div class="form-group"><label class="form-label" for="' + id + '">' + label + '</label><select class="form-select" id="' + id + '" style="height:40px;font-size:14px"><option value="">-- Select --</option>';
        options.forEach(function(opt) {
            h += '<option value="' + esc(opt) + '"' + (opt === selected ? ' selected' : '') + '>' + esc(opt) + '</option>';
        });
        h += '</select></div>';
        return h;
    }

    function formTextarea(label, id, value, placeholder) {
        return '<div class="form-group"><label class="form-label" for="' + id + '">' + label + '</label><textarea class="form-control" id="' + id + '" rows="3" placeholder="' + esc(placeholder || '') + '" style="font-size:14px">' + esc(value || '') + '</textarea></div>';
    }

    function openDoctorForm(doctorId) {
        try { bootstrap.Offcanvas.getInstance(document.getElementById('doctorDetailSheet'))?.hide(); } catch(e) {}
        editingDoctorId = doctorId || null;
        var d = doctorId ? doctors.find(function(doc) { return doc.doctorId === doctorId; }) : null;
        $('#doctorFormTitle').text(d ? 'Edit Doctor - ' + d.firstName + ' ' + d.lastName : 'Add New Doctor');
        $('#btnSaveDoctor').html(d ? '<i data-lucide="check"></i> Update Doctor' : '<i data-lucide="check"></i> Save & Add Doctor');
        $('#doctorFormBody').html(buildFormHtml(d || {}));
        lucide.createIcons();
        setTimeout(function() {
            new bootstrap.Offcanvas(document.getElementById('doctorFormSheet')).show();
        }, 200);
    }
    window.openDoctorForm = openDoctorForm;

    $(document).on('click', '#btnAddDoctor', function() { openDoctorForm(null); });

    $(document).on('click', '.degree-chip', function() {
        var deg = $(this).data('degree');
        var el = $('#docQualification');
        var cur = el.val();
        if (cur && cur.indexOf(deg) === -1) {
            el.val(cur + ', ' + deg);
        } else if (!cur) {
            el.val(deg);
        }
    });

    $(document).on('change', '#docSameAddress', function() {
        if ($(this).is(':checked')) {
            $('#docPermanentAddress').val($('#docCurrentAddress').val());
        }
    });

    $(document).on('click', '#btnSaveDoctor', function() {
        var firstName = ($('#docFirstName').val() || '').trim();
        var lastName = ($('#docLastName').val() || '').trim();
        var department = $('#docDepartment').val();
        if (!firstName) { HMS.toast('First name is required', 'warning'); return; }
        if (!lastName) { HMS.toast('Last name is required', 'warning'); return; }
        if (!department) { HMS.toast('Department is required', 'warning'); return; }

        var payload = {
            firstName: firstName,
            lastName: lastName,
            role: $('#docTitle').val() || 'Dr.',
            gender: $('#docGender').val(),
            dob: $('#docDob').val() || null,
            bloodGroup: $('#docBloodGroup').val(),
            cnic: $('#docCnic').val(),
            maritalStatus: $('#docMaritalStatus').val(),
            phone: $('#docPhone').val(),
            email: $('#docEmail').val(),
            emergencyContact: $('#docEmergencyContact').val(),
            currentAddress: $('#docCurrentAddress').val(),
            permanentAddress: $('#docPermanentAddress').val(),
            specialization: $('#docSpecialization').val(),
            specialist: $('#docSpecialist').val(),
            department: department,
            workExperience: $('#docWorkExperience').val(),
            designation: $('#docDesignation').val(),
            qualification: $('#docQualification').val(),
            contractType: $('#docContractType').val(),
            status: $('#docStatus').val() || 'ACTIVE',
            joiningDate: $('#docJoiningDate').val() || null,
            workShift: $('#docWorkShift').val(),
            workLocation: $('#docWorkLocation').val(),
            dutyFrom: $('#docDutyFrom').val(),
            dutyTo: $('#docDutyTo').val(),
            notes: $('#docNotes').val()
        };

        var btn = $(this);
        btn.prop('disabled', true);

        var url = editingDoctorId ? '/api/doctors/' + editingDoctorId : '/api/doctors';
        var method = editingDoctorId ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function() {
                bootstrap.Offcanvas.getInstance(document.getElementById('doctorFormSheet'))?.hide();
                loadAllData();
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed to save doctor');
            },
            complete: function() {
                btn.prop('disabled', false);
            }
        });
    });

    $(document).on('click', '#btnFilterToggle', function() {
        var body = $('#filterBody');
        var h = '';
        h += '<div class="form-group" style="margin-bottom:16px"><label class="form-label" style="font-weight:600">Department</label>';
        departments.forEach(function(dept) {
            h += '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer"><input type="checkbox" class="filter-dept-check" value="' + esc(dept) + '"> ' + esc(dept) + '</label>';
        });
        h += '</div>';

        h += '<div class="form-group" style="margin-bottom:16px"><label class="form-label" style="font-weight:600">Specialization</label>';
        specializations.forEach(function(sp) {
            h += '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer"><input type="checkbox" class="filter-spec-check" value="' + esc(sp) + '"> ' + esc(sp) + '</label>';
        });
        h += '</div>';

        h += '<div class="form-group" style="margin-bottom:16px"><label class="form-label" style="font-weight:600">Status</label>';
        statusOptions.forEach(function(s) {
            h += '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer"><input type="checkbox" class="filter-status-check" value="' + esc(s) + '"> ' + esc(s) + '</label>';
        });
        h += '</div>';

        h += '<div class="form-group" style="margin-bottom:16px"><label class="form-label" style="font-weight:600">Employment Type</label>';
        employmentTypes.forEach(function(et) {
            h += '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer"><input type="checkbox" class="filter-emp-check" value="' + esc(et) + '"> ' + esc(et) + '</label>';
        });
        h += '</div>';

        body.html(h);
        new bootstrap.Offcanvas(document.getElementById('filterSheet')).show();
    });

    $(document).on('click', '#btnApplyFilters', function() {
        try { bootstrap.Offcanvas.getInstance(document.getElementById('filterSheet'))?.hide(); } catch(e) {}
        renderTable();
    });

    $(document).on('click', '#btnClearFilters', function() {
        $('#doctorSearch').val('');
        drFiltered = null; drCurrentPage = 1;
        try { bootstrap.Offcanvas.getInstance(document.getElementById('filterSheet'))?.hide(); } catch(e) {}
        renderTable();
    });

    // ── Toolbar window functions ──────────────────────────────────────────────
    window.toggleDrFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('drFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnDrFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyDrFilters = function() {
        var stVal   = ($('#drStatusFilter').val() || '').toLowerCase();
        var deptVal = ($('#drDeptFilter').val()   || '').toLowerCase();
        var typeVal = ($('#drTypeFilter').val()   || '').toLowerCase();
        var dfVal   = $('#drDateFrom').val() || '';
        var dtVal   = $('#drDateTo').val()   || '';

        drFiltered = doctors.filter(function(d) {
            if (stVal   && stVal   !== 'all status'      && (d.status       || '').toLowerCase() !== stVal)   return false;
            if (deptVal && deptVal !== 'all departments' && (d.department   || '').toLowerCase() !== deptVal) return false;
            if (typeVal && typeVal !== 'all employment'  && (d.contractType || '').toLowerCase() !== typeVal) return false;
            if (dfVal && d.joiningDate && d.joiningDate.substring(0, 10) < dfVal) return false;
            if (dtVal && d.joiningDate && d.joiningDate.substring(0, 10) > dtVal) return false;
            return true;
        });

        var count = 0;
        if (stVal   && stVal   !== 'all status')      count++;
        if (deptVal && deptVal !== 'all departments') count++;
        if (typeVal && typeVal !== 'all employment')  count++;
        if (dfVal) count++;
        if (dtVal) count++;
        var badge = document.getElementById('drFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }

        drCurrentPage = 1;
        renderTable();
        toggleDrFilter();
    };

    window.resetDrFilters = function() {
        drFiltered = null; drCurrentPage = 1;
        ['drCsStatus','drCsDept','drCsType'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['drDpDateFrom','drDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('drFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        renderTable();
    };

    window.toggleDrRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('drRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setDrRowsPer = function(n) {
        drPerPageVal = n; drCurrentPage = 1;
        var m = document.getElementById('drRowsMenu'); if (m) m.classList.remove('open');
        renderTable();
    };

    window.toggleDrColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('drColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.drColVisSelectAll = function() {
        $('#drColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyDrColVis = function() {
        var m = document.getElementById('drColVisMenu'); if (m) m.classList.remove('open');
        $('#drColVisList input[type=checkbox]').each(function() {
            var col  = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#doctorsTable thead tr th:eq(' + col + ')').toggle(show);
            $('#doctorsTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleDrExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('drExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportDr = function(type) {
        var m = document.getElementById('drExportMenu'); if (m) m.classList.remove('open');
        var source = drFiltered !== null ? drFiltered : doctors;
        if (type === 'csv') {
            var hdrs = ['Doctor ID','First Name','Last Name','Specialization','Department','Experience','Employment','Phone','Status'];
            var rows = source.map(function(d) {
                var exp = d.workExperience ? d.workExperience + ' Yrs' : '';
                return [d.doctorId||'', d.firstName||'', d.lastName||'', d.specialization||'', d.department||'', exp, d.contractType||'', d.phone||'', d.status||''];
            });
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c+'').replace(/"/g,'""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'doctors.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // ── Outside-click handler ─────────────────────────────────────────────────
    $(document).on('click.drMenus', function(e) {
        if (!$(e.target).closest('#drRowsMenu, #drRowsBtn').length)          $('#drRowsMenu').removeClass('open');
        if (!$(e.target).closest('#drColVisMenu, .opd-col-vis-wrap').length) $('#drColVisMenu').removeClass('open');
        if (!$(e.target).closest('#drExportMenu, .opd-export-wrap').length)  $('#drExportMenu').removeClass('open');
        if (!$(e.target).closest('.opd-dp-trigger,.opd-dp-popup,.opd-cs-trigger,.opd-cs-popup').length) drCloseAll();
    });

    // ── Custom date picker & searchable select ────────────────────────────────
    var DR_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DR_DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function drCloseAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
    }
    document.addEventListener('click', drCloseAll);
    window.addEventListener('scroll', function() {
        document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
            if (!p._trigger) return;
            var rect = p._trigger.getBoundingClientRect();
            p.style.top = (rect.bottom + 6) + 'px'; p.style.left = rect.left + 'px';
        });
    }, true);

    function drInitDp(wrapId) {
        var wrap = document.getElementById(wrapId); if (!wrap) return;
        var hidden = document.getElementById(wrap.dataset.target);
        var ph = wrap.dataset.placeholder || 'Select date';
        var selDate = null, viewYear = new Date().getFullYear(), viewMonth = new Date().getMonth();
        var triggerEl = document.createElement('div');
        triggerEl.className = 'opd-dp-trigger';
        triggerEl.innerHTML = '<span class="opd-dp-val opd-ph">' + ph + '</span><i data-lucide="calendar" style="width:15px;height:15px;flex-shrink:0"></i>';
        var popup = document.createElement('div'); popup.className = 'opd-dp-popup';
        wrap.appendChild(triggerEl); wrap.appendChild(popup); lucide.createIcons();
        var valEl = triggerEl.querySelector('.opd-dp-val');
        function render() {
            var firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
            var dim = new Date(viewYear, viewMonth + 1, 0).getDate();
            var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + DR_MONTHS[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
            DR_DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
            for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= dim; d++) {
                var ds = viewYear + '-' + String(viewMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
                h += '<div class="opd-dp-day' + (selDate === ds ? ' selected' : '') + '" data-date="' + ds + '">' + d + '</div>';
            }
            popup.innerHTML = h + '</div>';
        }
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation(); var isOpen = popup.classList.contains('open'); drCloseAll();
            if (!isOpen) {
                var rect = triggerEl.getBoundingClientRect();
                popup.style.top = (rect.bottom+6)+'px'; popup.style.left = rect.left+'px'; popup.style.width = rect.width+'px';
                popup._trigger = triggerEl;
                if (popup.parentNode !== document.body) document.body.appendChild(popup);
                render(); popup.classList.add('open'); triggerEl.classList.add('open');
            }
        });
        popup.addEventListener('click', function(e) {
            e.stopPropagation(); var tgt = e.target;
            if (tgt.dataset.a === 'p') { if (--viewMonth < 0) { viewMonth=11; viewYear--; } render(); }
            else if (tgt.dataset.a === 'n') { if (++viewMonth > 11) { viewMonth=0; viewYear++; } render(); }
            else if (tgt.dataset.date) { selDate=tgt.dataset.date; valEl.textContent=selDate; valEl.classList.remove('opd-ph'); if (hidden) hidden.value=selDate; drCloseAll(); }
        });
        wrap._reset = function() { selDate=null; viewYear=new Date().getFullYear(); viewMonth=new Date().getMonth(); valEl.textContent=ph; valEl.classList.add('opd-ph'); if (hidden) hidden.value=''; };
    }

    function drInitCs(wrapId) {
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
        var search = popup.querySelector('.opd-cs-search');
        var list   = popup.querySelector('.opd-cs-list');
        function renderList(q) {
            q = (q||'').toLowerCase();
            var filt = q ? options.filter(function(o){return o.toLowerCase().indexOf(q)>-1;}) : options;
            if (!filt.length) { list.innerHTML='<div class="opd-cs-empty">No options</div>'; return; }
            list.innerHTML = filt.map(function(o) { return '<div class="opd-cs-option'+(o===selVal?' selected':'')+'" data-v="'+o.replace(/"/g,'&quot;')+'">'+o+'</div>'; }).join('');
            list.querySelectorAll('.opd-cs-option').forEach(function(el) {
                el.addEventListener('click', function(e) { e.stopPropagation(); selVal=this.dataset.v; valEl.textContent=selVal; valEl.classList.remove('opd-ph'); if(hidden) hidden.value=selVal; drCloseAll(); });
            });
        }
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation(); var isOpen=popup.classList.contains('open'); drCloseAll();
            if (!isOpen) {
                var rect=triggerEl.getBoundingClientRect();
                popup.style.top=(rect.bottom+6)+'px'; popup.style.left=rect.left+'px'; popup.style.width=rect.width+'px';
                popup._trigger=triggerEl;
                if (popup.parentNode!==document.body) document.body.appendChild(popup);
                popup.classList.add('open'); triggerEl.classList.add('open'); search.value=''; renderList('');
                setTimeout(function(){search.focus();},40);
            }
        });
        search.addEventListener('input', function(e){e.stopPropagation(); renderList(this.value);});
        search.addEventListener('click', function(e){e.stopPropagation();});
        popup.addEventListener('click', function(e){e.stopPropagation();});
        wrap.setOptions = function(opts) { options = opts || []; };
        wrap._reset = function() { selVal=''; valEl.textContent=ph; valEl.classList.add('opd-ph'); if(hidden) hidden.value=''; };
    }

    // ── Initialize toolbar components ─────────────────────────────────────────
    ['drDpDateFrom','drDpDateTo'].forEach(drInitDp);
    ['drCsStatus','drCsDept','drCsType'].forEach(drInitCs);

    var stWrap = document.getElementById('drCsStatus');
    if (stWrap && stWrap.setOptions) stWrap.setOptions(['All Status','ACTIVE','ON_LEAVE','INACTIVE','RETIRED']);

    loadAllData();
});
