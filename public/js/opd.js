function showToast(msg, type) {
    var bg = type === 'success' ? '#166534' : type === 'error' ? '#991B1B' : '#1E40AF';
    var icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
    var $t = $('<div style="position:fixed;top:20px;right:20px;z-index:99999;background:' + bg + ';color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn .3s ease"><i data-lucide="' + icon + '" style="width:16px;height:16px"></i> ' + msg + '</div>');
    $('body').append($t);
    lucide.createIcons({ attrs: { class: '' } });
    setTimeout(function() { $t.fadeOut(300, function() { $t.remove(); }); }, 3000);
}

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

    var patients = [];
    var visits = [];
    var bills = [];
    var doctors = [];
    var masterCharges = [];
    var hospitalInfo = { currency: 'PKR' };
    var masterData = {};
    var allVitals = [];
    var consultations = [];
    var activeTab = 'registration';

    /* ── Billing pagination state (inside ready scope) ── */
    var billCurrentPage = 1;
    var billPerPageVal  = 10;

    /* ── Consultation pagination state (inside ready scope) ── */
    var consultCurrentPage = 1;
    var consultPerPageVal  = 10;

    /* ── Vital pagination state (inside ready scope) ── */
    var vitalCurrentPage = 1;
    var vitalPerPageVal  = 12;
    var vitalAllItems    = [];   /* full sorted list, rebuilt on each render */

    var registrationStep = 'phone-search';
    var phoneSearch = '';
    var phoneSearchResults = null;
    var selectedPatientMRN = null;
    var patientForm = { name: '', age: '', gender: 'Male', cnic: '', contactType: 'SELF', guardianName: '', guardianCnic: '', relationshipToPatient: '' };
    var opdVisitTypes = [];
    var opdDepartments = [];
    var vitalFieldsConfig = [];
    var opdFormSections = [];
    var visitForm = { doctorName: '', doctorId: '', department: 'General Medicine', visitType: 'New Patient Visit', referredBy: '', doctorFee: '0' };

    var VITAL_DEFS = {
        temperature:         { jsField: 'temperature',        placeholder: '', step: '0.1' },
        blood_pressure:      { jsField: null,                  placeholder: '', step: ''    },
        heart_rate:          { jsField: 'heartRate',           placeholder: '', step: ''    },
        respiratory_rate:    { jsField: 'respiratoryRate',     placeholder: '', step: ''    },
        sp_o2:               { jsField: 'spO2',                placeholder: '', step: ''    },
        blood_sugar:         { jsField: 'bloodSugar',          placeholder: '', step: ''    },
        weight:              { jsField: 'weight',              placeholder: '', step: '0.1' },
        pain_scale:          { jsField: 'painScale',           placeholder: '', step: ''    },
        height:              { jsField: 'height',              placeholder: '', step: '0.1' },
        temperature_c:       { jsField: 'temperatureC',        placeholder: '', step: '0.1' },
        bmi:                 { jsField: 'bmi',                 placeholder: '', step: '0.1' },
        head_circumference:  { jsField: 'headCircumference',   placeholder: '', step: '0.1' },
        waist_circumference: { jsField: 'waistCircumference',  placeholder: '', step: '0.1' },
        urine_output:        { jsField: 'urineOutput',         placeholder: '', step: '1'   },
        glasgow_coma:        { jsField: 'glasgowComa',         placeholder: '', step: '1'   },
    };
    var selectedOptionalCharges = [];
    var validationErrors = [];

    var selectedVitalVisit = null;
    var vitalForm = { temperature: '', systolic: '', diastolic: '', heartRate: '', spO2: '', respiratoryRate: '', weight: '', bloodSugar: '', painScale: null, notes: '', height: '', temperatureC: '', bmi: '', headCircumference: '', waistCircumference: '', urineOutput: '', glasgowComa: '' };

    var selectedConsultVisit = null;
    var consultActiveSection = 'symptoms';
    var symptomInput = '';
    var symptomsList = [];
    var investigationsList = [];
    var invForm = { type: 'Laboratory', test: '', priority: 'Routine', testCode: '', price: '', dept: '', sample: '' };
    var prescriptionsList = [];
    var rxForm = { medicine: '', strength: '', dose: '', unit: '', route: '', frequency: '', duration: '' };
    var pharmRxConfig = { units: ['mg', 'ml', 'g', 'IU'], routes: ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaler'], frequencies: ['OD', 'BD', 'TDS', 'QID', 'PRN', 'SOS'] };

    function loadPharmRxConfig() {
        $.when(
            $.get('/api/pharmacy-config/rx_unit'),
            $.get('/api/pharmacy-config/rx_route'),
            $.get('/api/pharmacy-config/rx_frequency')
        ).done(function(unitRes, routeRes, freqRes) {
            var units = unitRes[0] || [];
            var routes = routeRes[0] || [];
            var freqs = freqRes[0] || [];
            if (units.length)  pharmRxConfig.units       = units;
            if (routes.length) pharmRxConfig.routes      = routes;
            if (freqs.length)  pharmRxConfig.frequencies = freqs;
            if (!rxForm.unit)      rxForm.unit      = pharmRxConfig.units[0]             || 'mg';
            if (!rxForm.route)     rxForm.route     = pharmRxConfig.routes[0]            || 'Oral';
            if (!rxForm.frequency) rxForm.frequency = (pharmRxConfig.frequencies[0] && pharmRxConfig.frequencies[0].name) ? pharmRxConfig.frequencies[0].name : (pharmRxConfig.frequencies[0] || 'OD');
        });
    }

    function getFreqTimesPerDay(freqName) {
        var f = pharmRxConfig.frequencies.find(function(x) { return (typeof x === 'object' ? x.name : x) === freqName; });
        if (!f) return null;
        var tpd = typeof f === 'object' ? f.timesPerDay : null;
        return (tpd !== null && tpd !== undefined) ? tpd : null;
    }

    function buildRxOptions(items, selected) {
        return (items || []).map(function(v) {
            var name  = typeof v === 'object' ? (v.name || v.label || '') : String(v);
            var label = $('<span>').text(name).html();
            return '<option value="' + label + '"' + (name === selected ? ' selected' : '') + '>' + label + '</option>';
        }).join('');
    }

    function buildFreqOptions(items, selected) {
        return items.map(function(v) {
            var name = (typeof v === 'object') ? v.name : v;
            var fullEsc = $('<span>').text(name).html();
            /* show only the short code before any parenthesis to avoid truncation */
            var short = name.indexOf('(') > -1 ? name.substring(0, name.indexOf('(')).trim() : name;
            var shortEsc = $('<span>').text(short).html();
            return '<option value="' + fullEsc + '" title="' + fullEsc + '"' + (name === selected ? ' selected' : '') + '>' + shortEsc + '</option>';
        }).join('');
    }

    function calcRxTotal(rx) {
        var dose = parseFloat(rx.dose);
        var dur  = parseInt(rx.duration);
        var tpd  = (rx.timesPerDay !== null && rx.timesPerDay !== undefined) ? parseInt(rx.timesPerDay) : null;
        if (isNaN(dose) || isNaN(dur) || dur <= 0 || tpd === null || tpd <= 0) return null;
        return dose * tpd * dur;
    }

    var clinicalNotes = { findings: '', provisionalDiagnosis: '', finalDiagnosis: '', doctorNotes: '' };
    var customSectionData = {};

    var commonSymptoms = [
        'Fever', 'Cough', 'Cold', 'Headache', 'Body Ache', 'Fatigue', 'Nausea', 'Vomiting',
        'Diarrhea', 'Constipation', 'Abdominal Pain', 'Chest Pain', 'Back Pain', 'Joint Pain',
        'Sore Throat', 'Runny Nose', 'Shortness of Breath', 'Dizziness', 'Weakness', 'Weight Loss',
        'Weight Gain', 'Loss of Appetite', 'Excessive Thirst', 'Frequent Urination', 'Burning Urination',
        'Blood in Urine', 'Blood in Stool', 'Skin Rash', 'Itching', 'Swelling', 'Numbness',
        'Tingling', 'Blurred Vision', 'Ear Pain', 'Difficulty Swallowing', 'Heartburn', 'Bloating',
        'Muscle Cramps', 'Night Sweats', 'Insomnia', 'Anxiety', 'Depression', 'Palpitations',
        'Wheezing', 'Sneezing', 'Nasal Congestion', 'Eye Redness', 'Excessive Sweating',
        'Dry Mouth', 'Hair Loss', 'Bruising', 'Bleeding Gums', 'Tooth Pain', 'Neck Pain',
        'Shoulder Pain', 'Knee Pain', 'Hip Pain', 'Ankle Swelling', 'Leg Cramps'
    ];
    var labTestSearchTimer = null;
    var radiologyTests = [
        'X-Ray Chest PA', 'X-Ray Abdomen', 'X-Ray Spine', 'X-Ray Pelvis',
        'X-Ray Knee', 'X-Ray Shoulder', 'X-Ray Hand', 'X-Ray Foot',
        'Ultrasound Abdomen', 'Ultrasound Pelvis', 'Ultrasound KUB', 'Ultrasound Thyroid',
        'CT Scan Brain', 'CT Scan Chest', 'CT Scan Abdomen', 'CT Scan Spine',
        'MRI Brain', 'MRI Spine', 'MRI Knee', 'MRI Shoulder',
        'ECG', 'Echocardiography', 'TMT (Treadmill Test)', 'Holter Monitor',
        'Doppler (Venous)', 'Doppler (Arterial)', 'HRCT Chest', 'Mammography',
        'Bone Densitometry (DEXA)', 'PFT (Pulmonary Function Test)'
    ];
    var pharmacyMedicines = [];
    var pharmacyMedicinesLoaded = false;
    var _pharmMedCallbacks = [];   /* queued callbacks waiting for first load */
    function loadPharmacyMedicines(cb) {
        if (cb) _pharmMedCallbacks.push(cb);
        if (pharmacyMedicinesLoaded) {
            /* already loaded — fire any newly-added callback immediately */
            if (cb) { _pharmMedCallbacks.pop(); cb(pharmacyMedicines); }
            return;
        }
        if (_pharmMedCallbacks.length > 1) return; /* request already in flight */
        $.get('/api/inventory/medicines')
            .done(function(data) {
                pharmacyMedicines = (data || []).map(function(m) {
                    return {
                        id: m.medicineId,
                        name: m.name,
                        generic: m.genericName || '',
                        strength: m.strength || '',
                        form: m.form || '',
                        stock: m.currentStock || 0,
                        unit: m.stockUnit || '',
                        label: m.name + (m.strength ? ' ' + m.strength : '') + (m.form ? ' (' + m.form + ')' : '')
                    };
                });
                pharmacyMedicinesLoaded = true;
                var cbs = _pharmMedCallbacks.splice(0);
                cbs.forEach(function(fn) { fn(pharmacyMedicines); });
            })
            .fail(function() {
                /* reset so the next call retries */
                _pharmMedCallbacks.splice(0);
            });
    }
    loadPharmacyMedicines();
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
        if (status === 'Paid') return '<span class="badge badge-success">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Pending') return '<span class="badge badge-warning">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Active') return '<span class="badge badge-success">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Completed') return '<span class="badge badge-info">' + esc(status).toUpperCase() + '</span>';
        if (status === 'In Progress') return '<span class="badge badge-purple">' + esc(status).toUpperCase() + '</span>';
        return '<span class="badge badge-outline">' + esc(status || 'N/A').toUpperCase() + '</span>';
    }

    // ===== DATA LOADING =====
    function loadAllData() {
        var safeGet = function(url) {
            return $.get(url).then(
                function(data) { return data; },
                function() { return $.Deferred().resolve([]); }
            );
        };
        $.when(
            safeGet('/api/patients'),
            safeGet('/api/opd/visits'),
            safeGet('/api/opd/bills'),
            safeGet('/api/doctors'),
            safeGet('/api/config/hospital-charges/module/OPD'),
            safeGet('/api/config/hospital-info'),
            safeGet('/api/config/master-data'),
            safeGet('/api/opd/vitals'),
            safeGet('/api/opd/consultations'),
            safeGet('/api/opd-config/opd_visit_type'),
            safeGet('/api/hr-config/department'),
            safeGet('/api/opd-vital-fields'),
            safeGet('/api/opd-config/opd_symptom'),
            safeGet('/api/opd/form-sections')
        ).done(function(r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14) {
            patients = r1 || [];
            visits = r2 || [];
            bills = r3 || [];
            doctors = (r4 || []).filter(function(d) { return d.status === 'ACTIVE'; });
            if (doctors.length === 0) doctors = getMockDoctors();
            masterCharges = r5 || [];
            if (r6 && !Array.isArray(r6)) { hospitalInfo = $.extend({ currency: 'PKR' }, r6); }
            if (r7 && !Array.isArray(r7)) masterData = r7;
            allVitals = r8 || [];
            consultations = r9 || [];
            if (Array.isArray(r10) && r10.length > 0) opdVisitTypes = r10;
            if (Array.isArray(r11) && r11.length > 0) opdDepartments = r11;
            if (Array.isArray(r12) && r12.length > 0) vitalFieldsConfig = r12;
            if (Array.isArray(r13) && r13.length > 0) commonSymptoms = r13;
            if (Array.isArray(r14) && r14.length > 0) opdFormSections = r14;
            if (opdVisitTypes.length > 0 && !visitForm.visitType) visitForm.visitType = opdVisitTypes[0];
            renderAll();
        });
    }

    function populateRegFilterDropdowns() {
        var mrns = [], names = [], docs = [];
        visits.forEach(function(v) {
            if (v.mrn && mrns.indexOf(v.mrn) === -1) mrns.push(v.mrn);
            if (v.patientName && names.indexOf(v.patientName) === -1) names.push(v.patientName);
            if (v.doctorName && docs.indexOf(v.doctorName) === -1) docs.push(v.doctorName);
        });
        mrns.sort(); names.sort(); docs.sort();
        if (window.setOpdSelectOptions) {
            window.setOpdSelectOptions('csMrn',     mrns);
            window.setOpdSelectOptions('csPatName', names);
            window.setOpdSelectOptions('csDoctor',  docs);
        }

        /* populate department selects from HR configuration */
        var deptSel = document.getElementById('regDeptFilter');
        if (deptSel && opdDepartments.length > 0) {
            var currentVal = deptSel.value;
            deptSel.innerHTML = '<option value="all">Any department</option>';
            opdDepartments.forEach(function(d) {
                var opt = document.createElement('option');
                opt.value = d; opt.textContent = d;
                deptSel.appendChild(opt);
            });
            deptSel.value = currentVal || 'all';
        }
        var billDeptSel = document.getElementById('billDeptFilter');
        if (billDeptSel && opdDepartments.length > 0) {
            var billDeptVal = billDeptSel.value;
            billDeptSel.innerHTML = '<option value="all">Any department</option>';
            opdDepartments.forEach(function(d) {
                var opt = document.createElement('option');
                opt.value = d; opt.textContent = d;
                billDeptSel.appendChild(opt);
            });
            billDeptSel.value = billDeptVal || 'all';
        }

        /* populate billing searchable dropdowns */
        var billMrns = [], billNames = [];
        bills.forEach(function(b) {
            if (b.mrn && billMrns.indexOf(b.mrn) === -1) billMrns.push(b.mrn);
            if (b.patientName && billNames.indexOf(b.patientName) === -1) billNames.push(b.patientName);
        });
        billMrns.sort(); billNames.sort();
        if (window.setOpdSelectOptions) {
            window.setOpdSelectOptions('csBillMrn',     billMrns);
            window.setOpdSelectOptions('csBillPatName', billNames);
        }

        /* populate consult searchable dropdowns */
        if (window.setOpdSelectOptions) {
            window.setOpdSelectOptions('csConsultMrn',     mrns);
            window.setOpdSelectOptions('csConsultPatName', names);
            window.setOpdSelectOptions('csConsultDoctor',  docs);
        }
        var consultDeptSel = document.getElementById('consultDeptFilter');
        if (consultDeptSel && opdDepartments.length > 0) {
            var consultDeptVal = consultDeptSel.value;
            consultDeptSel.innerHTML = '<option value="all">Any department</option>';
            opdDepartments.forEach(function(d) { var o = document.createElement('option'); o.value = d; o.textContent = d; consultDeptSel.appendChild(o); });
            consultDeptSel.value = consultDeptVal || 'all';
        }

        /* populate vital searchable dropdowns */
        if (window.setOpdSelectOptions) {
            window.setOpdSelectOptions('csVitalMrn',     mrns);
            window.setOpdSelectOptions('csVitalPatName', names);
            window.setOpdSelectOptions('csVitalDoctor',  docs);
        }
        var vitalDeptSel = document.getElementById('vitalDeptFilter');
        if (vitalDeptSel && opdDepartments.length > 0) {
            var vitalDeptVal = vitalDeptSel.value;
            vitalDeptSel.innerHTML = '<option value="all">Any department</option>';
            opdDepartments.forEach(function(d) { var o = document.createElement('option'); o.value = d; o.textContent = d; vitalDeptSel.appendChild(o); });
            vitalDeptSel.value = vitalDeptVal || 'all';
        }
    }

    function renderRegistrationStats() {
        var today = new Date(); today.setHours(0, 0, 0, 0);
        var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        var todayVisits = visits.filter(function(v) {
            var d = new Date(v.consultationDate); d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
        var monthVisits = visits.filter(function(v) {
            return new Date(v.consultationDate) >= monthStart;
        });
        var unpaidToday = todayVisits.filter(function(v) {
            return v.paymentStatus !== 'Paid';
        });
        var paidToday = todayVisits.filter(function(v) {
            return v.paymentStatus === 'Paid';
        });

        $('#statRegToday').text(todayVisits.length);
        $('#statRegMonth').text(monthVisits.length);
        $('#statRegUnpaid').text(unpaidToday.length);
        $('#statRegPaid').text(paidToday.length);
    }

    function renderAll() {
        renderRegistrationStats();
        renderRegistrationTable();
        renderBillingTab();
        renderVitalsTab();
        renderConsultationTab();
        populateRegFilterDropdowns();
        lucide.createIcons();
        /* re-apply any saved column visibility after re-render */
        if (typeof applyColVis === 'function') applyColVis();
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
        if (tab === 'billing' && window.renderBillPagination) window.renderBillPagination();
        if (tab === 'consultation' && window.renderConsultPagination) window.renderConsultPagination();
        if (tab === 'vitals' && window.renderVitalPagination) window.renderVitalPagination();
    });

    // ===== TAB 1: REGISTRATION TABLE =====
    function renderRegistrationTable() {
        var search = $('#regSearch').val() ? $('#regSearch').val().toLowerCase() : '';
        var statusFilter = $('#regStatusFilter').val();
        var filtered = visits.filter(function(v) {
            var match = !search || v.patientName.toLowerCase().indexOf(search) > -1 || v.mrn.toLowerCase().indexOf(search) > -1 || v.doctorName.toLowerCase().indexOf(search) > -1;
            var matchStatus = statusFilter === 'all' || (v.paymentStatus || '').toLowerCase() === statusFilter;
            return match && matchStatus;
        });
        filtered.sort(function(a, b) { return new Date(b.consultationDate) - new Date(a.consultationDate); });

        var html = '';
        if (filtered.length === 0) {
            html = '<tr><td colspan="11"><div class="empty-state"><i data-lucide="users"></i><p>No visits found</p><p class="empty-sub">Try adjusting your search</p></div></td></tr>';
        } else {
            filtered.forEach(function(v) {
                var bill = bills.find(function(b) { return b.visitId === v.visitId; });
                var amount = bill ? hospitalInfo.currency + ' ' + Number(bill.totalAmount).toLocaleString() : '-';
                var patient = patients.find(function(p) { return p.mrn === v.mrn; });
                var gender = (patient && patient.gender) ? patient.gender : (v.gender || '-');
                var visitType = v.visitType || '-';
                var referredBy = v.referredBy || '-';
                html += '<tr data-visit-id="' + esc(v.visitId) + '" class="clickable-row reg-row">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(v.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(v.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">Visit #' + esc(v.visitNumber) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(v.department) + '</td>' +
                    '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(v.doctorName) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(visitType) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(gender) + '</td>' +
                    '<td class="text-right font-mono" style="font-size:12px;font-weight:600">' + amount + '</td>' +
                    '<td class="text-center">' + statusBadge(v.paymentStatus) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(referredBy) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + new Date(v.consultationDate).toLocaleString() + '</td>' +
                    '</tr>';
            });
        }
        $('#regTableBody').html(html);
        lucide.createIcons();
    }

    $('#regSearch').on('input', renderRegistrationTable);
    $('#regStatusFilter').on('change', renderRegistrationTable);

    $(document).on('click', '.clickable-row', function() {
        var visitId = $(this).data('visit-id');
        if (!visitId) return;
        if ($(this).hasClass('reg-row')) {
            openRegistrationDetail(visitId);
        } else {
            openBillingDetail(visitId);
        }
    });

    $(document).on('click', '.dropdown-toggle-btn', function(e) {
        e.stopPropagation();
        var parent = $(this).closest('.dropdown-actions');
        var wasOpen = parent.hasClass('open');
        $('.dropdown-actions').removeClass('open');
        if (!wasOpen) parent.addClass('open');
    });
    $(document).on('click', function() { $('.dropdown-actions').removeClass('open'); });

    // ===== TAB 2: BILLING =====
    function renderBillingTab() {
        var pending = bills.filter(function(b) { return b.paymentStatus === 'Pending'; });
        var paid = bills.filter(function(b) { return b.paymentStatus === 'Paid'; });
        var outstanding = pending.reduce(function(s, b) { return s + (Number(b.totalAmount) || 0); }, 0);
        var collected = paid.reduce(function(s, b) { return s + (Number(b.totalAmount) || 0); }, 0);

        $('#statOutstanding').text(outstanding.toLocaleString());
        $('#statCollected').text(collected.toLocaleString());
        $('#statPending').text(pending.length);
        $('#statBillPatients').text(bills.length);

        var search = $('#billSearch').val() ? $('#billSearch').val().toLowerCase() : '';
        var filtered = bills.filter(function(b) {
            return !search || b.patientName.toLowerCase().indexOf(search) > -1 || b.mrn.toLowerCase().indexOf(search) > -1;
        });
        filtered.sort(function(a, b) { return (b.id || 0) - (a.id || 0); });

        var html = '';
        if (filtered.length === 0) {
            html = '<tr><td colspan="12"><div class="empty-state"><i data-lucide="receipt"></i><p>No bills found</p></div></td></tr>';
        } else {
            filtered.forEach(function(b) {
                var balance = (b.totalAmount || 0) - (b.paidAmount || 0);
                var relatedVisit = visits.find(function(v) { return v.visitId === b.visitId; });
                var dept      = relatedVisit ? relatedVisit.department : (b.department || '-');
                var doctor    = relatedVisit ? (relatedVisit.doctorName || '-') : '-';
                var visitType = relatedVisit ? (relatedVisit.visitType  || '-') : '-';
                html += '<tr class="clickable-row" data-visit-id="' + esc(b.visitId) + '">' +
                    '<td class="font-mono" style="font-size:12px;color:var(--midnight-blue)">' + esc(b.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(b.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(b.visitId) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(dept) + '</td>' +
                    '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(doctor) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(visitType) + '</td>' +
                    '<td class="font-mono text-right" style="font-size:12px;font-weight:600">' + hospitalInfo.currency + ' ' + Number(b.totalAmount).toLocaleString() + '</td>' +
                    '<td class="font-mono text-right" style="font-size:12px;color:var(--color-success)">' + hospitalInfo.currency + ' ' + Number(b.paidAmount || 0).toLocaleString() + '</td>' +
                    '<td class="font-mono text-right" style="font-size:12px;font-weight:600;color:' + (balance > 0 ? 'var(--color-destructive)' : 'var(--color-success)') + '">' + hospitalInfo.currency + ' ' + balance.toLocaleString() + '</td>' +
                    '<td>' + statusBadge(b.paymentStatus) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + (relatedVisit && relatedVisit.consultationDate ? new Date(relatedVisit.consultationDate).toLocaleString('en-GB') : '-') + '</td>' +
                    '<td class="text-right">' +
                        (b.paymentStatus === 'Pending' ? '<button class="btn-primary btn-sm" onclick="event.stopPropagation();window.opdMarkPaid(\'' + esc(b.billId) + '\')"><i data-lucide="credit-card" style="width:14px;height:14px"></i> Pay</button>' : '<span style="font-size:11px;color:var(--color-success)"><i data-lucide="check-circle-2" style="width:14px;height:14px"></i></span>') +
                    '</td>' +
                    '</tr>';
            });
        }
        $('#billTableBody').html(html);
        lucide.createIcons();
        renderBillPagination();
    }

    function renderBillPagination() {
        var tbody = document.getElementById('billTableBody');
        var info  = document.getElementById('billPageInfo');
        var nums  = document.getElementById('billPageNums');
        var prev  = document.getElementById('billPrevPage');
        var next  = document.getElementById('billNextPage');
        if (!tbody || !info || !nums) return;

        var allRows = Array.from(tbody.querySelectorAll('tr'));
        /* restore previously pagination-hidden rows (safe: only pagination hides with data-pg-hidden) */
        allRows.forEach(function(r) {
            if (r.getAttribute('data-pg-hidden')) { r.style.display = ''; r.removeAttribute('data-pg-hidden'); }
        });
        var visibleRows = allRows.filter(function(r) { return r.style.display !== 'none'; });
        var total  = visibleRows.length;
        var pages  = Math.max(1, Math.ceil(total / billPerPageVal));
        if (billCurrentPage > pages) billCurrentPage = pages;

        var from = total === 0 ? 0 : (billCurrentPage - 1) * billPerPageVal + 1;
        var to   = Math.min(billCurrentPage * billPerPageVal, total);
        info.textContent = total === 0
            ? 'No results found'
            : 'Showing ' + from + '\u2013' + to + ' of ' + total + ' results';
        /* show only current page rows */
        visibleRows.forEach(function(r, i) {
            if (i < from - 1 || i > to - 1) { r.style.display = 'none'; r.setAttribute('data-pg-hidden', '1'); }
        });

        if (prev) prev.disabled = billCurrentPage <= 1;
        if (next) next.disabled = billCurrentPage >= pages;

        nums.innerHTML = '';
        var range = [];
        for (var p = 1; p <= pages; p++) {
            if (p === 1 || p === pages || (p >= billCurrentPage - 1 && p <= billCurrentPage + 1)) range.push(p);
        }
        var last = 0;
        range.forEach(function(p) {
            if (last && p - last > 1) {
                var dots = document.createElement('span');
                dots.className = 'opd-page-ellipsis';
                dots.textContent = '\u2026';
                nums.appendChild(dots);
            }
            var btn = document.createElement('button');
            btn.className = 'opd-page-num' + (p === billCurrentPage ? ' active' : '');
            btn.textContent = p;
            (function(pg) {
                btn.addEventListener('click', function() { billCurrentPage = pg; renderBillPagination(); });
            })(p);
            nums.appendChild(btn);
            last = p;
        });
        lucide.createIcons();
    }

    /* prev / next / rows-per-page wired up once DOM is ready */
    $('#billPrevPage').on('click', function() {
        if (billCurrentPage > 1) { billCurrentPage--; renderBillPagination(); }
    });
    $('#billNextPage').on('click', function() {
        billCurrentPage++; renderBillPagination();
    });
    $('#billPerPage').on('change', function() {
        billPerPageVal  = parseInt($(this).val(), 10);
        billCurrentPage = 1;
        renderBillPagination();
    });

    /* expose for filter/toolbar functions outside this scope */
    window.renderBillPagination = renderBillPagination;

    $('#billSearch').on('input', renderBillingTab);

    window.opdMarkPaid = function(billId) {
        $.ajax({
            url: '/api/billing/mark-paid',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ billId: billId, module: 'OPD' }),
            success: function() { loadAllData(); },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed to mark as paid'); }
        });
    };

    // ===== TAB 3: VITALS =====
    function renderVitalsTab() {
        var search = $('#vitalSearch').val() ? $('#vitalSearch').val().toLowerCase() : '';

        var visitPatients = visits.filter(function(v) {
            if (!v || !v.visitId) return false;
            if (!search) return true;
            var p = patients.find(function(pt) { return pt.mrn === v.mrn; });
            return (v.mrn || '').toLowerCase().indexOf(search) > -1
                || (v.patientName || '').toLowerCase().indexOf(search) > -1
                || (v.visitId || '').toLowerCase().indexOf(search) > -1
                || (v.doctorName || '').toLowerCase().indexOf(search) > -1
                || (p && p.name.toLowerCase().indexOf(search) > -1);
        }).map(function(v) {
            var p = patients.find(function(pt) { return pt.mrn === v.mrn; });
            var vVitals = allVitals.filter(function(vt) { return vt.visitId === v.visitId; });
            var sortedV = vVitals.slice().sort(function(a, b) { return new Date(b.recordedAt) - new Date(a.recordedAt); });
            var latest = sortedV.length > 0 ? sortedV[0] : null;
            var hasAlert = latest && ((latest.temperature && latest.temperature > 100) || (latest.systolic && latest.systolic > 140) || (latest.spO2 && latest.spO2 < 94));
            return { visit: v, patient: p, latestVital: latest, hasAlert: hasAlert, vitalCount: vVitals.length };
        });

        /* sort: most recent consultationDate first */
        visitPatients.sort(function(a, b) {
            return new Date(b.visit.consultationDate) - new Date(a.visit.consultationDate);
        });

        /* update stat tiles */
        var totalPat   = visitPatients.length;
        var recorded   = visitPatients.filter(function(i) { return i.vitalCount > 0; }).length;
        var pending    = totalPat - recorded;
        var alerts     = visitPatients.filter(function(i) { return i.hasAlert; }).length;
        $('#statVitalTotal').text(totalPat);
        $('#statVitalRecorded').text(recorded);
        $('#statVitalPending').text(pending);
        $('#statVitalAlerts').text(alerts);

        /* store full list for pagination */
        vitalAllItems = visitPatients;
        vitalCurrentPage = 1;
        renderVitalPagination();

    }

    function buildVpcHtml(item) {
        var v = item.visit, p = item.patient;
        var selClass = selectedVitalVisit === v.visitId ? ' selected' : '';
        var dtStr = v.consultationDate ? new Date(v.consultationDate).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';
        var tags = '';
        if (item.hasAlert) tags += '<span class="vpc-tag vpc-tag--red">Alert</span>';
        if (item.latestVital) {
            var lv = item.latestVital;
            if (lv.temperature)              tags += '<span class="vpc-tag vpc-tag--orange">Temp</span>';
            if (lv.systolic || lv.diastolic) tags += '<span class="vpc-tag vpc-tag--blue">BP</span>';
            if (lv.spO2)                     tags += '<span class="vpc-tag vpc-tag--purple">SpO2</span>';
            if (lv.heartRate)                tags += '<span class="vpc-tag vpc-tag--green">HR</span>';
        }
        if (!tags) tags = '<span class="vpc-tag vpc-tag--orange">Pending</span>';
        return '<div class="vpc' + selClass + '" data-vital-visit="' + esc(v.visitId) + '">' +
            '<div class="vpc-head">' +
                '<div class="vpc-name">' + esc(v.patientName || (p ? p.name : '')) + '</div>' +
                '<div class="vpc-sub">' + esc(v.mrn) + ' &bull; ' + esc(v.visitId) + '</div>' +
            '</div>' +
            '<div class="vpc-body">' +
                '<div class="vpc-row">' + esc(v.department || '-') + '</div>' +
                '<div class="vpc-row">' + esc(v.doctorName || '-') + (v.visitType ? ' &bull; ' + esc(v.visitType) : '') + '</div>' +
                '<div class="vpc-row">' + dtStr + '</div>' +
            '</div>' +
            '<div class="vpc-footer"><div class="vpc-tags">' + tags + '</div>' +
                '<span class="vpc-view">View &rsaquo;</span>' +
            '</div>' +
        '</div>';
    }

    function renderVitalPagination() {
        var info  = document.getElementById('vitalPageInfo');
        var nums  = document.getElementById('vitalPageNums');
        var prev  = document.getElementById('vitalPrevPage');
        var next  = document.getElementById('vitalNextPage');
        if (!info || !nums) return;

        var total = vitalAllItems.length;
        var pages = Math.max(1, Math.ceil(total / vitalPerPageVal));
        if (vitalCurrentPage > pages) vitalCurrentPage = pages;

        var from  = total === 0 ? 0 : (vitalCurrentPage - 1) * vitalPerPageVal + 1;
        var to    = Math.min(vitalCurrentPage * vitalPerPageVal, total);
        info.textContent = total === 0 ? 'No patients found' : 'Showing ' + from + '\u2013' + to + ' of ' + total + ' patients';

        if (prev) prev.disabled = vitalCurrentPage <= 1;
        if (next) next.disabled = vitalCurrentPage >= pages;

        /* render page number buttons */
        nums.innerHTML = '';
        var range = [], last2 = 0;
        for (var p = 1; p <= pages; p++) {
            if (p === 1 || p === pages || (p >= vitalCurrentPage - 1 && p <= vitalCurrentPage + 1)) range.push(p);
        }
        range.forEach(function(p) {
            if (last2 && p - last2 > 1) { var d = document.createElement('span'); d.className = 'opd-page-ellipsis'; d.textContent = '\u2026'; nums.appendChild(d); }
            var btn = document.createElement('button');
            btn.className = 'opd-page-num' + (p === vitalCurrentPage ? ' active' : '');
            btn.textContent = p;
            (function(pg) { btn.addEventListener('click', function() { vitalCurrentPage = pg; renderVitalPage(); renderVitalPagination(); }); })(p);
            nums.appendChild(btn);
            last2 = p;
        });

        renderVitalPage();
        lucide.createIcons();
    }

    function renderVitalPage() {
        var start = (vitalCurrentPage - 1) * vitalPerPageVal;
        var slice = vitalAllItems.slice(start, start + vitalPerPageVal);
        var html = '';
        if (vitalAllItems.length === 0) {
            html = '<div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 0">' +
                '<i data-lucide="thermometer" style="width:48px;height:48px;color:var(--color-muted-foreground);opacity:0.3;margin-bottom:16px"></i>' +
                '<p style="font-size:14px;font-weight:500;color:var(--color-muted-foreground)">No OPD patients found</p>' +
                '<p style="font-size:12px;color:var(--color-muted-foreground);opacity:0.7">Register patients in the Registration tab first</p></div>';
        } else {
            slice.forEach(function(item) { html += buildVpcHtml(item); });
        }
        $('#vitalCardsGrid').html(html);
        lucide.createIcons();
    }

    $('#vitalSearch').on('input', renderVitalsTab);

    $(document).on('click', '.vpc', function() {
        var visitId = $(this).data('vital-visit');
        selectedVitalVisit = visitId;
        vitalForm = { temperature: '', systolic: '', diastolic: '', heartRate: '', spO2: '', respiratoryRate: '', weight: '', bloodSugar: '', painScale: null, notes: '', height: '', temperatureC: '', bmi: '', headCircumference: '', waistCircumference: '', urineOutput: '', glasgowComa: '' };
        openVitalSheet();
    });

    // ===== TAB 4: CONSULTATION =====
    function renderConsultationTab() {
        var completedCount = consultations.filter(function(c) { return c.status === 'Completed' || c.finalDiagnosis; }).length;
        var inProgressCount = consultations.filter(function(c) { return c.status === 'In Progress' || (!c.finalDiagnosis && c.symptoms && c.symptoms.length > 0); }).length;
        var pendingCount = Math.max(0, visits.length - consultations.length);

        $('#statTotalConsult').text(consultations.length);
        $('#statInProgress').text(inProgressCount);
        $('#statCompleted').text(completedCount);
        $('#statPendingQueue').text(pendingCount);

        var search = $('#consultSearch').val() ? $('#consultSearch').val().toLowerCase() : '';
        var filtered = visits.filter(function(v) {
            return !search || v.patientName.toLowerCase().indexOf(search) > -1 || v.mrn.toLowerCase().indexOf(search) > -1;
        }).sort(function(a, b) {
            return new Date(b.consultationDate || b.visitDate || 0) - new Date(a.consultationDate || a.visitDate || 0);
        });

        var html = '';
        if (filtered.length === 0) {
            html = '<tr><td colspan="9"><div class="empty-state"><i data-lucide="stethoscope"></i><p>No consultations found</p></div></td></tr>';
        } else {
            filtered.forEach(function(v) {
                var consult = consultations.find(function(c) { return c.visitId === v.visitId; });
                var status = consult ? (consult.finalDiagnosis ? 'Completed' : (consult.symptoms && consult.symptoms.length > 0 ? 'In Progress' : 'Pending')) : 'Pending';
                html += '<tr class="consult-row" data-consult-visit="' + esc(v.visitId) + '">' +
                    '<td class="font-mono" style="font-size:12px;color:var(--midnight-blue)">' + esc(v.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(v.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(v.visitId) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(v.department) + '</td>' +
                    '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(v.doctorName) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(v.visitType || '-') + '</td>' +
                    '<td class="text-center">' + statusBadge(status) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' + (v.consultationDate ? new Date(v.consultationDate).toLocaleString('en-GB') : '-') + '</td>' +
                    '<td class="text-center"><button class="btn-ghost btn-icon"><i data-lucide="arrow-right"></i></button></td>' +
                    '</tr>';
            });
        }
        $('#consultTableBody').html(html);
        lucide.createIcons();
        renderConsultPagination();
    }

    function renderConsultPagination() {
        var tbody = document.getElementById('consultTableBody');
        var info  = document.getElementById('consultPageInfo');
        var nums  = document.getElementById('consultPageNums');
        var prev  = document.getElementById('consultPrevPage');
        var next  = document.getElementById('consultNextPage');
        if (!tbody || !info || !nums) return;

        var allRows = Array.from(tbody.querySelectorAll('tr'));
        /* restore previously pagination-hidden rows */
        allRows.forEach(function(r) {
            if (r.getAttribute('data-pg-hidden')) { r.style.display = ''; r.removeAttribute('data-pg-hidden'); }
        });
        var visibleRows = allRows.filter(function(r) { return r.style.display !== 'none'; });
        var total  = visibleRows.length;
        var pages  = Math.max(1, Math.ceil(total / consultPerPageVal));
        if (consultCurrentPage > pages) consultCurrentPage = pages;

        var from = total === 0 ? 0 : (consultCurrentPage - 1) * consultPerPageVal + 1;
        var to   = Math.min(consultCurrentPage * consultPerPageVal, total);
        info.textContent = total === 0
            ? 'No results found'
            : 'Showing ' + from + '\u2013' + to + ' of ' + total + ' results';
        /* show only current page rows */
        visibleRows.forEach(function(r, i) {
            if (i < from - 1 || i > to - 1) { r.style.display = 'none'; r.setAttribute('data-pg-hidden', '1'); }
        });

        if (prev) prev.disabled = consultCurrentPage <= 1;
        if (next) next.disabled = consultCurrentPage >= pages;

        nums.innerHTML = '';
        var range = [];
        for (var p = 1; p <= pages; p++) {
            if (p === 1 || p === pages || (p >= consultCurrentPage - 1 && p <= consultCurrentPage + 1)) range.push(p);
        }
        var last = 0;
        range.forEach(function(p) {
            if (last && p - last > 1) {
                var dots = document.createElement('span');
                dots.className = 'opd-page-ellipsis';
                dots.textContent = '\u2026';
                nums.appendChild(dots);
            }
            var btn = document.createElement('button');
            btn.className = 'opd-page-num' + (p === consultCurrentPage ? ' active' : '');
            btn.textContent = p;
            (function(pg) {
                btn.addEventListener('click', function() { consultCurrentPage = pg; renderConsultPagination(); });
            })(p);
            nums.appendChild(btn);
            last = p;
        });
        lucide.createIcons();
    }

    $('#consultPrevPage').on('click', function() {
        if (consultCurrentPage > 1) { consultCurrentPage--; renderConsultPagination(); }
    });
    $('#consultNextPage').on('click', function() {
        consultCurrentPage++; renderConsultPagination();
    });
    $('#consultPerPage').on('change', function() {
        consultPerPageVal  = parseInt($(this).val(), 10);
        consultCurrentPage = 1;
        renderConsultPagination();
    });

    window.renderConsultPagination = renderConsultPagination;

    /* ── Vital pagination controls ── */
    $('#vitalPrevPage').on('click', function() {
        if (vitalCurrentPage > 1) { vitalCurrentPage--; renderVitalPage(); renderVitalPagination(); }
    });
    $('#vitalNextPage').on('click', function() {
        vitalCurrentPage++; renderVitalPage(); renderVitalPagination();
    });
    $('#vitalPerPage').on('change', function() {
        vitalPerPageVal  = parseInt($(this).val(), 10);
        vitalCurrentPage = 1;
        renderVitalPagination();
    });
    window.renderVitalPagination = renderVitalPagination;
    window.renderVitalPaginationFiltered = function(filtered) {
        vitalAllItems = filtered;
        vitalCurrentPage = 1;
        renderVitalPagination();
    };
    /* expose state refs so toolbar functions can read them */
    Object.defineProperty(window, 'vitalAllItems',    { get: function() { return vitalAllItems; },    set: function(v) { vitalAllItems = v; } });
    Object.defineProperty(window, 'vitalCurrentPage', { get: function() { return vitalCurrentPage; }, set: function(v) { vitalCurrentPage = v; } });
    Object.defineProperty(window, 'vitalPerPageVal',  { get: function() { return vitalPerPageVal; },  set: function(v) { vitalPerPageVal = v; } });

    $('#consultSearch').on('input', renderConsultationTab);

    $(document).on('click', '.consult-row', function() {
        var visitId = $(this).data('consult-visit');
        openConsultSheet(visitId);
    });

    // ===== REGISTRATION SHEET =====
    $('#btnNewRegistration').on('click', function() {
        resetRegistration();
        renderRegistrationSheet();
        new bootstrap.Offcanvas(document.getElementById('registrationSheet')).show();
    });

    function resetRegistration() {
        registrationStep = 'phone-search';
        phoneSearch = '';
        phoneSearchResults = null;
        selectedPatientMRN = null;
        patientForm = { name: '', age: '', gender: 'Male', cnic: '', contactType: 'SELF', guardianName: '', guardianCnic: '', relationshipToPatient: '' };
        visitForm = { doctorName: '', doctorId: '', department: 'General Medicine', visitType: 'New Patient Visit', referredBy: '', doctorFee: '0' };
        selectedOptionalCharges = [];
        validationErrors = [];
    }

    function renderRegistrationSheet() {
        var titleMap = { 'phone-search': 'New Patient Registration', 'phone-results': 'Search Results', 'new-patient': 'New Patient Details', 'visit-details': 'Visit Details' };
        $('#regSheetTitle').html('<i data-lucide="user-plus"></i> ' + titleMap[registrationStep]);

        var body = '';
        var footer = '';

        if (registrationStep === 'phone-search') {
            body = renderValidationErrors() +
                '<div style="background:#EFF6FF;border:1px solid #DBEAFE;padding:16px;border-radius:8px;margin-bottom:24px">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><i data-lucide="phone" style="width:16px;height:16px;color:#2563EB"></i><p style="font-size:14px;font-weight:600;color:#1E40AF;margin:0">Phone-First Registration</p></div>' +
                    '<p style="font-size:12px;color:#2563EB;margin:0">Enter the patient\'s phone number to check for existing records before creating a new registration.</p>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>MOBILE NUMBER <span style="color:var(--color-destructive)">*</span></label>' +
                    '<input type="text" class="form-control" id="phoneSearchInput" placeholder="Enter phone number" value="' + esc(phoneSearch) + '">' +
                '</div>';
            footer = '<button class="btn-primary" id="btnPhoneSearch"><i data-lucide="search"></i> Search Patient</button>';
        } else if (registrationStep === 'phone-results' && phoneSearchResults) {
            body = '<div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--color-muted-foreground);margin-bottom:24px"><i data-lucide="phone" style="width:16px;height:16px"></i> Results for: <span style="font-family:monospace;font-weight:600;color:var(--color-foreground)">' + esc(phoneSearchResults.phone) + '</span></div>';

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
            footer = '<button class="btn-outline" id="btnBackToPhone"><i data-lucide="arrow-left"></i> Back</button>' +
                '<button class="btn-primary" id="btnNewPatient"><i data-lucide="user-plus"></i> Register New Patient</button>';
        } else if (registrationStep === 'new-patient') {
            body = renderValidationErrors() +
                '<div style="margin-bottom:24px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px">Patient Information</h4>' +
                '<div class="form-grid" style="gap:16px">' +
                    '<div class="form-group"><label>FULL NAME <span style="color:var(--color-destructive)">*</span></label><input type="text" class="form-control" id="patName" placeholder="Patient Name" value="' + esc(patientForm.name) + '"></div>' +
                    '<div class="form-grid form-grid-2">' +
                        '<div class="form-group"><label>AGE (YEARS) <span style="color:var(--color-destructive)">*</span></label><input type="number" class="form-control" id="patAge" placeholder="YY" value="' + esc(patientForm.age) + '"></div>' +
                        '<div class="form-group"><label>GENDER <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="patGender"><option value="Male"' + (patientForm.gender === 'Male' ? ' selected' : '') + '>Male</option><option value="Female"' + (patientForm.gender === 'Female' ? ' selected' : '') + '>Female</option><option value="Other"' + (patientForm.gender === 'Other' ? ' selected' : '') + '>Other</option></select></div>' +
                    '</div>' +
                    '<div class="form-group"><label>CNIC / NATIONAL ID</label><input type="text" class="form-control" id="patCnic" placeholder="XXXXX-XXXXXXX-X" value="' + esc(patientForm.cnic) + '"></div>' +
                '</div></div>' +
                '<div style="height:1px;background:var(--color-border);margin-bottom:24px"></div>' +
                '<div style="margin-bottom:24px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px">Contact Type</h4>' +
                '<div style="display:flex;gap:16px;margin-bottom:16px">' +
                    '<label class="contact-type-option' + (patientForm.contactType === 'SELF' ? ' active' : '') + '"><input type="radio" name="contactType" value="SELF"' + (patientForm.contactType === 'SELF' ? ' checked' : '') + ' style="accent-color:var(--aquamint)"> <div><p style="font-size:14px;font-weight:500;margin:0">Self</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Patient owns this phone</p></div></label>' +
                    '<label class="contact-type-option' + (patientForm.contactType === 'GUARDIAN' ? ' active' : '') + '"><input type="radio" name="contactType" value="GUARDIAN"' + (patientForm.contactType === 'GUARDIAN' ? ' checked' : '') + ' style="accent-color:var(--aquamint)"> <div><p style="font-size:14px;font-weight:500;margin:0">Guardian</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Phone belongs to guardian</p></div></label>' +
                '</div>';

            if (patientForm.contactType === 'SELF' && phoneSearchResults && phoneSearchResults.hasSelf) {
                body += '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px;margin-bottom:16px"><p style="font-size:12px;color:var(--color-destructive);display:flex;align-items:center;gap:6px;margin:0"><i data-lucide="alert-triangle" style="width:16px;height:16px"></i> A SELF contact already exists for this phone number. Please choose GUARDIAN instead.</p></div>';
            }

            if (patientForm.contactType === 'GUARDIAN') {
                body += '<div style="border-left:2px solid rgba(127,255,212,0.2);padding-left:16px">' +
                    '<div class="form-grid" style="gap:16px">' +
                        '<div class="form-group"><label>GUARDIAN NAME</label><input type="text" class="form-control" id="guardianName" placeholder="Guardian Name" value="' + esc(patientForm.guardianName) + '"></div>' +
                        '<div class="form-group"><label>GUARDIAN PHONE</label><input type="text" class="form-control" disabled value="' + esc(phoneSearch) + '" style="background:var(--color-muted)"></div>' +
                        '<div class="form-group"><label>GUARDIAN CNIC</label><input type="text" class="form-control" id="guardianCnic" placeholder="XXXXX-XXXXXXX-X" value="' + esc(patientForm.guardianCnic) + '"></div>' +
                        '<div class="form-group"><label>RELATIONSHIP</label><select class="form-select" id="relationship"><option value="">-- Select Relationship --</option>' + relationshipOptions.map(function(r) { return '<option value="' + r + '"' + (patientForm.relationshipToPatient === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></div>' +
                    '</div></div>';
            }
            body += '</div>';
            footer = '<button class="btn-outline" id="btnBackToResults"><i data-lucide="arrow-left"></i> Back</button>' +
                '<button class="btn-primary" id="btnSavePatient">Continue to Visit Details</button>';
        } else if (registrationStep === 'visit-details') {
            var selectedName = getSelectedPatientName();
            var deptList = opdDepartments.length > 0 ? opdDepartments : (masterData.departments || ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology', 'Neurology', 'Psychiatry', 'Gynecology']);
            var deptOptions = deptList.map(function(d) { return '<option value="' + esc(d) + '"' + (visitForm.department === d ? ' selected' : '') + '>' + esc(d) + '</option>'; }).join('');

            body = renderValidationErrors() +
                '<div style="background:#EFF6FF;border:1px solid #DBEAFE;padding:16px;border-radius:8px;margin-bottom:24px">' +
                    '<p style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;margin:0 0 4px">SELECTED PATIENT</p>' +
                    '<h3 style="font-size:18px;font-weight:700;color:var(--midnight-blue);margin:0">' + esc(selectedName) + '</h3>' +
                    '<p style="font-size:12px;color:var(--color-muted-foreground);margin:0">' + esc(selectedPatientMRN || 'GENERATING NEW MRN') + '</p>' +
                '</div>' +
                '<div class="form-grid" style="gap:16px">' +
                    '<div class="form-group"><label>VISIT TYPE <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="visitType">' + opdVisitTypes.map(function(vt) { return '<option value="' + esc(vt) + '"' + (visitForm.visitType === vt ? ' selected' : '') + '>' + esc(vt) + '</option>'; }).join('') + '</select></div>' +
                    '<div class="form-group"><label>DEPARTMENT <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="visitDept">' + deptOptions + '</select></div>' +
                    '<div class="form-group"><label>CONSULTANT DOCTOR <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="visitDoctor"><option value="">-- Select Doctor --</option>' + doctors.map(function(d) { var n = d.firstName + ' ' + d.lastName; return '<option value="' + esc(n) + '" data-doctor-id="' + esc(d.doctorId || d.id) + '"' + (visitForm.doctorName === n ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select></div>' +
                    '<div class="form-group"><label>REFERRED BY</label><input type="text" class="form-control" id="visitReferred" placeholder="Referring source" value="' + esc(visitForm.referredBy) + '"></div>' +
                '</div>' +
                '<div style="margin-top:24px;padding:16px;background:var(--color-muted);border-radius:8px">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:14px;font-weight:600">Doctor Fee</span><span style="font-size:20px;font-weight:700;font-family:monospace;color:var(--midnight-blue)">' + hospitalInfo.currency + ' ' + Number(visitForm.doctorFee).toLocaleString() + '</span></div>' +
                '</div>';
            footer = '<button class="btn-outline" id="btnBackToPatient"><i data-lucide="arrow-left"></i> Back</button>' +
                '<button class="btn-primary" id="btnToCharges">Continue to Charges</button>';
        }

        $('#regSheetBody').html(body);
        $('#regSheetFooter').html(footer);
        lucide.createIcons();
        bindRegistrationEvents();
    }

    function renderValidationErrors() {
        if (validationErrors.length === 0) return '';
        return '<div class="validation-errors"><div class="alert" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:var(--color-destructive)">' + validationErrors.map(function(e) { return '<div>' + esc(e) + '</div>'; }).join('') + '</div></div>';
    }

    function renderPatientResult(p, type) {
        var badgeColor = type === 'SELF' ? 'background:#EFF6FF;color:#1D4ED8;border-color:#BFDBFE' : 'background:#FFF7ED;color:#C2410C;border-color:#FED7AA';
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--color-border);border-radius:8px;margin-bottom:8px;transition:background 0.15s;cursor:pointer" class="patient-result-item" data-mrn="' + esc(p.mrn) + '">' +
            '<div style="display:flex;align-items:center;gap:12px">' +
                '<div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(p.name) + '</div>' +
                '<div><p style="font-size:14px;font-weight:500;margin:0">' + esc(p.name) + '</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0"><span style="font-family:monospace">' + esc(p.mrn) + '</span> &middot; ' + (p.age || '-') + 'Y / ' + (p.gender || '-') + '</p></div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
                '<span class="badge" style="font-size:10px;' + badgeColor + '">' + type + '</span>' +
                '<button class="btn-outline btn-sm select-patient-btn" data-mrn="' + esc(p.mrn) + '">Select Patient</button>' +
            '</div>' +
        '</div>';
    }

    function getSelectedPatientName() {
        if (!selectedPatientMRN) return patientForm.name || 'NEW PATIENT';
        if (phoneSearchResults) {
            var all = (phoneSearchResults.self || []).concat(phoneSearchResults.guardian || []);
            var found = all.find(function(p) { return p.mrn === selectedPatientMRN; });
            if (found) return found.name;
        }
        return patientForm.name || 'NEW PATIENT';
    }

    function bindRegistrationEvents() {
        $('#btnPhoneSearch').off('click').on('click', function() {
            phoneSearch = $('#phoneSearchInput').val().trim();
            if (!phoneSearch) { validationErrors = ['Please enter a phone number']; renderRegistrationSheet(); return; }
            validationErrors = [];
            var btn = $(this);
            btn.prop('disabled', true).html('<i data-lucide="loader-2" style="width:16px;height:16px;animation:spin 1s linear infinite"></i> Searching...');
            $.ajax({
                url: '/api/patients/search-by-phone',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ phone: phoneSearch }),
                success: function(data) {
                    phoneSearchResults = data;
                    registrationStep = 'phone-results';
                    renderRegistrationSheet();
                },
                error: function(xhr) { validationErrors = [xhr.responseJSON?.message || 'Failed to search']; renderRegistrationSheet(); },
                complete: function() { btn.prop('disabled', false); }
            });
        });

        $('#phoneSearchInput').off('keydown').on('keydown', function(e) {
            if (e.key === 'Enter') $('#btnPhoneSearch').click();
        });

        $(document).off('click.selectPatient').on('click.selectPatient', '.select-patient-btn', function(e) {
            e.stopPropagation();
            selectedPatientMRN = $(this).data('mrn');
            validationErrors = [];
            registrationStep = 'visit-details';
            renderRegistrationSheet();
        });

        $('#btnNewPatient').off('click').on('click', function() {
            var hasSelf = phoneSearchResults ? phoneSearchResults.hasSelf : false;
            patientForm.contactType = hasSelf ? 'GUARDIAN' : 'SELF';
            validationErrors = [];
            registrationStep = 'new-patient';
            renderRegistrationSheet();
        });

        $('#btnBackToPhone').off('click').on('click', function() {
            registrationStep = 'phone-search';
            renderRegistrationSheet();
        });

        $('#btnBackToResults').off('click').on('click', function() {
            registrationStep = 'phone-results';
            renderRegistrationSheet();
        });

        $('#btnBackToPatient').off('click').on('click', function() {
            if (selectedPatientMRN && phoneSearchResults) {
                registrationStep = 'phone-results';
            } else {
                registrationStep = 'new-patient';
            }
            renderRegistrationSheet();
        });

        $('input[name="contactType"]').off('change').on('change', function() {
            patientForm.contactType = $(this).val();
            savePatientFormValues();
            renderRegistrationSheet();
        });

        $('#btnSavePatient').off('click').on('click', function() {
            savePatientFormValues();
            var errors = [];
            if (!patientForm.name.trim()) errors.push('Patient Name is required');
            if (!patientForm.age.trim() || isNaN(Number(patientForm.age)) || Number(patientForm.age) <= 0) errors.push('Valid Age is required');
            if (!patientForm.gender) errors.push('Gender is required');
            if (patientForm.contactType === 'SELF' && phoneSearchResults && phoneSearchResults.hasSelf) errors.push('A SELF contact already exists. Please choose GUARDIAN.');
            if (errors.length > 0) { validationErrors = errors; renderRegistrationSheet(); return; }
            validationErrors = [];
            registrationStep = 'visit-details';
            renderRegistrationSheet();
        });

        function lookupDoctorFee() {
            var doctorId = visitForm.doctorId;
            var visitType = visitForm.visitType;
            if (!doctorId || !visitType) { visitForm.doctorFee = '0'; delete visitForm.doctorFeeOverrideAmount; renderRegistrationSheet(); return; }
            $.get('/api/config/doctor-fees/lookup', { doctorId: doctorId, serviceType: 'OPD', visitType: visitType }).done(function(config) {
                visitForm.doctorFee = config && config.fee ? config.fee.toString() : '0';
                delete visitForm.doctorFeeOverrideAmount;
                renderRegistrationSheet();
            }).fail(function() { visitForm.doctorFee = '0'; delete visitForm.doctorFeeOverrideAmount; renderRegistrationSheet(); });
        }

        $('#visitDoctor').off('change').on('change', function() {
            visitForm.doctorName = $(this).val();
            var opt = $(this).find(':selected');
            visitForm.doctorId = opt.data('doctor-id') || '';
            lookupDoctorFee();
        });

        $('#visitType').off('change').on('change', function() {
            visitForm.visitType = $(this).val();
            lookupDoctorFee();
        });

        $('#btnToCharges').off('click').on('click', function() {
            saveVisitFormValues();
            var errors = [];
            if (!visitForm.doctorName) errors.push('Consultant Doctor is required');
            if (!visitForm.department) errors.push('Department is required');
            if (!visitForm.visitType) errors.push('Visit Type is required');
            if (errors.length > 0) { validationErrors = errors; renderRegistrationSheet(); return; }
            validationErrors = [];
            try { var oc = bootstrap.Offcanvas.getInstance(document.getElementById('registrationSheet')); if (oc) oc.hide(); } catch(e) {}
            openChargesSheet();
        });
    }

    function savePatientFormValues() {
        if ($('#patName').length) patientForm.name = $('#patName').val();
        if ($('#patAge').length) patientForm.age = $('#patAge').val();
        if ($('#patGender').length) patientForm.gender = $('#patGender').val();
        if ($('#patCnic').length) patientForm.cnic = $('#patCnic').val();
        if ($('#guardianName').length) patientForm.guardianName = $('#guardianName').val();
        if ($('#guardianCnic').length) patientForm.guardianCnic = $('#guardianCnic').val();
        if ($('#relationship').length) patientForm.relationshipToPatient = $('#relationship').val();
    }

    function saveVisitFormValues() {
        if ($('#visitType').length) visitForm.visitType = $('#visitType').val();
        if ($('#visitDept').length) visitForm.department = $('#visitDept').val();
        if ($('#visitDoctor').length) {
            visitForm.doctorName = $('#visitDoctor').val();
            visitForm.doctorId = $('#visitDoctor').find(':selected').data('doctor-id') || '';
        }
        if ($('#visitReferred').length) visitForm.referredBy = $('#visitReferred').val();
    }

    // ===== CHARGES SHEET =====
    var chargesGrid = [];

    function getActiveOpdCharges() {
        return masterCharges.filter(function(c) { return c.isActive !== false && c.module === 'OPD'; });
    }

    function chargeKey(c) {
        return String(c.chargeId || c.id);
    }

    function buildChargesGrid() {
        chargesGrid = [];
        delete visitForm.doctorFeeOverrideAmount;
        var sr = 1;
        var activeCharges = getActiveOpdCharges();
        activeCharges.filter(function(c) { return c.isMandatory; }).forEach(function(c) {
            chargesGrid.push({ sr: sr++, id: chargeKey(c), name: c.name, qty: 1, discount: 0, unitPrice: Number(c.amount), mandatory: true, type: 'charge' });
        });
        activeCharges.filter(function(c) { return !c.isMandatory && selectedOptionalCharges.indexOf(chargeKey(c)) > -1; }).forEach(function(c) {
            chargesGrid.push({ sr: sr++, id: chargeKey(c), name: c.name, qty: 1, discount: 0, unitPrice: Number(c.amount), mandatory: false, type: 'charge' });
        });
    }

    function calcRowAmount(row) {
        if (row.overrideAmount !== undefined) return Number(row.overrideAmount);
        var subtotal = row.unitPrice * row.qty;
        return Math.max(0, subtotal - Number(row.discount || 0));
    }

    function calcChargesTotal() {
        return chargesGrid.reduce(function(sum, row) { return sum + calcRowAmount(row); }, 0);
    }

    function calcDoctorFeeTotal() {
        if (visitForm.doctorFeeOverrideAmount !== undefined) return Number(visitForm.doctorFeeOverrideAmount);
        var fee = Number(visitForm.doctorFee) || 0;
        var disc = Number(visitForm.doctorFeeDiscount) || 0;
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
                '<td style="width:120px;vertical-align:middle"><input type="number" class="form-control form-control-sm charge-amount" data-idx="' + idx + '" value="' + amt.toFixed(2) + '" min="0" step="0.01" style="text-align:right;font-family:monospace;font-weight:600"></td>' +
                '<td style="text-align:center;vertical-align:middle;width:40px">' + deleteBtn + '</td>' +
                '</tr>';
        });
        return tbody;
    }

    function getAvailableOptionalCharges() {
        var activeCharges = getActiveOpdCharges();
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
        var selectedName = getSelectedPatientName();
        if (!visitForm.doctorFeeDiscount) visitForm.doctorFeeDiscount = 0;
        buildChargesGrid();
        var total = calcGrandTotal();
        var doctorFee = Number(visitForm.doctorFee) || 0;
        var doctorDisc = Number(visitForm.doctorFeeDiscount) || 0;
        var doctorNet = calcDoctorFeeTotal();

        var body = '<div style="display:flex;align-items:center;justify-content:space-between;background:#EFF6FF;border:1px solid #DBEAFE;padding:12px 16px;border-radius:8px;margin-bottom:20px">' +
            '<div><p style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;margin:0">CHARGES BREAKDOWN</p>' +
            '<h3 style="font-size:16px;font-weight:700;color:var(--midnight-blue);margin:0">' + esc(selectedName) + '</h3>' +
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
            '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(visitForm.doctorName || 'Doctor') + ' — ' + esc(visitForm.visitType || 'Visit') + '</div></td>' +
            '<td style="width:80px;vertical-align:middle"><input type="number" class="form-control form-control-sm" value="1" disabled style="text-align:center;font-family:monospace;background:#f1f1f1"></td>' +
            '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm" id="doctorFeeDiscount" value="' + doctorDisc + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
            '<td style="width:120px;vertical-align:middle"><input type="number" class="form-control form-control-sm" id="doctorFeeAmountInput" value="' + doctorNet.toFixed(2) + '" min="0" step="0.01" style="text-align:right;font-family:monospace;font-weight:600"></td>' +
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

        var footer = '<button class="btn-outline" id="btnBackFromCharges">BACK</button><button class="btn-primary" id="btnFinalize">FINALIZE & ISSUE SLIP</button>';

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
            delete chargesGrid[idx].overrideAmount;
            refreshChargesGrid();
        });

        $(document).off('input.chargesDiscount').on('input.chargesDiscount', '.charge-discount', function() {
            var idx = $(this).data('idx');
            var val = parseFloat($(this).val()) || 0;
            if (val < 0) val = 0;
            chargesGrid[idx].discount = val;
            delete chargesGrid[idx].overrideAmount;
            refreshChargesGrid();
        });

        $(document).off('input.chargesAmount').on('input.chargesAmount', '.charge-amount', function() {
            var idx = $(this).data('idx');
            var val = parseFloat($(this).val());
            if (isNaN(val) || val < 0) val = 0;
            chargesGrid[idx].overrideAmount = val;
            var total = calcGrandTotal();
            $('#chargeTotalDisplay').text(hospitalInfo.currency + ' ' + total.toLocaleString());
        });

        $(document).off('input.doctorDiscount').on('input.doctorDiscount', '#doctorFeeDiscount', function() {
            var val = parseFloat($(this).val()) || 0;
            if (val < 0) val = 0;
            visitForm.doctorFeeDiscount = val;
            delete visitForm.doctorFeeOverrideAmount;
            var net = calcDoctorFeeTotal();
            $('#doctorFeeAmountInput').val(net.toFixed(2));
            var total = calcGrandTotal();
            $('#chargeTotalDisplay').text(hospitalInfo.currency + ' ' + total.toLocaleString());
        });

        $(document).off('input.doctorFeeAmt').on('input.doctorFeeAmt', '#doctorFeeAmountInput', function() {
            var val = parseFloat($(this).val());
            if (isNaN(val) || val < 0) val = 0;
            visitForm.doctorFeeOverrideAmount = val;
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
            var activeCharges = getActiveOpdCharges();
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

        $('#btnBackFromCharges').off('click').on('click', function() {
            try { var oc = bootstrap.Offcanvas.getInstance(document.getElementById('chargesSheet')); if (oc) oc.hide(); } catch(e) {}
            registrationStep = 'visit-details';
            renderRegistrationSheet();
            new bootstrap.Offcanvas(document.getElementById('registrationSheet')).show();
        });

        $('#btnFinalize').off('click').on('click', function() {
            var patient    = patients.find(function(p) { return p.mrn === selectedPatientMRN; });
            var patName    = patient ? patient.name : (patientForm.name || selectedPatientMRN);
            var grandTotal = calcGrandTotal();
            showOpdConfirmModal({
                patientName : patName,
                mrn         : selectedPatientMRN || 'Will be auto-assigned',
                doctorName  : visitForm.doctorName,
                department  : visitForm.department,
                visitType   : visitForm.visitType,
                grandTotal  : grandTotal,
                currency    : hospitalInfo.currency
            });
        });
    }

    // ── Registration confirmation modal ─────────────────────────────────────────
    function showOpdConfirmModal(info) {
        $('#opdRegConfirmModal').remove();
        var html =
            '<div class="modal fade" id="opdRegConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:460px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* header */
            '<div style="background:#060740;padding:20px 24px;display:flex;align-items:center;gap:14px">' +
            '<div style="width:44px;height:44px;border-radius:50%;background:rgba(127,255,212,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<i data-lucide="clipboard-check" style="width:22px;height:22px;color:#7FFFD4"></i></div>' +
            '<div><h5 style="margin:0;font-size:17px;font-weight:700;color:#fff">Confirm Registration</h5>' +
            '<p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.6)">Please review the details before finalizing</p></div></div>' +

            /* body */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:16px">' +
            _confirmRow('Patient',     esc(info.patientName), true,  '#2C3E50', '') +
            _confirmRow('MRN',         esc(info.mrn),         true,  '#060740', 'monospace') +
            _confirmRow('Doctor',      esc(info.doctorName),  true,  '#2C3E50', '') +
            _confirmRow('Department',  esc(info.department),  true,  '#2C3E50', '') +
            _confirmRow('Visit Type',  esc(info.visitType),   false, '#2C3E50', '') +
            '</div>' +
            '<div style="background:#060740;border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between">' +
            '<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:.06em">Total Amount</span>' +
            '<span style="font-size:22px;font-weight:800;color:#7FFFD4;font-family:monospace">' + esc(info.currency) + ' ' + info.grandTotal.toLocaleString() + '</span></div>' +
            '</div>' +

            /* footer */
            '<div style="padding:14px 24px 20px;display:flex;gap:10px;justify-content:flex-end">' +
            '<button id="btnOpdCancelConfirm" style="height:40px;padding:0 20px;border:1px solid #DEE2E6;border-radius:8px;background:#fff;font-size:13.5px;font-weight:600;color:#6C757D;cursor:pointer">Cancel</button>' +
            '<button id="btnOpdConfirmFinalize" style="height:40px;padding:0 22px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px">' +
            '<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Finalize</button>' +
            '</div>' +

            '</div></div></div>';
        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('opdRegConfirmModal'), { backdrop: 'static' });
        modal.show();

        $('#btnOpdCancelConfirm').on('click', function() { modal.hide(); });

        $('#btnOpdConfirmFinalize').off('click').on('click', function() {
            var $cb = $(this);
            $cb.prop('disabled', true).html('<i data-lucide="loader-2" style="width:15px;height:15px"></i> Processing...');
            lucide.createIcons();
            var chargeIds = [];
            chargesGrid.forEach(function(row) { if (row.type === 'charge') chargeIds.push(row.id); });
            var payload = {
                doctorName          : visitForm.doctorName,
                department          : visitForm.department,
                visitType           : visitForm.visitType,
                referredBy          : visitForm.referredBy,
                chargeIds           : chargeIds,
                doctorFee           : calcDoctorFeeTotal(),
                consultationCharges : calcChargesTotal()
            };
            if (selectedPatientMRN) {
                payload.mrn = selectedPatientMRN;
            } else {
                payload.newPatient = {
                    name                 : patientForm.name,
                    age                  : Number(patientForm.age),
                    gender               : patientForm.gender,
                    phone                : phoneSearch,
                    cnic                 : patientForm.cnic,
                    contactType          : patientForm.contactType,
                    guardianName         : patientForm.guardianName,
                    guardianPhone        : patientForm.contactType === 'GUARDIAN' ? phoneSearch : '',
                    guardianCnic         : patientForm.guardianCnic,
                    relationshipToPatient: patientForm.relationshipToPatient
                };
            }
            $.ajax({
                url: '/api/opd/visits',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(payload),
                success: function(response) {
                    modal.hide();
                    /* capture slip data BEFORE resetRegistration() clears chargesGrid */
                    var slipCharges    = chargesGrid.slice();
                    var slipPatient    = response.patient || patients.find(function(p) { return p.mrn === selectedPatientMRN; });
                    var slipReferredBy = visitForm.referredBy || 'Self';
                    var slipVisitType  = visitForm.visitType  || 'OPD Visit';
                    var actualMrn      = (response.patient && response.patient.mrn) ? response.patient.mrn : info.mrn;
                    var actualName     = (response.patient && response.patient.name) ? response.patient.name : info.patientName;
                    try { bootstrap.Offcanvas.getInstance(document.getElementById('chargesSheet'))?.hide(); } catch(e) {}
                    try { bootstrap.Offcanvas.getInstance(document.getElementById('registrationSheet'))?.hide(); } catch(e) {}
                    resetRegistration();
                    loadAllData();
                    showOpdSuccessModal({
                        patientName : actualName,
                        mrn         : actualMrn,
                        visitId     : response.visit  ? response.visit.visitId  : '',
                        billId      : response.bill   ? response.bill.billId    : '',
                        doctorName  : info.doctorName,
                        department  : info.department,
                        visitType   : slipVisitType,
                        referredBy  : slipReferredBy,
                        grandTotal  : info.grandTotal,
                        currency    : info.currency,
                        charges     : slipCharges,
                        patient     : slipPatient,
                        visit       : response.visit  || null,
                        bill        : response.bill   || null
                    });
                },
                error: function(xhr) {
                    $cb.prop('disabled', false).html('<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Finalize');
                    lucide.createIcons();
                    showToast((xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message)) || 'Failed to create visit', 'error');
                }
            });
        });

        document.getElementById('opdRegConfirmModal').addEventListener('hidden.bs.modal', function() {
            $('#opdRegConfirmModal').remove();
        });
    }

    function _confirmRow(label, value, border, color, fontFamily) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;' +
            (border ? 'border-bottom:1px solid #E9ECEF;' : '') + '">' +
            '<span style="font-size:11.5px;font-weight:700;color:#6C757D;text-transform:uppercase;letter-spacing:.05em">' + label + '</span>' +
            '<span style="font-size:13.5px;font-weight:600;color:' + color + ';' + (fontFamily ? 'font-family:' + fontFamily + ';' : '') + '">' + value + '</span></div>';
    }

    // ── Registration success modal ───────────────────────────────────────────────
    function showOpdSuccessModal(info) {
        $('#opdRegSuccessModal').remove();
        var html =
            '<div class="modal fade" id="opdRegSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:480px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* success banner */
            '<div style="background:linear-gradient(135deg,#060740 0%,#1a1b7a 100%);padding:36px 24px;text-align:center">' +
            '<div style="width:68px;height:68px;border-radius:50%;background:#7FFFD4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 4px 20px rgba(127,255,212,0.4)">' +
            '<i data-lucide="check" style="width:36px;height:36px;color:#060740"></i></div>' +
            '<h4 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px">Registration Successful!</h4>' +
            '<p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0">Patient has been registered and slip issued</p>' +
            '</div>' +

            /* details */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:16px">' +
            _confirmRow('Patient',    esc(info.patientName), true,  '#2C3E50', '') +
            _confirmRow('MRN',        esc(info.mrn),         true,  '#060740', 'monospace') +
            (info.visitId ? _confirmRow('Visit ID', esc(info.visitId), true,  '#2C3E50', 'monospace') : '') +
            (info.billId  ? _confirmRow('Bill ID',  esc(info.billId),  true,  '#2C3E50', 'monospace') : '') +
            _confirmRow('Doctor',     esc(info.doctorName) + ' &mdash; ' + esc(info.department), false, '#2C3E50', '') +
            '</div>' +
            '<div style="background:#060740;border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">' +
            '<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:.06em">Total Billed</span>' +
            '<span style="font-size:22px;font-weight:800;color:#7FFFD4;font-family:monospace">' + esc(info.currency) + ' ' + info.grandTotal.toLocaleString() + '</span></div>' +

            /* action buttons */
            '<div style="display:flex;gap:10px">' +
            '<button id="btnOpdCloseSuccess" style="flex:1;height:44px;border:1px solid #DEE2E6;border-radius:10px;background:#fff;color:#6C757D;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px">' +
            '<i data-lucide="x" style="width:16px;height:16px"></i> Close</button>' +
            '<button id="btnOpdPrintSlip" style="flex:2;height:44px;border:none;border-radius:10px;background:#060740;color:#7FFFD4;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">' +
            '<i data-lucide="printer" style="width:17px;height:17px"></i> Print Slip</button>' +
            '</div>' +
            '</div>' +

            '</div></div></div>';
        $('body').append(html);
        lucide.createIcons();
        var successModal = new bootstrap.Modal(document.getElementById('opdRegSuccessModal'));
        successModal.show();
        $('#btnOpdCloseSuccess').on('click', function() { successModal.hide(); });
        $('#btnOpdPrintSlip').on('click', function() { printOpdRegistrationSlip(info.visit, info.patient, info.bill); });
        document.getElementById('opdRegSuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#opdRegSuccessModal').remove();
        });
    }

    function _generateOpdRegistrationSlipUnused(info) {
        $.when(
            $.get('/api/hospital-info/settings/letterhead'),
            $.get('/api/hospital-info/settings/footer'),
            $.get('/api/hospital-info/settings/basic')
        ).done(function(lhRes, ftRes, prRes) {
            var lh  = lhRes[0].settings || {};
            var ft  = ftRes[0].settings || {};
            var pr  = prRes[0].settings || {};

            var color    = lh.lh_primary_color || '#003366';
            var font     = lh.lh_header_font   || 'Segoe UI';
            var currency = info.currency || 'PKR';
            var now      = new Date();
            var dateStr  = now.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
            var timeStr  = now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
            var pat      = info.patient || {};
            var phone    = pat.phone || '—';
            var cnic     = pat.cnic  || '—';
            var age      = pat.age   ? pat.age + ' Years' : '—';
            var gender   = pat.gender || '—';

            function e(v) { return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
            function ic(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + e(value) + '</div>'
                     + '</div>';
            }

            // ── Patient info grid (3 rows × 4 cols) ──
            var rows = [
                [[' PATIENT NAME', info.patientName, true], ['MRN', info.mrn, true], ['VISIT ID', 'Visit #' + e(info.visitId), true], ['BILL ID', info.billId, false]],
                [['DOCTOR', info.doctorName, true], ['DEPARTMENT', info.department, true], ['VISIT TYPE', info.visitType || '—', true], ['REFERRED BY', info.referredBy || 'Self', false]],
                [['PHONE NO.', phone, true], ['CNIC', cnic, true], ['AGE', age, true], ['GENDER', gender, false]],
            ];
            var patGrid = '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">'
                        + '<div style="height:3px;background:' + color + '"></div>';
            rows.forEach(function(row, ri) {
                var bg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                patGrid += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < rows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { patGrid += ic(cell[0], cell[1], cell[2], bg); });
                patGrid += '</div>';
            });
            patGrid += '</div>';

            // ── Charges table ──
            var chargesHtml = '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">'
                + '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + color + ';padding:9px 14px">';
            ['S.NO','DESCRIPTION','QTY','RATE','DISC.','NET'].forEach(function(h, i) {
                chargesHtml += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;' + (i > 1 ? 'text-align:right' : '') + '">' + h + '</div>';
            });
            chargesHtml += '</div>';
            var charges = info.charges || [];
            charges.forEach(function(row, i) {
                var qty  = row.qty  || 1;
                var rate = row.unitPrice || 0;
                var disc = row.discount  || 0;
                var net  = row.overrideAmount !== undefined ? Number(row.overrideAmount) : Math.max(0, (rate * qty) - disc);
                var bg   = i % 2 === 1 ? '#f8fafc' : '#fff';
                chargesHtml += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                    + '<div style="font-size:10px;color:#64748b">' + (i + 1) + '</div>'
                    + '<div style="font-size:10px;color:#334155;font-weight:500">' + e(row.name) + (row.mandatory ? ' <span style="font-size:8px;color:#7c3aed;font-weight:700">●</span>' : '') + '</div>'
                    + '<div style="font-size:10px;color:#64748b;text-align:right">' + qty + '</div>'
                    + '<div style="font-size:10px;color:#64748b;text-align:right">' + currency + ' ' + Number(rate).toLocaleString() + '</div>'
                    + '<div style="font-size:10px;color:#64748b;text-align:right">' + (disc > 0 ? currency + ' ' + Number(disc).toLocaleString() : '—') + '</div>'
                    + '<div style="font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + currency + ' ' + Number(net).toLocaleString() + '</div>'
                    + '</div>';
            });
            if (!charges.length) {
                chargesHtml += '<div style="padding:14px;text-align:center;font-size:11px;color:#94a3b8">No charges</div>';
            }
            chargesHtml += '</div>';

            // ── Total bar ──
            var totalBar = '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</div>'
                + '<div style="font-size:16px;font-weight:800;color:#fff;font-family:monospace">' + e(currency) + ' ' + Number(info.grandTotal).toLocaleString() + '</div>'
                + '</div>';

            // ── Signature ──
            var sig = '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                + '<div style="width:200px;text-align:center">'
                + '<div style="height:40px;border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                + '</div></div>';

            // ── Letterhead header ──
            var logoSizes = { small: '44px', medium: '64px', large: '88px' };
            var logoSz    = logoSizes[lh.lh_logo_size] || '64px';
            var logoHtml  = '';
            var logoPath  = pr.logo || pr.basic_logo || '';
            if (logoPath) {
                logoHtml = '<img src="' + logoPath + '" style="width:' + logoSz + ';height:' + logoSz + ';object-fit:contain;border-radius:8px">';
            } else {
                logoHtml = '<div style="width:' + logoSz + ';height:' + logoSz + ';background:' + color + ';border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:800">'
                         + e((pr.basic_name || 'H').charAt(0)) + '</div>';
            }
            var addrParts = [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean);
            var contactParts = [];
            if (lh.lh_show_phone   === '1' && pr.contact_phone)   contactParts.push('<span style="display:inline-flex;align-items:center;gap:4px">&#128222; ' + e(pr.contact_phone) + '</span>');
            if (lh.lh_show_email   === '1' && pr.contact_email)   contactParts.push('<span style="display:inline-flex;align-items:center;gap:4px">&#9993; '   + e(pr.contact_email) + '</span>');
            if (lh.lh_show_website === '1' && pr.contact_website) contactParts.push('<span style="display:inline-flex;align-items:center;gap:4px">&#127760; '  + e(pr.contact_website) + '</span>');

            var header = '<div style="display:flex;align-items:center;gap:16px;padding:16px 24px 12px;font-family:' + e(font) + ',sans-serif">'
                + '<div>' + logoHtml + '</div>'
                + '<div style="flex:1">'
                + (lh.lh_show_name !== '0' ? '<div style="font-size:20px;font-weight:800;color:#1e293b;line-height:1.1">' + e(pr.basic_name || 'Hospital') + '</div>' : '')
                + (lh.lh_show_tagline === '1' && pr.basic_tagline ? '<div style="font-size:11px;color:#64748b;margin-top:2px">' + e(pr.basic_tagline) + '</div>' : '')
                + (addrParts.length ? '<div style="font-size:10px;color:#94a3b8;margin-top:4px">' + e(addrParts.join(', ')) + '</div>' : '')
                + (contactParts.length ? '<div style="font-size:10px;color:#64748b;margin-top:3px;display:flex;gap:14px;flex-wrap:wrap">' + contactParts.join('') + '</div>' : '')
                + '</div></div>'
                + '<div style="height:3px;background:' + color + ';margin-bottom:0"></div>';

            // ── Document title strip ──
            var titleStrip = '<div style="background:' + color + ';padding:8px 24px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">'
                + '<span style="font-size:12px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:1px">OPD REGISTRATION SLIP</span>'
                + '<span style="font-size:10px;color:rgba(255,255,255,0.75)">' + dateStr + ' &nbsp;&#8226;&nbsp; ' + timeStr + '</span>'
                + '</div>';

            // ── Footer ──
            var footerLines = [];
            if (ft.ft_line1) footerLines.push(ft.ft_line1);
            if (ft.ft_line2) footerLines.push(ft.ft_line2);
            if (ft.ft_line3) footerLines.push(ft.ft_line3);
            var footerHtml = '<div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:10px;text-align:center">'
                + footerLines.map(function(l) { return '<div style="font-size:9px;color:#94a3b8">' + e(l) + '</div>'; }).join('')
                + '<div style="font-size:8px;color:#cbd5e1;margin-top:4px">Printed: ' + now.toLocaleString() + '</div>'
                + '</div>';

            // ── Assemble full page ──
            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
                + '<title>OPD Registration Slip — ' + e(info.patientName) + '</title>'
                + '<style>'
                + '* { margin:0; padding:0; box-sizing:border-box; }'
                + 'body { font-family:"' + e(font) + '","Segoe UI",Arial,sans-serif; background:#fff; color:#1e293b; print-color-adjust:exact; -webkit-print-color-adjust:exact; }'
                + '@page { size:A4; margin:10mm; }'
                + '.body-pad { padding:0 24px 24px; }'
                + '.no-print { text-align:center; margin:20px; }'
                + '.no-print button { padding:10px 32px;font-size:14px;font-weight:700;background:' + color + ';color:#fff;border:none;border-radius:8px;cursor:pointer }'
                + '@media print { .no-print { display:none } }'
                + '</style></head><body>'
                + header
                + titleStrip
                + '<div class="body-pad">'
                + patGrid
                + chargesHtml
                + totalBar
                + sig
                + footerHtml
                + '</div>'
                + '<div class="no-print"><button onclick="window.print()">&#128438; Print Slip</button></div>'
                + '</body></html>';

            var win = window.open('', '_blank', 'width=860,height=1100');
            if (win) { win.document.write(html); win.document.close(); }
        }).fail(function() {
            showToast('Failed to load letterhead settings', 'error');
        });
    }

    function _printOpdThermal(visit, patient, bill) {
        var currency    = (typeof hospitalInfo !== 'undefined' && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';
        var now         = new Date();
        var dateStr     = now.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
        var timeStr     = now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

        $.get('/api/hospital-info/settings/basic').done(function(prRes) {
            var pr = prRes.settings || {};
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

            var patientName = patient ? (patient.name || visit.patientName) : visit.patientName;
            var mrn         = visit.mrn        || '—';
            var visitNum    = visit.visitNumber || visit.visitId || '—';
            var billId      = bill  ? (bill.billId || '—') : '—';
            var doctorName  = visit.doctorName  || '—';
            var department  = visit.department  || '—';
            var visitType   = visit.visitType   || '—';
            var referredBy  = visit.referredBy  || 'Self';
            var patPhone    = patient ? (patient.phone || '—') : '—';
            var cnic        = patient ? (patient.cnic  || '—') : '—';
            var age         = patient ? (patient.age   || '—') : '—';
            var gender      = patient ? (patient.gender|| '—') : '—';
            var createdBy   = visit.createdByName || visit.createdBy || bill && (bill.createdByName || bill.createdBy) || 'Staff';

            var doctorFee  = bill ? Number(bill.doctorFee || 0) : 0;
            var chargeLineItems = [];
            var storedConsultThermal = bill ? Number(bill.consultationCharges || 0) : 0;
            if (bill && bill.chargeIds && bill.chargeIds.length > 0) {
                var thermalMasterItems = [];
                bill.chargeIds.forEach(function(cid) {
                    var mc = (typeof masterCharges !== 'undefined') && masterCharges.find(function(m) { return String(m.id) === String(cid) || String(m.chargeId) === String(cid); });
                    if (mc) thermalMasterItems.push({ name: mc.name, amount: Number(mc.amount || 0) });
                });
                var thermalMasterSum = thermalMasterItems.reduce(function(s, c) { return s + c.amount; }, 0);
                if (storedConsultThermal > 0 && Math.abs(thermalMasterSum - storedConsultThermal) > 0.01) {
                    chargeLineItems.push({ name: thermalMasterItems.length === 1 ? thermalMasterItems[0].name : 'Hospital Charges', amount: storedConsultThermal });
                } else {
                    chargeLineItems = thermalMasterItems;
                }
            } else if (storedConsultThermal > 0) {
                chargeLineItems.push({ name: 'Hospital Charges', amount: storedConsultThermal });
            }
            var netTotal = bill ? Number(bill.totalAmount || 0) : (doctorFee + chargeLineItems.reduce(function(s,c){ return s+c.amount; }, 0));

            var thStyle = 'style="font-weight:700;padding:2px 4px;border-bottom:1px dashed #999"';
            var chargeRows = '<tr>'
                + '<th ' + thStyle + ' align="left">Description</th>'
                + '<th ' + thStyle + ' align="center">Qty</th>'
                + '<th ' + thStyle + ' align="right">Disc</th>'
                + '<th ' + thStyle + ' align="right">Net</th>'
                + '<th ' + thStyle + ' align="right">Total</th>'
                + '</tr>';
            if (doctorFee > 0) chargeRows += chargeRow('Doctor Fee', 1, '0', fmt(doctorFee), fmt(doctorFee));
            chargeLineItems.forEach(function(ci) {
                chargeRows += chargeRow(ci.name, 1, '0', fmt(ci.amount), fmt(ci.amount));
            });

            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OPD Slip</title>'
                + '<style>'
                + '* { margin:0; padding:0; box-sizing:border-box; }'
                + 'body { font-family:monospace; font-size:12px; color:#111; background:#fff; width:80mm; margin:0 auto; }'
                + '@page { size:80mm auto; margin:4mm; }'
                + 'table { width:100%; border-collapse:collapse; }'
                + '.divider { border-top:1px dashed #999; margin:6px 0; }'
                + '.center { text-align:center; }'
                + '.no-print { text-align:center; margin:12px 0; }'
                + '.no-print button { padding:6px 20px;font-size:12px;background:#060740;color:#fff;border:none;border-radius:6px;cursor:pointer }'
                + '@media print { .no-print { display:none } }'
                + '</style></head><body>'
                + '<div class="center" style="padding:8px 0 4px">'
                + '<div style="font-size:14px;font-weight:700">' + e(hospName) + '</div>'
                + (phone   ? '<div style="font-size:10px;color:#555">Tel: ' + e(phone) + '</div>' : '')
                + (website ? '<div style="font-size:10px;color:#555">' + e(website) + '</div>' : '')
                + '</div>'
                + '<div class="divider"></div>'
                + '<div class="center" style="font-size:11px;font-weight:700;letter-spacing:1px">OPD REGISTRATION SLIP</div>'
                + '<div class="center" style="font-size:10px;color:#555">' + e(dateStr) + ' | ' + e(timeStr) + '</div>'
                + '<div class="divider"></div>'
                + '<table>'
                + row('Patient',  patientName)
                + row('MRN',      mrn)
                + row('Visit #',  visitNum)
                + row('Bill ID',  billId)
                + row('Doctor',   doctorName)
                + row('Dept',     department)
                + row('Type',     visitType)
                + row('Ref By',   referredBy)
                + row('Phone',    patPhone)
                + row('CNIC',     cnic)
                + row('Age',      age + (gender !== '—' ? ' / ' + gender : ''))
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
            showToast('Failed to load hospital settings', 'error');
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

    function updateChargesTotal() {
        refreshChargesGrid();
    }

    // ===== BILLING DETAIL SHEET =====
    function openBillingDetail(visitId) {
        billingChargeFilter = 'All';
        var visit = visits.find(function(v) { return v.visitId === visitId; });
        if (!visit) return;
        var bill = bills.find(function(b) { return b.visitId === visitId; });

        $.get('/api/patients/' + visit.mrn).done(function(patient) {
            renderBillingDetailContent(visit, patient, bill);
        }).fail(function() {
            var patient = patients.find(function(p) { return p.mrn === visit.mrn; });
            renderBillingDetailContent(visit, patient, bill);
        });
    }

    window.opdViewVisit = function(visitId) { openRegistrationDetail(visitId); };

    // ===== REGISTRATION DETAIL SHEET =====
    function openRegistrationDetail(visitId) {
        var visit = visits.find(function(v) { return v.visitId === visitId; });
        if (!visit) return;
        var bill = bills.find(function(b) { return b.visitId === visitId; });

        $.get('/api/patients/' + visit.mrn).done(function(patient) {
            renderRegistrationDetailContent(visit, patient, bill);
        }).fail(function() {
            var patient = patients.find(function(p) { return p.mrn === visit.mrn; });
            renderRegistrationDetailContent(visit, patient, bill);
        });
    }

    function renderRegistrationDetailContent(visit, patient, bill) {
        var patientName = patient ? patient.name : visit.patientName;
        var mrn = visit.mrn;
        var cnic = patient ? (patient.cnic || patient.nationalId || '-') : '-';
        var phone = patient ? (patient.phone || patient.mobile || '-') : '-';
        var age = patient ? (patient.age || '-') : '-';
        var gender = patient ? (patient.gender || '-') : '-';
        var ageGender = age + (gender !== '-' ? ' / ' + gender : '');
        var regDate = new Date(visit.consultationDate);
        var regDateStr = regDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + regDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        var invoiceRef = bill ? (bill.billId || bill.invoiceNumber || '-') : '-';
        var paymentStatus = bill ? (bill.paymentStatus || 'Pending') : 'Pending';
        var doctorFeeAmount = bill ? Number(bill.doctorFee || 0) : 0;
        var chargeLineItems = [];
        var chargesSubtotal = 0;
        var storedConsultA4 = bill ? Number(bill.consultationCharges || 0) : 0;
        if (bill && bill.chargeIds && bill.chargeIds.length > 0) {
            var a4MasterItems = [];
            bill.chargeIds.forEach(function(cid) {
                var mc = masterCharges.find(function(m) { return String(m.id) === String(cid) || String(m.chargeId) === String(cid); });
                if (mc) a4MasterItems.push({ name: mc.name, amount: Number(mc.amount || 0) });
            });
            var a4MasterSum = a4MasterItems.reduce(function(s, c) { return s + c.amount; }, 0);
            if (storedConsultA4 > 0 && Math.abs(a4MasterSum - storedConsultA4) > 0.01) {
                var a4Name = a4MasterItems.length === 1 ? a4MasterItems[0].name : 'Hospital Charges';
                chargeLineItems.push({ name: a4Name, amount: storedConsultA4 });
                chargesSubtotal = storedConsultA4;
            } else {
                chargeLineItems = a4MasterItems;
                chargesSubtotal = a4MasterSum;
            }
        } else if (storedConsultA4 > 0) {
            chargeLineItems.push({ name: 'Hospital Charges', amount: storedConsultA4 });
            chargesSubtotal = storedConsultA4;
        }
        var netTotal = bill ? Number(bill.totalAmount || 0) : (doctorFeeAmount + chargesSubtotal);
        var currency = hospitalInfo.currency || 'PKR';

        var statusBadgeHtml = '';
        if (paymentStatus === 'Paid') {
            statusBadgeHtml = '<span style="background:#16A34A;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(paymentStatus) + '</span>';
        } else if (paymentStatus === 'Pending') {
            statusBadgeHtml = '<span style="background:#EAB308;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(paymentStatus) + '</span>';
        } else {
            statusBadgeHtml = '<span style="background:#6B7280;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(paymentStatus) + '</span>';
        }

        var visitStatusBadge = '';
        var vs = visit.status || 'Waiting';
        if (vs === 'Completed') {
            visitStatusBadge = '<span style="background:#16A34A;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">Completed</span>';
        } else if (vs === 'In Progress') {
            visitStatusBadge = '<span style="background:#3B82F6;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">In Progress</span>';
        } else {
            visitStatusBadge = '<span style="background:#EAB308;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(vs) + '</span>';
        }

        var body = '' +
            '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px;margin-bottom:20px">' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                    '<i data-lucide="user" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                    '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">Patient Information</span>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px">' +
                    '<div>' +
                        '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">Full Name</div>' +
                        '<div style="font-size:14px;font-weight:400;color:var(--color-foreground)">' + esc(patientName) + '</div>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">Assigned MRN</div>' +
                        '<div><span style="font-size:12px;font-family:monospace;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:3px 10px;border-radius:4px;font-weight:400">' + esc(mrn) + '</span></div>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">National ID / CNIC</div>' +
                        '<div style="font-size:13px;font-weight:400;color:var(--color-foreground)">' + esc(cnic) + '</div>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">Mobile Number</div>' +
                        '<div style="font-size:13px;font-weight:400;color:var(--color-foreground)">' + esc(phone) + '</div>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-size:11px;text-transform:uppercase;color:var(--color-muted-foreground);letter-spacing:0.5px;margin-bottom:4px">Age & Gender</div>' +
                        '<div style="font-size:13px;font-weight:400;color:var(--color-foreground)">' + esc(ageGender) + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
                '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                        '<i data-lucide="clipboard-list" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                        '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">Visit Details</span>' +
                    '</div>' +
                    '<table style="width:100%;font-size:13px;border-collapse:collapse">' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">OPD Visit ID</td><td style="padding:8px 0;text-align:right;font-weight:400;font-family:monospace;color:var(--color-foreground)">#' + esc(visit.visitId) + '</td></tr>' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Department</td><td style="padding:8px 0;text-align:right;font-weight:400;color:var(--color-foreground)">' + esc(visit.department) + '</td></tr>' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Consultant</td><td style="padding:8px 0;text-align:right;font-weight:400;color:var(--color-foreground)">' + esc(visit.doctorName) + '</td></tr>' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Visit Type</td><td style="padding:8px 0;text-align:right;font-weight:400;color:var(--color-foreground)">' + esc(visit.visitType || 'New Consultation') + '</td></tr>' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Reg. Date</td><td style="padding:8px 0;text-align:right;font-weight:400;font-family:monospace;color:var(--color-foreground)">' + regDateStr + '</td></tr>' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Status</td><td style="padding:8px 0;text-align:right">' + visitStatusBadge + '</td></tr>' +
                    '</table>' +
                '</div>' +

                '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                        '<i data-lucide="wallet" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                        '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">Financial Details</span>' +
                    '</div>' +
                    '<table style="width:100%;font-size:14px;border-collapse:collapse">' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Invoice Ref</td><td style="padding:8px 0;text-align:right;font-weight:600;font-family:monospace;color:var(--color-foreground)">' + esc(invoiceRef) + '</td></tr>' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Payment Status</td><td style="padding:8px 0;text-align:right">' + statusBadgeHtml + '</td></tr>' +
                        '<tr><td colspan="2" style="padding:0"><hr style="margin:8px 0;border-color:var(--color-border)"></td></tr>' +
                        '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Doctor Fee</td><td style="padding:8px 0;text-align:right;font-weight:500;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + doctorFeeAmount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) + '</td></tr>' +
                        (chargeLineItems.length > 0 ? chargeLineItems.map(function(ci) {
                            return '<tr><td style="padding:6px 0;color:var(--color-muted-foreground)">' + esc(ci.name) + '</td><td style="padding:6px 0;text-align:right;font-weight:500;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + ci.amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) + '</td></tr>';
                        }).join('') : '') +
                        '<tr><td colspan="2" style="padding:0"><hr style="margin:8px 0;border-color:var(--color-border)"></td></tr>' +
                        '<tr><td style="padding:8px 0;font-weight:700;font-size:13px;text-transform:uppercase;color:var(--color-foreground)">Net Total</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:18px;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + netTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) + '</td></tr>' +
                    '</table>' +
                '</div>' +
            '</div>';

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" data-bs-dismiss="offcanvas">CLOSE</button>' +
            '<button id="btnPrintRegSlip" class="btn-primary" style="display:flex;align-items:center;gap:6px"><i data-lucide="printer" style="width:16px;height:16px"></i> PRINT</button>' +
        '</div>';

        $('#regDetailBody').html(body);
        $('#regDetailFooter').html(footer);
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('regDetailSheet')).show();

        $('#btnPrintRegSlip').off('click').on('click', function() {
            printOpdRegistrationSlip(visit, patient, bill);
        });
    }

    function printOpdRegistrationSlip(visit, patient, bill) {
        var currency = (typeof hospitalInfo !== 'undefined' && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';

        $.when(
            $.get('/api/hospital-info/settings/letterhead'),
            $.get('/api/hospital-info/settings/footer'),
            $.get('/api/hospital-info/settings/basic'),
            $.get('/api/hospital-info/settings/doc_format_opd_registration')
        ).done(function(lhRes, ftRes, prRes, fmtRes) {
            var savedFormat = (fmtRes[0].settings && fmtRes[0].settings['doc_format_opd_registration']) || 'a4';
            if (savedFormat === 'thermal') {
                _printOpdThermal(visit, patient, bill, currency);
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
            // Inline SVG icons — guaranteed to render in print (no font / emoji dependency)
            var svgPhone   = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
            var svgMail    = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
            var svgGlobe   = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/></svg>';
            var contactParts = [];
            if (lh.lh_show_phone   === '1' && pr.contact_phone)   contactParts.push(svgPhone + e(pr.contact_phone));
            if (lh.lh_show_email   === '1' && pr.contact_email)   contactParts.push(svgMail  + e(pr.contact_email));
            if (lh.lh_show_website === '1' && pr.contact_website) contactParts.push(svgGlobe + e(pr.contact_website));

            // ── Patient data from live visit / patient / bill objects ──
            var patientName = patient ? (patient.name || visit.patientName) : (visit.patientName || '-');
            var mrn         = visit.mrn        || '-';
            var visitId     = visit.visitId    || '-';
            var billId      = bill ? (bill.billId || bill.invoiceNumber || '-') : '-';
            var doctorName  = visit.doctorName || '-';
            var department  = visit.department || '-';
            var visitType   = visit.visitType  || 'New Consultation';
            var referredBy  = visit.referredBy || 'Self';
            var phone       = patient ? (patient.phone  || patient.mobile     || '-') : '-';
            var cnic        = patient ? (patient.cnic   || patient.nationalId  || '-') : '-';
            var age         = patient ? (patient.age    || '-') : '-';
            var gender      = patient ? (patient.gender || '-') : '-';

            // ── Bill data ──
            var doctorFee      = bill ? Number(bill.doctorFee || 0) : 0;
            var chargeLineItems = [];
            var storedConsult  = bill ? Number(bill.consultationCharges || 0) : 0;
            if (bill && bill.chargeIds && bill.chargeIds.length > 0) {
                var masterItems = [];
                bill.chargeIds.forEach(function(cid) {
                    var mc = masterCharges.find(function(m) { return String(m.id) === String(cid) || String(m.chargeId) === String(cid); });
                    if (mc) masterItems.push({ name: mc.name, amount: Number(mc.amount || 0) });
                });
                var masterSum = masterItems.reduce(function(s, c) { return s + c.amount; }, 0);
                // If stored amount matches master total, show individual lines; otherwise use stored total
                if (storedConsult > 0 && Math.abs(masterSum - storedConsult) > 0.01) {
                    // User edited amounts — show as single consolidated line
                    if (masterItems.length === 1) {
                        chargeLineItems.push({ name: masterItems[0].name, amount: storedConsult });
                    } else {
                        chargeLineItems.push({ name: 'Hospital Charges', amount: storedConsult });
                    }
                } else {
                    chargeLineItems = masterItems;
                }
            } else if (storedConsult > 0) {
                chargeLineItems.push({ name: 'Hospital Charges', amount: storedConsult });
            }
            var netTotal = bill ? Number(bill.totalAmount || 0)
                                : (doctorFee + chargeLineItems.reduce(function(s, c) { return s + c.amount; }, 0));

            // ── Footer meta ──
            var footerLines = [ft.footer_line1, ft.footer_line2, ft.footer_line3].filter(Boolean);
            var metaParts   = [];
            if (ft.footer_show_page_number === '1') metaParts.push('Page 1 of 1');
            if (ft.footer_show_date        === '1') {
                var _now = new Date();
                metaParts.push('Printed: ' + _now.toLocaleDateString('en-GB') + ', ' + _now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            }
            if (ft.footer_show_disclaimer  === '1') metaParts.push('Confidential \u2014 For medical use only');

            // ── Helpers ──
            function e(v) {
                return (v || '').toString()
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            function fmt(n) {
                return currency + '\u00a0' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            function infoCell(label, val, borderRight, rowBg) {
                return '<td style="padding:7px 12px;background:' + (rowBg || '#fff') + ';'
                     + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + e(label) + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + e(val) + '</div>'
                     + '</td>';
            }

            // ── Logo block ──
            var logoHtml = '';
            if (lh.lh_show_logo !== '0') {
                logoHtml = '<div style="width:' + logoSize + ';height:' + logoSize
                         + ';background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2e8f0;flex-shrink:0">'
                         + (logoPath ? '<img src="' + logoPath + '" style="max-width:100%;max-height:100%;object-fit:contain">' : '<span style="font-size:9px;color:#94a3b8">Logo</span>')
                         + '</div>';
            }

            // ── Charge rows ──
            var chargeRows = '';
            var sno = 1;
            if (doctorFee > 0) {
                var bg0 = '#fff';
                chargeRows += '<tr style="background:' + bg0 + ';border-top:1px solid #f1f5f9">'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b">' + sno + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#334155;font-weight:500">Doctor Fee \u2014 ' + e(doctorName) + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">1</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">' + fmt(doctorFee) + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">\u2014</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + fmt(doctorFee) + '</td>'
                    + '</tr>';
                sno++;
            }
            chargeLineItems.forEach(function(ci) {
                var bg = sno % 2 === 0 ? '#f8fafc' : '#fff';
                chargeRows += '<tr style="background:' + bg + ';border-top:1px solid #f1f5f9">'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b">' + sno + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#334155;font-weight:500">' + e(ci.name) + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">1</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">' + fmt(ci.amount) + '</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#64748b;text-align:right">\u2014</td>'
                    + '<td style="padding:8px 10px;font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + fmt(ci.amount) + '</td>'
                    + '</tr>';
                sno++;
            });
            if (!chargeRows) {
                chargeRows = '<tr><td colspan="6" style="padding:14px 10px;font-size:10px;color:#94a3b8;text-align:center">No charges recorded</td></tr>';
            }

            // ── Full HTML ──
            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
                + '<title>OPD Registration Slip \u2014 ' + e(patientName) + '</title>'
                + '<style>'
                + '* { margin:0; padding:0; box-sizing:border-box; }'
                + 'body { font-family:"SF Pro Text","Segoe UI",Arial,sans-serif; background:#fff; color:#1e293b; }'
                + '@page { size:A4; margin:12mm 12mm 10mm 12mm; }'
                + '@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }'
                + 'table { border-collapse:collapse; width:100%; }'
                + '</style></head><body>'

                // Wrapper
                + '<div style="max-width:740px;margin:0 auto;background:#fff">'

                // Top accent bar
                + '<div style="height:4px;background:' + color + '"></div>'

                // Letterhead
                + '<div style="padding:24px 32px 16px">'
                + '<div style="display:flex;align-items:flex-start;gap:20px">'
                + logoHtml
                + '<div style="flex:1;min-width:0">'
                + (hospName ? '<div style="font-size:17px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;line-height:1.1">' + e(hospName) + '</div>' : '')
                + (tagline  ? '<div style="font-size:11px;color:#64748b;margin-top:4px;font-style:italic">' + e(tagline) + '</div>' : '')
                + (addrParts.length ? '<div style="font-size:10px;color:#475569;margin-top:5px">' + e(addrParts.join(', ')) + '</div>' : '')
                + (contactParts.length ? '<div style="font-size:10px;color:#475569;margin-top:4px;display:flex;gap:14px;flex-wrap:wrap;align-items:center">' + contactParts.map(function(p) { return '<span style="display:inline-flex;align-items:center;gap:2px">' + p + '</span>'; }).join('') + '</div>' : '')
                + '</div>'
                + '</div>'
                + '<div style="margin-top:16px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '</div>'

                // Title strip
                + '<div style="padding:9px 32px;background:' + color + ';display:flex;align-items:center;justify-content:space-between">'
                + '<span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">OPD REGISTRATION SLIP</span>'
                + '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:9px;font-weight:600;padding:2px 9px;border-radius:20px;letter-spacing:0.5px">ORIGINAL</span>'
                + '</div>'

                // Content area
                + '<div style="padding:16px 32px">'

                // Patient info grid
                + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '<table style="table-layout:fixed">'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('PATIENT NAME', patientName, true, '#fff')
                + infoCell('MRN', mrn, true, '#fff')
                + infoCell('VISIT ID', visitId, true, '#fff')
                + infoCell('BILL ID', billId, false, '#fff')
                + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">'
                + infoCell('DOCTOR', doctorName, true, '#f8fafc')
                + infoCell('DEPARTMENT', department, true, '#f8fafc')
                + infoCell('VISIT TYPE', visitType, true, '#f8fafc')
                + infoCell('REFERRED BY', referredBy, false, '#f8fafc')
                + '</tr>'
                + '<tr>'
                + infoCell('PHONE NO.', phone, true, '#fff')
                + infoCell('CNIC', cnic, true, '#fff')
                + infoCell('AGE', (age !== '-' ? age + ' Years' : '-'), true, '#fff')
                + infoCell('GENDER', gender, false, '#fff')
                + '</tr>'
                + '</table>'
                + '</div>'

                // Charges table
                + '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">'
                + '<table style="table-layout:fixed">'
                + '<thead><tr style="background:' + color + '">'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;width:36px;text-align:left">S.NO</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:left">DESCRIPTION</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:50px">QTY</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:100px">RATE</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:60px">DISC.</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:100px">NET</th>'
                + '</tr></thead>'
                + '<tbody>' + chargeRows + '</tbody>'
                + '</table>'
                + '</div>'

                // Total bar
                + '<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 18px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                + '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</span>'
                + '<span style="font-size:16px;font-weight:800;color:#fff">' + fmt(netTotal) + '</span>'
                + '</div>'

                // Signature (right-aligned) — show registeredBy name if available
                + (function() {
                    var regBy = visit.registeredBy || visit.registered_by || '';
                    return '<div style="display:flex;justify-content:flex-end;margin-top:24px">'
                         + '<div style="width:220px;text-align:center">'
                         + (regBy ? '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">' + e(regBy) + '</div>' : '<div style="height:40px"></div>')
                         + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                         + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                         + '</div>'
                         + '</div>';
                })()
                + '</div>' // end content

                // Footer
                + '<div style="margin:0 32px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '<div style="padding:12px 32px;display:flex;justify-content:space-between;align-items:flex-start">'
                + '<div style="font-size:9px;color:#64748b;line-height:1.6">' + footerLines.map(function(l) { return '<div>' + e(l) + '</div>'; }).join('') + '</div>'
                + '<div style="font-size:9px;color:#64748b;text-align:right;line-height:1.6">' + metaParts.map(function(p) { return '<div>' + e(p) + '</div>'; }).join('') + '</div>'
                + '</div>'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '</div>' // end wrapper

                + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>'
                + '</body></html>';

            var w = window.open('', '_blank', 'width=900,height=700');
            if (w) { w.document.write(html); w.document.close(); }
        });
    }

    var billingChargeFilter = 'All';
    var billingAddlChargeFilter = 'All';

    function renderBillingDetailContent(visit, patient, bill) {
        var patientName = patient ? patient.name : visit.patientName;
        var initials = getInitials(patientName);
        var totalAmount = bill ? Number(bill.totalAmount) : 0;
        var paidAmount = bill ? Number(bill.paidAmount || 0) : 0;
        var dueAmount = Math.max(0, totalAmount - paidAmount);
        var visitDate = new Date(visit.consultationDate);

        var correctedFields = bill ? (bill.correctedFields || []) : [];

        var chargeItems = [];
        if (bill) {
            var dfRemoved = correctedFields.some(function(f) { return f.indexOf('doctorFee') >= 0 && f.indexOf('Removed') >= 0; });
            if (dfRemoved) {
                chargeItems.push({ chargeId: 'doctor-fee', date: visitDate, description: 'Consultant Doctor Fee — ' + esc(visit.doctorName), category: 'Doctor Fee', qty: 1, amount: 0, corrected: true, removed: true });
            } else if (Number(bill.doctorFee) > 0) {
                chargeItems.push({ chargeId: 'doctor-fee', date: visitDate, description: 'Consultant Doctor Fee — ' + esc(visit.doctorName), category: 'Doctor Fee', qty: 1, amount: Number(bill.doctorFee), corrected: false, removed: false });
            }
            var storedConsult = Number(bill.consultationCharges || 0);
            if (bill.chargeIds && bill.chargeIds.length > 0) {
                var billMasterItems = [];
                bill.chargeIds.forEach(function(cid) {
                    var mc = masterCharges.find(function(m) { return String(m.id) === String(cid) || String(m.chargeId) === String(cid); });
                    if (mc) billMasterItems.push({ chargeId: String(mc.chargeId || mc.id), name: esc(mc.name), category: mc.category || 'Hospital Charges', amount: Number(mc.amount) });
                });
                var billMasterSum = billMasterItems.reduce(function(s, c) { return s + c.amount; }, 0);
                if (storedConsult > 0 && Math.abs(billMasterSum - storedConsult) > 0.01) {
                    // Amount was overridden at registration — use stored total, preserve name if single charge
                    var dispName = billMasterItems.length === 1 ? billMasterItems[0].name : 'Hospital Charges';
                    var dispCat  = billMasterItems.length === 1 ? billMasterItems[0].category : 'Hospital Charges';
                    var dispId   = billMasterItems.length === 1 ? billMasterItems[0].chargeId : 'consultation';
                    chargeItems.push({ chargeId: dispId, date: visitDate, description: dispName, category: dispCat, qty: 1, amount: storedConsult, corrected: false, removed: false });
                } else {
                    billMasterItems.forEach(function(m) {
                        chargeItems.push({ chargeId: m.chargeId, date: visitDate, description: m.name, category: m.category, qty: 1, amount: m.amount, corrected: false, removed: false });
                    });
                }
            } else if (storedConsult > 0) {
                chargeItems.push({ chargeId: 'consultation', date: visitDate, description: 'Hospital Charges', category: 'Hospital Charges', qty: 1, amount: storedConsult, corrected: false, removed: false });
            }
            correctedFields.forEach(function(f) {
                if (f.indexOf('Removed') < 0) return;
                if (f.indexOf('doctorFee') >= 0) return;
                if (f.indexOf('consultationCharges') >= 0) return;
                var chargeMatch = f.match(/^charge_([^\s]+)/);
                if (chargeMatch) {
                    var removedCid = chargeMatch[1].replace(' (Removed)', '');
                    var alreadyShown = chargeItems.some(function(ci) { return ci.chargeId === removedCid; });
                    if (!alreadyShown) {
                        var mc = masterCharges.find(function(m) { return String(m.id) === removedCid || String(m.chargeId) === removedCid; });
                        var desc = mc ? esc(mc.name) : 'Charge ' + removedCid;
                        var cat = mc ? (mc.category || 'Hospital Charges') : 'Hospital Charges';
                        chargeItems.push({ chargeId: removedCid, date: visitDate, description: desc, category: cat, qty: 1, amount: 0, corrected: true, removed: true });
                    }
                }
            });
            if (chargeItems.length === 0 && totalAmount > 0) {
                chargeItems.push({ chargeId: 'total', date: visitDate, description: 'OPD Visit Charges', category: 'Consultation', qty: 1, amount: totalAmount, corrected: false, removed: false });
            }
        }

        var categories = ['All'];
        chargeItems.forEach(function(ci) {
            if (categories.indexOf(ci.category) === -1) categories.push(ci.category);
        });

        var body = '' +
            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div style="flex:1">' +
                    '<h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                        '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(visit.visitId) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(visit.department) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="text-align:right">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground)">Visit Date</div>' +
                    '<div style="font-size:13px;font-weight:600">' + visitDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>' +
                '</div>' +
            '</div>';

        if (!bill) {
            body += '<div style="background:var(--color-card);padding:40px 24px;border-radius:12px;border:1px solid var(--color-border);text-align:center">' +
                '<i data-lucide="receipt" style="width:48px;height:48px;color:var(--color-muted-foreground);margin-bottom:12px"></i>' +
                '<h4 style="margin:0 0 8px;font-size:16px;font-weight:600;color:var(--color-foreground)">No Billing Record</h4>' +
                '<p style="margin:0;font-size:14px;color:var(--color-muted-foreground)">No bill has been generated for this visit yet.</p>' +
            '</div>';

            var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
                '<button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>' +
                '<div></div>' +
            '</div>';

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
            '</div>' +

            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700">Detailed Charges</h4>' +
                    '<div style="display:flex;gap:6px;align-items:center" id="chargeFilterPills">' +
                        categories.map(function(cat) {
                            var isActive = billingChargeFilter === cat;
                            return '<button class="charge-filter-pill" data-filter="' + cat + '" style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid ' + (isActive ? 'var(--midnight-blue)' : 'var(--color-border)') + ';background:' + (isActive ? 'var(--midnight-blue)' : '#fff') + ';color:' + (isActive ? '#fff' : 'var(--color-muted-foreground)') + ';cursor:pointer">' + cat + '</button>';
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
                    corrBadge = ' <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FFF7ED;color:#ea580c;border:1px solid #FDBA74;margin-left:6px;cursor:pointer" class="correction-badge" title="This item was corrected. Click Correction Log to view details."><i data-lucide="pencil-line" style="width:10px;height:10px"></i> Corrected</span>';
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
            '</table>' +
            '</div>' +

            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border)">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700">Payment Transactions</h4>' +
                    (bill && (dueAmount > 0 || bill.paymentStatus === 'Partial') ? '<button class="btn-primary btn-sm" id="btnAddPayment" style="font-size:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Payment</button>' : '') +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse">' +
                    '<thead><tr style="border-bottom:2px solid var(--color-border)">' +
                        '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Date</th>' +
                        '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Description</th>' +
                        '<th style="text-align:right;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Amount</th>' +
                        '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Mode</th>' +
                        '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-destructive)">Receipt #</th>' +
                    '</tr></thead>' +
                    '<tbody>';

        body += '<tr id="paymentsTbodyPlaceholder"><td colspan="5" style="padding:16px 4px;text-align:center;color:var(--color-muted-foreground);font-size:13px"><span class="spinner-border spinner-border-sm"></span> Loading...</td></tr>';
        body += '</tbody></table></div>';

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
        addlItems.forEach(function(ai) {
            if (addlCategories.indexOf(ai.category) === -1) addlCategories.push(ai.category);
        });

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-top:20px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700">Additional Charges</h4>' +
                    '<div style="display:flex;gap:6px;align-items:center">' +
                        addlCategories.map(function(cat) {
                            var isActive = billingAddlChargeFilter === cat;
                            return '<button class="addl-charge-filter-pill" data-filter="' + cat + '" style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid ' + (isActive ? 'var(--midnight-blue)' : 'var(--color-border)') + ';background:' + (isActive ? 'var(--midnight-blue)' : '#fff') + ';color:' + (isActive ? '#fff' : 'var(--color-muted-foreground)') + ';cursor:pointer">' + cat + '</button>';
                        }).join('') +
                        '<button class="btn-primary btn-sm" id="btnAddAdditionalCharges" style="font-size:12px;margin-left:8px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Charges</button>' +
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
                    addlCorrBadge = ' <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FFF7ED;color:#ea580c;border:1px solid #FDBA74;margin-left:6px;cursor:pointer" class="correction-badge" title="This item was corrected. Click Correction Log to view details."><i data-lucide="pencil-line" style="width:10px;height:10px"></i> Corrected</span>';
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
            '</table>' +
            '</div>';

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>' +
            '<div style="display:flex;gap:8px">' +
                '<button class="btn-outline" id="btnCorrectionLog" style="font-size:13px"><i data-lucide="history" style="width:14px;height:14px"></i> Correction Log</button>' +
                '<button class="btn-outline" id="btnCorrection" style="font-size:13px;border-color:#ea580c;color:#ea580c"><i data-lucide="pencil-line" style="width:14px;height:14px"></i> Correction</button>' +
                '<button class="btn-primary" id="btnGenerateBill" style="font-size:13px"><i data-lucide="file-text" style="width:14px;height:14px"></i> Generate Bill</button>' +
                (bill && bill.paymentStatus === 'Pending' ? '<button class="btn-primary" id="btnMarkPaid" data-bill-id="' + esc(bill.billId) + '" style="font-size:13px"><i data-lucide="credit-card" style="width:14px;height:14px"></i> Mark as Paid</button>' : '') +
            '</div>' +
        '</div>';

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
            allPaymentLookupItems.push({
                chargeId: stableId,
                description: esc(desc),
                category: cat,
                qty: ac.qty || 1,
                amount: Number(ac.net || 0)
            });
        });

        if (bill) {
            $.get('/api/opd/payments/' + encodeURIComponent(bill.billId), function(data) {
                var $placeholder = $('#paymentsTbodyPlaceholder');
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
                                '<td style="padding:10px 4px;font-size:13px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(p.receiptNumber || '-') + '</td>' +
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
                                    var mcLookup = masterCharges.find(function(m) { return String(m.id) === String(cid) || String(m.chargeId) === String(cid); });
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
                                    '<td style="padding:10px 4px;font-size:13px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(p.receiptNumber || '-') + '</td>' +
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
                                '<td style="padding:10px 4px;font-size:13px;font-family:monospace;color:var(--color-muted-foreground)">' + esc(p.receiptNumber || '-') + '</td>' +
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
            }).fail(function() {
                $('#paymentsTbodyPlaceholder').html('<td colspan="5" style="padding:16px 4px;text-align:center;color:var(--color-muted-foreground);font-size:13px">No payments recorded</td>');
            });
        }

        $('#btnMarkPaid').off('click').on('click', function() {
            var billId = $(this).data('bill-id');
            window.opdMarkPaid(billId);
            bootstrap.Offcanvas.getInstance(document.getElementById('billingDetailSheet')).hide();
        });

        $('#btnGenerateBill').off('click').on('click', function() {
            printOpdRegistrationSlip(visit, patient, bill);
        });

        $(document).off('click', '.charge-filter-pill').on('click', '.charge-filter-pill', function() {
            billingChargeFilter = $(this).data('filter');
            renderBillingDetailContent(visit, patient, bill);
        });

        $(document).off('click', '.addl-charge-filter-pill').on('click', '.addl-charge-filter-pill', function() {
            billingAddlChargeFilter = $(this).data('filter');
            renderBillingDetailContent(visit, patient, bill);
        });

        $('#btnAddPayment').off('click').on('click', function() {
            renderAddPaymentView(visit, patient, bill, chargeItems);
        });

        $('#btnAddAdditionalCharges').off('click').on('click', function() {
            renderAddChargesView(visit, patient, bill);
        });

        $('#btnCorrection').off('click').on('click', function() {
            renderCorrectionEditView(visit, patient, bill);
        });

        $('#btnCorrectionLog').off('click').on('click', function() {
            renderCorrectionLogView(visit, patient, bill);
        });
    }

    function renderAddChargesView(visit, patient, bill) {
        var patientName = patient ? patient.name : visit.patientName;
        var initials = getInitials(patientName);
        var addlGrid = [];
        var addlDoctorFees = [];

        function calcAddlTotal() {
            var dt = addlDoctorFees.reduce(function(s, d) {
                var net = Math.max(0, (Number(d.fee) * (d.qty || 1)) - Number(d.discount || 0));
                return s + net;
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
                            '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(visit.visitId) + '</span>' +
                            '<span style="font-size:12px;background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(bill.billId) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div style="text-align:right">' +
                        '<div style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase">ADDITIONAL CHARGES</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground)">Add doctors & charges</div>' +
                    '</div>' +
                '</div>';

            body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700"><i data-lucide="stethoscope" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i> Doctor Fees</h4>' +
                    '<button class="btn btn-sm btn-outline-primary" id="btnAddDoctorRow" style="font-size:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Doctor</button>' +
                '</div>';

            body += '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden;margin-bottom:8px">' +
                '<table class="table table-sm mb-0" style="font-size:13px" id="addlDoctorFeeGrid">' +
                '<thead><tr style="background:var(--midnight-blue);color:#fff">' +
                '<th style="text-align:center;width:50px;padding:10px 8px">Sr#</th>' +
                '<th style="padding:10px 8px">Doctor</th>' +
                '<th style="padding:10px 8px;width:140px">Visit Type</th>' +
                '<th style="text-align:right;width:100px;padding:10px 8px">Fee</th>' +
                '<th style="text-align:right;width:100px;padding:10px 8px">Discount</th>' +
                '<th style="text-align:right;width:100px;padding:10px 8px">Amount</th>' +
                '<th style="width:40px;padding:10px 8px"></th>' +
                '</tr></thead><tbody id="addlDoctorFeeBody">';

            if (addlDoctorFees.length === 0) {
                body += '<tr id="addlDoctorEmpty"><td colspan="7" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No doctor fees added. Click "Add Doctor" to add.</td></tr>';
            } else {
                addlDoctorFees.forEach(function(d, idx) {
                    var net = Math.max(0, (Number(d.fee) * (d.qty || 1)) - Number(d.discount || 0));
                    body += '<tr>' +
                        '<td style="text-align:center;vertical-align:middle">' + (idx + 1) + '</td>' +
                        '<td style="vertical-align:middle"><span style="font-weight:500">' + esc(d.doctorName) + '</span>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(d.department || '') + '</div></td>' +
                        '<td style="vertical-align:middle;font-size:12px">' + esc(d.visitType) + '</td>' +
                        '<td style="text-align:right;vertical-align:middle;font-family:monospace">' + hospitalInfo.currency + ' ' + Number(d.fee).toLocaleString() + '</td>' +
                        '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm addl-doc-discount" data-idx="' + idx + '" value="' + (d.discount || 0) + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
                        '<td style="text-align:right;vertical-align:middle;font-weight:600;font-family:monospace">' + hospitalInfo.currency + ' ' + net.toLocaleString() + '</td>' +
                        '<td style="text-align:center;vertical-align:middle"><button class="btn btn-sm p-0 border-0 addl-doc-delete" data-idx="' + idx + '" title="Remove"><i data-lucide="x-circle" style="width:16px;height:16px;color:#dc3545"></i></button></td>' +
                    '</tr>';
                });
            }
            body += '</tbody></table></div></div>';

            body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700"><i data-lucide="receipt" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i> Hospital Charges</h4>' +
                    '<button class="btn btn-sm btn-outline-primary" id="btnAddChargeRowAddl" style="font-size:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Row</button>' +
                '</div>';

            body += '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden">' +
                '<table class="table table-sm mb-0" style="font-size:13px">' +
                '<thead><tr style="background:var(--midnight-blue);color:#fff">' +
                '<th style="text-align:center;width:50px;padding:10px 8px">Sr#</th>' +
                '<th style="padding:10px 8px">Charges</th>' +
                '<th style="text-align:center;width:80px;padding:10px 8px">QTY</th>' +
                '<th style="text-align:right;width:100px;padding:10px 8px">Discount</th>' +
                '<th style="text-align:right;width:120px;padding:10px 8px">Amount</th>' +
                '<th style="width:40px;padding:10px 8px"></th>' +
                '</tr></thead><tbody id="addlChargesGridBody">';

            if (addlGrid.length === 0) {
                body += '<tr id="addlChargesEmpty"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add.</td></tr>';
            } else {
                addlGrid.forEach(function(row, idx) {
                    var amt = Math.max(0, (row.unitPrice * row.qty) - Number(row.discount || 0));
                    body += '<tr>' +
                        '<td style="text-align:center;vertical-align:middle">' + (idx + 1) + '</td>' +
                        '<td style="vertical-align:middle"><span style="font-weight:500">' + esc(row.name) + '</span>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground);font-family:monospace">@ ' + hospitalInfo.currency + ' ' + Number(row.unitPrice).toLocaleString() + ' each</div></td>' +
                        '<td style="width:80px;vertical-align:middle"><input type="number" class="form-control form-control-sm addl-charge-qty" data-idx="' + idx + '" value="' + row.qty + '" min="1" style="text-align:center;font-family:monospace"></td>' +
                        '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm addl-charge-discount" data-idx="' + idx + '" value="' + (row.discount || 0) + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
                        '<td style="text-align:right;vertical-align:middle;font-weight:600;font-family:monospace;width:120px">' + hospitalInfo.currency + ' ' + amt.toLocaleString() + '</td>' +
                        '<td style="text-align:center;vertical-align:middle"><button class="btn btn-sm p-0 border-0 addl-charge-delete" data-idx="' + idx + '" title="Remove"><i data-lucide="x-circle" style="width:16px;height:16px;color:#dc3545"></i></button></td>' +
                    '</tr>';
                });
            }
            body += '</tbody></table></div></div>';

            var total = calcAddlTotal();
            body += '<div style="background:var(--midnight-blue);padding:16px;border-radius:8px;color:#fff;display:flex;align-items:center;justify-content:space-between">' +
                '<div><p style="font-size:12px;font-weight:500;opacity:0.8;text-transform:uppercase;margin:0">Additional Total</p>' +
                '<p style="font-size:10px;opacity:0.6;margin:0">' + addlDoctorFees.length + ' DOCTOR(S) + ' + addlGrid.length + ' CHARGE(S)</p></div>' +
                '<div style="font-size:24px;font-weight:700;font-family:monospace" id="addlTotalDisplay">' + hospitalInfo.currency + ' ' + total.toLocaleString() + '</div></div>';

            return body;
        }

        function refreshAddChargesView() {
            $('#billingDetailBody').html(renderAddChargesBody());
            lucide.createIcons();
            bindAddChargesEvents();
        }

        function getAvailableAddlCharges() {
            var activeCharges = getActiveOpdCharges();
            var usedIds = addlGrid.map(function(r) { return r.id; });
            return activeCharges.filter(function(c) {
                return usedIds.indexOf(chargeKey(c)) === -1;
            });
        }

        function bindAddChargesEvents() {
            $('#btnAddDoctorRow').off('click').on('click', function() {
                var doctorOpts = '';
                var activeDoctors = doctors.filter(function(d) { return d.status === 'ACTIVE'; });
                activeDoctors.forEach(function(d) {
                    var docName = d.firstName + ' ' + d.lastName;
                    var docIdVal = d.doctorId || d.id;
                    doctorOpts += '<option value="' + esc(docIdVal) + '" data-name="' + esc(docName) + '" data-dept="' + esc(d.department || '') + '">' + esc(docName) + ' — ' + esc(d.department || '') + '</option>';
                });

                var visitTypeOpts = '<option value="">Select type...</option>';
                opdVisitTypes.forEach(function(vt) {
                    visitTypeOpts += '<option value="' + esc(vt) + '">' + esc(vt) + '</option>';
                });

                $('#addlDoctorEmpty').remove();
                if ($('#addlDoctorNewRow').length) return;

                var newRow = '<tr id="addlDoctorNewRow" style="background:#f8f9fa">' +
                    '<td style="text-align:center;vertical-align:middle"><i data-lucide="plus-circle" style="width:16px;height:16px;color:var(--aqua-mint-dark)"></i></td>' +
                    '<td style="vertical-align:middle"><select id="addlDoctorSelect" class="form-select form-select-sm" style="font-size:13px"><option value="">Select doctor...</option>' + doctorOpts + '</select></td>' +
                    '<td style="vertical-align:middle"><select id="addlVisitTypeSelect" class="form-select form-select-sm" style="font-size:12px">' + visitTypeOpts + '</select></td>' +
                    '<td colspan="3" style="vertical-align:middle;text-align:center;font-size:12px;color:var(--color-muted-foreground)" id="addlDocFeeInfo">Select doctor & type to lookup fee</td>' +
                    '<td></td></tr>';
                $('#addlDoctorFeeBody').append(newRow);
                lucide.createIcons();

                function lookupAddlFee() {
                    var docId = $('#addlDoctorSelect').val();
                    var vType = $('#addlVisitTypeSelect').val();
                    if (!docId || !vType) {
                        $('#addlDocFeeInfo').text('Select doctor & type to lookup fee');
                        return;
                    }
                    $('#addlDocFeeInfo').html('<span class="spinner-border spinner-border-sm"></span>');
                    $.get('/api/config/doctor-fees/lookup', { doctorId: docId, serviceType: 'OPD', visitType: vType }).done(function(config) {
                        var fee = config && config.fee ? Number(config.fee) : 0;
                        var docName = $('#addlDoctorSelect option:selected').data('name') || '';
                        var dept = $('#addlDoctorSelect option:selected').data('dept') || '';
                        if (fee > 0) {
                            addlDoctorFees.push({ doctorId: docId, doctorName: docName, department: dept, visitType: vType, fee: fee, qty: 1, discount: 0 });
                            refreshAddChargesView();
                        } else {
                            $('#addlDocFeeInfo').html('<span style="color:var(--color-destructive);font-size:12px">No fee configured for this combination</span>');
                        }
                    }).fail(function() {
                        $('#addlDocFeeInfo').html('<span style="color:var(--color-destructive);font-size:12px">Fee lookup failed</span>');
                    });
                }

                $('#addlDoctorSelect').off('change').on('change', lookupAddlFee);
                $('#addlVisitTypeSelect').off('change').on('change', lookupAddlFee);
            });

            $(document).off('input.addlDocDisc').on('input.addlDocDisc', '.addl-doc-discount', function() {
                var idx = $(this).data('idx');
                addlDoctorFees[idx].discount = parseFloat($(this).val()) || 0;
                refreshAddChargesView();
            });

            $(document).off('click.addlDocDel').on('click.addlDocDel', '.addl-doc-delete', function() {
                addlDoctorFees.splice($(this).data('idx'), 1);
                refreshAddChargesView();
            });

            $('#btnAddChargeRowAddl').off('click').on('click', function() {
                var available = getAvailableAddlCharges();
                if (available.length === 0) { showToast('All available charges have already been added.', 'info'); return; }
                $('#addlChargesEmpty').remove();
                if ($('#addlChargesNewRow').length) return;
                var opts = '';
                available.forEach(function(c) {
                    opts += '<option value="' + chargeKey(c) + '" data-amount="' + c.amount + '">' + esc(c.name) + ' — ' + hospitalInfo.currency + ' ' + Number(c.amount).toLocaleString() + '</option>';
                });
                var row = '<tr id="addlChargesNewRow" style="background:#f8f9fa">' +
                    '<td style="text-align:center;vertical-align:middle"><i data-lucide="plus-circle" style="width:16px;height:16px;color:var(--aqua-mint-dark)"></i></td>' +
                    '<td colspan="4" style="vertical-align:middle"><select class="form-select form-select-sm addl-new-charge-select" style="font-size:13px"><option value="">Select a charge to add...</option>' + opts + '</select></td><td></td></tr>';
                $('#addlChargesGridBody').append(row);
                lucide.createIcons();
            });

            $(document).off('change.addlNewCharge').on('change.addlNewCharge', '.addl-new-charge-select', function() {
                var cid = $(this).val();
                if (!cid) return;
                var activeCharges = getActiveOpdCharges();
                var charge = activeCharges.find(function(c) { return chargeKey(c) === cid; });
                if (charge) {
                    addlGrid.push({ id: cid, name: charge.name, qty: 1, discount: 0, unitPrice: Number(charge.amount) });
                }
                refreshAddChargesView();
            });

            $(document).off('input.addlChargeQty').on('input.addlChargeQty', '.addl-charge-qty', function() {
                var idx = $(this).data('idx');
                addlGrid[idx].qty = Math.max(1, parseInt($(this).val()) || 1);
                refreshAddChargesView();
            });

            $(document).off('input.addlChargeDisc').on('input.addlChargeDisc', '.addl-charge-discount', function() {
                var idx = $(this).data('idx');
                addlGrid[idx].discount = parseFloat($(this).val()) || 0;
                refreshAddChargesView();
            });

            $(document).off('click.addlChargeDel').on('click.addlChargeDel', '.addl-charge-delete', function() {
                addlGrid.splice($(this).data('idx'), 1);
                refreshAddChargesView();
            });
        }

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" id="btnBackFromAddlCharges" style="font-size:13px"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button>' +
            '<button class="btn-primary" id="btnSaveAddlCharges" style="font-size:13px"><i data-lucide="check" style="width:14px;height:14px"></i> Save Charges</button>' +
        '</div>';

        $('#billingDetailBody').html(renderAddChargesBody());
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();
        bindAddChargesEvents();

        $('#btnBackFromAddlCharges').off('click').on('click', function() {
            renderBillingDetailContent(visit, patient, bill);
        });

        $('#btnSaveAddlCharges').off('click').on('click', function() {
            if (addlDoctorFees.length === 0 && addlGrid.length === 0) {
                showToast('Please add at least one doctor fee or charge', 'error');
                return;
            }
            var items = [];
            addlDoctorFees.forEach(function(d) {
                items.push({
                    type: 'doctor_fee',
                    name: 'Consultant Doctor Fee',
                    doctorId: d.doctorId,
                    doctorName: d.doctorName,
                    visitType: d.visitType,
                    amount: Number(d.fee),
                    qty: d.qty || 1,
                    discount: Number(d.discount || 0)
                });
            });
            addlGrid.forEach(function(r) {
                items.push({
                    type: 'hospital_charge',
                    name: r.name,
                    chargeId: r.id,
                    category: r.category || 'Hospital Charges',
                    amount: r.unitPrice,
                    qty: r.qty,
                    discount: Number(r.discount || 0)
                });
            });

            var $btn = $('#btnSaveAddlCharges');
            $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');

            $.ajax({
                url: '/api/opd/bills/' + encodeURIComponent(bill.billId) + '/additional-charges',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ items: items }),
                success: function(resp) {
                    var updatedBill = resp.bill || bill;
                    var idx = bills.findIndex(function(b) { return b.billId === bill.billId; });
                    if (idx !== -1) bills[idx] = updatedBill;

                    var vIdx = visits.findIndex(function(v) { return v.visitId === visit.visitId; });
                    if (vIdx !== -1) {
                        visits[vIdx].paymentStatus = updatedBill.paymentStatus;
                    }

                    renderBillingTab(); renderRegistrationStats();
                    renderBillingDetailContent(visit, patient, updatedBill);
                    showToast('Additional charges saved successfully', 'success');
                },
                error: function(xhr) {
                    var msg = xhr.responseJSON ? xhr.responseJSON.error : 'Failed to save additional charges';
                    showToast(msg, 'error');
                    $btn.prop('disabled', false).html('<i data-lucide="check" style="width:14px;height:14px"></i> Save Charges');
                    lucide.createIcons();
                }
            });
        });
    }

    function renderAddPaymentView(visit, patient, bill, chargeItems) {
        var patientName = patient ? patient.name : visit.patientName;
        var initials = getInitials(patientName);
        var totalAmount = Number(bill.totalAmount);
        var paidAmount = Number(bill.paidAmount || 0);
        var dueAmount = Math.max(0, totalAmount - paidAmount);

        var allChargeItems = chargeItems.slice();
        var addlCharges = bill.additionalCharges || [];
        addlCharges.forEach(function(ac) {
            var desc = ac.name || 'Additional Charge';
            if (ac.type === 'doctor_fee' && ac.doctorName) desc += ' — ' + ac.doctorName;
            var cat = ac.type === 'doctor_fee' ? 'Doctor Fee' : (ac.category || 'Hospital Charges');
            var stableId = 'addl-' + (ac.type || 'charge') + '-' + (ac.name || '').replace(/\s+/g, '_') + '-' + (ac.addedAt || '0');
            allChargeItems.push({
                chargeId: stableId,
                date: ac.addedAt ? new Date(ac.addedAt) : new Date(),
                description: esc(desc),
                category: cat,
                qty: ac.qty || 1,
                amount: Number(ac.net || 0)
            });
        });

        $('#billingDetailBody').html('<div style="padding:40px;text-align:center"><span class="spinner-border"></span><div style="margin-top:12px;font-size:13px;color:var(--color-muted-foreground)">Loading payment details...</div></div>');
        $('#billingDetailFooter').html('');

        $.get('/api/opd/payments/' + encodeURIComponent(bill.billId), function(existingPayments) {
            var paidChargeIds = [];
            (existingPayments || []).forEach(function(p) {
                if (p.chargeIds && p.chargeIds.length) {
                    p.chargeIds.forEach(function(cid) {
                        paidChargeIds.push(String(cid));
                    });
                }
            });

            var unpaidItems = allChargeItems.filter(function(ci) {
                return paidChargeIds.indexOf(String(ci.chargeId)) === -1;
            });

            buildPaymentForm(visit, patient, bill, unpaidItems, dueAmount, initials, patientName);
        }).fail(function() {
            buildPaymentForm(visit, patient, bill, allChargeItems, dueAmount, initials, patientName);
        });
    }

    function buildPaymentForm(visit, patient, bill, unpaidItems, dueAmount, initials, patientName) {
        var totalAmount = Number(bill.totalAmount);
        var paidAmount  = Number(bill.paidAmount || 0);

        var body = '' +
            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div style="flex:1">' +
                    '<h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                        '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(visit.visitId) + '</span>' +
                        '<span style="font-size:12px;background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(bill.billId) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="text-align:right">' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground)">Outstanding</div>' +
                    '<div style="font-size:18px;font-weight:700;color:var(--color-destructive);font-family:monospace">' + hospitalInfo.currency + ' ' + dueAmount.toLocaleString() + '</div>' +
                '</div>' +
            '</div>';

        if (unpaidItems.length === 0) {
            body += '<div style="background:var(--color-card);padding:40px 24px;border-radius:12px;border:1px solid var(--color-border);text-align:center">' +
                '<i data-lucide="check-circle" style="width:48px;height:48px;color:var(--color-success);margin-bottom:12px"></i>' +
                '<h4 style="margin:0 0 8px;font-size:16px;font-weight:600">All Charges Paid</h4>' +
                '<p style="margin:0;font-size:14px;color:var(--color-muted-foreground)">All individual charges have been paid.</p>' +
            '</div>';
        } else {
            body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
                    '<h4 style="margin:0;font-size:15px;font-weight:700"><i data-lucide="list-checks" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i> Select Charges to Pay</h4>' +
                    '<button class="btn-outline btn-sm" id="btnSelectAllCharges" style="font-size:12px"><i data-lucide="check-square" style="width:14px;height:14px"></i> Select All</button>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse">' +
                    '<thead><tr style="border-bottom:2px solid var(--color-border)">' +
                        '<th style="width:40px;padding:8px 4px;text-align:center"><input type="checkbox" id="chkAllCharges" style="width:16px;height:16px;accent-color:var(--aqua-mint)"></th>' +
                        '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Description</th>' +
                        '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Category</th>' +
                        '<th style="text-align:right;padding:8px 4px;font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Amount</th>' +
                    '</tr></thead>' +
                    '<tbody>';

            unpaidItems.forEach(function(ci, idx) {
                var chargeKey = ci.chargeId || ('item-' + idx);
                body += '<tr style="border-bottom:1px solid var(--color-border)">' +
                    '<td style="padding:10px 4px;text-align:center"><input type="checkbox" class="pay-charge-chk" data-idx="' + idx + '" data-key="' + esc(chargeKey) + '" data-amount="' + ci.amount + '" style="width:16px;height:16px;accent-color:var(--aqua-mint)"></td>' +
                    '<td style="padding:10px 4px;font-size:13px;font-weight:500">' + ci.description + '</td>' +
                    '<td style="padding:10px 4px;text-align:center"><span style="font-size:11px;padding:2px 8px;border-radius:4px;background:#F3F4F6;color:#374151">' + esc(ci.category) + '</span></td>' +
                    '<td style="padding:10px 4px;text-align:right;font-family:monospace;font-size:13px;font-weight:600">' + hospitalInfo.currency + ' ' + ci.amount.toLocaleString() + '</td>' +
                '</tr>';
            });

            body += '</tbody>' +
                '<tfoot><tr style="border-top:2px solid var(--color-border)">' +
                    '<td colspan="3" style="padding:12px 4px;text-align:right;font-size:14px;font-weight:700">Selected Total</td>' +
                    '<td style="padding:12px 4px;text-align:right;font-size:16px;font-weight:700;font-family:monospace;color:var(--midnight-blue)" id="paySelectedTotal">' + hospitalInfo.currency + ' 0</td>' +
                '</tr></tfoot>' +
            '</table></div>';

            body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border)">' +
                '<h4 style="margin:0 0 16px;font-size:15px;font-weight:700"><i data-lucide="credit-card" style="width:16px;height:16px;display:inline;vertical-align:-3px;margin-right:6px"></i> Payment Details</h4>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
                    '<div class="form-group">' +
                        '<label style="font-size:12px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Payment Method *</label>' +
                        '<select id="paymentMode" class="form-control" style="font-size:13px">' +
                            '<option value="Cash">Cash</option>' +
                            '<option value="Card">Card (Credit/Debit)</option>' +
                            '<option value="UPI">UPI / Mobile Payment</option>' +
                            '<option value="Bank Transfer">Bank Transfer</option>' +
                            '<option value="Cheque">Cheque</option>' +
                            '<option value="Insurance">Insurance</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label style="font-size:12px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Reference / Transaction ID</label>' +
                        '<input type="text" id="paymentReference" class="form-control" placeholder="Optional reference" style="font-size:13px">' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" style="margin-top:12px">' +
                    '<label style="font-size:12px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Notes</label>' +
                    '<textarea id="paymentNotes" class="form-control" rows="2" placeholder="Optional payment notes" style="font-size:13px;resize:none"></textarea>' +
                '</div>' +
            '</div>';
        }

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" id="btnBackToBilling" style="font-size:13px"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button>' +
            (unpaidItems.length > 0 ? '<button class="btn-primary" id="btnSavePayment" disabled style="font-size:13px;opacity:0.5"><i data-lucide="check" style="width:14px;height:14px"></i> Save Payment</button>' : '') +
        '</div>';

        $('#billingDetailBody').html(body);
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();

        function updateSelectedTotal() {
            var total = 0;
            var anyChecked = false;
            $('.pay-charge-chk:checked').each(function() {
                total += Number($(this).data('amount'));
                anyChecked = true;
            });
            if (total > dueAmount) total = dueAmount;
            $('#paySelectedTotal').text(hospitalInfo.currency + ' ' + total.toLocaleString());
            if (anyChecked) {
                $('#btnSavePayment').prop('disabled', false).css('opacity', '1');
            } else {
                $('#btnSavePayment').prop('disabled', true).css('opacity', '0.5');
            }
            var allChecked = $('.pay-charge-chk').length === $('.pay-charge-chk:checked').length;
            $('#chkAllCharges').prop('checked', allChecked);
        }

        $(document).off('change', '.pay-charge-chk').on('change', '.pay-charge-chk', updateSelectedTotal);

        $('#chkAllCharges').off('change').on('change', function() {
            var checked = $(this).is(':checked');
            $('.pay-charge-chk').prop('checked', checked);
            updateSelectedTotal();
        });

        $('#btnSelectAllCharges').off('click').on('click', function() {
            var allChecked = $('.pay-charge-chk').length === $('.pay-charge-chk:checked').length;
            $('.pay-charge-chk').prop('checked', !allChecked);
            $('#chkAllCharges').prop('checked', !allChecked);
            updateSelectedTotal();
        });

        $('#btnBackToBilling').off('click').on('click', function() {
            renderBillingDetailContent(visit, patient, bill);
        });

        $('#btnSavePayment').off('click').on('click', function() {
            var selectedChargeIds = [];
            var selectedAmount    = 0;
            var selectedItems     = [];
            $('.pay-charge-chk:checked').each(function() {
                selectedChargeIds.push(String($(this).data('key')));
                selectedAmount += Number($(this).data('amount'));
                selectedItems.push({
                    description : $(this).closest('tr').find('td:nth-child(2)').text().trim(),
                    amount      : Number($(this).data('amount'))
                });
            });
            if (selectedAmount > dueAmount) selectedAmount = dueAmount;
            if (selectedChargeIds.length === 0) return;

            /* capture form values NOW — before any modal/re-render destroys these elements */
            var capturedMode  = $('#paymentMode').val() || '';
            var capturedRef   = ($('#paymentReference').val() || '').trim();
            var capturedNotes = ($('#paymentNotes').val() || '').trim();

            showPaymentConfirmModal({
                patientName   : patientName,
                mrn           : visit.mrn,
                visitId       : visit.visitId,
                billId        : bill.billId,
                paymentMode   : capturedMode,
                reference     : capturedRef,
                notes         : capturedNotes,
                selectedItems : selectedItems,
                totalAmount   : totalAmount,
                paidSoFar     : paidAmount,
                payingNow     : selectedAmount,
                dueAmount     : dueAmount,
                currency      : hospitalInfo.currency,
                chargeIds     : selectedChargeIds,
                /* callbacks */
                onConfirm: function(confirmBtn) {
                    $.ajax({
                        url: '/api/opd/payments',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            billId      : bill.billId,
                            visitId     : visit.visitId,
                            mrn         : visit.mrn,
                            amount      : selectedAmount,
                            paymentMode : capturedMode,
                            reference   : capturedRef,
                            notes       : capturedNotes,
                            chargeIds   : selectedChargeIds
                        }),
                        success: function(resp) {
                            var updatedBill = resp.bill || bill;
                            var idx = bills.findIndex(function(b) { return b.billId === bill.billId; });
                            if (idx !== -1) bills[idx] = updatedBill;
                            var vIdx = visits.findIndex(function(v) { return v.visitId === visit.visitId; });
                            if (vIdx !== -1) visits[vIdx].paymentStatus = updatedBill.paymentStatus;
                            renderBillingTab(); renderRegistrationStats();
                            renderBillingDetailContent(visit, patient, updatedBill);
                            showPaymentSuccessModal({
                                patientName  : patientName,
                                mrn          : visit.mrn,
                                visitId      : visit.visitId,
                                billId       : bill.billId,
                                paymentId    : resp.payment ? (resp.payment.paymentId || resp.payment.id || '') : '',
                                paymentMode  : capturedMode,
                                reference    : capturedRef,
                                payingNow    : selectedAmount,
                                newPaid      : Number(updatedBill.paidAmount || 0),
                                newBalance   : Math.max(0, Number(updatedBill.totalAmount) - Number(updatedBill.paidAmount || 0)),
                                newStatus    : updatedBill.paymentStatus || 'Partial',
                                currency     : hospitalInfo.currency
                            });
                        },
                        error: function(xhr) {
                            confirmBtn.prop('disabled', false)
                                .html('<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm Payment');
                            lucide.createIcons();
                            showToast((xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message)) || 'Failed to save payment', 'error');
                        }
                    });
                }
            });
        });
    }

    // ── Payment confirmation modal ───────────────────────────────────────────────
    function showPaymentConfirmModal(info) {
        $('#opdPayConfirmModal').remove();

        var itemRows = '';
        (info.selectedItems || []).forEach(function(it) {
            itemRows +=
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #E9ECEF">' +
                '<span style="font-size:13px;color:#2C3E50">' + esc(it.description) + '</span>' +
                '<span style="font-size:13px;font-weight:600;font-family:monospace;color:#2C3E50">' + esc(info.currency) + ' ' + Number(it.amount).toLocaleString() + '</span>' +
                '</div>';
        });

        var newBalance = Math.max(0, info.dueAmount - info.payingNow);

        var html =
            '<div class="modal fade" id="opdPayConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:480px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* header */
            '<div style="background:#060740;padding:20px 24px;display:flex;align-items:center;gap:14px">' +
            '<div style="width:44px;height:44px;border-radius:50%;background:rgba(127,255,212,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<i data-lucide="credit-card" style="width:22px;height:22px;color:#7FFFD4"></i></div>' +
            '<div><h5 style="margin:0;font-size:17px;font-weight:700;color:#fff">Confirm Payment</h5>' +
            '<p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.6)">Please review before recording</p></div></div>' +

            /* body */
            '<div style="padding:20px 24px">' +

            /* patient/bill summary */
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            _confirmRow('Patient',  esc(info.patientName), true,  '#2C3E50', '') +
            _confirmRow('MRN',      esc(info.mrn),         true,  '#060740', 'monospace') +
            _confirmRow('Bill ID',  esc(info.billId),      true,  '#2C3E50', 'monospace') +
            _confirmRow('Method',   esc(info.paymentMode), true,  '#2C3E50', '') +
            (info.reference ? _confirmRow('Reference', esc(info.reference), true, '#2C3E50', 'monospace') : '') +
            _confirmRow('Outstanding Before', esc(info.currency) + ' ' + Number(info.dueAmount).toLocaleString(), false, '#DC3545', 'monospace') +
            '</div>' +

            /* selected charges */
            '<div style="background:#F8F9FA;border-radius:10px;padding:10px 16px;margin-bottom:14px">' +
            '<div style="font-size:11px;font-weight:700;color:#6C757D;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Charges Being Paid</div>' +
            itemRows +
            '</div>' +

            /* paying now + new balance */
            '<div style="background:#060740;border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
            '<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:.06em">Paying Now</span>' +
            '<span style="font-size:22px;font-weight:800;color:#7FFFD4;font-family:monospace">' + esc(info.currency) + ' ' + Number(info.payingNow).toLocaleString() + '</span></div>' +
            (newBalance > 0
                ? '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
                  '<span style="font-size:12px;font-weight:700;color:#DC3545">Remaining Balance After</span>' +
                  '<span style="font-size:15px;font-weight:700;font-family:monospace;color:#DC3545">' + esc(info.currency) + ' ' + newBalance.toLocaleString() + '</span></div>'
                : '<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
                  '<span style="font-size:12px;font-weight:700;color:#16A34A">Bill Fully Settled</span>' +
                  '<span style="font-size:15px;font-weight:700;font-family:monospace;color:#16A34A">✓ Paid</span></div>') +
            '</div>' +

            /* footer */
            '<div style="padding:14px 24px 20px;display:flex;gap:10px;justify-content:flex-end">' +
            '<button id="btnPayCancelConfirm" style="height:40px;padding:0 20px;border:1px solid #DEE2E6;border-radius:8px;background:#fff;font-size:13.5px;font-weight:600;color:#6C757D;cursor:pointer">Cancel</button>' +
            '<button id="btnPayConfirmSave" style="height:40px;padding:0 22px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px">' +
            '<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm Payment</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('opdPayConfirmModal'), { backdrop: 'static' });
        modal.show();

        $('#btnPayCancelConfirm').on('click', function() { modal.hide(); });

        var $pendingConfirmBtn = null;

        $('#btnPayConfirmSave').off('click').on('click', function() {
            $pendingConfirmBtn = $(this);
            $pendingConfirmBtn.prop('disabled', true).html('<i data-lucide="loader-2" style="width:15px;height:15px"></i> Processing...');
            lucide.createIcons();
            modal.hide(); /* backdrop fades out; onConfirm fires in hidden.bs.modal below */
        });

        document.getElementById('opdPayConfirmModal').addEventListener('hidden.bs.modal', function() {
            /* only fire onConfirm when user clicked Confirm (not Cancel) */
            if ($pendingConfirmBtn) {
                info.onConfirm($pendingConfirmBtn);
                $pendingConfirmBtn = null;
            }
            $('#opdPayConfirmModal').remove();
        });
    }

    // ── Payment success modal ────────────────────────────────────────────────────
    function showPaymentSuccessModal(info) {
        $('#opdPaySuccessModal').remove();

        var statusColor = info.newStatus === 'Paid' ? '#16A34A' : '#D97706';
        var statusBg    = info.newStatus === 'Paid' ? '#F0FDF4' : '#FFFBEB';
        var statusBorder= info.newStatus === 'Paid' ? '#BBF7D0' : '#FDE68A';

        var html =
            '<div class="modal fade" id="opdPaySuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:460px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* banner */
            '<div style="background:linear-gradient(135deg,#060740 0%,#1a1b7a 100%);padding:36px 24px;text-align:center">' +
            '<div style="width:68px;height:68px;border-radius:50%;background:#7FFFD4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 4px 20px rgba(127,255,212,0.4)">' +
            '<i data-lucide="check" style="width:36px;height:36px;color:#060740"></i></div>' +
            '<h4 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px">Payment Recorded!</h4>' +
            '<p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0">Payment has been saved successfully</p>' +
            '</div>' +

            /* details */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            _confirmRow('Patient',      esc(info.patientName), true,  '#2C3E50', '') +
            _confirmRow('MRN',          esc(info.mrn),         true,  '#060740', 'monospace') +
            _confirmRow('Bill ID',      esc(info.billId),      true,  '#2C3E50', 'monospace') +
            (info.paymentId ? _confirmRow('Payment ID', esc(info.paymentId), true, '#2C3E50', 'monospace') : '') +
            _confirmRow('Method',       esc(info.paymentMode), true,  '#2C3E50', '') +
            (info.reference ? _confirmRow('Reference', esc(info.reference), true, '#2C3E50', 'monospace') : '') +
            _confirmRow('Total Paid',   esc(info.currency) + ' ' + Number(info.newPaid).toLocaleString(),    true,  '#16A34A', 'monospace') +
            _confirmRow('Balance Due',  esc(info.currency) + ' ' + Number(info.newBalance).toLocaleString(), false, info.newBalance > 0 ? '#DC3545' : '#16A34A', 'monospace') +
            '</div>' +

            /* amount paid now + status badge */
            '<div style="background:#060740;border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
            '<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:.06em">Amount Paid</span>' +
            '<span style="font-size:22px;font-weight:800;color:#7FFFD4;font-family:monospace">' + esc(info.currency) + ' ' + Number(info.payingNow).toLocaleString() + '</span></div>' +

            '<div style="background:' + statusBg + ';border:1px solid ' + statusBorder + ';border-radius:8px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">' +
            '<span style="font-size:12px;font-weight:700;color:' + statusColor + '">Payment Status</span>' +
            '<span style="font-size:13px;font-weight:800;color:' + statusColor + ';text-transform:uppercase;letter-spacing:1px">' + esc(info.newStatus) + '</span></div>' +

            '<button id="btnPayCloseSuccess" style="width:100%;height:44px;border:none;border-radius:10px;background:#060740;color:#7FFFD4;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">' +
            '<i data-lucide="x" style="width:17px;height:17px"></i> Close</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var successModal = new bootstrap.Modal(document.getElementById('opdPaySuccessModal'));
        successModal.show();
        $('#btnPayCloseSuccess').on('click', function() { successModal.hide(); });
        document.getElementById('opdPaySuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#opdPaySuccessModal').remove();
        });
    }

    // ── Vital confirmation modal ─────────────────────────────────────────────────
    function showVitalConfirmModal(info) {
        $('#opdVitalConfirmModal').remove();

        var rowsHtml = '';
        (info.vitalSummary || []).forEach(function(r) {
            rowsHtml += _confirmRow(r.label, r.value, true, '#2C3E50', 'monospace');
        });
        if (!rowsHtml) {
            rowsHtml = '<p style="font-size:13px;color:#6C757D;margin:8px 0">No vital values entered.</p>';
        }

        var html =
            '<div class="modal fade" id="opdVitalConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:460px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* header */
            '<div style="background:#060740;padding:20px 24px;display:flex;align-items:center;gap:14px">' +
            '<div style="width:44px;height:44px;border-radius:50%;background:rgba(127,255,212,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<i data-lucide="thermometer" style="width:22px;height:22px;color:#7FFFD4"></i></div>' +
            '<div><h5 style="margin:0;font-size:17px;font-weight:700;color:#fff">Save Vital Signs</h5>' +
            '<p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.6)">Please review before saving</p></div></div>' +

            /* body */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            _confirmRow('Patient',  esc(info.patientName), true,  '#2C3E50', '') +
            _confirmRow('MRN',      esc(info.mrn),         true,  '#060740', 'monospace') +
            _confirmRow('Visit',    esc(info.visitId),     true,  '#2C3E50', 'monospace') +
            _confirmRow('Doctor',   esc(info.doctorName),  false, '#2C3E50', '') +
            '</div>' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            '<div style="font-size:11px;font-weight:700;color:#6C757D;text-transform:uppercase;letter-spacing:.05em;padding:10px 0 4px">Vitals Being Recorded</div>' +
            rowsHtml +
            '</div>' +
            '</div>' +

            /* footer */
            '<div style="padding:14px 24px 20px;display:flex;gap:10px;justify-content:flex-end">' +
            '<button id="btnVitalCancelConfirm" style="height:40px;padding:0 20px;border:1px solid #DEE2E6;border-radius:8px;background:#fff;font-size:13.5px;font-weight:600;color:#6C757D;cursor:pointer">Cancel</button>' +
            '<button id="btnVitalConfirmSave" style="height:40px;padding:0 22px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px">' +
            '<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Save</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('opdVitalConfirmModal'), { backdrop: 'static' });
        modal.show();

        $('#btnVitalCancelConfirm').on('click', function() { modal.hide(); });

        var $pendingVitalBtn = null;

        $('#btnVitalConfirmSave').off('click').on('click', function() {
            $pendingVitalBtn = $(this);
            $pendingVitalBtn.prop('disabled', true).html('<i data-lucide="loader-2" style="width:15px;height:15px"></i> Saving...');
            lucide.createIcons();
            modal.hide();
        });

        document.getElementById('opdVitalConfirmModal').addEventListener('hidden.bs.modal', function() {
            if ($pendingVitalBtn) {
                info.onConfirm($pendingVitalBtn);
                $pendingVitalBtn = null;
            }
            $('#opdVitalConfirmModal').remove();
        });
    }

    // ── Vital success modal ──────────────────────────────────────────────────────
    function showVitalSuccessModal(info) {
        $('#opdVitalSuccessModal').remove();

        var rowsHtml = '';
        (info.vitalSummary || []).forEach(function(r) {
            rowsHtml += _confirmRow(r.label, r.value, true, '#2C3E50', 'monospace');
        });

        var html =
            '<div class="modal fade" id="opdVitalSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:440px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* banner */
            '<div style="background:linear-gradient(135deg,#060740 0%,#1a1b7a 100%);padding:36px 24px;text-align:center">' +
            '<div style="width:68px;height:68px;border-radius:50%;background:#7FFFD4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 4px 20px rgba(127,255,212,0.4)">' +
            '<i data-lucide="check" style="width:36px;height:36px;color:#060740"></i></div>' +
            '<h4 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px">Vitals Saved!</h4>' +
            '<p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0">Vital signs have been recorded successfully</p>' +
            '</div>' +

            /* details */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            _confirmRow('Patient', esc(info.patientName), true,  '#2C3E50', '') +
            _confirmRow('MRN',     esc(info.mrn),         true,  '#060740', 'monospace') +
            _confirmRow('Visit',   esc(info.visitId),     false, '#2C3E50', 'monospace') +
            '</div>' +
            (rowsHtml
                ? '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
                  '<div style="font-size:11px;font-weight:700;color:#6C757D;text-transform:uppercase;letter-spacing:.05em;padding:10px 0 4px">Recorded Vitals</div>' +
                  rowsHtml + '</div>'
                : '') +
            '</div>' +

            /* footer */
            '<div style="padding:0 24px 20px;display:flex;justify-content:flex-end">' +
            '<button id="btnVitalCloseSuccess" style="height:40px;padding:0 28px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer">Close</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('opdVitalSuccessModal'));
        modal.show();
        $('#btnVitalCloseSuccess').on('click', function() { modal.hide(); });
        document.getElementById('opdVitalSuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#opdVitalSuccessModal').remove();
        });
    }

    // ── Consultation confirm modal ───────────────────────────────────────────────
    function showConsultConfirmModal(info) {
        $('#opdConsultConfirmModal').remove();

        /* summary rows for what will be saved */
        var summaryHtml = '';
        if (info.symptoms && info.symptoms.length)       summaryHtml += _confirmRow('Symptoms',       info.symptoms.length + ' selected',         true,  '#2C3E50', '');
        if (info.investigations && info.investigations.length) summaryHtml += _confirmRow('Investigations', info.investigations.length + ' order(s)',    true,  '#2C3E50', '');
        if (info.prescriptions && info.prescriptions.length)  summaryHtml += _confirmRow('Prescriptions',  info.prescriptions.length + ' medicine(s)',  true,  '#2C3E50', '');
        if (info.finalDiagnosis) summaryHtml += _confirmRow('Final Diagnosis', esc(info.finalDiagnosis), false, '#060740', '');
        if (!summaryHtml) summaryHtml = '<p style="font-size:13px;color:#6C757D;margin:10px 0 6px">No consultation data entered yet.</p>';

        var html =
            '<div class="modal fade" id="opdConsultConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:480px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* header */
            '<div style="background:#060740;padding:20px 24px;display:flex;align-items:center;gap:14px">' +
            '<div style="width:44px;height:44px;border-radius:50%;background:rgba(127,255,212,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<i data-lucide="stethoscope" style="width:22px;height:22px;color:#7FFFD4"></i></div>' +
            '<div><h5 style="margin:0;font-size:17px;font-weight:700;color:#fff">' + (info.isUpdate ? 'Update' : 'Save') + ' Consultation</h5>' +
            '<p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.6)">Please review before confirming</p></div></div>' +

            /* body */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            _confirmRow('Patient', esc(info.patientName), true,  '#2C3E50', '') +
            _confirmRow('MRN',     esc(info.mrn),         true,  '#060740', 'monospace') +
            _confirmRow('Visit',   esc(info.visitId),     true,  '#2C3E50', 'monospace') +
            _confirmRow('Doctor',  esc(info.doctorName),  false, '#2C3E50', '') +
            '</div>' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            '<div style="font-size:11px;font-weight:700;color:#6C757D;text-transform:uppercase;letter-spacing:.05em;padding:10px 0 4px">Consultation Summary</div>' +
            summaryHtml +
            '</div>' +
            '</div>' +

            /* footer */
            '<div style="padding:14px 24px 20px;display:flex;gap:10px;justify-content:flex-end">' +
            '<button id="btnConsultCancelConfirm" style="height:40px;padding:0 20px;border:1px solid #DEE2E6;border-radius:8px;background:#fff;font-size:13.5px;font-weight:600;color:#6C757D;cursor:pointer">Cancel</button>' +
            '<button id="btnConsultConfirmSave" style="height:40px;padding:0 22px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px">' +
            '<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Save</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('opdConsultConfirmModal'), { backdrop: 'static' });
        modal.show();

        $('#btnConsultCancelConfirm').on('click', function() { modal.hide(); });

        var $pendingConsultBtn = null;

        $('#btnConsultConfirmSave').off('click').on('click', function() {
            $pendingConsultBtn = $(this);
            $pendingConsultBtn.prop('disabled', true).html('<i data-lucide="loader-2" style="width:15px;height:15px"></i> Saving...');
            lucide.createIcons();
            modal.hide();
        });

        document.getElementById('opdConsultConfirmModal').addEventListener('hidden.bs.modal', function() {
            if ($pendingConsultBtn) {
                info.onConfirm($pendingConsultBtn);
                $pendingConsultBtn = null;
            }
            $('#opdConsultConfirmModal').remove();
        });
    }

    // ── Consultation success modal ───────────────────────────────────────────────
    function showConsultSuccessModal(info) {
        $('#opdConsultSuccessModal').remove();

        var html =
            '<div class="modal fade" id="opdConsultSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:440px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* banner */
            '<div style="background:linear-gradient(135deg,#060740 0%,#1a1b7a 100%);padding:36px 24px;text-align:center">' +
            '<div style="width:68px;height:68px;border-radius:50%;background:#7FFFD4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 4px 20px rgba(127,255,212,0.4)">' +
            '<i data-lucide="check" style="width:36px;height:36px;color:#060740"></i></div>' +
            '<h4 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px">Consultation ' + (info.isUpdate ? 'Updated' : 'Saved') + '!</h4>' +
            '<p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0">Consultation has been recorded successfully</p>' +
            '</div>' +

            /* details */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            _confirmRow('Patient', esc(info.patientName), true,  '#2C3E50', '') +
            _confirmRow('MRN',     esc(info.mrn),         true,  '#060740', 'monospace') +
            _confirmRow('Visit',   esc(info.visitId),     true,  '#2C3E50', 'monospace') +
            _confirmRow('Doctor',  esc(info.doctorName),  false, '#2C3E50', '') +
            '</div>' +
            '</div>' +

            /* footer */
            '<div style="padding:0 24px 20px;display:flex;justify-content:flex-end">' +
            '<button id="btnConsultCloseSuccess" style="height:40px;padding:0 28px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer">Close</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('opdConsultSuccessModal'));
        modal.show();
        $('#btnConsultCloseSuccess').on('click', function() { modal.hide(); });
        document.getElementById('opdConsultSuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#opdConsultSuccessModal').remove();
        });
    }

    // ===== VITALS SHEET =====
    function openVitalSheet() {
        var visit = visits.find(function(v) { return v.visitId === selectedVitalVisit; });
        if (!visit) return;
        var patient = patients.find(function(p) { return p.mrn === visit.mrn; });
        var visitVitals = allVitals.filter(function(vt) { return vt.visitId === selectedVitalVisit; }).sort(function(a, b) { return new Date(b.recordedAt) - new Date(a.recordedAt); });

        $('#vitalSheetTitle').html('<i data-lucide="thermometer"></i> Patient Vitals: ' + esc(visit.patientName));

        var body = '<div style="display:grid;grid-template-columns:2fr 1fr;gap:24px">' +
            '<div>' +
                '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:24px">' +
                    '<div style="display:flex;align-items:center;gap:16px">' +
                        '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff;font-size:16px;font-weight:700">' + getInitials(visit.patientName) + '</div>' +
                        '<div style="flex:1">' +
                            '<div style="display:flex;align-items:center;gap:8px"><h3 style="font-size:16px;font-weight:600;margin:0">' + esc(visit.patientName) + '</h3>' + statusBadge(visit.status) + '</div>' +
                            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:4px">' +
                                '<span style="font-size:12px;color:var(--color-muted-foreground)">' + (patient ? patient.age : '-') + 'Y, ' + (patient ? patient.gender : '-') + '</span>' +
                                '<span style="font-size:12px;color:var(--color-muted-foreground);font-family:monospace">' + esc(visit.mrn) + '</span>' +
                                '<span style="font-size:12px;color:var(--color-muted-foreground)">Visit: ' + esc(visit.visitId) + '</span>' +
                                '<span style="font-size:12px;color:var(--color-muted-foreground)">Dr. ' + esc(visit.doctorName) + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:24px">' +
                    '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Record Vital Signs</h4></div>' +
                    '<div style="padding:20px">' +
                        buildVitalInputsBlock() +
                        '<div style="margin-top:16px" class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Notes</label><textarea class="form-control vital-field" data-field="notes" rows="2" placeholder="Additional observations...">' + esc(vitalForm.notes) + '</textarea></div>' +
                        '<div style="margin-top:16px;display:flex;justify-content:flex-end"><button class="btn-primary" id="btnSaveVital"><i data-lucide="save"></i> Save Vitals</button></div>' +
                    '</div>' +
                '</div>' +
                (visitVitals.length > 0 ? '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                    '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Vital History (' + visitVitals.length + ' records)</h4></div>' +
                    '<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Date</th><th>Temp</th><th>BP</th><th>Pulse</th><th>SpO2</th><th>Resp</th><th>Sugar</th><th>Weight</th><th>Pain</th><th>By</th></tr></thead><tbody>' +
                    visitVitals.map(function(vt) {
                        return '<tr><td style="font-size:11px;font-family:monospace">' + new Date(vt.recordedAt).toLocaleString() + '</td>' +
                            '<td style="font-size:12px;font-family:monospace">' + (vt.temperature || '-') + '</td>' +
                            '<td style="font-size:12px;font-family:monospace">' + (vt.systolic && vt.diastolic ? vt.systolic + '/' + vt.diastolic : '-') + '</td>' +
                            '<td style="font-size:12px;font-family:monospace">' + (vt.heartRate || '-') + '</td>' +
                            '<td style="font-size:12px;font-family:monospace">' + (vt.spO2 || '-') + '</td>' +
                            '<td style="font-size:12px;font-family:monospace">' + (vt.respiratoryRate || '-') + '</td>' +
                            '<td style="font-size:12px;font-family:monospace">' + (vt.bloodSugar || '-') + '</td>' +
                            '<td style="font-size:12px;font-family:monospace">' + (vt.weight || '-') + '</td>' +
                            '<td style="font-size:12px">' + (vt.painScale != null ? vt.painScale + '/10' : '-') + '</td>' +
                            '<td style="font-size:11px;color:var(--color-muted-foreground)">' + esc(vt.recordedBy || '-') + '</td></tr>';
                    }).join('') +
                    '</tbody></table></div></div>' : '') +
            '</div>' +
            '<div>' +
                '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:24px">' +
                    '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Latest Vitals</h4></div>' +
                    '<div style="padding:16px">' +
                    (visitVitals.length === 0 ?
                        '<div style="text-align:center;padding:24px 0"><i data-lucide="thermometer" style="width:32px;height:32px;color:var(--color-muted-foreground);opacity:0.3;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto"></i><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">No vitals recorded yet</p></div>' :
                        (function() {
                            var lt = visitVitals[0];
                            var items = [
                                { label: 'Temperature', value: lt.temperature ? lt.temperature + ' F' : '-', icon: 'thermometer', color: lt.temperature > 100 ? 'color:var(--color-destructive)' : '' },
                                { label: 'Blood Pressure', value: lt.systolic && lt.diastolic ? lt.systolic + '/' + lt.diastolic + ' mmHg' : '-', icon: 'heart', color: lt.systolic > 140 ? 'color:var(--color-destructive)' : '' },
                                { label: 'Pulse', value: lt.heartRate ? lt.heartRate + ' bpm' : '-', icon: 'activity', color: '' },
                                { label: 'SPO2', value: lt.spO2 ? lt.spO2 + '%' : '-', icon: 'droplets', color: lt.spO2 < 94 ? 'color:var(--color-destructive)' : '' },
                                { label: 'Resp Rate', value: lt.respiratoryRate ? lt.respiratoryRate + '/min' : '-', icon: 'wind', color: '' },
                                { label: 'Blood Sugar', value: lt.bloodSugar ? lt.bloodSugar + ' mg/dL' : '-', icon: 'droplets', color: '' },
                                { label: 'Weight', value: lt.weight ? lt.weight + ' kg' : '-', icon: 'scale', color: '' }
                            ];
                            var h = '';
                            items.forEach(function(it) {
                                h += '<div class="vital-row" style="margin-bottom:8px"><div class="vital-label"><i data-lucide="' + it.icon + '"></i> ' + it.label + '</div><span class="vital-value" style="' + it.color + '">' + it.value + '</span></div>';
                            });
                            h += '<div style="font-size:10px;color:var(--color-muted-foreground);margin-top:8px">Last recorded: ' + new Date(lt.recordedAt).toLocaleString() + ' by ' + esc(lt.recordedBy || '-') + '</div>';
                            return h;
                        })()
                    ) +
                    '</div>' +
                '</div>' +
                '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                    '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h4 style="font-size:14px;font-weight:600;margin:0">Visit Info</h4></div>' +
                    '<div style="padding:16px">' +
                        '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:12px;color:var(--color-muted-foreground)">Visit ID</span><span style="font-size:12px;font-family:monospace;font-weight:500">' + esc(visit.visitId) + '</span></div>' +
                        '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:12px;color:var(--color-muted-foreground)">Department</span><span style="font-size:12px;font-weight:500">' + esc(visit.department) + '</span></div>' +
                        '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:12px;color:var(--color-muted-foreground)">Doctor</span><span style="font-size:12px;font-weight:500">' + esc(visit.doctorName) + '</span></div>' +
                        '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:12px;color:var(--color-muted-foreground)">Visit Type</span>' + '<span class="badge badge-outline" style="font-size:10px">' + esc(visit.visitType) + '</span></div>' +
                        '<div style="display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--color-muted-foreground)">Phone</span><span style="font-size:12px;font-family:monospace">' + esc(patient ? patient.phone : '-') + '</span></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        $('#vitalSheetBody').html(body);
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('vitalSheet')).show();

        $('.vital-field').off('input').on('input', function() {
            var field = $(this).data('field');
            if (field) vitalForm[field] = $(this).val();
        });

        $('.pain-scale-btn').off('click').on('click', function() {
            var val = parseInt($(this).data('pain'));
            vitalForm.painScale = val;
            $('.pain-scale-btn').removeClass('active');
            $(this).addClass('active');
        });

        $('#btnSaveVital').off('click').on('click', function() {
            var vVisit = visits.find(function(v) { return v.visitId === selectedVitalVisit; });
            var payload = { visitId: selectedVitalVisit, mrn: vVisit ? vVisit.mrn : '' };
            if (vitalForm.temperature) payload.temperature = parseFloat(vitalForm.temperature);
            if (vitalForm.systolic) payload.systolic = parseInt(vitalForm.systolic);
            if (vitalForm.diastolic) payload.diastolic = parseInt(vitalForm.diastolic);
            if (vitalForm.heartRate) payload.heartRate = parseInt(vitalForm.heartRate);
            if (vitalForm.spO2) payload.spO2 = parseInt(vitalForm.spO2);
            if (vitalForm.respiratoryRate) payload.respiratoryRate = parseInt(vitalForm.respiratoryRate);
            if (vitalForm.weight) payload.weight = parseFloat(vitalForm.weight);
            if (vitalForm.bloodSugar) payload.bloodSugar = parseInt(vitalForm.bloodSugar);
            if (vitalForm.painScale !== null) payload.painScale = vitalForm.painScale;
            if (vitalForm.notes) payload.notes = vitalForm.notes;
            if (vitalForm.height) payload.height = parseFloat(vitalForm.height);
            if (vitalForm.temperatureC) payload.temperatureC = parseFloat(vitalForm.temperatureC);
            if (vitalForm.bmi) payload.bmi = parseFloat(vitalForm.bmi);
            if (vitalForm.headCircumference) payload.headCircumference = parseFloat(vitalForm.headCircumference);
            if (vitalForm.waistCircumference) payload.waistCircumference = parseFloat(vitalForm.waistCircumference);
            if (vitalForm.urineOutput) payload.urineOutput = parseFloat(vitalForm.urineOutput);
            if (vitalForm.glasgowComa) payload.glasgowComa = parseInt(vitalForm.glasgowComa);

            /* build a readable summary of what is being saved */
            var vitalSummary = [];
            if (payload.temperature)      vitalSummary.push({ label: 'Temperature',       value: payload.temperature + ' °F' });
            if (payload.systolic)         vitalSummary.push({ label: 'Blood Pressure',     value: payload.systolic + ' / ' + (payload.diastolic || '-') + ' mmHg' });
            if (payload.heartRate)        vitalSummary.push({ label: 'Heart Rate',          value: payload.heartRate + ' bpm' });
            if (payload.respiratoryRate)  vitalSummary.push({ label: 'Respiratory Rate',    value: payload.respiratoryRate + ' /min' });
            if (payload.spO2)             vitalSummary.push({ label: 'SpO2',               value: payload.spO2 + ' %' });
            if (payload.bloodSugar)       vitalSummary.push({ label: 'Blood Sugar',         value: payload.bloodSugar + ' mg/dL' });
            if (payload.weight)           vitalSummary.push({ label: 'Weight',             value: payload.weight + ' kg' });
            if (payload.bmi)              vitalSummary.push({ label: 'BMI',                value: payload.bmi + ' kg/m²' });
            if (payload.painScale != null) vitalSummary.push({ label: 'Pain Scale',        value: payload.painScale + ' / 10' });

            showVitalConfirmModal({
                patientName  : visit.patientName,
                mrn          : visit.mrn,
                visitId      : visit.visitId,
                doctorName   : visit.doctorName,
                vitalSummary : vitalSummary,
                onConfirm: function($cb) {
                    $.ajax({
                        url: '/api/opd/vitals',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(payload),
                        success: function() {
                            /* reload only vitals, then refresh the form immediately */
                            $.get('/api/opd/vitals', function(freshVitals) {
                                allVitals = freshVitals || [];
                                openVitalSheet();
                                showVitalSuccessModal({
                                    patientName  : visit.patientName,
                                    mrn          : visit.mrn,
                                    visitId      : visit.visitId,
                                    vitalSummary : vitalSummary
                                });
                            }).fail(function() {
                                /* still refresh the sheet even if vitals reload fails */
                                openVitalSheet();
                                showVitalSuccessModal({
                                    patientName  : visit.patientName,
                                    mrn          : visit.mrn,
                                    visitId      : visit.visitId,
                                    vitalSummary : vitalSummary
                                });
                            });
                        },
                        error: function(xhr) {
                            $cb.prop('disabled', false).html('<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Save');
                            lucide.createIcons();
                            showToast((xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message)) || 'Failed to save vitals', 'error');
                        }
                    });
                }
            });
        });
    }

    function vitalInput(field, label, icon, placeholder, type, step) {
        return '<div class="form-group"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="' + icon + '" style="width:12px;height:12px;color:' + (icon === 'thermometer' || icon === 'heart' ? 'var(--color-destructive)' : icon === 'activity' ? 'var(--color-info)' : 'var(--color-muted-foreground)') + '"></i> ' + label + '</label><input type="' + (type || 'text') + '" class="form-control vital-field" data-field="' + field + '" placeholder="' + placeholder + '"' + (step ? ' step="' + step + '"' : '') + ' value="' + esc(vitalForm[field] || '') + '"></div>';
    }

    function buildVitalInputsBlock() {
        var DEFAULT_FIELDS = [
            { fieldKey: 'temperature',      label: 'Temperature (°F)',    icon: 'thermometer', unit: '°F',   inputType: 'number' },
            { fieldKey: 'blood_pressure',   label: 'Blood Pressure',      icon: 'heart',       unit: 'mmHg', inputType: 'blood_pressure' },
            { fieldKey: 'heart_rate',       label: 'Heart Rate / Pulse',  icon: 'activity',    unit: 'bpm',  inputType: 'number' },
            { fieldKey: 'respiratory_rate', label: 'Respiratory Rate',    icon: 'wind',        unit: '/min', inputType: 'number' },
            { fieldKey: 'sp_o2',            label: 'SpO2',                icon: 'droplets',    unit: '%',    inputType: 'number' },
            { fieldKey: 'blood_sugar',      label: 'Blood Sugar',         icon: 'droplets',    unit: 'mg/dL',inputType: 'number' },
            { fieldKey: 'weight',           label: 'Weight',              icon: 'scale',       unit: 'kg',   inputType: 'number' },
            { fieldKey: 'pain_scale',       label: 'Pain Scale',          icon: 'zap',         unit: '0-10', inputType: 'pain_scale' },
        ];

        var visible = (vitalFieldsConfig.length > 0)
            ? vitalFieldsConfig.filter(function(f) { return f.isVisible; })
            : DEFAULT_FIELDS;

        var gridHtml = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">';
        var hasPainScale = false;

        visible.forEach(function(f) {
            var def = VITAL_DEFS[f.fieldKey];
            if (!def) return;
            var inputType = f.inputType || 'number';
            if (inputType === 'blood_pressure') {
                gridHtml += '<div class="form-group"><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="heart" style="width:12px;height:12px;color:var(--color-destructive)"></i> Blood Pressure</label><div style="display:flex;gap:4px"><input type="number" class="form-control vital-field" data-field="systolic" value="' + esc(vitalForm.systolic) + '"><span style="display:flex;align-items:center;font-size:12px;color:var(--color-muted-foreground)">/</span><input type="number" class="form-control vital-field" data-field="diastolic" value="' + esc(vitalForm.diastolic) + '"></div></div>';
            } else if (inputType === 'pain_scale') {
                hasPainScale = true;
            } else {
                var labelText = f.label + (f.unit ? ' (' + f.unit + ')' : '');
                gridHtml += vitalInput(def.jsField, labelText, f.icon, def.placeholder, 'number', def.step);
            }
        });

        gridHtml += '</div>';

        if (hasPainScale) {
            var painHtml = '<div style="margin-top:16px"><label style="font-size:12px;color:var(--color-muted-foreground);display:block;margin-bottom:4px">Pain Scale (0-10)</label><div class="pain-scale-btns">';
            for (var pi = 0; pi <= 10; pi++) {
                painHtml += '<button class="pain-scale-btn' + (vitalForm.painScale === pi ? ' active' : '') + '" data-pain="' + pi + '">' + pi + '</button>';
            }
            painHtml += '</div></div>';
            return gridHtml + painHtml;
        }

        return gridHtml;
    }

    // ===== CONSULTATION SHEET =====
    function getAvailableConsultSections(visitDept) {
        var BUILTIN_ICONS = { symptoms: 'stethoscope', investigation: 'flask-conical', prescription: 'pill', notes: 'file-text' };
        var sections = (opdFormSections.length > 0 ? opdFormSections : [
            { key: 'symptoms', label: 'Symptoms', isDefault: true, isEnabled: true, department: null, sortOrder: 1, fields: [] },
            { key: 'investigation', label: 'Investigation Orders', isDefault: true, isEnabled: true, department: null, sortOrder: 2, fields: [] },
            { key: 'prescription', label: 'Prescription', isDefault: true, isEnabled: true, department: null, sortOrder: 3, fields: [] },
            { key: 'notes', label: 'Clinical Notes', isDefault: true, isEnabled: true, department: null, sortOrder: 4, fields: [] }
        ]);
        return sections.filter(function(s) {
            return s.isEnabled && (!s.department || s.department === visitDept);
        }).map(function(s) {
            return { id: s.key, label: s.label, icon: BUILTIN_ICONS[s.key] || 'layout', isDefault: s.isDefault, fields: s.fields || [] };
        });
    }

    function openConsultSheet(visitId) {
        selectedConsultVisit = visitId;
        var visit = visits.find(function(v) { return v.visitId === visitId; });
        var existing = consultations.find(function(c) { return c.visitId === visitId; });
        if (existing) {
            symptomsList = existing.symptoms || [];
            investigationsList = existing.investigationOrders || [];
            prescriptionsList = existing.prescriptions || [];
            clinicalNotes = { findings: existing.clinicalFindings || '', provisionalDiagnosis: existing.provisionalDiagnosis || '', finalDiagnosis: existing.finalDiagnosis || '', doctorNotes: existing.doctorNotes || '' };
            customSectionData = existing.customSectionData || {};
        } else {
            symptomsList = [];
            investigationsList = [];
            prescriptionsList = [];
            clinicalNotes = { findings: '', provisionalDiagnosis: '', finalDiagnosis: '', doctorNotes: '' };
            customSectionData = {};
        }
        var availSections = getAvailableConsultSections(visit ? visit.department : '');
        consultActiveSection = availSections.length > 0 ? availSections[0].id : 'symptoms';
        symptomInput = '';
        invForm = { type: 'Laboratory', test: '', priority: 'Routine' };
        rxForm = { medicine: '', strength: '', dose: '', unit: pharmRxConfig.units[0] || 'mg', route: pharmRxConfig.routes[0] || 'Oral', frequency: (function(f){ return f ? (f.name || f) : 'OD'; })(pharmRxConfig.frequencies[0]), duration: '' };
        renderConsultSheet();
        new bootstrap.Offcanvas(document.getElementById('consultSheet')).show();
    }

    function renderConsultSheet() {
        var visit = visits.find(function(v) { return v.visitId === selectedConsultVisit; });
        if (!visit) return;
        var patient = patients.find(function(p) { return p.mrn === visit.mrn; });
        var visitVitals = allVitals.filter(function(v) { return v.visitId === selectedConsultVisit; }).sort(function(a, b) { return new Date(b.recordedAt) - new Date(a.recordedAt); });
        var latestVital = visitVitals.length > 0 ? visitVitals[0] : null;
        var existing = consultations.find(function(c) { return c.visitId === selectedConsultVisit; });
        var isCompleted = !!(existing && existing.finalDiagnosis);

        $('#consultSheetTitle').html('<i data-lucide="stethoscope"></i> Consultation: ' + esc(visit.patientName));

        var body = '<div style="padding:24px">';

        body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:16px">' +
            '<div style="display:flex;align-items:center;gap:16px">' +
                '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff;font-size:16px;font-weight:700">' + getInitials(visit.patientName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="font-size:16px;font-weight:600;margin:0">' + esc(visit.patientName) + '</h3>' +
                        '<span class="badge badge-outline" style="font-size:10px">' + esc(visit.visitId) + '</span>' +
                        (isCompleted ? '<span class="badge badge-success" style="font-size:10px"><i data-lucide="lock" style="width:10px;height:10px"></i> Completed</span>' : '') +
                    '</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:4px">' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + (patient ? patient.age : '-') + 'Y, ' + (patient ? patient.gender : '-') + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground);font-family:monospace">' + esc(visit.mrn) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">Dr. ' + esc(visit.doctorName) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(visit.department) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        if (latestVital) {
            body += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;border-top:1px solid var(--color-border);padding-top:12px">';
            if (latestVital.temperature) body += '<span class="badge badge-outline" style="font-size:10px"><i data-lucide="thermometer" style="width:10px;height:10px"></i> ' + latestVital.temperature + '°F</span>';
            if (latestVital.systolic) body += '<span class="badge badge-outline" style="font-size:10px"><i data-lucide="heart" style="width:10px;height:10px"></i> ' + latestVital.systolic + '/' + (latestVital.diastolic || '-') + '</span>';
            if (latestVital.heartRate) body += '<span class="badge badge-outline" style="font-size:10px"><i data-lucide="activity" style="width:10px;height:10px"></i> ' + latestVital.heartRate + ' bpm</span>';
            if (latestVital.spO2) body += '<span class="badge badge-outline" style="font-size:10px"><i data-lucide="droplets" style="width:10px;height:10px"></i> SpO2: ' + latestVital.spO2 + '%</span>';
            body += '</div>';
        }
        body += '</div>';

        var availSections = getAvailableConsultSections(visit.department);
        body += '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:24px">';
        availSections.forEach(function(sec) {
            body += '<button class="consult-section-btn' + (consultActiveSection === sec.id ? ' active' : '') + '" data-section="' + sec.id + '"><i data-lucide="' + sec.icon + '"></i> ' + esc(sec.label) + '</button>';
        });
        body += '</div>';

        body += '<div style="display:grid;grid-template-columns:2fr 1fr;gap:24px">';

        var activeSecDef = availSections.find(function(s) { return s.id === consultActiveSection; }) || availSections[0] || {};

        body += '<div><div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">';
        body += '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px;display:flex;align-items:center;justify-content:space-between">';
        body += '<h3 style="font-size:16px;font-weight:600;margin:0">' + esc(activeSecDef.label || consultActiveSection) + '</h3>';
        if (isCompleted) body += '<span class="badge badge-success" style="font-size:10px"><i data-lucide="lock" style="width:10px;height:10px"></i> Completed — Read Only</span>';
        body += '</div>';
        body += '<div style="padding:20px">';

        if (consultActiveSection === 'symptoms') {
            body += renderSymptomsSection(isCompleted);
        } else if (consultActiveSection === 'investigation') {
            body += renderInvestigationsSection(isCompleted);
        } else if (consultActiveSection === 'prescription') {
            body += renderPrescriptionSection(isCompleted);
        } else if (consultActiveSection === 'notes') {
            body += renderNotesSection(isCompleted);
        } else {
            body += renderCustomConsultSection(activeSecDef, isCompleted);
        }

        body += '</div></div></div>';

        body += '<div>';
        body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:16px">' +
            '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h3 style="font-size:16px;font-weight:600;margin:0">Vitals Summary</h3></div>' +
            '<div style="padding:16px">';
        if (latestVital) {
            var vItems = [];
            if (latestVital.temperature) vItems.push({ label: 'Temperature', value: latestVital.temperature + '°F' });
            if (latestVital.systolic || latestVital.diastolic) vItems.push({ label: 'Blood Pressure', value: latestVital.systolic + '/' + latestVital.diastolic });
            if (latestVital.heartRate) vItems.push({ label: 'Pulse Rate', value: latestVital.heartRate + ' bpm' });
            if (latestVital.spO2) vItems.push({ label: 'SpO2', value: latestVital.spO2 + '%' });
            if (latestVital.respiratoryRate) vItems.push({ label: 'Resp Rate', value: latestVital.respiratoryRate });
            if (latestVital.weight) vItems.push({ label: 'Weight', value: latestVital.weight + ' kg' });
            body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
            vItems.forEach(function(it) {
                body += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:12px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">' + it.label + '</p><p style="font-size:18px;font-weight:700;margin:0">' + it.value + '</p></div>';
            });
            body += '</div>';
        } else {
            body += '<p style="font-size:12px;color:var(--color-muted-foreground);text-align:center;padding:16px 0">No vitals recorded for this visit</p>';
        }
        body += '</div></div>';

        if (existing) {
            body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h3 style="font-size:16px;font-weight:600;margin:0">Previous Record</h3></div>' +
                '<div style="padding:16px">';
            if (existing.symptoms && existing.symptoms.length > 0) {
                body += '<div style="margin-bottom:12px"><p style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin:0 0 4px">Symptoms</p><div style="display:flex;flex-wrap:wrap;gap:4px">' + existing.symptoms.map(function(s) { return '<span class="badge badge-outline" style="font-size:10px">' + esc(s) + '</span>'; }).join('') + '</div></div>';
            }
            if (existing.investigationOrders && existing.investigationOrders.length > 0) {
                body += '<div style="margin-bottom:12px"><p style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin:0 0 4px">Investigations</p>' + existing.investigationOrders.map(function(inv) { return '<p style="font-size:12px;margin:0">' + esc(inv.type) + ': ' + esc(inv.test) + ' (' + esc(inv.priority) + ')</p>'; }).join('') + '</div>';
            }
            if (existing.prescriptions && existing.prescriptions.length > 0) {
                body += '<div style="margin-bottom:12px"><p style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin:0 0 4px">Prescriptions</p>' + existing.prescriptions.map(function(rx) { return '<p style="font-size:12px;margin:0">' + esc(rx.medicine) + ' ' + rx.dose + rx.unit + ' - ' + rx.route + ' - ' + rx.frequency + ' x ' + rx.duration + '</p>'; }).join('') + '</div>';
            }
            if (existing.provisionalDiagnosis) body += '<div style="margin-bottom:12px"><p style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin:0 0 4px">Provisional Diagnosis</p><p style="font-size:12px;margin:0">' + esc(existing.provisionalDiagnosis) + '</p></div>';
            if (existing.finalDiagnosis) body += '<div><p style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin:0 0 4px">Final Diagnosis</p><p style="font-size:12px;margin:0">' + esc(existing.finalDiagnosis) + '</p></div>';
            body += '</div></div>';
        }
        body += '</div></div>';

        body += '<div style="display:flex;justify-content:flex-end;gap:12px;padding-top:16px;border-top:1px solid var(--color-border);margin-top:24px">' +
            '<button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>';
        if (isCompleted) {
            body += '<button class="btn-primary" id="btnPrintPrescription" style="background:#060740;color:#fff"><i data-lucide="printer"></i> Print Prescription</button>';
        } else {
            body += '<button class="btn-primary" id="btnSaveConsult"><i data-lucide="send"></i> ' + (existing ? 'Update Consultation' : 'Save Consultation') + '</button>';
        }
        body += '</div></div>';

        $('#consultSheetBody').html(body);
        lucide.createIcons();
        bindConsultEvents(isCompleted);
    }

    function renderSymptomsSection(readOnly) {
        var html = '';
        if (readOnly) {
            html += '<p style="font-size:12px;font-weight:500;color:var(--color-muted-foreground);margin-bottom:8px">Recorded Symptoms (' + symptomsList.length + ')</p>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
            symptomsList.forEach(function(s) { html += '<span class="symptom-tag">' + esc(s) + '</span>'; });
            if (symptomsList.length === 0) html += '<p style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">No symptoms recorded</p>';
            html += '</div>';
        } else {
            html += '<div style="position:relative;margin-bottom:16px"><div style="display:flex;gap:8px">' +
                '<div style="position:relative;flex:1"><i data-lucide="search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--color-muted-foreground)"></i>' +
                '<input type="text" class="form-control" id="symptomSearchInput" placeholder="Search symptoms..." style="padding-left:36px" value="' + esc(symptomInput) + '"></div>' +
                '<button class="btn-outline" id="btnAddCustomSymptom"><i data-lucide="plus" style="width:16px;height:16px"></i> Add Custom</button>' +
                '</div><div class="autocomplete-dropdown" id="symptomDropdown" style="display:none"></div></div>';
            html += '<div><p style="font-size:12px;font-weight:500;color:var(--color-muted-foreground);margin-bottom:8px">Selected Symptoms (' + symptomsList.length + ')</p>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
            symptomsList.forEach(function(s, i) { html += '<span class="symptom-tag">' + esc(s) + ' <button class="remove-btn remove-symptom" data-idx="' + i + '"><i data-lucide="x" style="width:12px;height:12px"></i></button></span>'; });
            if (symptomsList.length === 0) html += '<p style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">No symptoms selected — search above to add</p>';
            html += '</div></div>';
        }
        return html;
    }

    function renderInvestigationsSection(readOnly) {
        var html = '';
        if (!readOnly) {
            html += '<div style="display:grid;grid-template-columns:1fr 2fr 1fr auto;gap:8px;align-items:end;margin-bottom:16px">' +
                '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Type</label><select class="form-select" id="invType"><option value="Laboratory"' + (invForm.type === 'Laboratory' ? ' selected' : '') + '>Laboratory</option><option value="Radiology"' + (invForm.type === 'Radiology' ? ' selected' : '') + '>Radiology</option></select></div>' +
                '<div class="form-group" style="position:relative"><label style="font-size:12px;color:var(--color-muted-foreground)">Test Name</label>' +
                '<div style="position:relative">' +
                '<i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--color-muted-foreground);pointer-events:none;z-index:1"></i>' +
                '<input type="text" class="form-control" id="invTestInput" placeholder="Click or type to search..." value="' + esc(invForm.test) + '" style="padding-left:30px;padding-right:28px;cursor:pointer" autocomplete="off">' +
                '<i data-lucide="chevron-down" id="invTestChevron" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--color-muted-foreground);pointer-events:none;transition:transform 0.2s"></i>' +
                '</div>' +
                '<div class="autocomplete-dropdown" id="invTestDropdown" style="display:none;top:calc(100% + 2px)"></div></div>' +
                '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Priority</label><select class="form-select" id="invPriority"><option value="Routine"' + (invForm.priority === 'Routine' ? ' selected' : '') + '>Routine</option><option value="Urgent"' + (invForm.priority === 'Urgent' ? ' selected' : '') + '>Urgent</option><option value="STAT"' + (invForm.priority === 'STAT' ? ' selected' : '') + '>STAT</option></select></div>' +
                '<button class="btn-primary btn-sm" id="btnAddInv" style="height:38px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add</button>' +
            '</div>';
        }
        if (investigationsList.length > 0) {
            html += '<div style="border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">Type</th><th style="font-size:12px">Test</th><th style="font-size:12px">Priority</th>' + (!readOnly ? '<th style="width:40px"></th>' : '') + '</tr></thead><tbody>';
            investigationsList.forEach(function(inv, i) {
                var prioClass = inv.priority === 'STAT' ? 'color:var(--color-destructive)' : (inv.priority === 'Urgent' ? 'color:var(--color-warning)' : 'color:var(--color-muted-foreground)');
                var testDisplay = esc(inv.test);
                if (inv.testCode) testDisplay += ' <span style="font-size:10px;color:var(--color-muted-foreground);font-weight:400">(' + esc(inv.testCode) + ')</span>';
                html += '<tr><td style="font-size:12px">' + esc(inv.type) + '</td><td style="font-size:14px;font-weight:500">' + testDisplay + '</td><td><span style="font-size:10px;font-weight:600;text-transform:uppercase;' + prioClass + '">' + esc(inv.priority) + '</span></td>' + (!readOnly ? '<td><button class="btn-ghost remove-inv" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td>' : '') + '</tr>';
            });
            html += '</tbody></table></div>';
        } else {
            html += '<p style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">No investigations ' + (readOnly ? 'ordered' : 'added yet') + '</p>';
        }
        return html;
    }

    function renderPrescriptionSection(readOnly) {
        var html = '';
        if (!readOnly) {
            /* Single row: Medicine · Strength · Dose · Unit · Route · Frequency · Duration · Add */
            html += '<div style="display:grid;grid-template-columns:minmax(180px,2.4fr) minmax(90px,0.9fr) minmax(70px,0.65fr) minmax(80px,0.75fr) minmax(110px,1fr) minmax(110px,1fr) minmax(100px,0.9fr) auto;gap:8px;align-items:end;margin-bottom:16px">' +
                /* Medicine — styled like investigation test-name dropdown */
                '<div class="form-group" style="position:relative;margin-bottom:0">' +
                    '<label style="font-size:12px;color:var(--color-muted-foreground)">Medicine</label>' +
                    '<div style="position:relative">' +
                        '<i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--color-muted-foreground);pointer-events:none;z-index:1"></i>' +
                        '<input type="text" class="form-control" id="rxMedInput" placeholder="Click or type to search..." value="' + esc(rxForm.medicine) + '" style="padding-left:30px;padding-right:28px;cursor:pointer" autocomplete="off">' +
                        '<i data-lucide="chevron-down" id="rxMedChevron" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--color-muted-foreground);pointer-events:none;transition:transform 0.2s"></i>' +
                    '</div>' +
                    '<div class="autocomplete-dropdown" id="rxMedDropdown" style="display:none;top:calc(100% + 2px)"></div>' +
                '</div>' +
                /* Strength — auto-filled readonly */
                '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Strength</label>' +
                '<input type="text" class="form-control" id="rxStrength" value="' + esc(rxForm.strength) + '" placeholder="Auto" readonly style="background:var(--color-muted);cursor:default;color:var(--color-muted-foreground)"></div>' +
                /* Dose */
                '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Dose</label>' +
                '<input type="text" class="form-control" id="rxDose" placeholder="e.g. 1" value="' + esc(rxForm.dose) + '"></div>' +
                /* Unit */
                '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Unit</label>' +
                '<select class="form-select" id="rxUnit">' + buildRxOptions(pharmRxConfig.units, rxForm.unit) + '</select></div>' +
                /* Route */
                '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Route</label>' +
                '<select class="form-select" id="rxRoute">' + buildRxOptions(pharmRxConfig.routes, rxForm.route) + '</select></div>' +
                /* Frequency */
                '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Frequency</label>' +
                '<select class="form-select" id="rxFrequency">' + buildFreqOptions(pharmRxConfig.frequencies, rxForm.frequency) + '</select></div>' +
                /* Duration */
                '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration</label>' +
                '<input type="text" class="form-control" id="rxDuration" placeholder="e.g. 5 days" value="' + esc(rxForm.duration) + '"></div>' +
                /* Add button */
                '<button class="btn-primary btn-sm" id="btnAddRx" style="height:38px;white-space:nowrap"><i data-lucide="plus" style="width:14px;height:14px"></i> Add</button>' +
            '</div>';
        }
        if (prescriptionsList.length > 0) {
            html += '<div style="border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Medicine</th><th style="font-size:12px">Dose</th><th style="font-size:12px">Route</th><th style="font-size:12px">Frequency</th><th style="font-size:12px">Duration</th><th style="font-size:12px" title="Dose × Times/day × Days">Total Qty</th>' + (!readOnly ? '<th style="width:40px"></th>' : '') + '</tr></thead><tbody>';
            prescriptionsList.forEach(function(rx, i) {
                var total = calcRxTotal(rx);
                var totalHtml = (total !== null)
                    ? '<span style="font-size:12px;font-weight:600;color:var(--midnight-blue)">' + total + ' ' + esc(rx.unit) + '</span><div style="font-size:10px;color:var(--color-muted-foreground)">' + rx.dose + ' × ' + rx.timesPerDay + '/day × ' + parseInt(rx.duration) + 'd</div>'
                    : '<span style="font-size:11px;color:var(--color-muted-foreground)">—</span>';
                html += '<tr><td style="font-size:12px;font-weight:500">' + (i + 1) + '</td><td style="font-size:14px;font-weight:500">' + esc(rx.medicine) + '</td><td style="font-size:12px">' + esc(rx.dose) + ' ' + esc(rx.unit) + '</td><td style="font-size:12px">' + esc(rx.route) + '</td><td><span class="badge badge-outline" style="font-size:10px">' + esc(rx.frequency) + '</span></td><td style="font-size:12px">' + esc(rx.duration) + '</td><td>' + totalHtml + '</td>' + (!readOnly ? '<td><button class="btn-ghost remove-rx" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td>' : '') + '</tr>';
            });
            html += '</tbody></table></div>';
        } else {
            html += '<p style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">No prescriptions ' + (readOnly ? 'recorded' : 'added yet') + '</p>';
        }
        return html;
    }

    function renderNotesSection(readOnly) {
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';
        if (readOnly) {
            html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:16px"><p style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin:0 0 8px">Clinical Findings</p><p style="font-size:14px;margin:0">' + (clinicalNotes.findings || '<span style="color:var(--color-muted-foreground);font-style:italic;font-size:12px">Not recorded</span>') + '</p></div>';
            html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:16px"><p style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin:0 0 8px">Provisional Diagnosis</p><p style="font-size:14px;margin:0">' + (clinicalNotes.provisionalDiagnosis || '<span style="color:var(--color-muted-foreground);font-style:italic;font-size:12px">Not recorded</span>') + '</p></div>';
            html += '<div style="border:2px solid rgba(127,255,212,0.3);background:rgba(127,255,212,0.05);border-radius:8px;padding:16px"><p style="font-size:10px;font-weight:600;color:var(--aquamint);text-transform:uppercase;margin:0 0 8px">Final Diagnosis</p><p style="font-size:14px;font-weight:600;margin:0">' + esc(clinicalNotes.finalDiagnosis) + '</p></div>';
            html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:16px"><p style="font-size:10px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;margin:0 0 8px">Doctor Notes</p><p style="font-size:14px;margin:0">' + (clinicalNotes.doctorNotes || '<span style="color:var(--color-muted-foreground);font-style:italic;font-size:12px">Not recorded</span>') + '</p></div>';
        } else {
            html += '<div class="form-group"><label style="font-size:12px;font-weight:600;color:var(--midnight-blue)">Clinical Findings</label><textarea class="form-control consult-note" data-note="findings" rows="4" placeholder="Examination findings..." style="resize:none">' + esc(clinicalNotes.findings) + '</textarea></div>';
            html += '<div class="form-group"><label style="font-size:12px;font-weight:600;color:var(--midnight-blue)">Provisional Diagnosis</label><textarea class="form-control consult-note" data-note="provisionalDiagnosis" rows="4" placeholder="Initial diagnosis..." style="resize:none">' + esc(clinicalNotes.provisionalDiagnosis) + '</textarea></div>';
            html += '<div class="form-group"><label style="font-size:12px;font-weight:600;color:var(--midnight-blue)">Final Diagnosis</label><textarea class="form-control consult-note" data-note="finalDiagnosis" rows="4" placeholder="Confirmed diagnosis..." style="resize:none">' + esc(clinicalNotes.finalDiagnosis) + '</textarea></div>';
            html += '<div class="form-group"><label style="font-size:12px;font-weight:600;color:var(--midnight-blue)">Doctor Notes</label><textarea class="form-control consult-note" data-note="doctorNotes" rows="4" placeholder="Additional notes and instructions..." style="resize:none">' + esc(clinicalNotes.doctorNotes) + '</textarea></div>';
        }
        html += '</div>';
        return html;
    }

    function renderCustomConsultSection(secDef, readOnly) {
        var fields = secDef.fields || [];
        var sKey = secDef.id;
        var saved = (customSectionData && customSectionData[sKey]) ? customSectionData[sKey] : {};
        if (!fields.length) {
            return '<p style="color:var(--color-muted-foreground);font-style:italic;font-size:13px">No fields configured for this section.</p>';
        }
        var OPTION_TYPES = ['dropdown', 'multi-select', 'radio', 'checkbox'];
        var html = '<div style="display:flex;flex-direction:column;gap:14px">';
        fields.forEach(function(f) {
            var val = saved[f.id] !== undefined ? saved[f.id] : (OPTION_TYPES.indexOf(f.type) > -1 ? [] : '');
            var opts = Array.isArray(f.options) ? f.options : [];
            var sAttr = ' data-section="' + esc(sKey) + '" data-field="' + esc(f.id) + '"';
            html += '<div class="form-group" style="margin:0">';
            html += '<label style="font-size:12px;font-weight:600;color:var(--midnight-blue);display:block;margin-bottom:5px">' + esc(f.label) + '</label>';

            if (readOnly) {
                var displayVal = '';
                if (Array.isArray(val)) {
                    displayVal = val.length ? val.map(function(v) { return '<span style="display:inline-block;padding:2px 8px;background:rgba(6,7,64,0.07);border-radius:4px;font-size:12px;margin:2px">' + esc(v) + '</span>'; }).join(' ') : '';
                } else {
                    displayVal = esc(val);
                }
                html += '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px 14px;min-height:36px;background:var(--color-muted)">' + (displayVal || '<span style="color:var(--color-muted-foreground);font-style:italic;font-size:12px">Not recorded</span>') + '</div>';
            } else {
                if (f.type === 'textarea') {
                    html += '<textarea class="form-control custom-section-field"' + sAttr + ' rows="3" style="resize:none">' + esc(val) + '</textarea>';

                } else if (f.type === 'number') {
                    html += '<input type="number" class="form-control custom-section-field"' + sAttr + ' value="' + esc(val) + '" placeholder="Enter value...">';

                } else if (f.type === 'email') {
                    html += '<input type="email" class="form-control custom-section-field"' + sAttr + ' value="' + esc(val) + '" placeholder="Enter email...">';

                } else if (f.type === 'password') {
                    html += '<input type="password" class="form-control custom-section-field"' + sAttr + ' value="' + esc(val) + '" placeholder="Enter password...">';

                } else if (f.type === 'date') {
                    html += '<input type="date" class="form-control custom-section-field"' + sAttr + ' value="' + esc(val) + '">';

                } else if (f.type === 'time') {
                    html += '<input type="time" class="form-control custom-section-field"' + sAttr + ' value="' + esc(val) + '">';

                } else if (f.type === 'dropdown') {
                    html += '<select class="form-select custom-section-field"' + sAttr + '>';
                    html += '<option value="">— Select —</option>';
                    opts.forEach(function(o) { html += '<option value="' + esc(o) + '"' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; });
                    html += '</select>';

                } else if (f.type === 'multi-select') {
                    var arrVal = Array.isArray(val) ? val : (val ? [val] : []);
                    html += '<select class="form-select custom-section-multiselect"' + sAttr + ' multiple style="min-height:' + Math.min(opts.length * 32 + 16, 140) + 'px">';
                    opts.forEach(function(o) { html += '<option value="' + esc(o) + '"' + (arrVal.indexOf(o) > -1 ? ' selected' : '') + '>' + esc(o) + '</option>'; });
                    html += '</select>';
                    html += '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:3px">Hold Ctrl / Cmd to select multiple</div>';

                } else if (f.type === 'radio') {
                    html += '<div class="custom-section-radio-group" style="display:flex;flex-wrap:wrap;gap:10px"' + sAttr + '>';
                    opts.forEach(function(o) {
                        html += '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">' +
                            '<input type="radio" name="csf_' + esc(sKey) + '_' + esc(f.id) + '" class="custom-section-radio" data-section="' + esc(sKey) + '" data-field="' + esc(f.id) + '" value="' + esc(o) + '"' + (val === o ? ' checked' : '') + '> ' + esc(o) + '</label>';
                    });
                    html += '</div>';

                } else if (f.type === 'checkbox') {
                    var arrVal2 = Array.isArray(val) ? val : (val ? [val] : []);
                    html += '<div class="custom-section-checkbox-group" style="display:flex;flex-wrap:wrap;gap:10px"' + sAttr + '>';
                    opts.forEach(function(o) {
                        html += '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">' +
                            '<input type="checkbox" class="custom-section-checkbox" data-section="' + esc(sKey) + '" data-field="' + esc(f.id) + '" value="' + esc(o) + '"' + (arrVal2.indexOf(o) > -1 ? ' checked' : '') + '> ' + esc(o) + '</label>';
                    });
                    html += '</div>';

                } else {
                    html += '<input type="text" class="form-control custom-section-field"' + sAttr + ' value="' + esc(val) + '" placeholder="Enter ' + esc(f.label.toLowerCase()) + '...">';
                }
            }
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    function bindConsultEvents(isCompleted) {
        $(document).off('click.consultSection').on('click.consultSection', '.consult-section-btn', function() {
            consultActiveSection = $(this).data('section');
            saveConsultFormValues();
            renderConsultSheet();
        });

        if (!isCompleted) {
            $('#symptomSearchInput').off('input focus').on('input focus', function() {
                symptomInput = $(this).val();
                var filtered = commonSymptoms.filter(function(s) { return s.toLowerCase().indexOf(symptomInput.toLowerCase()) > -1 && symptomsList.indexOf(s) === -1; });
                if (filtered.length > 0 || symptomInput.trim()) {
                    var dropHtml = '';
                    filtered.slice(0, 15).forEach(function(s) {
                        dropHtml += '<button class="add-symptom-item" data-symptom="' + esc(s) + '"><i data-lucide="plus"></i> ' + esc(s) + '</button>';
                    });
                    if (symptomInput.trim() && !commonSymptoms.some(function(s) { return s.toLowerCase() === symptomInput.trim().toLowerCase(); }) && symptomsList.indexOf(symptomInput.trim()) === -1) {
                        dropHtml += '<button class="add-symptom-item" data-symptom="' + esc(symptomInput.trim()) + '" style="border-top:1px solid var(--color-border);font-weight:500;color:var(--aquamint)"><i data-lucide="plus"></i> Add "' + esc(symptomInput.trim()) + '" as custom symptom</button>';
                    }
                    $('#symptomDropdown').html(dropHtml).show();
                    lucide.createIcons();
                } else {
                    $('#symptomDropdown').hide();
                }
            });

            $('#symptomSearchInput').off('keydown').on('keydown', function(e) {
                if (e.key === 'Enter' && symptomInput.trim()) {
                    if (symptomsList.indexOf(symptomInput.trim()) === -1) symptomsList.push(symptomInput.trim());
                    symptomInput = '';
                    renderConsultSheet();
                }
                if (e.key === 'Escape') $('#symptomDropdown').hide();
            });

            $(document).off('click.addSymptom').on('click.addSymptom', '.add-symptom-item', function() {
                var s = $(this).data('symptom');
                if (symptomsList.indexOf(s) === -1) symptomsList.push(s);
                symptomInput = '';
                renderConsultSheet();
            });

            $('#btnAddCustomSymptom').off('click').on('click', function() {
                var val = $('#symptomSearchInput').val().trim();
                if (val && symptomsList.indexOf(val) === -1) { symptomsList.push(val); symptomInput = ''; renderConsultSheet(); }
            });

            $(document).off('click.removeSymptom').on('click.removeSymptom', '.remove-symptom', function() {
                symptomsList.splice($(this).data('idx'), 1);
                renderConsultSheet();
            });

            $('#invType').off('change').on('change', function() {
                invForm.type = $(this).val();
                invForm.test = '';
                invForm.testCode = '';
                invForm.price = '';
                invForm.dept = '';
                invForm.sample = '';
                $('#invTestInput').val('').focus();
                _invHideDropdown();
            });

            function _invShowDropdown() {
                $('#invTestChevron').css('transform', 'translateY(-50%) rotate(180deg)');
            }
            function _invHideDropdown() {
                $('#invTestDropdown').hide();
                $('#invTestChevron').css('transform', 'translateY(-50%) rotate(0deg)');
            }

            function _invBuildLabRow(t) {
                return '<button class="add-inv-test" data-test="' + esc(t.test_name) + '" data-code="' + esc(t.test_code) + '" data-price="' + (t.standard_price || '') + '" data-dept="' + esc(t.department) + '" data-sample="' + esc(t.sample_type) + '" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 12px;border:none;background:transparent;cursor:pointer;text-align:left;border-bottom:1px solid rgba(0,0,0,0.04)">' +
                    '<div style="min-width:0;flex:1">' +
                        '<div style="font-size:13px;font-weight:600;color:var(--color-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(t.test_name) + (t.short_name ? ' <span style="font-weight:400;font-size:11px;color:var(--color-muted-foreground)">(' + esc(t.short_name) + ')</span>' : '') + '</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:1px">' + esc(t.department || '') + (t.sample_type ? ' &middot; ' + esc(t.sample_type) : '') + '</div>' +
                    '</div>' +
                    (t.standard_price ? '<div style="font-size:12px;font-weight:600;font-family:monospace;color:var(--aqua-mint);white-space:nowrap;margin-left:12px">PKR ' + Number(t.standard_price).toLocaleString() + '</div>' : '') +
                '</button>';
            }

            function _invSearchLab(q) {
                clearTimeout(labTestSearchTimer);
                labTestSearchTimer = setTimeout(function() {
                    $.get('/api/test-master/search', { q: q }, function(tests) {
                        if (!tests || tests.length === 0) {
                            $('#invTestDropdown').html('<div style="padding:16px;text-align:center;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="search-x" style="width:20px;height:20px;margin:0 auto 6px;display:block;opacity:0.5"></i>No tests found</div>').show();
                            lucide.createIcons();
                            return;
                        }
                        var dh = '';
                        tests.forEach(function(t) { dh += _invBuildLabRow(t); });
                        $('#invTestDropdown').html(dh).show();
                        _invShowDropdown();
                    });
                }, q.length === 0 ? 0 : 220);
            }

            $('#invTestInput').off('input focus click').on('input focus click', function(e) {
                invForm.test = $(this).val();
                var q = invForm.test;
                if (invForm.type === 'Laboratory') {
                    _invSearchLab(q);
                } else {
                    /* Radiology: filter hardcoded list */
                    var list = q.length === 0
                        ? radiologyTests.slice(0, 20)
                        : radiologyTests.filter(function(t) { return t.toLowerCase().indexOf(q.toLowerCase()) > -1; });
                    if (list.length > 0) {
                        var dh = '';
                        list.slice(0, 15).forEach(function(t) {
                            dh += '<button class="add-inv-test" data-test="' + esc(t) + '" style="display:flex;align-items:center;width:100%;padding:8px 12px;border:none;background:transparent;cursor:pointer;text-align:left;border-bottom:1px solid rgba(0,0,0,0.04)">' +
                                '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(t) + '</div>' +
                            '</button>';
                        });
                        $('#invTestDropdown').html(dh).show();
                        _invShowDropdown();
                    } else {
                        $('#invTestDropdown').html('<div style="padding:16px;text-align:center;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="search-x" style="width:20px;height:20px;margin:0 auto 6px;display:block;opacity:0.5"></i>No tests found</div>').show();
                        lucide.createIcons();
                    }
                }
            });

            $('#invTestInput').off('blur.invDrop').on('blur.invDrop', function() {
                /* mousedown on a dropdown item fires before blur, so by the time
                   blur triggers the selection is already done — just close cleanly */
                setTimeout(_invHideDropdown, 80);
            });

            /* use mousedown (fires before blur) so selection is captured
               even when the input loses focus at the same moment           */
            $(document).off('mousedown.addInvTest click.addInvTest')
                       .on('mousedown.addInvTest', '.add-inv-test', function(e) {
                e.preventDefault(); /* stop input losing focus / blur firing */
                invForm.test    = $(this).data('test')   || '';
                invForm.testCode= $(this).data('code')   || '';
                invForm.price   = $(this).data('price')  || '';
                invForm.dept    = $(this).data('dept')   || '';
                invForm.sample  = $(this).data('sample') || '';
                $('#invTestInput').val(invForm.test);
                _invHideDropdown();
            });

            $('#invPriority').off('change').on('change', function() { invForm.priority = $(this).val(); });

            $('#btnAddInv').off('click').on('click', function() {
                if (!invForm.test.trim()) return;
                var invEntry = { type: invForm.type, test: invForm.test.trim(), priority: invForm.priority };
                if (invForm.type === 'Laboratory' && invForm.testCode) {
                    invEntry.testCode = invForm.testCode;
                    invEntry.price = invForm.price;
                    invEntry.department = invForm.dept;
                    invEntry.sampleType = invForm.sample;
                }
                investigationsList.push(invEntry);
                invForm.test = '';
                invForm.testCode = '';
                invForm.price = '';
                invForm.dept = '';
                invForm.sample = '';
                renderConsultSheet();
            });

            $(document).off('click.removeInv').on('click.removeInv', '.remove-inv', function() {
                investigationsList.splice($(this).data('idx'), 1);
                renderConsultSheet();
            });

            /* helpers for medicine dropdown chevron */
            function _rxShowDropdown() {
                $('#rxMedChevron').css('transform', 'translateY(-50%) rotate(180deg)');
            }
            function _rxHideDropdown() {
                $('#rxMedDropdown').hide();
                $('#rxMedChevron').css('transform', 'translateY(-50%) rotate(0deg)');
            }

            /* guess dosage unit keyword from strength string e.g. "500mg" → "mg" */
            function _rxUnitFromStrength(s) {
                if (!s) return '';
                var sl = s.toLowerCase();
                if (sl.indexOf('iu') > -1) return 'IU';
                if (sl.indexOf('mcg') > -1) return 'mcg';
                if (sl.indexOf('mg') > -1) return 'mg';
                if (sl.indexOf('ml') > -1) return 'ml';
                if (sl.indexOf('g') > -1) return 'g';
                return '';
            }

            /* normalise a pharmRxConfig item to its string value */
            function _rxItemStr(v) { return typeof v === 'object' ? (v.name || v.label || '') : String(v); }

            /* find the best matching option value from a list (e.g. "mg" → "mg") */
            function _rxMatchOption(items, keyword) {
                if (!keyword) return '';
                var kl = keyword.toLowerCase();
                var strs = items.map(_rxItemStr);
                /* 1. exact match (case-insensitive) */
                for (var i = 0; i < strs.length; i++) {
                    if (strs[i].toLowerCase() === kl) return strs[i];
                }
                /* 2. option starts with keyword */
                for (var i = 0; i < strs.length; i++) {
                    if (strs[i].toLowerCase().indexOf(kl) === 0) return strs[i];
                }
                /* 3. keyword appears anywhere inside option */
                for (var i = 0; i < strs.length; i++) {
                    if (strs[i].toLowerCase().indexOf(kl) > -1) return strs[i];
                }
                return '';
            }

            function _rxBuildMedRow(m) {
                return '<button class="add-rx-med" type="button"' +
                    ' data-med="' + esc(m.label) + '"' +
                    ' data-med-id="' + esc(m.id) + '"' +
                    ' data-strength="' + esc(m.strength) + '"' +
                    ' data-form="' + esc(m.form) + '"' +
                    ' style="display:flex;align-items:center;width:100%;padding:8px 12px;border:none;background:transparent;cursor:pointer;text-align:left;border-bottom:1px solid rgba(0,0,0,0.04)">' +
                    '<div style="min-width:0;flex:1">' +
                        '<div style="font-size:13px;font-weight:600;color:var(--color-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
                            esc(m.name) +
                            (m.strength ? ' <span style="font-weight:400;color:var(--color-muted-foreground);font-size:12px">' + esc(m.strength) + '</span>' : '') +
                            (m.form ? ' <span style="font-size:10px;color:var(--color-muted-foreground)">(' + esc(m.form) + ')</span>' : '') +
                        '</div>' +
                        (m.generic ? '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:1px">' + esc(m.generic) + '</div>' : '') +
                    '</div>' +
                '</button>';
            }

            function _rxRefreshDropdown() {
                var query = ($('#rxMedInput').val() || '').toLowerCase();
                var filtered = query.length === 0
                    ? pharmacyMedicines.slice(0, 20)
                    : pharmacyMedicines.filter(function(m) {
                        return m.label.toLowerCase().indexOf(query) > -1 || (m.generic || '').toLowerCase().indexOf(query) > -1;
                    }).slice(0, 15);

                if (filtered.length > 0) {
                    var dh = '';
                    filtered.forEach(function(m) { dh += _rxBuildMedRow(m); });
                    $('#rxMedDropdown').html(dh).show();
                    _rxShowDropdown();
                } else {
                    $('#rxMedDropdown').html('<div style="padding:16px;text-align:center;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="search-x" style="width:20px;height:20px;margin:0 auto 6px;display:block;opacity:0.5"></i>No medicines found</div>').show();
                    lucide.createIcons();
                }
            }

            $('#rxMedInput').off('input focus click').on('input focus click', function() {
                rxForm.medicine = $(this).val();
                if (!pharmacyMedicinesLoaded) {
                    /* show loading state then auto-populate once loaded */
                    $('#rxMedDropdown').html('<div style="padding:16px;text-align:center;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="loader-2" style="width:18px;height:18px;margin:0 auto 6px;display:block;opacity:0.6"></i>Loading medicines...</div>').show();
                    lucide.createIcons();
                    _rxShowDropdown();
                    loadPharmacyMedicines(function() { _rxRefreshDropdown(); });
                } else {
                    _rxRefreshDropdown();
                }
            });

            $('#rxMedInput').off('blur.rxDrop').on('blur.rxDrop', function() {
                setTimeout(_rxHideDropdown, 80);
            });

            /* mousedown fires before blur — prevents focus loss during selection */
            $(document).off('mousedown.addRxMed click.addRxMed')
                       .on('mousedown.addRxMed', '.add-rx-med', function(e) {
                e.preventDefault();
                var med      = $(this).data('med')      || '';
                var strength = $(this).data('strength') || '';
                var form     = $(this).data('form')     || '';
                var rawUnit   = _rxUnitFromStrength(strength);
                var autoUnit  = _rxMatchOption(pharmRxConfig.units, rawUnit);

                rxForm.medicine   = med;
                rxForm.medicineId = $(this).data('med-id') || '';
                rxForm.strength   = strength;

                $('#rxMedInput').val(med);
                $('#rxStrength').val(strength);

                /* auto-fill unit: set and confirm the select accepted the value */
                if (autoUnit) {
                    $('#rxUnit').val(autoUnit);
                    /* if browser rejected (option not present), keep whatever is selected */
                    rxForm.unit = $('#rxUnit').val() || rxForm.unit;
                }
                _rxHideDropdown();
            });

            $('#btnAddRx').off('click').on('click', function() {
                if (!$('#rxMedInput').val().trim()) return;
                var freqName = $('#rxFrequency').val() || 'OD';
                prescriptionsList.push({
                    medicine  : $('#rxMedInput').val().trim(),
                    strength  : $('#rxStrength').val().trim(),
                    medicineId: rxForm.medicineId || null,
                    dose      : $('#rxDose').val() || '',
                    unit      : $('#rxUnit').val() || 'mg',
                    route     : $('#rxRoute').val() || 'Oral',
                    frequency : freqName,
                    timesPerDay: getFreqTimesPerDay(freqName),
                    duration  : $('#rxDuration').val() || ''
                });
                rxForm = { medicine: '', strength: '', dose: '', unit: pharmRxConfig.units[0] || 'mg', route: pharmRxConfig.routes[0] || 'Oral', frequency: (function(f){ return f ? (f.name || f) : 'OD'; })(pharmRxConfig.frequencies[0]), duration: '' };
                renderConsultSheet();
            });

            $(document).off('click.removeRx').on('click.removeRx', '.remove-rx', function() {
                prescriptionsList.splice($(this).data('idx'), 1);
                renderConsultSheet();
            });

            $('.consult-note').off('input').on('input', function() {
                clinicalNotes[$(this).data('note')] = $(this).val();
            });
        }

        $('#btnSaveConsult').off('click').on('click', function() {
            saveConsultFormValues();
            var visit = visits.find(function(v) { return v.visitId === selectedConsultVisit; });
            if (!visit) return;
            var existing = consultations.find(function(c) { return c.visitId === selectedConsultVisit; });

            showConsultConfirmModal({
                patientName:    visit.patientName,
                mrn:            visit.mrn,
                visitId:        visit.visitId,
                doctorName:     visit.doctorName,
                symptoms:       symptomsList,
                investigations: investigationsList,
                prescriptions:  prescriptionsList,
                finalDiagnosis: clinicalNotes.finalDiagnosis,
                isUpdate:       !!existing,
                onConfirm: function($cb) {
                    var payload = {
                        visitId: selectedConsultVisit, mrn: visit.mrn, patientName: visit.patientName,
                        doctorName: visit.doctorName, department: visit.department,
                        symptoms: symptomsList, investigationOrders: investigationsList,
                        prescriptions: prescriptionsList,
                        clinicalFindings: clinicalNotes.findings, provisionalDiagnosis: clinicalNotes.provisionalDiagnosis,
                        finalDiagnosis: clinicalNotes.finalDiagnosis, doctorNotes: clinicalNotes.doctorNotes,
                        customSectionData: customSectionData
                    };
                    var ajax = existing
                        ? $.ajax({ url: '/api/opd/consultations/' + existing.consultationId, method: 'PUT', contentType: 'application/json', data: JSON.stringify(payload) })
                        : $.ajax({ url: '/api/opd/consultations', method: 'POST', contentType: 'application/json', data: JSON.stringify(payload) });
                    ajax.done(function() {
                        bootstrap.Offcanvas.getInstance(document.getElementById('consultSheet')).hide();
                        selectedConsultVisit = null;
                        loadAllData();
                        showConsultSuccessModal({
                            patientName: visit.patientName,
                            mrn:         visit.mrn,
                            visitId:     visit.visitId,
                            doctorName:  visit.doctorName,
                            isUpdate:    !!existing
                        });
                    }).fail(function(xhr) {
                        if ($cb) $cb.prop('disabled', false).html('<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Save');
                        lucide.createIcons();
                        HMS.ajaxError(xhr, 'Failed to save consultation');
                    });
                }
            });
        });

        $('#btnPrintPrescription').off('click').on('click', function() {
            handlePrintPrescription();
        });

        $(document).off('click.closeDropdowns').on('click.closeDropdowns', function(e) {
            if (!$(e.target).closest('#symptomSearchInput, #symptomDropdown').length) $('#symptomDropdown').hide();
            if (!$(e.target).closest('#invTestInput, #invTestDropdown').length) $('#invTestDropdown').hide();
            if (!$(e.target).closest('#rxMedInput, #rxMedDropdown').length) $('#rxMedDropdown').hide();
        });
    }

    function saveConsultFormValues() {
        $('.consult-note').each(function() {
            clinicalNotes[$(this).data('note')] = $(this).val();
        });
        // Standard fields (text, number, textarea, email, password, date, time, dropdown)
        $('.custom-section-field').each(function() {
            var secKey = $(this).data('section');
            var fieldId = $(this).data('field');
            if (!customSectionData[secKey]) customSectionData[secKey] = {};
            customSectionData[secKey][fieldId] = $(this).val();
        });
        // Multi-select
        $('.custom-section-multiselect').each(function() {
            var secKey = $(this).data('section');
            var fieldId = $(this).data('field');
            if (!customSectionData[secKey]) customSectionData[secKey] = {};
            customSectionData[secKey][fieldId] = $(this).val() || [];
        });
        // Radio buttons — collect checked value per section+field
        var radioSeen = {};
        $('.custom-section-radio:checked').each(function() {
            var secKey = $(this).data('section');
            var fieldId = $(this).data('field');
            var key = secKey + '|' + fieldId;
            if (!radioSeen[key]) {
                if (!customSectionData[secKey]) customSectionData[secKey] = {};
                customSectionData[secKey][fieldId] = $(this).val();
                radioSeen[key] = true;
            }
        });
        // Checkbox groups — collect all checked values per section+field
        var cbGroups = {};
        $('.custom-section-checkbox').each(function() {
            var secKey = $(this).data('section');
            var fieldId = $(this).data('field');
            var key = secKey + '|' + fieldId;
            if (!cbGroups[key]) cbGroups[key] = { secKey: secKey, fieldId: fieldId, values: [] };
            if ($(this).is(':checked')) cbGroups[key].values.push($(this).val());
        });
        $.each(cbGroups, function(key, g) {
            if (!customSectionData[g.secKey]) customSectionData[g.secKey] = {};
            customSectionData[g.secKey][g.fieldId] = g.values;
        });
    }

    function handlePrintPrescription() {
        var visit = visits.find(function(v) { return v.visitId === selectedConsultVisit; });
        var existing = consultations.find(function(c) { return c.visitId === selectedConsultVisit; });
        if (!visit || !existing) return;
        var patient = patients.find(function(p) { return p.mrn === visit.mrn; });

        var visitVitals = allVitals.filter(function(v) { return v.visitId === selectedConsultVisit; })
            .sort(function(a, b) { return new Date(b.recordedAt) - new Date(a.recordedAt); });
        var lv = visitVitals.length > 0 ? visitVitals[0] : null;

        // Doctor who saved the consultation
        var consultDoctor = existing.doctorName || visit.doctorName || '';
        var consultDept   = visit.department || '';

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

            var svgPhone = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
            var svgMail  = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
            var svgGlobe = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/></svg>';
            var contactParts = [];
            if (lh.lh_show_phone   === '1' && pr.contact_phone)   contactParts.push(svgPhone + esc(pr.contact_phone));
            if (lh.lh_show_email   === '1' && pr.contact_email)   contactParts.push(svgMail  + esc(pr.contact_email));
            if (lh.lh_show_website === '1' && pr.contact_website) contactParts.push(svgGlobe + esc(pr.contact_website));

            var footerLines = [ft.footer_line1, ft.footer_line2, ft.footer_line3].filter(Boolean);
            var metaParts = [];
            if (ft.footer_show_page_number === '1') metaParts.push('Page 1 of 1');
            if (ft.footer_show_date === '1') {
                var _now = new Date();
                metaParts.push('Printed: ' + _now.toLocaleDateString('en-GB') + ', ' + _now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            }

            // ── Helpers ──
            function e(v) { return (v || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
            function infoCell(label, val, borderRight, rowBg) {
                return '<td style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + e(label) + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + e(val) + '</div>'
                     + '</td>';
            }
            function sectionLabel(title) {
                return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
                     + '<div style="width:3px;height:14px;background:' + color + ';border-radius:2px;flex-shrink:0"></div>'
                     + '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#1e293b">' + title + '</span>'
                     + '</div>';
            }

            // ── Logo ──
            var logoHtml = '';
            if (lh.lh_show_logo !== '0') {
                logoHtml = '<div style="width:' + logoSize + ';height:' + logoSize + ';background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2e8f0;flex-shrink:0">'
                         + (logoPath ? '<img src="' + logoPath + '" style="max-width:100%;max-height:100%;object-fit:contain">' : '<span style="font-size:9px;color:#94a3b8">Logo</span>')
                         + '</div>';
            }

            // ── Patient info rows ──
            var consultDate = new Date(visit.consultationDate).toLocaleDateString('en-GB');
            var ptRows = [
                [['PATIENT NAME', e(visit.patientName), true],  ['MRN', e(visit.mrn), true],             ['VISIT ID', e(visit.visitId), true],        ['DATE', consultDate, false]],
                [['DOCTOR', e(consultDoctor), true],             ['DEPARTMENT', e(consultDept), true],    ['VISIT TYPE', e(visit.visitType||'OPD'), true], ['REFERRED BY', e(visit.referredBy||'Self'), false]],
                [['PHONE NO.', e(patient ? (patient.phone||patient.mobile||'-') : '-'), true],
                 ['CNIC', e(patient ? (patient.cnic||patient.nationalId||'-') : '-'), true],
                 ['AGE', e(patient ? (patient.age ? patient.age+' Years' : '-') : '-'), true],
                 ['GENDER', e(patient ? (patient.gender||'-') : '-'), false]],
            ];
            var ptGridHtml = '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '<table style="width:100%;table-layout:fixed;border-collapse:collapse">';
            ptRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                ptGridHtml += '<tr' + (ri < ptRows.length - 1 ? ' style="border-bottom:1px solid #e8edf2"' : '') + '>';
                row.forEach(function(cell) { ptGridHtml += infoCell(cell[0], cell[1], cell[2], rowBg); });
                ptGridHtml += '</tr>';
            });
            ptGridHtml += '</table></div>';

            // ── Vitals bar ──
            var vitalItems = [];
            if (lv) {
                if (lv.temperature) vitalItems.push(['Temp', lv.temperature + ' °F']);
                if (lv.systolic)    vitalItems.push(['BP', lv.systolic + '/' + (lv.diastolic||'—') + ' mmHg']);
                if (lv.heartRate)   vitalItems.push(['Pulse', lv.heartRate + ' bpm']);
                if (lv.spO2)        vitalItems.push(['SpO2', lv.spO2 + '%']);
                if (lv.weight)      vitalItems.push(['Weight', lv.weight + ' kg']);
                if (lv.height)      vitalItems.push(['Height', lv.height + ' cm']);
                if (lv.respiratoryRate) vitalItems.push(['RR', lv.respiratoryRate + ' /min']);
            }
            var vitalsHtml = sectionLabel('Vitals');
            if (vitalItems.length > 0) {
                vitalsHtml += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">';
                vitalItems.forEach(function(vi) {
                    vitalsHtml += '<div style="padding:7px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-top:2px solid ' + color + '">'
                        + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + vi[0] + '</div>'
                        + '<div style="font-size:11px;font-weight:700;color:#0f172a">' + vi[1] + '</div>'
                        + '</div>';
                });
                vitalsHtml += '</div>';
            } else {
                vitalsHtml += '<div style="font-size:10px;color:#94a3b8;font-style:italic;margin-bottom:16px">No vitals recorded</div>';
            }

            // ── Final Diagnosis ──
            var diagHtml = sectionLabel('Final Diagnosis');
            var diag = existing.finalDiagnosis || existing.provisionalDiagnosis || '';
            diagHtml += '<div style="padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:16px;font-size:11px;font-weight:600;color:#0f172a;min-height:32px">'
                + (diag ? e(diag) : '<span style="color:#94a3b8;font-weight:400;font-style:italic">Not recorded</span>')
                + '</div>';

            // ── Prescription table ──
            var rxHtml = sectionLabel('Prescription');
            if (existing.prescriptions && existing.prescriptions.length > 0) {
                rxHtml += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">'
                    + '<table style="width:100%;table-layout:fixed;border-collapse:collapse">'
                    + '<thead><tr style="background:' + color + '">'
                    + ['#','MEDICINE','DOSE','ROUTE','FREQUENCY','DURATION'].map(function(h, i) {
                        var w = ['36px','','80px','80px','110px','80px'][i];
                        return '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:left' + (w ? ';width:'+w : '') + '">' + h + '</th>';
                      }).join('')
                    + '</tr></thead><tbody>';
                existing.prescriptions.forEach(function(rx, i) {
                    var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                    rxHtml += '<tr style="background:' + bg + ';border-top:1px solid #f1f5f9">'
                        + '<td style="padding:8px 10px;font-size:10px;color:#64748b">' + (i+1) + '</td>'
                        + '<td style="padding:8px 10px;font-size:10px;font-weight:600;color:#0f172a">' + e(rx.medicine) + '</td>'
                        + '<td style="padding:8px 10px;font-size:10px;color:#334155">' + e(rx.dose) + ' ' + e(rx.unit||'') + '</td>'
                        + '<td style="padding:8px 10px;font-size:10px;color:#334155">' + e(rx.route) + '</td>'
                        + '<td style="padding:8px 10px;font-size:10px;color:#334155">' + e(rx.frequency) + '</td>'
                        + '<td style="padding:8px 10px;font-size:10px;color:#334155">' + e(rx.duration) + '</td>'
                        + '</tr>';
                });
                rxHtml += '</tbody></table></div>';
            } else {
                rxHtml += '<div style="font-size:10px;color:#94a3b8;font-style:italic;margin-bottom:16px">No prescription recorded</div>';
            }

            // ── Investigation Orders ──
            var invHtml = sectionLabel('Investigation Orders');
            if (existing.investigationOrders && existing.investigationOrders.length > 0) {
                invHtml += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">';
                existing.investigationOrders.forEach(function(inv) {
                    invHtml += '<span style="display:inline-block;padding:4px 12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;font-size:10px;font-weight:600;color:#1e40af">' + e(inv) + '</span>';
                });
                invHtml += '</div>';
            } else {
                invHtml += '<div style="font-size:10px;color:#94a3b8;font-style:italic;margin-bottom:16px">No investigation orders</div>';
            }

            // ── Full HTML ──
            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
                + '<title>Doctor Prescription \u2014 ' + e(visit.patientName) + '</title>'
                + '<style>'
                + '* { margin:0; padding:0; box-sizing:border-box; }'
                + 'body { font-family:"SF Pro Text","Segoe UI",Arial,sans-serif; background:#fff; color:#1e293b; }'
                + '@page { size:A4; margin:12mm 12mm 10mm 12mm; }'
                + '@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }'
                + 'table { border-collapse:collapse; }'
                + '</style></head><body>'
                + '<div style="max-width:740px;margin:0 auto;background:#fff">'

                // Top accent bar
                + '<div style="height:4px;background:' + color + '"></div>'

                // Letterhead
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

                // Title strip
                + '<div style="padding:9px 32px;background:' + color + ';display:flex;align-items:center;justify-content:space-between">'
                + '<span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Doctor Prescription</span>'
                + '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:9px;font-weight:600;padding:2px 9px;border-radius:20px;letter-spacing:0.5px">ORIGINAL</span>'
                + '</div>'

                // Content
                + '<div style="padding:16px 32px">'
                + ptGridHtml
                + vitalsHtml
                + diagHtml
                + rxHtml
                + invHtml

                // Signature — doctor who saved the consultation (right-aligned)
                + '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                + '<div style="width:220px;text-align:center">'
                + '<div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:6px">' + e(consultDoctor ? 'Dr. ' + consultDoctor : '') + '</div>'
                + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">' + e(consultDept || 'Consulting Doctor') + '</div>'
                + '</div></div>'
                + '</div>' // end content

                // Footer
                + '<div style="margin:0 32px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '<div style="padding:12px 32px;display:flex;justify-content:space-between;align-items:flex-start">'
                + '<div style="font-size:9px;color:#64748b;line-height:1.6">' + footerLines.map(function(l){return '<div>'+e(l)+'</div>';}).join('') + '</div>'
                + '<div style="font-size:9px;color:#64748b;text-align:right;line-height:1.6">' + metaParts.map(function(p){return '<div>'+e(p)+'</div>';}).join('') + '</div>'
                + '</div>'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '</div>' // end wrapper

                + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>'
                + '</body></html>';

            var w = window.open('', '_blank', 'width=900,height=700');
            if (w) { w.document.write(html); w.document.close(); }
        });
    }

    function generateBillPrint(visit, patient, bill, chargeItems, addlItems) {
        if (!bill) return;
        var currency = hospitalInfo.currency || 'PKR';
        var patientName = patient ? patient.name : visit.patientName;
        var visitDate = new Date(visit.consultationDate);
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

        if (sn === 1) {
            chargesRows = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">No charges</td></tr>';
        }

        var totalAmount = Number(bill.totalAmount);
        var paidAmount = Number(bill.paidAmount || 0);
        var dueAmount = Math.max(0, totalAmount - paidAmount);
        var statusLabel = bill.paymentStatus || 'Pending';
        var statusColor = statusLabel === 'Paid' ? '#16a34a' : (statusLabel === 'Partial' ? '#d97706' : '#dc2626');

        var html = '<!DOCTYPE html><html><head><title>Bill - ' + esc(bill.billId) + '</title><style>' +
            '@page { size: A4; margin: 12mm; } ' +
            '* { margin: 0; padding: 0; box-sizing: border-box; } ' +
            'body { font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; padding: 20px; } ' +
            '.header { text-align: center; border-bottom: 3px double #060740; padding-bottom: 12px; margin-bottom: 8px; } ' +
            '.header h1 { font-size: 22px; color: #060740; margin-bottom: 2px; } ' +
            '.header p { font-size: 11px; color: #555; } ' +
            '.bill-title { text-align: center; margin: 8px 0 12px; } ' +
            '.bill-title h2 { font-size: 16px; color: #060740; text-transform: uppercase; letter-spacing: 2px; } ' +
            '.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 30px; font-size: 12px; margin-bottom: 14px; padding: 10px; background: #f8f9fa; border-radius: 6px; } ' +
            '.info-grid .label { color: #666; font-weight: 600; } ' +
            '.charges-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 14px; } ' +
            '.charges-table th { background: #060740; color: white; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; } ' +
            '.charges-table td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; } ' +
            '.charges-table tr:last-child td { border-bottom: none; } ' +
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
            '<div class="bill-title"><h2>OPD Bill / Invoice</h2></div>' +
            '<div class="info-grid">' +
                '<div><span class="label">Patient Name:</span> ' + esc(patientName) + '</div>' +
                '<div><span class="label">Bill #:</span> ' + esc(bill.billId) + '</div>' +
                '<div><span class="label">MRN:</span> ' + esc(visit.mrn) + '</div>' +
                '<div><span class="label">Visit ID:</span> ' + esc(visit.visitId) + '</div>' +
                '<div><span class="label">Age/Gender:</span> ' + (patient ? patient.age : '-') + ' yrs / ' + (patient ? patient.gender : '-') + '</div>' +
                '<div><span class="label">Bill Date:</span> ' + billDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) + '</div>' +
                '<div><span class="label">Doctor:</span> Dr. ' + esc(visit.doctorName) + '</div>' +
                '<div><span class="label">Visit Type:</span> ' + esc(visit.visitType || '-') + '</div>' +
            '</div>' +
            '<table class="charges-table"><thead><tr><th style="text-align:center;width:40px">#</th><th>Description</th><th style="text-align:center">Category</th><th style="text-align:center;width:50px">Qty</th><th style="text-align:right;width:100px">Rate</th><th style="text-align:right;width:110px">Amount</th></tr></thead><tbody>' +
            chargesRows +
            '</tbody></table>' +
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
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    }

    function renderCorrectionEditView(visit, patient, bill) {
        var patientName = patient ? patient.name : visit.patientName;
        var initials = getInitials(patientName);
        var currency = hospitalInfo.currency || 'PKR';

        var allCharges = [];
        var correctedFields = bill ? (bill.correctedFields || []) : [];
        if (bill) {
            if (Number(bill.doctorFee) > 0) {
                var alreadyRemoved = correctedFields.some(function(f) { return f.indexOf('doctorFee') >= 0 && f.indexOf('Removed') >= 0; });
                allCharges.push({ type: 'doctor_fee', field: 'doctorFee', chargeId: null, description: 'Consultant Doctor Fee — ' + esc(visit.doctorName), category: 'Doctor Fee', amount: Number(bill.doctorFee), removed: alreadyRemoved });
            }
            if (bill.chargeIds && bill.chargeIds.length > 0) {
                bill.chargeIds.forEach(function(cid) {
                    var mc = masterCharges.find(function(m) { return String(m.id) === String(cid) || String(m.chargeId) === String(cid); });
                    if (mc) {
                        var alreadyRemoved = correctedFields.some(function(f) { return f.indexOf('charge_' + cid) >= 0 && f.indexOf('Removed') >= 0; });
                        allCharges.push({ type: 'master_charge', field: 'charge_' + cid, chargeId: cid, description: esc(mc.name), category: mc.category || 'Hospital Charges', amount: Number(mc.amount), removed: alreadyRemoved });
                    }
                });
            } else if (Number(bill.consultationCharges) > 0) {
                var alreadyRemoved = correctedFields.some(function(f) { return f.indexOf('consultationCharges') >= 0 && f.indexOf('Removed') >= 0; });
                allCharges.push({ type: 'consultation', field: 'consultationCharges', chargeId: null, description: 'Hospital Charges', category: 'Hospital Charges', amount: Number(bill.consultationCharges), removed: alreadyRemoved });
            }
        }

        var addlCharges = bill.additionalCharges || [];

        var body = '' +
            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div style="flex:1">' +
                    '<h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                        '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(visit.visitId) + '</span>' +
                        '<span style="font-size:12px;background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;padding:2px 8px;border-radius:4px;font-weight:600">CORRECTION MODE</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:8px">' +
                '<i data-lucide="alert-triangle" style="width:16px;height:16px;color:#92400E;flex-shrink:0"></i>' +
                '<span style="font-size:13px;color:#92400E;font-weight:500">Select charges to remove from this bill. Removed charges will show as excluded with zero amount. Any payments against removed charges will be automatically refunded.</span>' +
            '</div>';

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
            '<h4 style="margin:0 0 16px;font-size:15px;font-weight:700"><i data-lucide="receipt" style="width:16px;height:16px;margin-right:6px;vertical-align:-2px"></i> Detailed Charges</h4>' +
            '<table style="width:100%;border-collapse:collapse">' +
                '<thead><tr style="border-bottom:2px solid var(--color-border)">' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue)">Description</th>' +
                    '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue);width:100px">Amount</th>' +
                    '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue);width:100px">Action</th>' +
                '</tr></thead>' +
                '<tbody>';

        allCharges.forEach(function(ci, idx) {
            var isRemoved = ci.removed;
            var rowStyle = isRemoved ? 'border-bottom:1px solid var(--color-border);opacity:0.5;text-decoration:line-through' : 'border-bottom:1px solid var(--color-border)';
            body += '<tr style="' + rowStyle + '" data-charge-idx="' + idx + '">' +
                '<td style="padding:10px 4px;font-size:13px;font-weight:500">' + ci.description + ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#F1F5F9;color:#475569;border:1px solid #E2E8F0;margin-left:6px">' + ci.category + '</span>' +
                (isRemoved ? ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:rgba(234,88,12,0.1);color:#ea580c;border:1px solid rgba(234,88,12,0.2);margin-left:4px">Already Removed</span>' : '') + '</td>' +
                '<td style="padding:10px 4px;text-align:center;font-size:13px;font-family:monospace;font-weight:600">' + (isRemoved ? '<span style="color:#dc2626">0</span>' : currency + ' ' + Number(ci.amount).toLocaleString()) + '</td>' +
                '<td style="padding:10px 4px;text-align:center">' +
                (isRemoved ?
                    '<span style="font-size:11px;color:var(--color-muted-foreground);font-style:italic">Excluded</span>' :
                    '<button class="btn-remove-charge" data-idx="' + idx + '" data-type="detailed" style="background:#FEF2F2;color:#dc2626;border:1px solid #FECACA;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px"><i data-lucide="x-circle" style="width:13px;height:13px"></i> Remove</button>'
                ) + '</td>' +
            '</tr>';
        });

        body += '</tbody></table></div>';

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px">' +
            '<h4 style="margin:0 0 16px;font-size:15px;font-weight:700"><i data-lucide="plus-circle" style="width:16px;height:16px;margin-right:6px;vertical-align:-2px"></i> Additional Charges</h4>';

        if (addlCharges.length === 0) {
            body += '<p style="text-align:center;color:var(--color-muted-foreground);font-size:13px;padding:16px 0">No additional charges</p>';
        } else {
            body += '<table style="width:100%;border-collapse:collapse">' +
                '<thead><tr style="border-bottom:2px solid var(--color-border)">' +
                    '<th style="text-align:left;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue)">Description</th>' +
                    '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue);width:100px">Amount</th>' +
                    '<th style="text-align:center;padding:8px 4px;font-size:12px;font-weight:600;color:var(--midnight-blue);width:100px">Action</th>' +
                '</tr></thead>' +
                '<tbody>';

            addlCharges.forEach(function(ac, idx) {
                var desc = ac.name || 'Additional Charge';
                if (ac.type === 'doctor_fee' && ac.doctorName) desc += ' — ' + ac.doctorName;
                var cat = ac.type === 'doctor_fee' ? 'Doctor Fee' : (ac.category || 'Hospital Charges');
                var acName = ac.name || 'Additional Charge';
                var isRemoved = correctedFields.some(function(f) { return f.indexOf(acName) >= 0 && f.indexOf('Removed') >= 0; });
                var rowStyle = isRemoved ? 'border-bottom:1px solid var(--color-border);opacity:0.5;text-decoration:line-through' : 'border-bottom:1px solid var(--color-border)';
                body += '<tr style="' + rowStyle + '" data-addl-idx="' + idx + '">' +
                    '<td style="padding:10px 4px;font-size:13px;font-weight:500">' + esc(desc) + ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#F1F5F9;color:#475569;border:1px solid #E2E8F0;margin-left:6px">' + cat + '</span>' +
                    (isRemoved ? ' <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:rgba(234,88,12,0.1);color:#ea580c;border:1px solid rgba(234,88,12,0.2);margin-left:4px">Already Removed</span>' : '') + '</td>' +
                    '<td style="padding:10px 4px;text-align:center;font-size:13px;font-family:monospace;font-weight:600">' + (isRemoved ? '<span style="color:#dc2626">0</span>' : currency + ' ' + Number(ac.net || 0).toLocaleString()) + '</td>' +
                    '<td style="padding:10px 4px;text-align:center">' +
                    (isRemoved ?
                        '<span style="font-size:11px;color:var(--color-muted-foreground);font-style:italic">Excluded</span>' :
                        '<button class="btn-remove-charge" data-idx="' + idx + '" data-type="additional" style="background:#FEF2F2;color:#dc2626;border:1px solid #FECACA;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px"><i data-lucide="x-circle" style="width:13px;height:13px"></i> Remove</button>'
                    ) + '</td>' +
                '</tr>';
            });

            body += '</tbody></table>';
        }
        body += '</div>';

        body += '<div id="correctionRemoveList" style="display:none;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px 24px;margin-bottom:20px">' +
            '<h4 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#dc2626"><i data-lucide="trash-2" style="width:16px;height:16px;margin-right:6px;vertical-align:-2px"></i> Charges to Remove</h4>' +
            '<div id="correctionRemoveItems"></div>' +
        '</div>';

        body += '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border)">' +
            '<h4 style="margin:0 0 12px;font-size:15px;font-weight:700"><i data-lucide="message-square" style="width:16px;height:16px;margin-right:6px;vertical-align:-2px"></i> Correction Reason</h4>' +
            '<textarea class="form-control" id="correctionReason" rows="3" placeholder="Enter the reason for this correction (optional)" style="font-size:13px;resize:vertical"></textarea>' +
        '</div>';

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" id="btnCorrectionBack"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button>' +
            '<button class="btn-primary" id="btnSaveCorrection" style="font-size:13px;background:#ea580c;border-color:#ea580c" disabled><i data-lucide="check" style="width:14px;height:14px"></i> Save Corrections</button>' +
        '</div>';

        $('#billingDetailBody').html(body);
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();

        var removals = [];

        function updateRemoveList() {
            if (removals.length === 0) {
                $('#correctionRemoveList').hide();
                $('#btnSaveCorrection').prop('disabled', true);
                return;
            }
            var html = '';
            removals.forEach(function(r, ri) {
                html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#fff;border-radius:6px;border:1px solid #FECACA;margin-bottom:6px">' +
                    '<div style="font-size:13px;font-weight:500;color:#dc2626"><i data-lucide="minus-circle" style="width:14px;height:14px;margin-right:6px;vertical-align:-2px"></i>' + r.description + ' <span style="font-family:monospace;font-size:12px">(' + currency + ' ' + Number(r.amount).toLocaleString() + ')</span></div>' +
                    '<button class="btn-undo-remove" data-ri="' + ri + '" style="background:none;border:1px solid #93C5FD;color:#2563EB;border-radius:4px;padding:2px 10px;font-size:11px;font-weight:600;cursor:pointer">Undo</button>' +
                '</div>';
            });
            $('#correctionRemoveItems').html(html);
            $('#correctionRemoveList').show();
            $('#btnSaveCorrection').prop('disabled', false);
            lucide.createIcons();
        }

        $(document).off('click.correction-remove').on('click.correction-remove', '.btn-remove-charge', function() {
            var $btn = $(this);
            var idx = Number($btn.data('idx'));
            var type = $btn.data('type');
            var item;
            if (type === 'detailed') {
                item = allCharges[idx];
                removals.push({ type: 'detailed', idx: idx, field: item.field, chargeId: item.chargeId, description: item.description, category: item.category, amount: item.amount, chargeType: item.type });
            } else {
                item = addlCharges[idx];
                var desc = item.name || 'Additional Charge';
                if (item.type === 'doctor_fee' && item.doctorName) desc += ' — ' + item.doctorName;
                removals.push({ type: 'additional', idx: idx, description: desc, name: item.name || 'Additional Charge', amount: Number(item.net || 0) });
            }
            var $row = $btn.closest('tr');
            $row.css({ opacity: '0.5', textDecoration: 'line-through' });
            $btn.replaceWith('<span style="font-size:11px;color:#dc2626;font-weight:600">Marked for removal</span>');
            updateRemoveList();
        });

        $(document).off('click.correction-undo').on('click.correction-undo', '.btn-undo-remove', function() {
            var ri = Number($(this).data('ri'));
            var removed = removals.splice(ri, 1)[0];
            renderCorrectionEditView(visit, patient, bill);
        });

        $('#btnCorrectionBack').off('click').on('click', function() {
            $(document).off('click.correction-remove');
            $(document).off('click.correction-undo');
            renderBillingDetailContent(visit, patient, bill);
        });

        $('#btnSaveCorrection').off('click').on('click', function() {
            if (removals.length === 0) {
                showToast('No charges selected for removal', 'info');
                return;
            }

            var corrections = [];
            var removeChargeIds = [];
            var newDoctorFee = null;
            var newConsultationCharges = null;
            var updatedAdditional = null;
            var hasAddlChanges = false;
            var addlCopy = JSON.parse(JSON.stringify(addlCharges));

            removals.forEach(function(r) {
                if (r.type === 'detailed') {
                    corrections.push({ section: 'Detailed Charges', fieldName: r.field + ' (Removed)', oldValue: String(r.amount), newValue: '0' });
                    if (r.chargeType === 'doctor_fee') {
                        newDoctorFee = 0;
                    } else if (r.chargeType === 'master_charge' && r.chargeId) {
                        removeChargeIds.push(r.chargeId);
                    } else if (r.chargeType === 'consultation') {
                        newConsultationCharges = 0;
                    }
                } else {
                    corrections.push({ section: 'Additional Charges', fieldName: r.name + ' (Removed)', oldValue: String(r.amount), newValue: '0' });
                    addlCopy[r.idx].net = 0;
                    addlCopy[r.idx].amount = 0;
                    addlCopy[r.idx].removed = true;
                    hasAddlChanges = true;
                }
            });

            if (hasAddlChanges) updatedAdditional = addlCopy;

            var payload = {
                corrections: corrections,
                reason: ($('#correctionReason').val() || '').trim()
            };
            if (newDoctorFee !== null) payload.doctorFee = newDoctorFee;
            if (newConsultationCharges !== null) payload.consultationCharges = newConsultationCharges;
            if (removeChargeIds.length > 0) payload.removeChargeIds = removeChargeIds;
            if (updatedAdditional !== null) payload.additionalCharges = updatedAdditional;

            var $btn = $('#btnSaveCorrection');
            $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');

            $.ajax({
                url: '/api/opd/bills/' + encodeURIComponent(bill.billId) + '/corrections',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(payload),
                success: function(resp) {
                    $(document).off('click.correction-remove');
                    $(document).off('click.correction-undo');
                    showToast('Charges removed successfully', 'success');
                    if (resp.bill) {
                        var idx = bills.findIndex(function(b) { return b.billId === bill.billId; });
                        if (idx >= 0) bills[idx] = resp.bill;
                        var vIdx = visits.findIndex(function(v) { return v.visitId === visit.visitId; });
                        if (vIdx >= 0 && resp.bill.paymentStatus) {
                            visits[vIdx].paymentStatus = resp.bill.paymentStatus;
                        }
                        renderBillingTab(); renderRegistrationStats();
                        renderBillingDetailContent(visit, patient, resp.bill);
                    } else {
                        renderBillingDetailContent(visit, patient, bill);
                    }
                },
                error: function(xhr) {
                    var msg = xhr.responseJSON ? xhr.responseJSON.error : 'Failed to save corrections';
                    showToast(msg, 'error');
                    $btn.prop('disabled', false).html('<i data-lucide="check" style="width:14px;height:14px"></i> Save Corrections');
                    lucide.createIcons();
                }
            });
        });
    }

    function renderCorrectionLogView(visit, patient, bill) {
        var patientName = patient ? patient.name : visit.patientName;
        var initials = getInitials(patientName);

        var body = '' +
            '<div style="background:var(--color-card);padding:20px 24px;border-radius:12px;border:1px solid var(--color-border);margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
                '<div class="avatar" style="width:48px;height:48px;background:var(--midnight-blue);color:#fff;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">' + initials + '</div>' +
                '<div style="flex:1">' +
                    '<h4 style="margin:0;font-size:18px;font-weight:700">' + esc(patientName) + '</h4>' +
                    '<div style="display:flex;gap:8px;margin-top:4px;align-items:center">' +
                        '<span style="font-size:12px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:2px 8px;border-radius:4px;font-family:monospace">' + esc(bill.billId) + '</span>' +
                        '<span style="font-size:12px;background:#EDE9FE;color:#6D28D9;border:1px solid #DDD6FE;padding:2px 8px;border-radius:4px;font-weight:600">CORRECTION LOG</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="correctionLogContent" style="min-height:100px;display:flex;align-items:center;justify-content:center"><span class="spinner-border spinner-border-sm"></span>&nbsp; Loading correction history...</div>';

        var footer = '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
            '<button class="btn-outline" id="btnCorrectionLogBack"><i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back</button>' +
            '<div></div>' +
        '</div>';

        $('#billingDetailBody').html(body);
        $('#billingDetailFooter').html(footer);
        lucide.createIcons();

        $('#btnCorrectionLogBack').off('click').on('click', function() {
            renderBillingDetailContent(visit, patient, bill);
        });

        $.get('/api/opd/bills/' + encodeURIComponent(bill.billId) + '/corrections', function(data) {
            var $container = $('#correctionLogContent');
            if (!data || data.length === 0) {
                $container.html(
                    '<div style="text-align:center;padding:40px 20px">' +
                        '<i data-lucide="file-check" style="width:48px;height:48px;color:var(--color-muted-foreground);margin-bottom:12px"></i>' +
                        '<h4 style="margin:0 0 8px;font-size:16px;font-weight:600;color:var(--color-foreground)">No Corrections</h4>' +
                        '<p style="margin:0;font-size:14px;color:var(--color-muted-foreground)">No corrections have been made to this bill yet.</p>' +
                    '</div>'
                );
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
                            '<div>' +
                                '<div style="font-size:14px;font-weight:600;color:var(--color-foreground)">Correction #' + (groups.length - gi) + '</div>' +
                                '<div style="font-size:12px;color:var(--color-muted-foreground)">' + dateStr + ' &bull; by ' + esc(g.correctedBy) + '</div>' +
                            '</div>' +
                        '</div>' +
                        '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(234,88,12,0.08);color:#ea580c">' + g.items.length + ' change' + (g.items.length > 1 ? 's' : '') + '</span>' +
                    '</div>';

                if (g.reason) {
                    h += '<div style="background:#F8FAFC;border:1px solid var(--color-border);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#475569"><strong>Reason:</strong> ' + esc(g.reason) + '</div>';
                }

                h += '<table style="width:100%;border-collapse:collapse">' +
                    '<thead><tr style="border-bottom:2px solid var(--color-border)">' +
                        '<th style="text-align:left;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.5px">Section</th>' +
                        '<th style="text-align:left;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.5px">Field</th>' +
                        '<th style="text-align:right;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.5px">Previous Value</th>' +
                        '<th style="text-align:center;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);width:30px"></th>' +
                        '<th style="text-align:right;padding:8px 4px;font-size:11px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.5px">New Value</th>' +
                    '</tr></thead><tbody>';

                g.items.forEach(function(item) {
                    h += '<tr style="border-bottom:1px solid var(--color-border)">' +
                        '<td style="padding:10px 4px;font-size:13px"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#F1F5F9;color:#475569;border:1px solid #E2E8F0">' + esc(item.section) + '</span></td>' +
                        '<td style="padding:10px 4px;font-size:13px;font-weight:500">' + esc(item.fieldName) + '</td>' +
                        '<td style="padding:10px 4px;font-size:13px;text-align:right;font-family:monospace;color:#dc2626;text-decoration:line-through">' + esc(item.oldValue) + '</td>' +
                        '<td style="padding:10px 4px;text-align:center"><i data-lucide="arrow-right" style="width:14px;height:14px;color:var(--color-muted-foreground)"></i></td>' +
                        '<td style="padding:10px 4px;font-size:13px;text-align:right;font-family:monospace;color:#16a34a;font-weight:600">' + esc(item.newValue) + '</td>' +
                    '</tr>';
                });

                h += '</tbody></table></div>';
            });

            $container.html(h);
            lucide.createIcons();
        }).fail(function() {
            $('#correctionLogContent').html(
                '<div style="text-align:center;padding:40px 20px;color:var(--color-destructive)">' +
                    '<i data-lucide="alert-circle" style="width:32px;height:32px;margin-bottom:8px"></i>' +
                    '<p style="font-size:14px;font-weight:500">Failed to load correction log</p>' +
                '</div>'
            );
            lucide.createIcons();
        });
    }

    loadPharmRxConfig();
    loadAllData();
});

/* ═══════════════════════════════════════════════════════════════════════════
   OPD Registration — Filter / Export / Pagination / Custom Components
   (moved from inline blade script for reliable execution)
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Filter pane toggle ───────────────────────────────────────────────────── */
function toggleRegFilter() {
    var pane = document.getElementById('regFilterPane');
    var btn  = document.getElementById('btnRegFilter');
    if (!pane) return;
    var open = pane.style.display !== 'none';
    pane.style.display = open ? 'none' : '';
    btn && btn.classList.toggle('filter-active', !open);
    if (!open && window.lucide) lucide.createIcons();
}

/* ── Apply filters ────────────────────────────────────────────────────────── */
function applyRegFilters() {
    var status   = (document.getElementById('regStatusFilter')  || {}).value || 'all';
    var dateFrom = (document.getElementById('regDateFrom')      || {}).value || '';
    var dateTo   = (document.getElementById('regDateTo')        || {}).value || '';
    var doctor   = ((document.getElementById('regDoctorFilter') || {}).value || '').toLowerCase().trim();
    var dept     = (document.getElementById('regDeptFilter')   || {}).value || 'all';
    var mrn      = ((document.getElementById('regMrnFilter')    || {}).value || '').toLowerCase().trim();
    var patName  = ((document.getElementById('regPatNameFilter')|| {}).value || '').toLowerCase().trim();
    var refBy    = ((document.getElementById('regRefByFilter')  || {}).value || '').toLowerCase().trim();

    var rows = document.querySelectorAll('#regTableBody tr');
    var visible = 0;
    rows.forEach(function(row) {
        var cells  = row.querySelectorAll('td');
        if (!cells.length) return;

        // Column indices: 0=MRN, 1=Name, 2=VisitID, 3=Dept, 4=Doctor, 5=VisitType, 6=Gender, 7=Amount, 8=Status, 9=ReferredBy, 10=Date
        var rowStatus = (cells[8] ? cells[8].textContent.trim().toLowerCase() : '');
        var rowDoctor = (cells[4] ? cells[4].textContent.trim().toLowerCase() : '');
        var rowDept   = (cells[3] ? cells[3].textContent.trim().toLowerCase() : '');
        var rowDate   = (cells[10] ? cells[10].textContent.trim() : '');
        var rowMrn    = (cells[0] ? cells[0].textContent.trim().toLowerCase() : '');
        var rowName   = (cells[1] ? cells[1].textContent.trim().toLowerCase() : '');
        var rowRefBy  = (cells[9] ? cells[9].textContent.trim().toLowerCase() : '');

        var pass = true;
        if (status !== 'all' && rowStatus !== status) pass = false;
        if (dept   !== 'all' && !rowDept.includes(dept.toLowerCase())) pass = false;
        if (mrn    && !rowMrn.includes(mrn))       pass = false;
        if (patName && !rowName.includes(patName)) pass = false;
        if (doctor && !rowDoctor.includes(doctor)) pass = false;
        if (refBy  && !rowRefBy.includes(refBy))   pass = false;
        if (dateFrom || dateTo) {
            var d = new Date(rowDate.split(' ')[0]);
            if (dateFrom && !isNaN(new Date(dateFrom)) && d < new Date(dateFrom)) pass = false;
            if (dateTo   && !isNaN(new Date(dateTo))   && d > new Date(dateTo))   pass = false;
        }

        row.style.display = pass ? '' : 'none';
        if (pass) visible++;
    });

    var active = 0;
    if (status !== 'all') active++;
    if (dateFrom) active++;
    if (dateTo)   active++;
    if (doctor)   active++;
    if (dept !== 'all') active++;
    if (mrn)      active++;
    if (patName)  active++;
    if (refBy)    active++;
    var badge = document.getElementById('regFilterBadge');
    if (badge) {
        badge.textContent = active;
        badge.style.display = active > 0 ? '' : 'none';
    }

    if (window.renderRegPagination) window.renderRegPagination();
}

/* ── Reset filters ────────────────────────────────────────────────────────── */
function resetRegFilters() {
    var fields = ['regStatusFilter','regDateFrom','regDateTo','regDoctorFilter','regDeptFilter','regMrnFilter','regPatNameFilter','regRefByFilter'];
    fields.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === 'SELECT') el.value = 'all';
        else el.value = '';
    });
    if (window.resetOpdCustomFilters) window.resetOpdCustomFilters();
    document.querySelectorAll('#regTableBody tr').forEach(function(r) { r.style.display = ''; });
    var badge = document.getElementById('regFilterBadge');
    if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
    if (window.renderRegPagination) window.renderRegPagination();
}

/* ── Custom Date Picker & Searchable Select components ───────────────────── */
(function() {
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function closeAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) {
            p.classList.remove('open');
            if (p._trigger) p._trigger.classList.remove('open');
        });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) {
            p.classList.remove('open');
            if (p._trigger) p._trigger.classList.remove('open');
        });
    }
    document.addEventListener('click', closeAll);

    /* Reposition any open popup when the user scrolls or resizes */
    function repositionOpen() {
        document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
            if (!p._trigger) return;
            var rect = p._trigger.getBoundingClientRect();
            p.style.top  = (rect.bottom + 6) + 'px';
            p.style.left = rect.left + 'px';
        });
    }
    window.addEventListener('scroll', repositionOpen, true);
    window.addEventListener('resize', repositionOpen);

    function initDp(wrapId) {
        var wrap = document.getElementById(wrapId);
        if (!wrap) return;
        var hiddenId   = wrap.dataset.target;
        var ph         = wrap.dataset.placeholder || 'Select date';
        var trigger    = wrap.querySelector('.opd-dp-trigger');
        var valEl      = wrap.querySelector('.opd-dp-val');
        var popup      = wrap.querySelector('.opd-dp-popup');
        var hidden     = document.getElementById(hiddenId);
        var selDate    = null;
        var viewYear   = new Date().getFullYear();
        var viewMonth  = new Date().getMonth();

        function render() {
            var firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
            var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
            var h = '<div class="opd-dp-header">' +
                '<button class="opd-dp-nav" data-a="p">&#8249;</button>' +
                '<span class="opd-dp-month-year">' + MONTHS[viewMonth] + ' ' + viewYear + '</span>' +
                '<button class="opd-dp-nav" data-a="n">&#8250;</button></div>' +
                '<div class="opd-dp-grid">';
            DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
            for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= daysInMonth; d++) {
                var cur = new Date(viewYear, viewMonth, d);
                var cls = 'opd-dp-day';
                if (selDate && cur.toDateString() === selDate.toDateString()) cls += ' selected';
                h += '<div class="' + cls + '" data-d="' + d + '">' + d + '</div>';
            }
            h += '</div>';
            popup.innerHTML = h;
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
                    var day = parseInt(this.dataset.d);
                    selDate = new Date(viewYear, viewMonth, day);
                    var dd = String(selDate.getDate()).padStart(2,'0');
                    var mm = String(selDate.getMonth()+1).padStart(2,'0');
                    var yyyy = selDate.getFullYear();
                    valEl.textContent = dd + '/' + mm + '/' + yyyy;
                    valEl.classList.remove('opd-ph');
                    if (hidden) hidden.value = yyyy + '-' + mm + '-' + dd;
                    closeAll();
                });
            });
        }

        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = popup.classList.contains('open');
            closeAll();
            if (!isOpen) {
                var rect = trigger.getBoundingClientRect();
                popup.style.top  = (rect.bottom + 6) + 'px';
                popup.style.left = rect.left + 'px';
                popup._trigger = trigger;
                if (popup.parentNode !== document.body) document.body.appendChild(popup);
                render();
                popup.classList.add('open');
                trigger.classList.add('open');
            }
        });

        wrap._reset = function() {
            selDate = null; viewYear = new Date().getFullYear(); viewMonth = new Date().getMonth();
            valEl.textContent = ph; valEl.classList.add('opd-ph');
            if (hidden) hidden.value = '';
        };
    }

    function initCs(wrapId) {
        var wrap = document.getElementById(wrapId);
        if (!wrap) return;
        var hiddenId = wrap.dataset.target;
        var ph       = wrap.dataset.placeholder || 'Select...';
        var trigger  = wrap.querySelector('.opd-cs-trigger');
        var valEl    = wrap.querySelector('.opd-cs-val');
        var popup    = wrap.querySelector('.opd-cs-popup');
        var search   = wrap.querySelector('.opd-cs-search');
        var list     = wrap.querySelector('.opd-cs-list');
        var hidden   = document.getElementById(hiddenId);
        var options  = [];
        var selVal   = '';

        /* ensure placeholder text is always shown on init */
        if (valEl) { valEl.textContent = ph; valEl.classList.add('opd-ph'); }

        function renderList(q) {
            q = (q || '').toLowerCase();
            var filtered = q ? options.filter(function(o) { return o.toLowerCase().indexOf(q) > -1; }) : options;
            if (!filtered.length) { list.innerHTML = '<div class="opd-cs-empty">No options</div>'; return; }
            list.innerHTML = filtered.map(function(o) {
                return '<div class="opd-cs-option' + (o === selVal ? ' selected' : '') + '" data-v="' + o.replace(/"/g,'&quot;') + '">' + o + '</div>';
            }).join('');
            list.querySelectorAll('.opd-cs-option').forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.stopPropagation();
                    selVal = this.dataset.v;
                    valEl.textContent = selVal; valEl.classList.remove('opd-ph');
                    if (hidden) hidden.value = selVal;
                    closeAll();
                });
            });
        }

        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = popup.classList.contains('open');
            closeAll();
            if (!isOpen) {
                var rect = trigger.getBoundingClientRect();
                popup.style.top   = (rect.bottom + 6) + 'px';
                popup.style.left  = rect.left + 'px';
                popup.style.width = rect.width + 'px';
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
        wrap._reset = function() {
            selVal = ''; valEl.textContent = ph; valEl.classList.add('opd-ph');
            if (hidden) hidden.value = '';
        };
    }

    window.setOpdSelectOptions = function(csId, opts) {
        var w = document.getElementById(csId);
        if (w && w.setOptions) w.setOptions(opts);
    };

    window.resetOpdCustomFilters = function() {
        ['dpDateFrom','dpDateTo'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        ['csMrn','csPatName','csDoctor'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
    };

    window.initDp = initDp;
    window.initCs = initCs;

    /* Use $(function) — fires immediately if DOM already ready */
    $(function() {
        ['dpDateFrom','dpDateTo','dpBillDateFrom','dpBillDateTo','dpConsultDateFrom','dpConsultDateTo','dpVitalDateFrom','dpVitalDateTo'].forEach(initDp);
        ['csMrn','csPatName','csDoctor','csBillMrn','csBillPatName','csConsultMrn','csConsultPatName','csConsultDoctor','csVitalMrn','csVitalPatName','csVitalDoctor'].forEach(initCs);
        if (window.lucide) lucide.createIcons();
    });
})();

/* ── Rows-per-page toolbar dropdown ──────────────────────────────────────── */
function toggleRowsMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('rowsPerMenu');
    if (!menu) return;
    /* close other menus */
    var expMenu = document.getElementById('regExportMenu');
    var colMenu = document.getElementById('colVisMenu');
    if (expMenu) expMenu.classList.remove('open');
    if (colMenu) colMenu.classList.remove('open');
    if (menu.classList.toggle('open')) {
        /* mark currently active option */
        var sel = document.getElementById('regPerPage');
        var cur = sel ? parseInt(sel.value, 10) : 10;
        menu.querySelectorAll('button').forEach(function(btn) {
            var v = parseInt(btn.textContent, 10);
            btn.classList.toggle('active', v === cur);
        });
    }
}

function setRowsPer(n) {
    var menu = document.getElementById('rowsPerMenu');
    if (menu) menu.classList.remove('open');
    var sel = document.getElementById('regPerPage');
    if (!sel) return;
    sel.value = n;
    sel.dispatchEvent(new Event('change'));
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('rowsPerMenu');
    var btn  = document.getElementById('btnRowsPer');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && e.target !== btn && !(btn && btn.contains(e.target))) {
            menu.classList.remove('open');
        }
    }
});

/* ── Column Visibility ────────────────────────────────────────────────────── */
var _colVisState = null; /* null = all visible */

function toggleColVis(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('colVisMenu');
    if (!menu) return;
    var expMenu = document.getElementById('regExportMenu');
    var rowMenu = document.getElementById('rowsPerMenu');
    if (expMenu) expMenu.classList.remove('open');
    if (rowMenu) rowMenu.classList.remove('open');
    menu.classList.toggle('open');
}

function colVisSelectAll() {
    document.querySelectorAll('#colVisList input[type="checkbox"]').forEach(function(cb) {
        cb.checked = true;
    });
}

function applyColVis() {
    var menu = document.getElementById('colVisMenu');
    if (menu) menu.classList.remove('open');

    var hidden = {};
    document.querySelectorAll('#colVisList input[type="checkbox"]').forEach(function(cb) {
        var col = parseInt(cb.getAttribute('data-col'), 10);
        hidden[col] = !cb.checked;
    });

    var table = document.getElementById('regTable');
    if (!table) return;

    /* header cells */
    var ths = table.querySelectorAll('thead tr th');
    ths.forEach(function(th, i) {
        th.style.display = hidden[i] ? 'none' : '';
    });

    /* data cells */
    table.querySelectorAll('tbody tr').forEach(function(row) {
        var tds = row.querySelectorAll('td');
        tds.forEach(function(td, i) {
            td.style.display = hidden[i] ? 'none' : '';
        });
    });
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('colVisMenu');
    var btn  = document.getElementById('btnColVis');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            menu.classList.remove('open');
        }
    }
});

/* ── Export menu toggle ───────────────────────────────────────────────────── */
function toggleExportMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('regExportMenu');
    if (!menu) return;
    menu.classList.toggle('open');
}
document.addEventListener('click', function(e) {
    var menu = document.getElementById('regExportMenu');
    var btn  = document.getElementById('btnRegExport');
    if (menu && menu.classList.contains('open')) {
        if (btn && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            menu.classList.remove('open');
        }
    }
});

/* ── Export helpers ───────────────────────────────────────────────────────── */
function _exportGetRows(table) {
    var headers = [];
    var thead = table.querySelector('thead tr');
    if (thead) {
        Array.from(thead.querySelectorAll('th')).forEach(function(th) {
            headers.push(th.innerText.trim());
        });
    }
    var dataRows = [];
    Array.from(table.querySelectorAll('tbody tr')).forEach(function(row) {
        if (row.style.display === 'none') return;
        var cells = [];
        Array.from(row.querySelectorAll('td')).forEach(function(td) {
            cells.push(td.innerText.trim());
        });
        if (cells.length) dataRows.push(cells);
    });
    return { headers: headers, rows: dataRows };
}

function _exportPrintWindow(title, headers, rows) {
    var w = window.open('', '_blank');
    if (!w) return;
    var now = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + title + '</title>'
        + '<style>'
        + 'body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:20px}'
        + 'h2{font-size:16px;margin:0 0 4px}p.sub{font-size:11px;color:#666;margin:0 0 14px}'
        + 'table{border-collapse:collapse;width:100%}'
        + 'th{background:#060740;color:#fff;padding:7px 8px;text-align:left;font-size:11px}'
        + 'td{padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px}'
        + 'tr:nth-child(even) td{background:#f9fafb}'
        + '@media print{@page{margin:15mm} body{margin:0}}'
        + '</style>'
        + '</head><body>'
        + '<h2>OPD Patient Registrations</h2>'
        + '<p class="sub">Generated on ' + now + ' &nbsp;|&nbsp; ' + rows.length + ' record(s)</p>'
        + '<table><thead><tr>'
        + headers.map(function(h) { return '<th>' + h + '</th>'; }).join('')
        + '</tr></thead><tbody>'
        + rows.map(function(r) {
            return '<tr>' + r.map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
          }).join('')
        + '</tbody></table>'
        + '<script>window.onload=function(){window.print();}<\/script>'
        + '</body></html>';
    w.document.open(); w.document.write(html); w.document.close();
}

/* ── Export: CSV, Excel, PDF, Print ──────────────────────────────────────── */
function exportReg(type) {
    var menu = document.getElementById('regExportMenu');
    if (menu) menu.classList.remove('open');

    var table = document.getElementById('regTable');
    if (!table) return;

    var data = _exportGetRows(table);
    var headers = data.headers;
    var rows    = data.rows;

    /* ── CSV ── */
    if (type === 'csv') {
        var csvLines = [headers.map(function(h) { return '"' + h.replace(/"/g,'""') + '"'; }).join(',')];
        rows.forEach(function(r) {
            csvLines.push(r.map(function(c) { return '"' + c.replace(/"/g,'""') + '"'; }).join(','));
        });
        var blob = new Blob([csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href = url; a.download = 'opd-registrations.csv'; a.click();
        URL.revokeObjectURL(url);
        return;
    }

    /* ── Excel (.xlsx via SpreadsheetML) ── */
    if (type === 'excel') {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
            + '<?mso-application progid="Excel.Sheet"?>\n'
            + '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"'
            + ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"'
            + ' xmlns:x="urn:schemas-microsoft-com:office:excel">\n'
            + '<Styles>'
            + '<Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#060740" ss:Pattern="Solid"/></Style>'
            + '</Styles>\n'
            + '<Worksheet ss:Name="OPD Registrations">\n<Table>\n';

        /* header row */
        xml += '<Row>';
        headers.forEach(function(h) {
            xml += '<Cell ss:StyleID="header"><Data ss:Type="String">' + _xmlEsc(h) + '</Data></Cell>';
        });
        xml += '</Row>\n';

        /* data rows */
        rows.forEach(function(r) {
            xml += '<Row>';
            r.forEach(function(c) {
                xml += '<Cell><Data ss:Type="String">' + _xmlEsc(c) + '</Data></Cell>';
            });
            xml += '</Row>\n';
        });

        xml += '</Table>\n</Worksheet>\n</Workbook>';

        var blobXl = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        var urlXl  = URL.createObjectURL(blobXl);
        var aXl    = document.createElement('a');
        aXl.href = urlXl; aXl.download = 'opd-registrations.xls'; aXl.click();
        URL.revokeObjectURL(urlXl);
        return;
    }

    /* ── PDF (print-to-PDF via browser dialog) ── */
    if (type === 'pdf') {
        _exportPrintWindow('OPD Registrations – PDF', headers, rows);
        return;
    }

    /* ── Print ── */
    if (type === 'print') {
        _exportPrintWindow('OPD Registrations – Print', headers, rows);
    }
}

function _xmlEsc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Pagination ───────────────────────────────────────────────────────────── */
(function() {
    var perPage = 10;
    var currentPage = 1;

    window.renderRegPagination = function() {
        var tbody = document.getElementById('regTableBody');
        var info  = document.getElementById('regPageInfo');
        var nums  = document.getElementById('regPageNums');
        var prev  = document.getElementById('regPrevPage');
        var next  = document.getElementById('regNextPage');
        if (!tbody || !info || !nums) return;

        var allRows = Array.from(tbody.querySelectorAll('tr'));
        /* restore previously pagination-hidden rows */
        allRows.forEach(function(r) {
            if (r.getAttribute('data-pg-hidden')) { r.style.display = ''; r.removeAttribute('data-pg-hidden'); }
        });
        var visibleRows = allRows.filter(function(r) { return r.style.display !== 'none'; });
        var total = visibleRows.length;
        var pages = Math.max(1, Math.ceil(total / perPage));
        if (currentPage > pages) currentPage = pages;

        var from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
        var to   = Math.min(currentPage * perPage, total);
        info.textContent = total === 0
            ? 'No results found'
            : 'Showing ' + from + '\u2013' + to + ' of ' + total + ' results';
        /* show only current page rows */
        visibleRows.forEach(function(r, i) {
            if (i < from - 1 || i > to - 1) { r.style.display = 'none'; r.setAttribute('data-pg-hidden', '1'); }
        });

        if (prev) prev.disabled = currentPage <= 1;
        if (next) next.disabled = currentPage >= pages;

        nums.innerHTML = '';
        var range = [];
        for (var p = 1; p <= pages; p++) {
            if (p === 1 || p === pages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                range.push(p);
            }
        }
        var last = 0;
        range.forEach(function(p) {
            if (last && p - last > 1) {
                var dots = document.createElement('span');
                dots.className = 'opd-page-ellipsis';
                dots.textContent = '\u2026';
                nums.appendChild(dots);
            }
            var btn = document.createElement('button');
            btn.className = 'opd-page-num' + (p === currentPage ? ' active' : '');
            btn.textContent = p;
            (function(pg) {
                btn.addEventListener('click', function() {
                    currentPage = pg;
                    window.renderRegPagination();
                });
            })(p);
            nums.appendChild(btn);
            last = p;
        });
        if (window.lucide) lucide.createIcons();
    };

    document.addEventListener('DOMContentLoaded', function() {
        var prev   = document.getElementById('regPrevPage');
        var next   = document.getElementById('regNextPage');
        var selPP  = document.getElementById('regPerPage');
        if (prev) prev.addEventListener('click', function() {
            if (currentPage > 1) { currentPage--; window.renderRegPagination(); }
        });
        if (next) next.addEventListener('click', function() {
            currentPage++; window.renderRegPagination();
        });
        if (selPP) selPP.addEventListener('change', function() {
            perPage = parseInt(this.value, 10);
            currentPage = 1;
            window.renderRegPagination();
        });
        var tbody = document.getElementById('regTableBody');
        if (!tbody) return;
        window.renderRegPagination();
        var obs = new MutationObserver(function() { window.renderRegPagination(); });
        obs.observe(tbody, { childList: true, subtree: false });
    });
})();

/* ══════════════════════════════════════════════════════════════════════════
   BILLING TAB — Filter, Rows-per-page, Column Visibility, Export, Pagination
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Filter toggle ────────────────────────────────────────────────────────── */
function toggleBillFilter() {
    var pane = document.getElementById('billFilterPane');
    var btn  = document.getElementById('btnBillFilter');
    if (!pane) return;
    var open = pane.style.display !== 'none';
    pane.style.display = open ? 'none' : '';
    btn && btn.classList.toggle('filter-active', !open);
    if (!open && window.lucide) lucide.createIcons();
}

/* ── Apply filters ────────────────────────────────────────────────────────── */
function applyBillFilters() {
    var status  = (document.getElementById('billStatusFilter')  || {}).value || 'all';
    var dept    = (document.getElementById('billDeptFilter')    || {}).value || 'all';
    var mrn     = ((document.getElementById('billMrnFilter')    || {}).value || '').toLowerCase().trim();
    var patName = ((document.getElementById('billPatNameFilter')|| {}).value || '').toLowerCase().trim();
    var dateFrom = (document.getElementById('billDateFrom')     || {}).value || '';
    var dateTo   = (document.getElementById('billDateTo')       || {}).value || '';

    var rows = document.querySelectorAll('#billTableBody tr');
    rows.forEach(function(row) {
        var cells = row.querySelectorAll('td');
        if (!cells.length) return;

        /* col indices: 0=MRN,1=Name,2=VisitID,3=Dept,4=Doctor,5=VisitType,6=TotalAmount,7=Paid,8=Balance,9=Status,10=DateTime,11=Actions */
        var rowMrn    = (cells[0] ? cells[0].textContent.trim().toLowerCase() : '');
        var rowName   = (cells[1] ? cells[1].textContent.trim().toLowerCase() : '');
        var rowDept   = (cells[3] ? cells[3].textContent.trim().toLowerCase() : '');
        var rowStatus = (cells[9] ? cells[9].textContent.trim().toLowerCase() : '');

        var pass = true;
        if (status !== 'all' && rowStatus !== status.toLowerCase()) pass = false;
        if (dept   !== 'all' && !rowDept.includes(dept.toLowerCase())) pass = false;
        if (mrn    && !rowMrn.includes(mrn))       pass = false;
        if (patName && !rowName.includes(patName)) pass = false;
        if (dateFrom || dateTo) {
            /* bills table doesn't have a visible date column — skip date filter */
        }

        row.style.display = pass ? '' : 'none';
    });

    var active = 0;
    if (status !== 'all') active++;
    if (dept   !== 'all') active++;
    if (mrn)      active++;
    if (patName)  active++;
    if (dateFrom) active++;
    if (dateTo)   active++;
    var badge = document.getElementById('billFilterBadge');
    if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }

    if (window.renderBillPagination) window.renderBillPagination();
}

/* ── Reset filters ────────────────────────────────────────────────────────── */
function resetBillFilters() {
    ['billStatusFilter','billDeptFilter'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = 'all';
    });
    /* reset custom searchable selects */
    ['csBillMrn','csBillPatName'].forEach(function(id) {
        var w = document.getElementById(id);
        if (w && w._reset) w._reset();
    });
    /* reset hidden inputs */
    ['billMrnFilter','billPatNameFilter'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    /* reset date pickers */
    ['dpBillDateFrom','dpBillDateTo'].forEach(function(id) {
        var w = document.getElementById(id);
        if (w && w._reset) w._reset();
    });
    document.querySelectorAll('#billTableBody tr').forEach(function(r) { r.style.display = ''; });
    var badge = document.getElementById('billFilterBadge');
    if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
    if (window.renderBillPagination) window.renderBillPagination();
}

/* ── Rows-per-page ────────────────────────────────────────────────────────── */
function toggleBillRowsMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('billRowsMenu');
    if (!menu) return;
    document.getElementById('billExportMenu') && document.getElementById('billExportMenu').classList.remove('open');
    document.getElementById('billColVisMenu') && document.getElementById('billColVisMenu').classList.remove('open');
    if (menu.classList.toggle('open')) {
        var sel = document.getElementById('billPerPage');
        var cur = sel ? parseInt(sel.value, 10) : 10;
        menu.querySelectorAll('button').forEach(function(btn) {
            var v = parseInt(btn.textContent, 10);
            btn.classList.toggle('active', v === cur);
        });
    }
}

function setBillRowsPer(n) {
    var menu = document.getElementById('billRowsMenu');
    if (menu) menu.classList.remove('open');
    var sel = document.getElementById('billPerPage');
    if (!sel) return;
    sel.value = n;
    sel.dispatchEvent(new Event('change'));
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('billRowsMenu');
    var btn  = document.getElementById('btnBillRowsPer');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && e.target !== btn && !(btn && btn.contains(e.target))) {
            menu.classList.remove('open');
        }
    }
});

/* ── Column Visibility ────────────────────────────────────────────────────── */
function toggleBillColVis(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('billColVisMenu');
    if (!menu) return;
    document.getElementById('billExportMenu') && document.getElementById('billExportMenu').classList.remove('open');
    document.getElementById('billRowsMenu')   && document.getElementById('billRowsMenu').classList.remove('open');
    menu.classList.toggle('open');
}

function billColVisSelectAll() {
    document.querySelectorAll('#billColVisList input[type="checkbox"]').forEach(function(cb) {
        cb.checked = true;
    });
}

function applyBillColVis() {
    var menu = document.getElementById('billColVisMenu');
    if (menu) menu.classList.remove('open');

    var hidden = {};
    document.querySelectorAll('#billColVisList input[type="checkbox"]').forEach(function(cb) {
        hidden[parseInt(cb.getAttribute('data-col'), 10)] = !cb.checked;
    });

    var table = document.getElementById('billTable');
    if (!table) return;
    table.querySelectorAll('thead tr th').forEach(function(th, i) {
        th.style.display = hidden[i] ? 'none' : '';
    });
    table.querySelectorAll('tbody tr').forEach(function(row) {
        row.querySelectorAll('td').forEach(function(td, i) {
            td.style.display = hidden[i] ? 'none' : '';
        });
    });
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('billColVisMenu');
    var btn  = document.getElementById('btnBillColVis');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && e.target !== btn && !(btn && btn.contains(e.target))) {
            menu.classList.remove('open');
        }
    }
});

/* ── Export menu ──────────────────────────────────────────────────────────── */
function toggleBillExportMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('billExportMenu');
    if (!menu) return;
    menu.classList.toggle('open');
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('billExportMenu');
    var btn  = document.getElementById('btnBillExport');
    if (menu && menu.classList.contains('open')) {
        if (btn && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            menu.classList.remove('open');
        }
    }
});

function exportBill(type) {
    var menu = document.getElementById('billExportMenu');
    if (menu) menu.classList.remove('open');

    var table = document.getElementById('billTable');
    if (!table) return;
    var data    = _exportGetRows(table);
    var headers = data.headers;
    var rows    = data.rows;

    if (type === 'csv') {
        var csvLines = [headers.map(function(h) { return '"' + h.replace(/"/g,'""') + '"'; }).join(',')];
        rows.forEach(function(r) { csvLines.push(r.map(function(c) { return '"' + c.replace(/"/g,'""') + '"'; }).join(',')); });
        var blob = new Blob([csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a'); a.href = url; a.download = 'opd-billing.csv'; a.click();
        URL.revokeObjectURL(url);
        return;
    }

    if (type === 'excel') {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n'
            + '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n'
            + '<Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#060740" ss:Pattern="Solid"/></Style></Styles>\n'
            + '<Worksheet ss:Name="Billing"><Table>\n'
            + '<Row>' + headers.map(function(h) { return '<Cell ss:StyleID="h"><Data ss:Type="String">' + h + '</Data></Cell>'; }).join('') + '</Row>\n'
            + rows.map(function(r) { return '<Row>' + r.map(function(c) { return '<Cell><Data ss:Type="String">' + c.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</Data></Cell>'; }).join('') + '</Row>'; }).join('\n')
            + '\n</Table></Worksheet></Workbook>';
        var blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a'); a.href = url; a.download = 'opd-billing.xls'; a.click();
        URL.revokeObjectURL(url);
        return;
    }

    if (type === 'pdf' || type === 'print') {
        var now = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
        var w = window.open('', '_blank');
        if (!w) return;
        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OPD Billing</title>'
            + '<style>body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:20px}'
            + 'h2{font-size:16px;margin:0 0 4px}p.sub{font-size:11px;color:#666;margin:0 0 14px}'
            + 'table{border-collapse:collapse;width:100%}'
            + 'th{background:#060740;color:#fff;padding:7px 8px;text-align:left;font-size:11px}'
            + 'td{padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px}'
            + 'tr:nth-child(even) td{background:#f9fafb}'
            + '@media print{@page{margin:15mm}body{margin:0}}</style></head><body>'
            + '<h2>OPD Billing & Payments</h2>'
            + '<p class="sub">Generated on ' + now + ' &nbsp;|&nbsp; ' + rows.length + ' record(s)</p>'
            + '<table><thead><tr>' + headers.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>'
            + rows.map(function(r) { return '<tr>' + r.map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('')
            + '</tbody></table><script>window.onload=function(){window.print();}<\/script></body></html>';
        w.document.open(); w.document.write(html); w.document.close();
    }
}

/* billing pagination is now fully inside $(document).ready() — see renderBillPagination() above */

/* ═══════════════════════════════════════════════════════════════════════════
   CONSULTATION TOOLBAR FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function toggleConsultFilter() {
    var pane = document.getElementById('consultFilterPane');
    var btn  = document.getElementById('btnConsultFilter');
    if (!pane) return;
    var open = pane.style.display !== 'none';
    pane.style.display = open ? 'none' : '';
    btn && btn.classList.toggle('filter-active', !open);
    if (!open && window.lucide) lucide.createIcons();
}

function applyConsultFilters() {
    var status  = (document.getElementById('consultStatusFilter')  || {}).value || 'all';
    var dept    = (document.getElementById('consultDeptFilter')    || {}).value || 'all';
    var mrn     = ((document.getElementById('consultMrnFilter')    || {}).value || '').toLowerCase().trim();
    var patName = ((document.getElementById('consultPatNameFilter')|| {}).value || '').toLowerCase().trim();
    var doctor  = ((document.getElementById('consultDoctorFilter') || {}).value || '').toLowerCase().trim();

    var rows = document.querySelectorAll('#consultTableBody tr');
    rows.forEach(function(row) {
        var cells = row.querySelectorAll('td');
        if (!cells.length) return;

        /* col indices: 0=MRN,1=PatientName,2=VisitID,3=Department,4=Doctor,5=VisitType,6=Status,7=DateTime,8=Action */
        var rowMrn    = (cells[0] ? cells[0].textContent.trim().toLowerCase() : '');
        var rowName   = (cells[1] ? cells[1].textContent.trim().toLowerCase() : '');
        var rowDept   = (cells[3] ? cells[3].textContent.trim().toLowerCase() : '');
        var rowDoctor = (cells[4] ? cells[4].textContent.trim().toLowerCase() : '');
        var rowStatus = (cells[6] ? cells[6].textContent.trim().toLowerCase() : '');

        var pass = true;
        if (status !== 'all' && !rowStatus.includes(status.toLowerCase())) pass = false;
        if (dept   !== 'all' && !rowDept.includes(dept.toLowerCase()))     pass = false;
        if (mrn    && !rowMrn.includes(mrn))       pass = false;
        if (patName && !rowName.includes(patName)) pass = false;
        if (doctor  && !rowDoctor.includes(doctor)) pass = false;

        row.style.display = pass ? '' : 'none';
    });

    var active = 0;
    if (status !== 'all') active++;
    if (dept   !== 'all') active++;
    if (mrn)      active++;
    if (patName)  active++;
    if (doctor)   active++;
    var badge = document.getElementById('consultFilterBadge');
    if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }

    if (window.renderConsultPagination) window.renderConsultPagination();
}

function resetConsultFilters() {
    ['consultStatusFilter','consultDeptFilter'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = 'all';
    });
    ['csConsultMrn','csConsultPatName','csConsultDoctor'].forEach(function(id) {
        var w = document.getElementById(id);
        if (w && w._reset) w._reset();
    });
    ['consultMrnFilter','consultPatNameFilter','consultDoctorFilter'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['dpConsultDateFrom','dpConsultDateTo'].forEach(function(id) {
        var w = document.getElementById(id);
        if (w && w._reset) w._reset();
    });
    document.querySelectorAll('#consultTableBody tr').forEach(function(r) { r.style.display = ''; });
    var badge = document.getElementById('consultFilterBadge');
    if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
    if (window.renderConsultPagination) window.renderConsultPagination();
}

function toggleConsultRowsMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('consultRowsMenu');
    if (!menu) return;
    document.getElementById('consultExportMenu') && document.getElementById('consultExportMenu').classList.remove('open');
    document.getElementById('consultColVisMenu') && document.getElementById('consultColVisMenu').classList.remove('open');
    if (menu.classList.toggle('open')) {
        var sel = document.getElementById('consultPerPage');
        var cur = sel ? parseInt(sel.value, 10) : 10;
        menu.querySelectorAll('button').forEach(function(btn) {
            var v = parseInt(btn.textContent, 10);
            btn.classList.toggle('active', v === cur);
        });
    }
}

function setConsultRowsPer(n) {
    var menu = document.getElementById('consultRowsMenu');
    if (menu) menu.classList.remove('open');
    var sel = document.getElementById('consultPerPage');
    if (!sel) return;
    sel.value = n;
    sel.dispatchEvent(new Event('change'));
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('consultRowsMenu');
    var btn  = document.getElementById('btnConsultRowsPer');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && e.target !== btn && !(btn && btn.contains(e.target))) {
            menu.classList.remove('open');
        }
    }
});

function toggleConsultColVis(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('consultColVisMenu');
    if (!menu) return;
    document.getElementById('consultExportMenu') && document.getElementById('consultExportMenu').classList.remove('open');
    document.getElementById('consultRowsMenu')   && document.getElementById('consultRowsMenu').classList.remove('open');
    menu.classList.toggle('open');
}

function consultColVisSelectAll() {
    document.querySelectorAll('#consultColVisList input[type="checkbox"]').forEach(function(cb) {
        cb.checked = true;
    });
}

function applyConsultColVis() {
    var menu = document.getElementById('consultColVisMenu');
    if (menu) menu.classList.remove('open');

    var hidden = {};
    document.querySelectorAll('#consultColVisList input[type="checkbox"]').forEach(function(cb) {
        hidden[parseInt(cb.getAttribute('data-col'), 10)] = !cb.checked;
    });

    var table = document.getElementById('consultTable');
    if (!table) return;
    table.querySelectorAll('thead tr th').forEach(function(th, i) {
        th.style.display = hidden[i] ? 'none' : '';
    });
    table.querySelectorAll('tbody tr').forEach(function(row) {
        row.querySelectorAll('td').forEach(function(td, i) {
            td.style.display = hidden[i] ? 'none' : '';
        });
    });
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('consultColVisMenu');
    var btn  = document.getElementById('btnConsultColVis');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && e.target !== btn && !(btn && btn.contains(e.target))) {
            menu.classList.remove('open');
        }
    }
});

function toggleConsultExportMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('consultExportMenu');
    if (!menu) return;
    menu.classList.toggle('open');
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('consultExportMenu');
    var btn  = document.getElementById('btnConsultExport');
    if (menu && menu.classList.contains('open')) {
        if (btn && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            menu.classList.remove('open');
        }
    }
});

function exportConsult(type) {
    var menu = document.getElementById('consultExportMenu');
    if (menu) menu.classList.remove('open');

    var table = document.getElementById('consultTable');
    if (!table) return;
    var data    = _exportGetRows(table);
    var headers = data.headers;
    var rows    = data.rows;

    if (type === 'csv') {
        var csvLines = [headers.map(function(h) { return '"' + h.replace(/"/g,'""') + '"'; }).join(',')];
        rows.forEach(function(r) { csvLines.push(r.map(function(c) { return '"' + c.replace(/"/g,'""') + '"'; }).join(',')); });
        var blob = new Blob([csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a'); a.href = url; a.download = 'opd-consultations.csv'; a.click();
        URL.revokeObjectURL(url);
        return;
    }

    if (type === 'excel') {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n'
            + '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n'
            + '<Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#060740" ss:Pattern="Solid"/></Style></Styles>\n'
            + '<Worksheet ss:Name="Consultations"><Table>\n'
            + '<Row>' + headers.map(function(h) { return '<Cell ss:StyleID="h"><Data ss:Type="String">' + h + '</Data></Cell>'; }).join('') + '</Row>\n'
            + rows.map(function(r) { return '<Row>' + r.map(function(c) { return '<Cell><Data ss:Type="String">' + c.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</Data></Cell>'; }).join('') + '</Row>'; }).join('\n')
            + '\n</Table></Worksheet></Workbook>';
        var blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a'); a.href = url; a.download = 'opd-consultations.xls'; a.click();
        URL.revokeObjectURL(url);
        return;
    }

    if (type === 'pdf' || type === 'print') {
        var now = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
        var w = window.open('', '_blank');
        if (!w) return;
        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OPD Consultations</title>'
            + '<style>body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:20px}'
            + 'h2{font-size:16px;margin:0 0 4px}p.sub{font-size:11px;color:#666;margin:0 0 14px}'
            + 'table{border-collapse:collapse;width:100%}'
            + 'th{background:#060740;color:#fff;padding:7px 8px;text-align:left;font-size:11px}'
            + 'td{padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px}'
            + 'tr:nth-child(even) td{background:#f9fafb}'
            + '@media print{@page{margin:15mm}body{margin:0}}</style></head><body>'
            + '<h2>OPD Doctor Consultations</h2>'
            + '<p class="sub">Generated on ' + now + ' &nbsp;|&nbsp; ' + rows.length + ' record(s)</p>'
            + '<table><thead><tr>' + headers.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>'
            + rows.map(function(r) { return '<tr>' + r.map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('')
            + '</tbody></table><script>window.onload=function(){window.print();}<\/script></body></html>';
        w.document.open(); w.document.write(html); w.document.close();
    }
}

/* ═══════════════════════════════════════════════════════════════════════
   VITAL RECORDING TOOLBAR FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════ */

function toggleVitalFilter() {
    var pane = document.getElementById('vitalFilterPane');
    var btn  = document.getElementById('btnVitalFilter');
    if (!pane) return;
    var open = pane.style.display !== 'none';
    pane.style.display = open ? 'none' : '';
    btn && btn.classList.toggle('filter-active', !open);
    if (!open && window.lucide) lucide.createIcons();
}

function applyVitalFilters() {
    var status  = (document.getElementById('vitalStatusFilter') || {}).value || 'all';
    var dept    = (document.getElementById('vitalDeptFilter')   || {}).value || 'all';
    var mrn     = ((document.getElementById('vitalMrnFilter')    || {}).value || '').toLowerCase().trim();
    var patName = ((document.getElementById('vitalPatNameFilter')|| {}).value || '').toLowerCase().trim();
    var doctor  = ((document.getElementById('vitalDoctorFilter') || {}).value || '').toLowerCase().trim();
    var active  = 0;
    if (status !== 'all') active++; if (dept !== 'all') active++;
    if (mrn) active++; if (patName) active++; if (doctor) active++;
    var badge = document.getElementById('vitalFilterBadge');
    if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
    if (!window.vitalAllItems) return;
    var filtered = window.vitalAllItems.filter(function(item) {
        var v = item.visit;
        var cName   = (v.patientName || '').toLowerCase();
        var cSub    = ((v.mrn || '') + ' ' + (v.visitId || '')).toLowerCase();
        var cDept   = (v.department  || '').toLowerCase();
        var cDoctor = (v.doctorName  || '').toLowerCase();
        var tStatus = item.hasAlert ? 'alert' : (item.vitalCount > 0 ? 'recorded' : 'pending');
        var pass = true;
        if (mrn     && cSub.indexOf(mrn) === -1)        pass = false;
        if (patName && cName.indexOf(patName) === -1)   pass = false;
        if (doctor  && cDoctor.indexOf(doctor) === -1)  pass = false;
        if (dept !== 'all' && cDept.indexOf(dept.toLowerCase()) === -1) pass = false;
        if (status !== 'all') {
            if (status === 'alert'    && tStatus !== 'alert')   pass = false;
            if (status === 'recorded' && tStatus === 'pending') pass = false;
            if (status === 'pending'  && tStatus !== 'pending') pass = false;
        }
        return pass;
    });
    window._vitalFilteredItems = filtered;
    if (window.renderVitalPaginationFiltered) window.renderVitalPaginationFiltered(filtered);
}

function resetVitalFilters() {
    ['vitalStatusFilter','vitalDeptFilter'].forEach(function(id) { var el=document.getElementById(id); if(el) el.value='all'; });
    ['csVitalMrn','csVitalPatName','csVitalDoctor'].forEach(function(id) { var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
    ['vitalMrnFilter','vitalPatNameFilter','vitalDoctorFilter'].forEach(function(id) { var el=document.getElementById(id); if(el) el.value=''; });
    ['dpVitalDateFrom','dpVitalDateTo'].forEach(function(id) { var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
    window._vitalFilteredItems = null;
    var badge = document.getElementById('vitalFilterBadge');
    if (badge) { badge.textContent='0'; badge.style.display='none'; }
    if (window.renderVitalPagination) window.renderVitalPagination();
}

function toggleVitalRowsMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('vitalRowsMenu');
    if (!menu) return;
    document.getElementById('vitalExportMenu') && document.getElementById('vitalExportMenu').classList.remove('open');
    if (menu.classList.toggle('open')) {
        var cur = window.vitalPerPageVal || 12;
        menu.querySelectorAll('button').forEach(function(btn) {
            btn.classList.toggle('active', parseInt(btn.textContent,10) === cur);
        });
    }
}

function setVitalRowsPer(n) {
    var menu = document.getElementById('vitalRowsMenu');
    if (menu) menu.classList.remove('open');
    var sel = document.getElementById('vitalPerPage');
    if (sel) { sel.value = n; sel.dispatchEvent(new Event('change')); }
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('vitalRowsMenu');
    var btn  = document.getElementById('btnVitalRowsPer');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && e.target !== btn && !(btn && btn.contains(e.target)))
            menu.classList.remove('open');
    }
});

function toggleVitalExportMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('vitalExportMenu');
    if (!menu) return;
    document.getElementById('vitalRowsMenu') && document.getElementById('vitalRowsMenu').classList.remove('open');
    menu.classList.toggle('open');
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('vitalExportMenu');
    var btn  = document.getElementById('btnVitalExport');
    if (menu && menu.classList.contains('open')) {
        if (btn && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target))
            menu.classList.remove('open');
    }
});

function exportVital(type) {
    var menu = document.getElementById('vitalExportMenu');
    if (menu) menu.classList.remove('open');
    var src  = window._vitalFilteredItems || window.vitalAllItems || [];
    var rows = src.map(function(item) {
        var v  = item.visit;
        var dt = v.consultationDate ? new Date(v.consultationDate).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';
        return [ v.patientName||'', (v.mrn||'')+' / '+(v.visitId||''), v.department||'', v.doctorName||'', dt ];
    });
    var hdrs = ['Patient Name','MRN / Visit ID','Department','Doctor','Date/Time'];
    if (type === 'csv') {
        var lines = [hdrs.map(function(h){return'"'+h+'"';}).join(',')];
        rows.forEach(function(r){lines.push(r.map(function(c){return'"'+c.replace(/"/g,'""')+'"';}).join(','));});
        var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a'); a.href=url; a.download='opd-vitals.csv'; a.click();
        URL.revokeObjectURL(url); return;
    }
    if (type === 'pdf' || type === 'print') {
        var now = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
        var wv  = window.open('','_blank'); if (!wv) return;
        var hv  = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OPD Vitals</title>'
            +'<style>body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:20px}'
            +'h2{font-size:16px;margin:0 0 4px}p.sub{font-size:11px;color:#666;margin:0 0 14px}'
            +'table{border-collapse:collapse;width:100%}'
            +'th{background:#060740;color:#fff;padding:7px 8px;text-align:left;font-size:11px}'
            +'td{padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px}'
            +'tr:nth-child(even) td{background:#f9fafb}'
            +'@media print{@page{margin:15mm}body{margin:0}}</style></head><body>'
            +'<h2>OPD Vital Recording</h2><p class="sub">Generated on '+now+' | '+rows.length+' patient(s)</p>'
            +'<table><thead><tr>'+hdrs.map(function(h){return'<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>'
            +rows.map(function(r){return'<tr>'+r.map(function(c){return'<td>'+c+'</td>';}).join('')+'</tr>';}).join('')
            +'</tbody></table><script>window.onload=function(){window.print();}<\/script></body></html>';
        wv.document.open(); wv.document.write(hv); wv.document.close();
    }
}
