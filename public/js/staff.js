$(document).ready(function() {
    var staffList = [];
    var editingStaffId = null;

    // ── Toolbar state ─────────────────────────────────────────────────────────
    var sfCurrentPage = 1;
    var sfPerPageVal  = 10;
    var sfFiltered    = null;

    function esc(s) { return $('<span>').text(s || '').html(); }
    function getInitials(first, last) { return ((first || '')[0] || '') + ((last || '')[0] || ''); }

    var categories = ['Clinical Staff','Support Staff','Administrative Staff','Security & Maintenance'];

    var designationsByCategory = {
        'Clinical Staff': ['Registered Nurse (RN)','Licensed Practical Nurse (LPN)','Staff Nurse','Charge Nurse','Head Nurse','Nurse Supervisor','Paramedic','EMT','Lab Technician','Medical Lab Technologist','Phlebotomist','X-Ray Technician','CT Technician','MRI Technician','Ultrasound Technician','Pharmacy Technician','Pharmacy Assistant','OT Technician','OT Assistant','Physiotherapist','Nutritionist','Dietitian','Respiratory Therapist'],
        'Support Staff': ['Ward Boy','Ward Attendant','Stretcher Bearer','Cleaner/Janitor','Housekeeping Staff','Laundry Staff','Kitchen Staff','Cook','Helper','Driver/Ambulance Driver'],
        'Administrative Staff': ['Receptionist','Front Desk Officer','Medical Records Officer','Billing Officer','Cashier','Accountant','Accounts Assistant','HR Officer','HR Assistant','IT Officer','IT Technician','Procurement Officer','Store Keeper','Admin Assistant','Office Assistant'],
        'Security & Maintenance': ['Security Guard','Security Supervisor','Electrician','Plumber','AC Technician','Biomedical Engineer','Maintenance Supervisor','Housekeeping Supervisor']
    };

    var departments = ['Nursing','Laboratory','Radiology','Pharmacy','OT','Emergency','ICU','General Ward','Private Ward','Pediatric Ward','Maternity','Administration','Front Desk','Accounts','HR','IT','Housekeeping','Kitchen','Laundry','Security','Maintenance','Transport','Store','Medical Records'];
    var shifts = ['Morning (7AM-3PM)','Evening (3PM-11PM)','Night (11PM-7AM)','Rotating','General (9AM-5PM)'];
    var employmentTypes = ['Permanent','Contractual','Temporary','Part-time','Trainee/Intern'];
    var statusOptions = ['ACTIVE','ON_LEAVE','SUSPENDED','TERMINATED','RESIGNED'];
    var bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
    var educationLevels = ['Primary/Middle','Matriculation (SSC)','Intermediate (HSSC)','Bachelor\'s Degree','Master\'s Degree','Other'];

    function safeGet(url) {
        return $.get(url).then(function(d) { return d; }, function() { return null; });
    }

    function loadAllData() {
        safeGet('/api/staff').done(function(data) {
            staffList = data || [];
            renderStats();
            renderTable();
            populateDeptFilter();
        });
    }

    function populateDeptFilter() {
        var depts = {};
        staffList.forEach(function(s) { if (s.department) depts[s.department] = true; });
        var deptWrap = document.getElementById('sfCsDept');
        if (deptWrap && deptWrap.setOptions) {
            deptWrap.setOptions(['All Departments'].concat(Object.keys(depts).sort()));
        }
    }

    function renderStats() {
        var total = staffList.length;
        var clinical = staffList.filter(function(s) { return s.category === 'Clinical Staff'; }).length;
        var support = staffList.filter(function(s) { return s.category === 'Support Staff'; }).length;
        var admin = staffList.filter(function(s) { return s.category === 'Administrative Staff'; }).length;
        var active = staffList.filter(function(s) { return s.employmentStatus === 'ACTIVE'; }).length;
        var onLeave = staffList.filter(function(s) { return s.employmentStatus === 'ON_LEAVE'; }).length;
        $('#statTotal').text(total);
        $('#statClinical').text(clinical);
        $('#statSupport').text(support);
        $('#statAdmin').text(admin);
        $('#statActive').text(active);
        $('#statLeave').text(onLeave);
    }

    function getFilteredStaff() {
        var search    = ($('#staffSearch').val()     || '').toLowerCase();
        var statusVal = ($('#sfStatusFilter').val()  || '').toLowerCase();
        var catVal    = ($('#sfCatFilter').val()     || '').toLowerCase();
        var deptVal   = ($('#sfDeptFilter').val()    || '').toLowerCase();

        var base = sfFiltered !== null ? sfFiltered : staffList;
        return base.filter(function(s) {
            var name = ((s.firstName || '') + ' ' + (s.lastName || '')).toLowerCase();
            if (search && name.indexOf(search) < 0 && (s.designation || '').toLowerCase().indexOf(search) < 0 && (s.department || '').toLowerCase().indexOf(search) < 0 && (s.staffId || '').toLowerCase().indexOf(search) < 0 && (s.employeeId || '').toLowerCase().indexOf(search) < 0) return false;
            if (statusVal && statusVal !== 'all status'      && (s.employmentStatus || '').toLowerCase() !== statusVal) return false;
            if (catVal    && catVal    !== 'all categories'  && (s.category         || '').toLowerCase() !== catVal)    return false;
            if (deptVal   && deptVal   !== 'all departments' && (s.department        || '').toLowerCase() !== deptVal)  return false;
            return true;
        });
    }

    function statusBadge(s) {
        if (s === 'ACTIVE') return '<span class="badge badge-success">ACTIVE</span>';
        if (s === 'ON_LEAVE') return '<span class="badge badge-warning">ON LEAVE</span>';
        if (s === 'SUSPENDED') return '<span class="badge" style="background:rgba(239,68,68,0.1);color:#dc2626;font-size:10px">SUSPENDED</span>';
        if (s === 'TERMINATED') return '<span class="badge" style="background:rgba(107,114,128,0.1);color:#374151;font-size:10px">TERMINATED</span>';
        if (s === 'RESIGNED') return '<span class="badge" style="background:rgba(156,163,175,0.1);color:#6b7280;font-size:10px">RESIGNED</span>';
        return '<span class="badge badge-outline">' + esc(s || 'N/A') + '</span>';
    }

    function catBadge(c) {
        if (c === 'Clinical Staff') return '<span class="badge" style="background:rgba(37,99,235,0.1);color:#2563eb;font-size:10px">CLINICAL</span>';
        if (c === 'Support Staff') return '<span class="badge" style="background:rgba(22,163,74,0.1);color:#16a34a;font-size:10px">SUPPORT</span>';
        if (c === 'Administrative Staff') return '<span class="badge" style="background:rgba(234,88,12,0.1);color:#ea580c;font-size:10px">ADMIN</span>';
        if (c === 'Security & Maintenance') return '<span class="badge" style="background:rgba(107,114,128,0.1);color:#6b7280;font-size:10px">SECURITY</span>';
        return '<span class="badge badge-outline" style="font-size:10px">' + esc(c || 'N/A') + '</span>';
    }

    function shiftBadge(s) {
        if (!s) return '-';
        if (s.indexOf('Morning') > -1) return '<span class="badge" style="background:rgba(234,179,8,0.1);color:#ca8a04;font-size:10px">MORNING</span>';
        if (s.indexOf('Evening') > -1) return '<span class="badge" style="background:rgba(234,88,12,0.1);color:#ea580c;font-size:10px">EVENING</span>';
        if (s.indexOf('Night') > -1) return '<span class="badge" style="background:rgba(147,51,234,0.1);color:#9333ea;font-size:10px">NIGHT</span>';
        if (s.indexOf('Rotating') > -1) return '<span class="badge" style="background:rgba(37,99,235,0.1);color:#2563eb;font-size:10px">ROTATING</span>';
        if (s.indexOf('General') > -1) return '<span class="badge" style="background:rgba(22,163,74,0.1);color:#16a34a;font-size:10px">GENERAL</span>';
        return '<span class="badge badge-outline" style="font-size:10px">' + esc(s) + '</span>';
    }

    function catBorderColor(c) {
        if (c === 'Clinical Staff') return '#2563eb';
        if (c === 'Support Staff') return '#16a34a';
        if (c === 'Administrative Staff') return '#ea580c';
        if (c === 'Security & Maintenance') return '#6b7280';
        return '#94a3b8';
    }

    function renderTable() {
        _sfRenderPagination(getFilteredStaff());
    }

    function _sfRenderPagination(source) {
        var total    = source.length;
        var totalPgs = Math.max(1, Math.ceil(total / sfPerPageVal));
        if (sfCurrentPage > totalPgs) sfCurrentPage = totalPgs;
        var start = (sfCurrentPage - 1) * sfPerPageVal;
        var page  = source.slice(start, start + sfPerPageVal);

        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="10"><div class="empty-state"><i data-lucide="users"></i><p>No staff members found</p><p class="empty-sub">Get started by adding your first staff member</p><button class="btn-primary" onclick="$(\'#btnAddStaff\').click()"><i data-lucide="user-plus"></i> Add Staff</button></div></td></tr>';
        } else {
            page.forEach(function(s) {
                var fullName = (s.firstName || '') + ' ' + (s.lastName || '');
                var initials = getInitials(s.firstName, s.lastName);
                var borderColor = catBorderColor(s.category);
                html += '<tr class="staff-row" data-staff-id="' + esc(s.staffId) + '" style="cursor:pointer;border-left:3px solid ' + borderColor + '">' +
                    '<td><div class="avatar avatar-sm" style="background:' + borderColor + ';color:#fff;font-size:12px">' + esc(initials) + '</div></td>' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(s.staffId) + '</td>' +
                    '<td><span style="font-weight:600;font-size:14px;color:var(--midnight-blue)">' + esc(fullName) + '</span></td>' +
                    '<td>' + catBadge(s.category) + '</td>' +
                    '<td style="font-size:12px">' + esc(s.designation || '-') + '</td>' +
                    '<td style="font-size:13px">' + esc(s.department || '-') + '</td>' +
                    '<td>' + shiftBadge(s.shift) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(s.phone || '-') + '</td>' +
                    '<td>' + statusBadge(s.employmentStatus) + '</td>' +
                    '<td class="text-right"><div class="dropdown" onclick="event.stopPropagation()"><button class="btn-ghost btn-icon" data-bs-toggle="dropdown"><i data-lucide="more-vertical"></i></button>' +
                        '<ul class="dropdown-menu dropdown-menu-end">' +
                            '<li><a class="dropdown-item staff-action" data-action="view" data-id="' + esc(s.staffId) + '"><i data-lucide="eye" style="width:14px;height:14px"></i> View Details</a></li>' +
                            '<li><a class="dropdown-item staff-action" data-action="edit" data-id="' + esc(s.staffId) + '"><i data-lucide="pencil" style="width:14px;height:14px"></i> Edit</a></li>' +
                            '<li><hr class="dropdown-divider"></li>' +
                            (s.employmentStatus === 'ACTIVE' ?
                                '<li><a class="dropdown-item staff-action" data-action="leave" data-id="' + esc(s.staffId) + '"><i data-lucide="calendar-off" style="width:14px;height:14px"></i> Mark on Leave</a></li>' +
                                '<li><a class="dropdown-item staff-action" data-action="suspend" data-id="' + esc(s.staffId) + '"><i data-lucide="ban" style="width:14px;height:14px"></i> Suspend</a></li>' :
                                '<li><a class="dropdown-item staff-action" data-action="activate" data-id="' + esc(s.staffId) + '"><i data-lucide="check-circle" style="width:14px;height:14px"></i> Activate</a></li>') +
                        '</ul></div></td>' +
                    '</tr>';
            });
        }
        $('#staffTableBody').html(html);

        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + sfPerPageVal, total);
        $('#sfTableInfo').text('Showing ' + from + '\u2013' + to + ' of ' + total + ' records');

        var numsHtml = '';
        var maxBtns = 5, half = Math.floor(maxBtns / 2);
        var pStart = Math.max(1, sfCurrentPage - half);
        var pEnd   = Math.min(totalPgs, pStart + maxBtns - 1);
        if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
        for (var pg = pStart; pg <= pEnd; pg++) {
            numsHtml += '<button class="opd-page-num' + (pg === sfCurrentPage ? ' active' : '') + '" data-page="' + pg + '">' + pg + '</button>';
        }
        $('#sfPageNums').html(numsHtml);
        $('#sfPrevPage').prop('disabled', sfCurrentPage <= 1);
        $('#sfNextPage').prop('disabled', sfCurrentPage >= totalPgs);

        lucide.createIcons();
    }

    $('#staffSearch').on('input', function() { sfCurrentPage = 1; renderTable(); });

    $(document).on('click', '#sfPageNums .opd-page-num', function() {
        sfCurrentPage = parseInt($(this).data('page')); renderTable();
    });
    $(document).on('click', '#sfPrevPage', function() {
        if (sfCurrentPage > 1) { sfCurrentPage--; renderTable(); }
    });
    $(document).on('click', '#sfNextPage', function() {
        sfCurrentPage++; renderTable();
    });

    $(document).on('click', '.staff-row', function() {
        openStaffDetail($(this).data('staff-id'));
    });

    $(document).on('click', '.staff-action', function(e) {
        e.preventDefault(); e.stopPropagation();
        var action = $(this).data('action');
        var id = $(this).data('id');
        if (action === 'view') openStaffDetail(id);
        else if (action === 'edit') openStaffForm(id);
        else if (action === 'leave') updateStatus(id, 'ON_LEAVE');
        else if (action === 'suspend') updateStatus(id, 'SUSPENDED');
        else if (action === 'activate') updateStatus(id, 'ACTIVE');
    });

    function updateStatus(staffId, newStatus) {
        $.ajax({
            url: '/api/staff/' + staffId,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ employmentStatus: newStatus }),
            success: function() { loadAllData(); },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed to update status'); }
        });
    }

    function detailRow(label, value) {
        return '<div style="margin-bottom:4px"><div style="font-size:11px;color:var(--color-muted-foreground);text-transform:uppercase">' + esc(label) + '</div><div style="font-size:14px;font-weight:500;color:var(--color-foreground);margin-top:2px">' + esc(value || '-') + '</div></div>';
    }

    function openStaffDetail(staffId) {
        var s = staffList.find(function(st) { return st.staffId === staffId; });
        if (!s) return;
        var fullName = (s.firstName || '') + ' ' + (s.lastName || '');
        var initials = getInitials(s.firstName, s.lastName);
        var borderColor = catBorderColor(s.category);
        var joiningStr = s.joiningDate ? new Date(s.joiningDate).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '-';
        var dobStr = s.dob ? new Date(s.dob).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '-';

        var html = '<div style="background:linear-gradient(135deg,var(--midnight-blue),#004d99);color:#fff;padding:24px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:72px;height:72px;font-size:24px;background:' + borderColor + ';color:#fff;flex-shrink:0;border:3px solid rgba(255,255,255,0.3)">' + esc(initials) + '</div>' +
                '<div style="flex:1">' +
                    '<h4 style="margin:0;font-size:20px;font-weight:700">' + esc(fullName) + '</h4>' +
                    '<p style="margin:4px 0 0;font-size:13px;opacity:0.85">' + esc(s.designation || '') + ' &bull; ' + esc(s.department || '') + '</p>' +
                    '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
                        catBadge(s.category).replace(/color:#[0-9a-f]+/gi, 'color:#fff').replace(/background:rgba\([^)]+\)/g, 'background:rgba(255,255,255,0.15)') +
                        statusBadge(s.employmentStatus) +
                    '</div>' +
                '</div>' +
            '</div>';

        html += '<div style="padding:20px">';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">' +
            '<div class="stat-card" style="padding:12px;text-align:center"><div style="font-size:11px;color:var(--color-muted-foreground);text-transform:uppercase">Staff ID</div><div style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-top:4px">' + esc(s.staffId) + '</div></div>' +
            '<div class="stat-card" style="padding:12px;text-align:center"><div style="font-size:11px;color:var(--color-muted-foreground);text-transform:uppercase">Employee ID</div><div style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-top:4px">' + esc(s.employeeId || '-') + '</div></div>' +
            '<div class="stat-card" style="padding:12px;text-align:center"><div style="font-size:11px;color:var(--color-muted-foreground);text-transform:uppercase">Experience</div><div style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-top:4px">' + esc(s.workExperience ? s.workExperience + ' Years' : '-') + '</div></div>' +
            '</div>';

        var sectionStyle = 'font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)';

        html += '<div class="form-section-title" style="' + sectionStyle + '">Personal Information</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px">';
        html += detailRow('Full Name', fullName);
        html += detailRow('Gender', s.gender);
        html += detailRow('Date of Birth', dobStr);
        html += detailRow('Blood Group', s.bloodGroup);
        html += detailRow('CNIC', s.cnic);
        html += detailRow('Marital Status', s.maritalStatus);
        html += '</div>';

        html += '<div class="form-section-title" style="' + sectionStyle + '">Contact Information</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px">';
        html += detailRow('Phone', s.phone);
        html += detailRow('Secondary Phone', s.secondaryPhone);
        html += detailRow('Email', s.email);
        html += detailRow('Current Address', s.currentAddress);
        html += detailRow('Permanent Address', s.permanentAddress);
        html += '</div>';

        if (s.emergencyContactName) {
            html += '<div class="form-section-title" style="' + sectionStyle + '">Emergency Contact</div>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 16px;margin-bottom:20px">';
            html += detailRow('Name', s.emergencyContactName);
            html += detailRow('Relationship', s.emergencyContactRelationship);
            html += detailRow('Phone', s.emergencyContactPhone);
            html += '</div>';
        }

        html += '<div class="form-section-title" style="' + sectionStyle + '">Employment Details</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px">';
        html += detailRow('Category', s.category);
        html += detailRow('Designation', s.designation);
        html += detailRow('Department', s.department);
        html += detailRow('Shift', s.shift);
        html += detailRow('Employment Type', s.employmentType);
        html += detailRow('Joining Date', joiningStr);
        html += '</div>';

        if (s.qualification || s.certifications || s.specialSkills) {
            html += '<div class="form-section-title" style="' + sectionStyle + '">Qualifications</div>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:20px">';
            html += detailRow('Education Level', s.educationLevel);
            html += detailRow('Qualification', s.qualification);
            html += detailRow('Certifications', s.certifications);
            html += detailRow('Special Skills', s.specialSkills);
            html += detailRow('Registration Authority', s.registrationAuthority);
            html += detailRow('Registration Number', s.registrationNumber);
            html += '</div>';
        }

        if (s.notes) {
            html += '<div class="form-section-title" style="' + sectionStyle + '">Notes</div>';
            html += '<div style="padding:12px;background:var(--color-muted);border-radius:8px;font-size:13px;color:var(--color-muted-foreground);margin-bottom:20px">' + esc(s.notes) + '</div>';
        }

        html += '</div>';

        $('#staffDetailTitle').text(fullName);
        $('#staffDetailBody').html(html);
        $('#staffDetailFooter').html(
            '<button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>' +
            '<div style="display:flex;gap:8px">' +
                '<button class="btn-outline" onclick="openStaffFormGlobal(\'' + esc(s.staffId) + '\')"><i data-lucide="pencil" style="width:14px;height:14px"></i> Edit</button>' +
            '</div>'
        );
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('staffDetailSheet')).show();
    }

    function buildFormHtml(s) {
        s = s || {};
        var h = '';
        var secStyle = 'font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)';

        h += '<div class="form-section-title" style="' + secStyle + '"><i data-lucide="user" style="width:16px;height:16px;margin-right:6px"></i> Basic Information</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">';
        h += formInput('First Name *', 'stfFirstName', s.firstName, 'Enter first name');
        h += formInput('Last Name *', 'stfLastName', s.lastName, 'Enter last name');
        h += formSelect('Gender', 'stfGender', ['Male','Female','Other'], s.gender);
        h += formInput('Date of Birth', 'stfDob', s.dob ? s.dob.substring(0,10) : '', '', 'date');
        h += formInput('CNIC', 'stfCnic', s.cnic, '_____-_______-_');
        h += formSelect('Blood Group', 'stfBloodGroup', bloodGroups, s.bloodGroup);
        h += formSelect('Marital Status', 'stfMaritalStatus', ['Single','Married','Divorced','Widowed'], s.maritalStatus);
        h += '</div>';

        h += '<div class="form-section-title" style="' + secStyle + '"><i data-lucide="phone" style="width:16px;height:16px;margin-right:6px"></i> Contact Information</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
        h += formInput('Primary Phone *', 'stfPhone', s.phone, '03XX-XXXXXXX');
        h += formInput('Secondary Phone', 'stfSecondaryPhone', s.secondaryPhone, '03XX-XXXXXXX');
        h += formInput('Email', 'stfEmail', s.email, 'email@example.com', 'email');
        h += '</div>';
        h += formTextarea('Current Address', 'stfCurrentAddress', s.currentAddress, 'Enter current address');
        h += '<div style="margin:8px 0"><label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="stfSameAddress"> Same as current address</label></div>';
        h += formTextarea('Permanent Address', 'stfPermanentAddress', s.permanentAddress, 'Enter permanent address');
        h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0 24px">';
        h += formInput('Emergency Contact Name', 'stfEmContactName', s.emergencyContactName, 'Contact person name');
        h += formSelect('Relationship', 'stfEmContactRelation', ['Father','Mother','Spouse','Brother','Sister','Son','Daughter','Other'], s.emergencyContactRelationship);
        h += formInput('Emergency Phone', 'stfEmContactPhone', s.emergencyContactPhone, '03XX-XXXXXXX');
        h += '</div>';

        h += '<div class="form-section-title" style="' + secStyle + '"><i data-lucide="briefcase" style="width:16px;height:16px;margin-right:6px"></i> Employment Details</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">';
        h += formSelect('Staff Category *', 'stfCategory', categories, s.category);
        h += '<div class="form-group"><label class="form-label" for="stfDesignation">Designation *</label><select class="form-select" id="stfDesignation" style="height:40px;font-size:14px"><option value="">-- Select Category First --</option></select></div>';
        h += formSelect('Department *', 'stfDepartment', departments, s.department);
        h += formSelect('Shift', 'stfShift', shifts, s.shift);
        h += formSelect('Employment Type', 'stfEmploymentType', employmentTypes, s.employmentType);
        h += formSelect('Status', 'stfEmploymentStatus', statusOptions, s.employmentStatus || 'ACTIVE');
        h += formInput('Joining Date', 'stfJoiningDate', s.joiningDate ? s.joiningDate.substring(0,10) : '', '', 'date');
        h += formInput('Contract End Date', 'stfContractEndDate', s.contractEndDate ? s.contractEndDate.substring(0,10) : '', '', 'date');
        h += '</div>';

        h += '<div class="form-section-title" style="' + secStyle + '"><i data-lucide="graduation-cap" style="width:16px;height:16px;margin-right:6px"></i> Qualifications & Certifications</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
        h += formSelect('Education Level', 'stfEducationLevel', educationLevels, s.educationLevel);
        h += formInput('Qualification / Degree', 'stfQualification', s.qualification, 'e.g. Diploma in Nursing');
        h += formInput('Work Experience (Years)', 'stfWorkExperience', s.workExperience, 'e.g. 5', 'number');
        h += '</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
        h += formInput('Registration Authority', 'stfRegAuthority', s.registrationAuthority, 'e.g. Pakistan Nursing Council');
        h += formInput('Registration Number', 'stfRegNumber', s.registrationNumber, 'Registration #');
        h += '</div>';
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">';
        h += formInput('Certifications', 'stfCertifications', s.certifications, 'e.g. BLS, ACLS, First Aid');
        h += formInput('Special Skills', 'stfSpecialSkills', s.specialSkills, 'e.g. IV Insertion, ECG Operation');
        h += '</div>';

        h += '<div class="form-section-title" style="' + secStyle + '"><i data-lucide="file-text" style="width:16px;height:16px;margin-right:6px"></i> Additional Information</div>';
        h += formTextarea('Notes', 'stfNotes', s.notes, 'Any special notes or comments...');
        h += formTextarea('Internal Notes (Admin Only)', 'stfInternalNotes', s.internalNotes, 'Internal admin notes...');

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

    function openStaffForm(staffId) {
        try { bootstrap.Offcanvas.getInstance(document.getElementById('staffDetailSheet'))?.hide(); } catch(e) {}
        editingStaffId = staffId || null;
        var s = staffId ? staffList.find(function(st) { return st.staffId === staffId; }) : null;
        $('#staffFormTitle').text(s ? 'Edit Staff - ' + s.firstName + ' ' + s.lastName : 'Add New Staff Member');
        $('#btnSaveStaff').html(s ? '<i data-lucide="check"></i> Update Staff' : '<i data-lucide="check"></i> Save & Add Staff');
        $('#staffFormBody').html(buildFormHtml(s || {}));

        if (s && s.category) {
            populateDesignations(s.category, s.designation);
        }

        lucide.createIcons();
        setTimeout(function() {
            new bootstrap.Offcanvas(document.getElementById('staffFormSheet')).show();
        }, 200);
    }
    window.openStaffFormGlobal = function(id) { openStaffForm(id); };

    function populateDesignations(category, selected) {
        var desigs = designationsByCategory[category] || [];
        var sel = $('#stfDesignation');
        sel.html('<option value="">-- Select --</option>');
        desigs.forEach(function(d) {
            sel.append('<option value="' + esc(d) + '"' + (d === selected ? ' selected' : '') + '>' + esc(d) + '</option>');
        });
    }

    $(document).on('change', '#stfCategory', function() {
        populateDesignations($(this).val(), '');
    });

    $(document).on('change', '#stfSameAddress', function() {
        if ($(this).is(':checked')) {
            $('#stfPermanentAddress').val($('#stfCurrentAddress').val());
        }
    });

    $(document).on('click', '#btnAddStaff', function() { openStaffForm(null); });

    $(document).on('click', '#btnSaveStaff', function() {
        var firstName = ($('#stfFirstName').val() || '').trim();
        var lastName = ($('#stfLastName').val() || '').trim();
        var category = $('#stfCategory').val();
        var designation = $('#stfDesignation').val();
        var department = $('#stfDepartment').val();
        if (!firstName) { HMS.toast('First name is required', 'warning'); return; }
        if (!lastName) { HMS.toast('Last name is required', 'warning'); return; }
        if (!category) { HMS.toast('Staff category is required', 'warning'); return; }
        if (!designation) { HMS.toast('Designation is required', 'warning'); return; }
        if (!department) { HMS.toast('Department is required', 'warning'); return; }

        var payload = {
            firstName: firstName,
            lastName: lastName,
            gender: $('#stfGender').val(),
            dob: $('#stfDob').val() || null,
            cnic: $('#stfCnic').val(),
            bloodGroup: $('#stfBloodGroup').val(),
            maritalStatus: $('#stfMaritalStatus').val(),
            phone: $('#stfPhone').val(),
            secondaryPhone: $('#stfSecondaryPhone').val(),
            email: $('#stfEmail').val(),
            currentAddress: $('#stfCurrentAddress').val(),
            permanentAddress: $('#stfPermanentAddress').val(),
            emergencyContactName: $('#stfEmContactName').val(),
            emergencyContactRelationship: $('#stfEmContactRelation').val(),
            emergencyContactPhone: $('#stfEmContactPhone').val(),
            category: category,
            designation: designation,
            department: department,
            shift: $('#stfShift').val(),
            employmentType: $('#stfEmploymentType').val(),
            employmentStatus: $('#stfEmploymentStatus').val() || 'ACTIVE',
            joiningDate: $('#stfJoiningDate').val() || null,
            contractEndDate: $('#stfContractEndDate').val() || null,
            educationLevel: $('#stfEducationLevel').val(),
            qualification: $('#stfQualification').val(),
            registrationAuthority: $('#stfRegAuthority').val(),
            registrationNumber: $('#stfRegNumber').val(),
            certifications: $('#stfCertifications').val(),
            specialSkills: $('#stfSpecialSkills').val(),
            workExperience: $('#stfWorkExperience').val(),
            notes: $('#stfNotes').val(),
            internalNotes: $('#stfInternalNotes').val()
        };

        var btn = $(this);
        btn.prop('disabled', true);

        var url = editingStaffId ? '/api/staff/' + editingStaffId : '/api/staff';
        var method = editingStaffId ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function() {
                bootstrap.Offcanvas.getInstance(document.getElementById('staffFormSheet'))?.hide();
                loadAllData();
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed to save staff member');
            },
            complete: function() {
                btn.prop('disabled', false);
            }
        });
    });

    // ── Toolbar window functions ──────────────────────────────────────────────
    window.toggleSfFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('sfFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnSfFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applySfFilters = function() {
        var statusVal = ($('#sfStatusFilter').val() || '').toLowerCase();
        var catVal    = ($('#sfCatFilter').val()    || '').toLowerCase();
        var deptVal   = ($('#sfDeptFilter').val()   || '').toLowerCase();
        var dfVal     = $('#sfDateFrom').val() || '';
        var dtVal     = $('#sfDateTo').val()   || '';

        sfFiltered = staffList.filter(function(s) {
            if (statusVal && statusVal !== 'all status'      && (s.employmentStatus || '').toLowerCase() !== statusVal) return false;
            if (catVal    && catVal    !== 'all categories'  && (s.category         || '').toLowerCase() !== catVal)    return false;
            if (deptVal   && deptVal   !== 'all departments' && (s.department        || '').toLowerCase() !== deptVal)  return false;
            if (dfVal && s.joiningDate && s.joiningDate.substring(0, 10) < dfVal) return false;
            if (dtVal && s.joiningDate && s.joiningDate.substring(0, 10) > dtVal) return false;
            return true;
        });

        var count = 0;
        if (statusVal && statusVal !== 'all status')      count++;
        if (catVal    && catVal    !== 'all categories')  count++;
        if (deptVal   && deptVal   !== 'all departments') count++;
        if (dfVal) count++;
        if (dtVal) count++;
        var badge = document.getElementById('sfFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }

        sfCurrentPage = 1;
        renderTable();
        toggleSfFilter();
    };

    window.resetSfFilters = function() {
        sfFiltered = null; sfCurrentPage = 1;
        ['sfCsStatus','sfCsCategory','sfCsDept'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['sfDpDateFrom','sfDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('sfFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        renderTable();
    };

    window.toggleSfRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('sfRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setSfRowsPer = function(n) {
        sfPerPageVal = n; sfCurrentPage = 1;
        var m = document.getElementById('sfRowsMenu'); if (m) m.classList.remove('open');
        renderTable();
    };

    window.toggleSfColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('sfColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.sfColVisSelectAll = function() {
        $('#sfColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applySfColVis = function() {
        var m = document.getElementById('sfColVisMenu'); if (m) m.classList.remove('open');
        $('#sfColVisList input[type=checkbox]').each(function() {
            var col  = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#staffTable thead tr th:eq(' + col + ')').toggle(show);
            $('#staffTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleSfExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('sfExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportSf = function(type) {
        var m = document.getElementById('sfExportMenu'); if (m) m.classList.remove('open');
        var source = sfFiltered !== null ? sfFiltered : staffList;
        if (type === 'csv') {
            var hdrs = ['Staff ID','First Name','Last Name','Category','Designation','Department','Shift','Phone','Status'];
            var rows = source.map(function(s) {
                return [s.staffId||'', s.firstName||'', s.lastName||'', s.category||'', s.designation||'', s.department||'', s.shift||'', s.phone||'', s.employmentStatus||''];
            });
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c+'').replace(/"/g,'""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'staff.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // ── Outside-click handler ─────────────────────────────────────────────────
    $(document).on('click.sfMenus', function(e) {
        if (!$(e.target).closest('#sfRowsMenu, #sfRowsBtn').length)          $('#sfRowsMenu').removeClass('open');
        if (!$(e.target).closest('#sfColVisMenu, .opd-col-vis-wrap').length) $('#sfColVisMenu').removeClass('open');
        if (!$(e.target).closest('#sfExportMenu, .opd-export-wrap').length)  $('#sfExportMenu').removeClass('open');
        if (!$(e.target).closest('.opd-dp-trigger,.opd-dp-popup,.opd-cs-trigger,.opd-cs-popup').length) sfCloseAll();
    });

    // ── Custom date picker & searchable select ────────────────────────────────
    var SF_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var SF_DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function sfCloseAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
    }
    document.addEventListener('click', sfCloseAll);
    window.addEventListener('scroll', function() {
        document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
            if (!p._trigger) return;
            var rect = p._trigger.getBoundingClientRect();
            p.style.top = (rect.bottom + 6) + 'px'; p.style.left = rect.left + 'px';
        });
    }, true);

    function sfInitDp(wrapId) {
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
            var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + SF_MONTHS[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
            SF_DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
            for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= dim; d++) {
                var ds = viewYear + '-' + String(viewMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
                h += '<div class="opd-dp-day' + (selDate === ds ? ' selected' : '') + '" data-date="' + ds + '">' + d + '</div>';
            }
            popup.innerHTML = h + '</div>';
        }
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation(); var isOpen = popup.classList.contains('open'); sfCloseAll();
            if (!isOpen) {
                var rect = triggerEl.getBoundingClientRect();
                popup.style.top=(rect.bottom+6)+'px'; popup.style.left=rect.left+'px'; popup.style.width=rect.width+'px';
                popup._trigger=triggerEl;
                if (popup.parentNode !== document.body) document.body.appendChild(popup);
                render(); popup.classList.add('open'); triggerEl.classList.add('open');
            }
        });
        popup.addEventListener('click', function(e) {
            e.stopPropagation(); var tgt=e.target;
            if (tgt.dataset.a==='p'){if(--viewMonth<0){viewMonth=11;viewYear--;}render();}
            else if(tgt.dataset.a==='n'){if(++viewMonth>11){viewMonth=0;viewYear++;}render();}
            else if(tgt.dataset.date){selDate=tgt.dataset.date;valEl.textContent=selDate;valEl.classList.remove('opd-ph');if(hidden)hidden.value=selDate;sfCloseAll();}
        });
        wrap._reset=function(){selDate=null;viewYear=new Date().getFullYear();viewMonth=new Date().getMonth();valEl.textContent=ph;valEl.classList.add('opd-ph');if(hidden)hidden.value='';};
    }

    function sfInitCs(wrapId) {
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
        var valEl=triggerEl.querySelector('.opd-cs-val'), search=popup.querySelector('.opd-cs-search'), list=popup.querySelector('.opd-cs-list');
        function renderList(q) {
            q=(q||'').toLowerCase();
            var filt=q?options.filter(function(o){return o.toLowerCase().indexOf(q)>-1;}):options;
            if(!filt.length){list.innerHTML='<div class="opd-cs-empty">No options</div>';return;}
            list.innerHTML=filt.map(function(o){return '<div class="opd-cs-option'+(o===selVal?' selected':'')+'" data-v="'+o.replace(/"/g,'&quot;')+'">'+o+'</div>';}).join('');
            list.querySelectorAll('.opd-cs-option').forEach(function(el){
                el.addEventListener('click',function(e){e.stopPropagation();selVal=this.dataset.v;valEl.textContent=selVal;valEl.classList.remove('opd-ph');if(hidden)hidden.value=selVal;sfCloseAll();});
            });
        }
        triggerEl.addEventListener('click',function(e){
            e.stopPropagation();var isOpen=popup.classList.contains('open');sfCloseAll();
            if(!isOpen){
                var rect=triggerEl.getBoundingClientRect();
                popup.style.top=(rect.bottom+6)+'px';popup.style.left=rect.left+'px';popup.style.width=rect.width+'px';
                popup._trigger=triggerEl;
                if(popup.parentNode!==document.body)document.body.appendChild(popup);
                popup.classList.add('open');triggerEl.classList.add('open');search.value='';renderList('');
                setTimeout(function(){search.focus();},40);
            }
        });
        search.addEventListener('input',function(e){e.stopPropagation();renderList(this.value);});
        search.addEventListener('click',function(e){e.stopPropagation();});
        popup.addEventListener('click',function(e){e.stopPropagation();});
        wrap.setOptions=function(opts){options=opts||[];};
        wrap._reset=function(){selVal='';valEl.textContent=ph;valEl.classList.add('opd-ph');if(hidden)hidden.value='';};
    }

    // ── Initialize toolbar components ─────────────────────────────────────────
    ['sfDpDateFrom','sfDpDateTo'].forEach(sfInitDp);
    ['sfCsStatus','sfCsCategory','sfCsDept'].forEach(sfInitCs);

    var stWrap = document.getElementById('sfCsStatus');
    if (stWrap && stWrap.setOptions) stWrap.setOptions(['All Status','ACTIVE','ON_LEAVE','SUSPENDED','TERMINATED','RESIGNED']);
    var catWrap = document.getElementById('sfCsCategory');
    if (catWrap && catWrap.setOptions) catWrap.setOptions(['All Categories'].concat(categories));

    loadAllData();
});
