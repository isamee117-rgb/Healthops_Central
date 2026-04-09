$(document).ready(function() {
    function getMockDoctors() {
        return [
            { id: 1, firstName: 'Ahmed', lastName: 'Khan', department: 'Emergency', specialization: 'Emergency Medicine', status: 'ACTIVE' },
            { id: 2, firstName: 'Fatima', lastName: 'Noor', department: 'Emergency', specialization: 'Trauma Surgeon', status: 'ACTIVE' },
            { id: 3, firstName: 'Hassan', lastName: 'Ali', department: 'Surgery', specialization: 'General Surgeon', status: 'ACTIVE' },
            { id: 4, firstName: 'Ayesha', lastName: 'Siddiqui', department: 'General Medicine', specialization: 'General Physician', status: 'ACTIVE' },
            { id: 5, firstName: 'Usman', lastName: 'Malik', department: 'Orthopedics', specialization: 'Orthopedic Surgeon', status: 'ACTIVE' },
            { id: 6, firstName: 'Sana', lastName: 'Rehman', department: 'Cardiology', specialization: 'Cardiologist', status: 'ACTIVE' },
            { id: 7, firstName: 'Bilal', lastName: 'Mirza', department: 'Neurology', specialization: 'Neurologist', status: 'ACTIVE' },
            { id: 8, firstName: 'Zainab', lastName: 'Shah', department: 'Pediatrics', specialization: 'Pediatrician', status: 'ACTIVE' },
            { id: 9, firstName: 'Tariq', lastName: 'Mehmood', department: 'Anesthesiology', specialization: 'Anesthesiologist', status: 'ACTIVE' },
            { id: 10, firstName: 'Rabia', lastName: 'Iqbal', department: 'Radiology', specialization: 'Radiologist', status: 'ACTIVE' }
        ];
    }

    var patients = [];
    var visits = [];
    var bills = [];
    var doctors = [];

    /* Triage table pagination / filter state */
    var erTriCurrentPage = 1;
    var erTriPerPageVal  = 10;
    var erTriFiltered    = null;

    /* Treatment & Orders pagination / filter state */
    var erOrdCurrentPage = 1;
    var erOrdPerPageVal  = 10;
    var erOrdFiltered    = null;

    /* Investigations pagination / filter state */
    var erInvCurrentPage = 1;
    var erInvPerPageVal  = 10;
    var erInvFiltered    = null;

    /* Disposition pagination / filter state */
    var erDispCurrentPage = 1;
    var erDispPerPageVal  = 10;
    var erDispFiltered    = null;
    var masterCharges = [];
    var hospitalInfo = { currency: 'USD' };
    var masterData = {};
    var activeTab = 'triage';

    var registrationStep = 'phone-search';
    var phoneSearch = '';
    var phoneSearchResults = null;
    var selectedPatientMRN = null;
    var patientForm = { name: '', age: '', gender: 'Male', cnic: '', contactType: 'SELF', guardianName: '', guardianCnic: '', relationshipToPatient: '' };
    var visitForm = { doctorName: '', department: 'Emergency', visitType: 'ER Visit', doctorFee: '0', doctorFeeDiscount: 0, esi: '3 - Urgent', modeOfArrival: 'Walk-in', chiefComplaint: '', mechanismOfInjury: '', isMLC: false };
    var selectedOptionalCharges = [];
    var erChargesGrid = [];
    var validationErrors = [];

    var erClinicalInvestigations = { grouped: [], all: [] };

    var selectedEROrderVisit = null;
    var erOrderActiveSection = 'medication';
    var erExistingOrders = [];
    var erPrescriptionsList = [];
    var erInvestigationsList = [];
    var erIVFluidsList = [];
    var erDietOrdersList = [];
    var erNursingOrdersList = [];
    var erProcedureOrdersList = [];
    var erFormSections = [];
    var erCustomOrderData = {};
    var erInventoryMedicines = [];
    var erMedicinesLoaded = false;

    var _erMedCallbacks = [];
    function loadErInventoryMedicines(cb) {
        if (cb) _erMedCallbacks.push(cb);
        if (erMedicinesLoaded) {
            if (cb) { _erMedCallbacks.pop(); cb(erInventoryMedicines); }
            return;
        }
        if (_erMedCallbacks.length > 1) return;
        $.get('/api/inventory/medicines')
            .done(function(data) {
                erInventoryMedicines = (data || []).map(function(m) {
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
                erMedicinesLoaded = true;
                var cbs = _erMedCallbacks.splice(0);
                cbs.forEach(function(fn) { fn(erInventoryMedicines); });
            })
            .fail(function() { _erMedCallbacks.splice(0); });
    }

    var erPharmRxConfig = { units: ['mg', 'ml', 'g', 'IU'], routes: ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaler'], frequencies: ['OD', 'BD', 'TDS', 'QID', 'PRN', 'SOS'] };

    function loadErPharmRxConfig() {
        $.when(
            $.get('/api/pharmacy-config/rx_unit'),
            $.get('/api/pharmacy-config/rx_route'),
            $.get('/api/pharmacy-config/rx_frequency')
        ).done(function(unitRes, routeRes, freqRes) {
            var units  = unitRes[0]  || [];
            var routes = routeRes[0] || [];
            var freqs  = freqRes[0]  || [];
            if (units.length)  erPharmRxConfig.units       = units;
            if (routes.length) erPharmRxConfig.routes      = routes;
            if (freqs.length)  erPharmRxConfig.frequencies = freqs;
            var firstUnit  = erPharmRxConfig.units[0]  || 'mg';
            var firstRoute = erPharmRxConfig.routes[0] || 'Oral';
            var firstFreq  = erPharmRxConfig.frequencies[0];
            var firstFreqName = firstFreq ? (typeof firstFreq === 'object' ? firstFreq.name : firstFreq) : 'OD';
            erRxForm.unit      = erRxForm.unit      || firstUnit;
            erRxForm.route     = erRxForm.route     || firstRoute;
            erRxForm.frequency = erRxForm.frequency || firstFreqName;
        });
    }

    function getErFreqTimesPerDay(freqName) {
        var f = erPharmRxConfig.frequencies.find(function(x) { return (typeof x === 'object' ? x.name : x) === freqName; });
        if (!f) return null;
        var tpd = typeof f === 'object' ? f.timesPerDay : null;
        return (tpd !== null && tpd !== undefined) ? tpd : null;
    }

    function buildErRxOptions(items, selected) {
        return (items || []).map(function(v) {
            var name  = typeof v === 'object' ? (v.name || v.label || '') : String(v);
            var label = $('<span>').text(name).html();
            return '<option value="' + label + '"' + (name === selected ? ' selected' : '') + '>' + label + '</option>';
        }).join('');
    }

    function buildErFreqOptions(items, selected) {
        return (items || []).map(function(v) {
            var name     = (typeof v === 'object') ? v.name : v;
            var fullEsc  = $('<span>').text(name).html();
            var short    = name.indexOf('(') > -1 ? name.substring(0, name.indexOf('(')).trim() : name;
            var shortEsc = $('<span>').text(short).html();
            return '<option value="' + fullEsc + '" title="' + fullEsc + '"' + (name === selected ? ' selected' : '') + '>' + shortEsc + '</option>';
        }).join('');
    }

    var erRxForm = { medicine: '', medicineId: '', strength: '', dose: '', unit: 'mg', route: 'Oral', frequency: 'OD', duration: '' };
    var erInvForm = { type: 'Laboratory', test: '', testCode: '', price: '', dept: '', sample: '', priority: 'Routine' };
    var erIVForm = { fluidType: '', volume: '', rateMethod: 'rate', rate: '', additives: [], ivAccess: 'Peripheral IV (existing)', site: '', startTime: 'now', frequency: 'single', dailyFluidGoal: '', monitorIO: false, checkSite: false, watchOverload: false, specialInstructions: '', otherFluid: '' };
    var erDietForm = { dietType: '', otherDiet: '', restrictions: [], foodAllergies: '', foodPreferences: '', feedingRoute: 'Oral Feeding', mealFrequency: '3 Main Meals + 2 Snacks', fluidRestriction: 'none', fluidRestrictAmount: '', startTime: 'next_meal', duration: 'until_further', durationDays: '', specialInstructions: '' };
    var erNursingForm = { orderType: '', vitals: ['Blood Pressure', 'Heart Rate/Pulse', 'Respiratory Rate', 'Temperature', 'Oxygen Saturation (SpO2)'], frequency: 'Q4H', duration: 'until_further', durationHours: '', alertBPLow: '90/60', alertBPHigh: '180/100', alertHRLow: '50', alertHRHigh: '120', alertRRLow: '12', alertRRHigh: '24', alertTempLow: '35.5', alertTempHigh: '38.5', alertSpO2: '90', specialInstructions: '', otherType: '' };
    var erProcForm = { procedure: '', indication: '', diagnosis: '', priority: 'Emergency', location: 'Bedside', consentObtained: false, consentBy: '', consentDate: '', consentWitness: '', preProc: [], specialInstructions: '', estimatedDuration: '', estimatedCost: '' };
    var selectedRecord = null;

    var relationshipOptions = ['Father', 'Mother', 'Son', 'Daughter', 'Husband', 'Wife', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Legal Guardian', 'Other'];
    var boardTimerInterval = null;

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    }

    function esc(str) {
        if (!str) return '';
        return $('<div>').text(str).html();
    }

    function getTriageBadgeClass(category) {
        switch(category) {
            case 'Red': return 'badge-triage-red';
            case 'Orange': return 'badge-triage-orange';
            case 'Yellow': return 'badge-triage-yellow';
            case 'Green': return 'badge-triage-green';
            case 'Black': return 'badge-triage-black';
            default: return 'badge-triage-default';
        }
    }

    function getTriageDotClass(category) {
        switch(category) {
            case 'Red': return 'triage-red';
            case 'Orange': return 'triage-orange';
            case 'Yellow': return 'triage-yellow';
            case 'Green': return 'triage-green';
            case 'Black': return 'triage-black';
            default: return 'triage-default';
        }
    }

    function getBoardBorderClass(status) {
        switch(status) {
            case 'Waiting': return 'border-waiting';
            case 'In Treatment': return 'border-treatment';
            case 'Under Observation': return 'border-observation';
            case 'Ready for Disposition': return 'border-disposition';
            default: return '';
        }
    }

    function getMinutesAgo(dateStr) {
        return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    }

    function getTimeInER(dateStr) {
        if (!dateStr) return '-';
        var mins = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
        if (mins < 60) return mins + ' min';
        var hrs = Math.floor(mins / 60);
        var rem = mins % 60;
        return hrs + 'h ' + rem + 'm';
    }

    function statusBadge(status) {
        if (status === 'Paid') return '<span class="badge badge-success">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Pending') return '<span class="badge badge-warning">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Active') return '<span class="badge badge-success">' + esc(status).toUpperCase() + '</span>';
        if (status === 'Completed') return '<span class="badge badge-info">' + esc(status).toUpperCase() + '</span>';
        return '<span class="badge badge-outline">' + esc(status || 'WAITING').toUpperCase() + '</span>';
    }

    function safeGet(url) {
        return $.get(url).then(
            function(data) { return data; },
            function() { return null; }
        );
    }

    function loadAllData() {
        $.when(
            safeGet('/api/patients'),
            safeGet('/api/emergency/visits'),
            safeGet('/api/emergency/bills'),
            safeGet('/api/doctors'),
            safeGet('/api/config/hospital-charges/module/ER'),
            safeGet('/api/config/hospital-info'),
            safeGet('/api/config/master-data')
        ).done(function(r1, r2, r3, r4, r5, r6, r7) {
            patients = r1 || [];
            visits = r2 || [];
            bills = r3 || [];
            doctors = (r4 || []).filter(function(d) { return d.status === 'ACTIVE'; });
            if (doctors.length === 0) doctors = getMockDoctors();
            masterCharges = r5 || [];
            if (r6) hospitalInfo = $.extend(hospitalInfo, r6);
            if (r7) masterData = r7;
            renderAll();
        });
        loadErInvestigations();
        loadErPharmRxConfig();
        loadErInventoryMedicines();
        loadErFormSections();
    }

    function loadErFormSections() {
        $.get('/api/er/form-sections').done(function(sections) {
            erFormSections = sections || [];
        }).fail(function() {
            erFormSections = [];
        });
    }

    function getAvailableErSections() {
        if (!erFormSections || erFormSections.length === 0) {
            return [
                { id: 'medication', label: 'Medication', icon: 'pill', isDefault: true },
                { id: 'investigation', label: 'Investigation', icon: 'flask-conical', isDefault: true },
                { id: 'ivfluids', label: 'IV Fluids', icon: 'droplets', isDefault: true },
                { id: 'diet', label: 'Diet', icon: 'utensils', isDefault: true },
                { id: 'nursing', label: 'Nursing', icon: 'heart-pulse', isDefault: true },
                { id: 'procedure', label: 'Procedures', icon: 'stethoscope', isDefault: true },
                { id: 'ordersummary', label: 'Order Summary', icon: 'clipboard-list', isDefault: true }
            ];
        }
        var BUILTIN_ICONS = { medication: 'pill', investigation: 'flask-conical', ivfluids: 'droplets', diet: 'utensils', nursing: 'heart-pulse', procedure: 'stethoscope', ordersummary: 'clipboard-list' };
        return erFormSections
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

    function loadErInvestigations() {
        $.get('/api/er/clinical-orders/investigations', function(res) {
            erClinicalInvestigations = res || { grouped: [], all: [] };
            renderInvestigationsTab();
        }).fail(function() {
            erClinicalInvestigations = { grouped: [], all: [] };
        });
    }

    function renderAll() {
        renderTriageTable();
        renderBoard();
        renderTreatmentTab();
        renderInvestigationsTab();
        renderDispositionTab();
        lucide.createIcons();
        startBoardTimer();
    }

    function getFilteredVisits() {
        var search = '';
        if (activeTab === 'triage') search = ($('#erTriageSearch').val() || '').toLowerCase();
        return visits.filter(function(v) {
            return !search || v.patientName.toLowerCase().indexOf(search) > -1 || v.mrn.toLowerCase().indexOf(search) > -1;
        });
    }

    // ===== TAB SWITCHING =====
    $('.module-tab').on('click', function() {
        var tab = $(this).data('tab');
        activeTab = tab;
        $('.module-tab').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').hide();
        $('#tab-' + tab).show();
        // Hide the ER dept header on Treatment, Investigations & Disposition tabs
        if (tab === 'treatment' || tab === 'investigations' || tab === 'disposition') {
            $('#erDeptHeader').hide();
        } else {
            $('#erDeptHeader').show();
        }
        if (tab === 'treatment') { erOrdCurrentPage = 1; renderTreatmentTab(); }
        if (tab === 'triage')         { erTriCurrentPage = 1; renderTriageTable(); }
        if (tab === 'investigations') { erInvCurrentPage = 1; renderInvestigationsTab(); }
        if (tab === 'disposition')    { erDispCurrentPage = 1; renderDispositionTab(); }
        lucide.createIcons();
    });

    // ===== TAB 1: TRIAGE TABLE =====
    function erTriPopulateFilterOptions() {
        if (!visits.length) return;
        var docs = [];
        visits.forEach(function(v){ if (v.doctorName && docs.indexOf(v.doctorName) < 0) docs.push(v.doctorName); });
        var docWrap = document.getElementById('erTriCsDoctor');
        if (docWrap && docWrap.setOptions) docWrap.setOptions(['All Doctors'].concat(docs.map(function(d){ return 'Dr. ' + d; })));
    }

    function _erTriRenderPagination(source) {
        /* sort latest / most-recent first */
        var sorted = source.slice().sort(function(a, b) {
            return new Date(b.consultationDate) - new Date(a.consultationDate);
        });
        var total  = sorted.length;
        var pages  = Math.max(1, Math.ceil(total / erTriPerPageVal));
        erTriCurrentPage = Math.min(erTriCurrentPage, pages);
        var start  = (erTriCurrentPage - 1) * erTriPerPageVal;
        var slice  = sorted.slice(start, start + erTriPerPageVal);
        var end    = Math.min(start + erTriPerPageVal, total);
        var html   = '';
        if (slice.length === 0) {
            html = '<tr><td colspan="10"><div class="empty-state"><i data-lucide="users"></i><p>No emergency visits found</p><p class="empty-sub">Try adjusting your search or filters</p></div></td></tr>';
        } else {
            slice.forEach(function(v) {
                var mins = getMinutesAgo(v.consultationDate);
                var triageClass = getTriageBadgeClass(v.triageCategory);
                var pulseClass  = v.triageCategory === 'Red' ? ' pulse-badge' : '';
                var dtObj = new Date(v.consultationDate);
                var dateStr = dtObj.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
                var timeStr = dtObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                html += '<tr class="er-visit-row clickable-row" data-visit-id="' + esc(v.visitId) + '">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(v.mrn) + '</td>' +
                    '<td><span style="font-weight:500;font-size:14px">' + esc(v.patientName) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(v.visitId) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + dtObj.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + '</td>' +
                    '<td><span class="badge ' + triageClass + pulseClass + '" style="font-size:10px">' + esc(v.triageCategory || 'Unassigned') + '</span></td>' +
                    '<td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--color-muted-foreground)">' + esc(v.chiefComplaint || '-') + '</td>' +
                    '<td style="font-size:12px;font-weight:500;color:var(--midnight-blue)">Dr. ' + esc(v.doctorName) + '</td>' +
                    '<td class="er-time-cell" data-date="' + esc(v.consultationDate) + '" style="font-size:12px;font-family:monospace;color:var(--color-muted-foreground)">' + mins + 'm</td>' +
                    '<td>' + statusBadge(v.clinicalStatus) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);white-space:nowrap">' +
                        '<span style="display:block;font-weight:500;color:var(--midnight-blue)">' + dateStr + '</span>' +
                        '<span style="font-size:11px">' + timeStr + '</span>' +
                    '</td>' +
                    '</tr>';
            });
        }
        $('#erTriageTableBody').html(html);
        $('#erTriTableInfo').text(total === 0 ? 'No results' : 'Showing ' + (start + 1) + '\u2013' + end + ' of ' + total + ' visits');
        var nums = '';
        for (var p = 1; p <= pages; p++) nums += '<button class="opd-page-num' + (p === erTriCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        $('#erTriPageNums').html(nums);
        $('#erTriPrevPage').prop('disabled', erTriCurrentPage <= 1);
        $('#erTriNextPage').prop('disabled', erTriCurrentPage >= pages);
        lucide.createIcons();
    }

    function renderTriageTable() {
        erTriPopulateFilterOptions();
        var search = ($('#erTriageSearch').val() || '').toLowerCase();
        var base   = erTriFiltered !== null ? erTriFiltered : visits;
        var src    = search ? base.filter(function(v) {
            return v.patientName.toLowerCase().indexOf(search) > -1 || v.mrn.toLowerCase().indexOf(search) > -1 || (v.visitId||'').toLowerCase().indexOf(search) > -1;
        }) : base;
        _erTriRenderPagination(src);
    }

    $('#erTriageSearch').on('input', function() { erTriCurrentPage = 1; renderTriageTable(); });
    $(document).on('click', '#erTriPageNums .opd-page-num', function() {
        erTriCurrentPage = parseInt($(this).data('p')); renderTriageTable();
    });
    $(document).on('click', '#erTriPrevPage', function() {
        if (!$(this).prop('disabled') && erTriCurrentPage > 1) { erTriCurrentPage--; renderTriageTable(); }
    });
    $(document).on('click', '#erTriNextPage', function() {
        if (!$(this).prop('disabled')) { erTriCurrentPage++; renderTriageTable(); }
    });

    $(document).on('click', '.er-visit-row', function() {
        var visitId = $(this).data('visit-id');
        if (visitId) openERDetail(visitId);
    });

    $(document).on('click', '.er-treatment-visit-row', function() {
        var visitId = $(this).data('visit-id');
        if (visitId) openEROrdersDetail(visitId);
    });

    // ===== TAB 2: BOARD =====
    function renderBoard() {
        var statuses = ['Waiting', 'In Treatment', 'Under Observation', 'Ready for Disposition'];
        var colors = { 'Waiting': '#ca8a04', 'In Treatment': '#2563eb', 'Under Observation': '#7c3aed', 'Ready for Disposition': '#16a34a' };
        var filtered = getFilteredVisits();

        var html = '';
        statuses.forEach(function(status) {
            var columnVisits = filtered.filter(function(v) { return (v.clinicalStatus || 'Waiting') === status; });
            html += '<div class="er-board-column">' +
                '<div class="er-board-column-header" style="color:' + colors[status] + '">' +
                    status.toUpperCase() +
                    '<span class="badge badge-outline" style="font-size:11px;background:#fff;border:1px solid var(--color-border)">' + columnVisits.length + '</span>' +
                '</div>' +
                '<div class="er-board-column-body">';

            if (columnVisits.length === 0) {
                html += '<div style="text-align:center;padding:24px;color:var(--color-muted-foreground);font-size:12px;opacity:0.5">No patients</div>';
            } else {
                columnVisits.forEach(function(v) {
                    var mins = getMinutesAgo(v.consultationDate);
                    html += '<div class="er-board-card ' + getBoardBorderClass(status) + ' er-visit-row" data-visit-id="' + esc(v.visitId) + '">' +
                        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
                            '<span style="font-family:monospace;font-size:11px;color:var(--color-muted-foreground)">' + esc(v.mrn) + '</span>' +
                            '<div class="er-triage-dot ' + getTriageDotClass(v.triageCategory) + '"></div>' +
                        '</div>' +
                        '<h4 style="font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 0 4px">' + esc(v.patientName) + '</h4>' +
                        '<p style="font-size:11px;color:var(--color-muted-foreground);margin:0 0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(v.chiefComplaint || 'No chief complaint') + '</p>' +
                        '<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--color-muted-foreground);margin-top:8px;padding-top:8px;border-top:1px solid var(--color-border)">' +
                            '<i data-lucide="clock" style="width:12px;height:12px"></i>' +
                            '<span class="er-time-cell" data-date="' + v.consultationDate + '">' + mins + 'm ago</span>' +
                        '</div>' +
                    '</div>';
                });
            }

            html += '</div></div>';
        });

        $('#erBoardGrid').html(html);
        lucide.createIcons();
    }

    function startBoardTimer() {
        if (boardTimerInterval) clearInterval(boardTimerInterval);
        boardTimerInterval = setInterval(function() {
            $('.er-time-cell').each(function() {
                var date = $(this).data('date');
                if (date) {
                    var mins = getMinutesAgo(date);
                    var text = $(this).text().indexOf('ago') > -1 ? mins + 'm ago' : mins + 'm';
                    $(this).text(text);
                }
            });
        }, 60000);
    }

    // ===== TAB 3: TREATMENT =====
    function erOrdPopulateFilterOptions() {
        if (!visits.length) return;
        var docs = [];
        visits.forEach(function(v) { if (v.doctorName && docs.indexOf(v.doctorName) < 0) docs.push(v.doctorName); });
        var docWrap = document.getElementById('erOrdCsDoctor');
        if (docWrap && docWrap.setOptions) docWrap.setOptions(['All Doctors'].concat(docs.map(function(d) { return 'Dr. ' + d; })));
    }

    function _erOrdRenderPagination(source) {
        /* latest / most-recent visit first */
        var sorted = source.slice().sort(function(a, b) {
            return new Date(b.visitDate || b.consultationDate || b.createdAt || 0) -
                   new Date(a.visitDate || a.consultationDate || a.createdAt || 0);
        });
        var total  = sorted.length;
        var pages  = Math.max(1, Math.ceil(total / erOrdPerPageVal));
        erOrdCurrentPage = Math.min(erOrdCurrentPage, pages);
        var start  = (erOrdCurrentPage - 1) * erOrdPerPageVal;
        var slice  = sorted.slice(start, start + erOrdPerPageVal);
        var end    = Math.min(start + erOrdPerPageVal, total);

        var criticalCount = source.filter(function(v) { return v.esi === '1 - Immediate' || v.esi === '2 - Emergent'; }).length;
        var invCount = 0;
        source.forEach(function(v) { if (v.investigations && v.investigations.length) invCount += v.investigations.length; });
        $('#erStatPendingOrders').text(total);
        $('#erStatActiveMeds').text(total > 0 ? total * 2 : 0);
        $('#erStatInvestigations').text(invCount);
        $('#erStatCriticalESI').text(criticalCount);

        var html = '';
        if (slice.length === 0) {
            html = '<tr><td colspan="9"><div class="empty-state"><i data-lucide="clipboard-list"></i><p>No active ER patients found</p><p class="empty-sub">Register a new emergency arrival to create clinical orders</p></div></td></tr>';
        } else {
            slice.forEach(function(v) {
                var age = v.age || '';
                var gender = v.gender || '';
                var esiLabel = (v.esi || '').replace(/^\d\s*-\s*/, '') || '-';
                var esiNum = (v.esi || '').match(/^(\d)/);
                var esiColor = esiNum ? (['', '#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6'][parseInt(esiNum[1])] || '#64748B') : '#64748B';
                var visitDate = v.visitDate || v.createdAt || null;
                var hoursAgo = '-';
                if (visitDate) {
                    var diff = Math.floor((Date.now() - new Date(visitDate).getTime()) / 3600000);
                    hoursAgo = diff < 1 ? 'Just now' : diff < 24 ? diff + 'h ago' : Math.floor(diff / 24) + 'd ago';
                }
                var visitIdShort = (v.visitId || '').split('-').slice(-2).join('-') || v.visitId || '-';
                var statusBadge = '<span class="badge badge-success" style="font-size:10px">ACTIVE</span>';
                if (v.status === 'Discharged') statusBadge = '<span class="badge badge-outline" style="font-size:10px">DISCHARGED</span>';

                html += '<tr class="clickable-row er-treatment-visit-row" data-visit-id="' + esc(v.visitId) + '">' +
                    '<td><div style="display:flex;align-items:center;gap:8px"><div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(v.patientName || '') + '</div><div><span style="font-weight:500;font-size:14px">' + esc(v.patientName || '-') + '</span><div style="font-size:11px;color:var(--color-muted-foreground)">' + (age ? age + 'y ' + esc(gender) : esc(gender)) + '</div></div></div></td>' +
                    '<td style="font-size:12px"><span style="color:var(--color-muted-foreground)">' + esc(visitIdShort) + '</span> / <span style="font-weight:600;color:' + esiColor + '">' + esc(esiLabel) + '</span></td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(v.chiefComplaint || v.department || '-') + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + esc(v.doctorName || '-') + '</td>' +
                    '<td class="text-center"><span style="font-size:12px;color:var(--color-muted-foreground)">-</span></td>' +
                    '<td class="text-center" style="font-size:12px;font-weight:500">-</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + hoursAgo + '</td>' +
                    '<td>' + statusBadge + '</td>' +
                    '<td class="text-center"><button class="btn-ghost btn-icon"><i data-lucide="arrow-right" style="width:16px;height:16px"></i></button></td>' +
                    '</tr>';
            });
        }
        $('#erOrdersTableBody').html(html);
        $('#erOrdTableInfo').text(total === 0 ? 'No results' : 'Showing ' + (start + 1) + '\u2013' + end + ' of ' + total + ' orders');
        var nums = '';
        for (var p = 1; p <= pages; p++) nums += '<button class="opd-page-num' + (p === erOrdCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        $('#erOrdPageNums').html(nums);
        $('#erOrdPrevPage').prop('disabled', erOrdCurrentPage <= 1);
        $('#erOrdNextPage').prop('disabled', erOrdCurrentPage >= pages);
        lucide.createIcons();
    }

    function renderTreatmentTab() {
        erOrdPopulateFilterOptions();
        var search = ($('#erOrdSearch').val() || '').toLowerCase();
        var base = erOrdFiltered !== null ? erOrdFiltered : visits.filter(function(v) {
            return v.status === 'Active' || v.status === 'In Treatment' || v.status === 'Under Observation' || !v.status || v.status === 'Waiting';
        });
        var src = search ? base.filter(function(v) {
            return (v.patientName || '').toLowerCase().indexOf(search) > -1 ||
                (v.visitId || '').toLowerCase().indexOf(search) > -1 ||
                (v.mrn || '').toLowerCase().indexOf(search) > -1 ||
                (v.doctorName || '').toLowerCase().indexOf(search) > -1;
        }) : base;
        _erOrdRenderPagination(src);
    }

    $('#erOrdSearch').on('input', function() { erOrdCurrentPage = 1; renderTreatmentTab(); });
    $(document).on('click', '#erOrdPageNums .opd-page-num', function() {
        erOrdCurrentPage = parseInt($(this).data('p')); renderTreatmentTab();
    });
    $(document).on('click', '#erOrdPrevPage', function() {
        if (!$(this).prop('disabled') && erOrdCurrentPage > 1) { erOrdCurrentPage--; renderTreatmentTab(); }
    });
    $(document).on('click', '#erOrdNextPage', function() {
        if (!$(this).prop('disabled')) { erOrdCurrentPage++; renderTreatmentTab(); }
    });
    $('#btnERNewOrder').on('click', function() {
        var activeVisits = visits.filter(function(v) { return v.status !== 'Discharged'; });
        if (activeVisits.length > 0) {
            openEROrdersDetail(activeVisits[0].visitId);
        } else {
            showToast('No active ER patients. Register a new arrival first.', 'error');
        }
    });

    // ===== TAB 4: INVESTIGATIONS =====

    function renderInvestigationsTab() {
        var grouped = (erClinicalInvestigations && erClinicalInvestigations.grouped) ? erClinicalInvestigations.grouped : [];

        /* Update stat tiles from full dataset */
        var cPending = 0, cInProg = 0, cDone = 0, cCritical = 0;
        grouped.forEach(function(g) {
            var invs = g.investigations || [];
            var allOrdered  = invs.length > 0 && invs.every(function(i) { return i.status !== 'pending'; });
            var anyComplete = invs.some(function(i) { return i.status === 'completed'; });
            if (allOrdered && anyComplete)       cDone++;
            else if (allOrdered)                 cInProg++;
            else                                 cPending++;
            var firstInv = invs[0] || {};
            if ((firstInv.priority || '').toLowerCase() === 'stat') cCritical++;
        });
        $('#erInvStatPending').text(cPending);
        $('#erInvStatInProgress').text(cInProg);
        $('#erInvStatCompleted').text(cDone);
        $('#erInvStatCritical').text(cCritical);

        var search = ($('#erInvSearch').val() || '').toLowerCase();
        var src    = erInvFiltered !== null ? erInvFiltered : grouped;
        if (search) {
            src = src.filter(function(g) {
                return (g.patient || '').toLowerCase().indexOf(search) >= 0 ||
                    (g.mrn || '').toLowerCase().indexOf(search) >= 0 ||
                    (g.admissionId || '').toLowerCase().indexOf(search) >= 0 ||
                    (g.investigations || []).some(function(inv) { return (inv.name || '').toLowerCase().indexOf(search) >= 0; });
            });
        }
        _erInvRenderPagination(src);
    }

    function _erInvRenderPagination(source) {
        /* Sort: most recent investigation date first */
        source = source.slice().sort(function(a, b) {
            var da = (a.investigations && a.investigations[0] && a.investigations[0].date)
                ? new Date(a.investigations[0].date) : new Date(0);
            var db = (b.investigations && b.investigations[0] && b.investigations[0].date)
                ? new Date(b.investigations[0].date) : new Date(0);
            return db - da;
        });

        var total  = source.length;
        var pages  = Math.max(1, Math.ceil(total / erInvPerPageVal));
        if (erInvCurrentPage > pages) erInvCurrentPage = pages;
        var start  = (erInvCurrentPage - 1) * erInvPerPageVal;
        var slice  = source.slice(start, start + erInvPerPageVal);
        var end    = Math.min(start + erInvPerPageVal, total);

        if (total === 0) {
            $('#erInvestigationsBody').html(
                '<tr><td colspan="8" class="text-center" style="padding:56px 24px">' +
                '<div style="color:var(--color-muted-foreground)">' +
                '<i data-lucide="flask-conical" style="width:40px;height:40px;margin:0 auto 12px;display:block;opacity:0.3"></i>' +
                '<p style="font-weight:600;font-size:15px;margin:0 0 4px">No investigations found</p>' +
                '<p style="font-size:13px;margin:0">Order investigations from the Treatment &amp; Orders tab</p>' +
                '</div></td></tr>'
            );
            $('#erInvTableInfo').text('No results');
            $('#erInvPageNums').empty();
            $('#erInvPrevPage').prop('disabled', true);
            $('#erInvNextPage').prop('disabled', true);
            lucide.createIcons();
            return;
        }

        var html = '';
        slice.forEach(function(group) {
            var invs     = group.investigations || [];
            var labCount = invs.filter(function(i) { return i.type === 'lab'; }).length;
            var radCount = invs.filter(function(i) { return i.type === 'radiology'; }).length;

            var typeBadges = '';
            if (labCount > 0) typeBadges += '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:5px;background:#f5f3ff;color:#7c3aed;font-size:11px;font-weight:600;border:1px solid #e9d5ff">Lab &times;' + labCount + '</span> ';
            if (radCount > 0) typeBadges += '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:5px;background:#ecfeff;color:#0891b2;font-size:11px;font-weight:600;border:1px solid #a5f3fc">Rad &times;' + radCount + '</span>';

            var firstInv      = invs[0] || {};
            var priority      = (firstInv.priority || 'routine').toLowerCase();
            var priorityBadge = priority === 'stat'
                ? '<span style="font-size:11px;font-weight:700;color:#dc2626;letter-spacing:0.5px">STAT</span>'
                : priority === 'urgent'
                ? '<span style="font-size:11px;font-weight:700;color:#ea580c;letter-spacing:0.5px">URGENT</span>'
                : '<span style="font-size:11px;font-weight:600;color:var(--color-muted-foreground);letter-spacing:0.5px">ROUTINE</span>';

            var allOrdered  = invs.every(function(i) { return i.status !== 'pending'; });
            var anyComplete = invs.some(function(i)  { return i.status === 'completed'; });
            var statusBadge = allOrdered && anyComplete
                ? '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;background:#dcfce7;color:#15803d;font-size:11px;font-weight:600;border:1px solid #bbf7d0"><span style="width:6px;height:6px;border-radius:50%;background:#16a34a;display:inline-block"></span>Completed</span>'
                : allOrdered
                ? '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:600;border:1px solid #bfdbfe"><span style="width:6px;height:6px;border-radius:50%;background:#2563eb;display:inline-block"></span>Sent to Lab</span>'
                : '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;background:#fefce8;color:#854d0e;font-size:11px;font-weight:600;border:1px solid #fde68a"><span style="width:6px;height:6px;border-radius:50%;background:#eab308;display:inline-block"></span>Pending</span>';

            html += '<tr style="cursor:default">' +
                '<td style="font-size:13px;color:var(--color-muted-foreground);white-space:nowrap">' + esc(firstInv.date || '-') + '</td>' +
                '<td>' +
                    '<div style="font-weight:600;font-size:14px;color:var(--midnight-blue)">' + esc(group.patient) + '</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">' + esc(group.mrn) + ' &middot; ' + esc(group.admissionId) + '</div>' +
                '</td>' +
                '<td>' + typeBadges + '</td>' +
                '<td style="font-size:13px;font-weight:500">' + invs.length + ' test' + (invs.length !== 1 ? 's' : '') + '</td>' +
                '<td style="font-size:13px">' + esc(firstInv.orderedBy || '-') + '</td>' +
                '<td>' + priorityBadge + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td><button class="er-inv-view-btn" data-mrn="' + esc(group.mrn) + '" data-visit="' + esc(group.admissionId) + '" ' +
                    'style="display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:7px;background:#0d9488;color:#fff;border:none;font-size:12px;font-weight:600;cursor:pointer">' +
                    '<i data-lucide="eye" style="width:13px;height:13px"></i> View</button></td>' +
            '</tr>';
        });

        $('#erInvestigationsBody').html(html);
        lucide.createIcons();

        $('#erInvTableInfo').text('Showing ' + (start + 1) + '\u2013' + end + ' of ' + total + ' results');
        var nums = ''; var maxBtn = 5; var half = Math.floor(maxBtn / 2);
        var pStart = Math.max(1, erInvCurrentPage - half);
        var pEnd   = Math.min(pages, pStart + maxBtn - 1);
        if (pEnd - pStart < maxBtn - 1) pStart = Math.max(1, pEnd - maxBtn + 1);
        for (var p = pStart; p <= pEnd; p++) {
            nums += '<button class="opd-page-num' + (p === erInvCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        }
        $('#erInvPageNums').html(nums);
        $('#erInvPrevPage').prop('disabled', erInvCurrentPage <= 1);
        $('#erInvNextPage').prop('disabled', erInvCurrentPage >= pages);
    }

    /* Delegated view-btn binding */
    $(document).on('click', '.er-inv-view-btn', function() {
        var mrn   = $(this).attr('data-mrn');
        var visit = $(this).attr('data-visit');
        var group = (erClinicalInvestigations.grouped || []).find(function(g) {
            return g.mrn === mrn && g.admissionId === visit;
        });
        if (group) showErInvDetail(group);
    });

    /* Search + pagination bindings */
    $('#erInvSearch').on('input', function() { erInvCurrentPage = 1; renderInvestigationsTab(); });
    $(document).on('click', '#erInvPageNums .opd-page-num', function() {
        erInvCurrentPage = parseInt($(this).data('p')); renderInvestigationsTab();
    });
    $(document).on('click', '#erInvPrevPage', function() {
        if (!$(this).prop('disabled') && erInvCurrentPage > 1) { erInvCurrentPage--; renderInvestigationsTab(); }
    });
    $(document).on('click', '#erInvNextPage', function() {
        if (!$(this).prop('disabled')) { erInvCurrentPage++; renderInvestigationsTab(); }
    });

    /* ── Investigation: Confirmation modal ──────────────────────────── */
    var $pendingLabBtn = null;

    function showErLabConfirmModal(info) {
        /* info: { patient, mrn, visitId, testLabel, count, isBulk, onConfirm } */
        var existing = document.getElementById('erLabConfirmModal');
        if (existing) existing.remove();

        var labLines = '';
        if (info.tests && info.tests.length) {
            info.tests.forEach(function(t) {
                labLines +=
                    '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fafc;border-radius:7px;margin-bottom:6px">' +
                        '<i data-lucide="flask-conical" style="width:13px;height:13px;color:#7c3aed;flex-shrink:0"></i>' +
                        '<span style="font-size:13px;font-weight:500;color:var(--midnight-blue)">' + esc(t.name) + '</span>' +
                        '<span style="margin-left:auto;font-size:11px;padding:2px 7px;border-radius:4px;background:#f5f3ff;color:#7c3aed;font-weight:600;border:1px solid #e9d5ff">' + esc((t.type || 'lab') === 'lab' ? 'Lab' : 'Rad') + '</span>' +
                    '</div>';
            });
        }

        var html =
            '<div class="modal fade" id="erLabConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:460px">' +
            '<div class="modal-content" style="border-radius:16px;border:none;overflow:hidden">' +
                /* Header */
                '<div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:20px 24px;display:flex;align-items:center;gap:12px">' +
                    '<div style="width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
                        '<i data-lucide="send" style="width:20px;height:20px;color:#fff"></i>' +
                    '</div>' +
                    '<div>' +
                        '<h5 style="margin:0;font-size:16px;font-weight:700;color:#fff">Confirm Lab Order</h5>' +
                        '<p style="margin:2px 0 0;font-size:12px;color:rgba(255,255,255,0.65)">' +
                            (info.isBulk ? 'Pass all pending tests to Laboratory' : 'Pass this test to Laboratory') +
                        '</p>' +
                    '</div>' +
                '</div>' +
                /* Body */
                '<div style="padding:20px 24px">' +
                    '<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:12px 16px;margin-bottom:16px">' +
                        '<div style="font-size:13px;font-weight:700;color:var(--midnight-blue)">' + esc(info.patient) + '</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">' + esc(info.mrn) + ' &middot; ' + esc(info.visitId) + '</div>' +
                    '</div>' +
                    '<div style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">' +
                        (info.isBulk ? 'Tests to be sent (' + info.count + ')' : 'Test to be sent') +
                    '</div>' +
                    labLines +
                    '<div style="margin-top:14px;padding:10px 14px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;display:flex;align-items:center;gap:8px">' +
                        '<i data-lucide="info" style="width:14px;height:14px;color:#854d0e;flex-shrink:0"></i>' +
                        '<span style="font-size:12px;color:#854d0e">Only <strong>Laboratory</strong> tests will be queued. Radiology orders are handled separately.</span>' +
                    '</div>' +
                '</div>' +
                /* Footer */
                '<div style="padding:14px 24px 20px;display:flex;gap:10px;justify-content:flex-end">' +
                    '<button type="button" data-bs-dismiss="modal" style="padding:9px 20px;border-radius:8px;border:1px solid var(--color-border);background:#fff;font-size:13px;font-weight:600;cursor:pointer;color:var(--color-foreground)">Cancel</button>' +
                    '<button type="button" id="erLabConfirmBtn" style="padding:9px 22px;border-radius:8px;background:linear-gradient(135deg,#0f172a,#1e3a5f);color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px">' +
                        '<i data-lucide="send" style="width:14px;height:14px"></i> Confirm & Send' +
                    '</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('erLabConfirmModal'), { backdrop: 'static' });
        modal.show();

        $('#erLabConfirmBtn').off('click').on('click', function() {
            $pendingLabBtn = $('#erLabConfirmBtn');
            modal.hide();
        });

        $('#erLabConfirmModal').off('hidden.bs.modal').on('hidden.bs.modal', function() {
            if ($pendingLabBtn) {
                $pendingLabBtn = null;
                if (typeof info.onConfirm === 'function') info.onConfirm();
            }
            document.getElementById('erLabConfirmModal') && document.getElementById('erLabConfirmModal').remove();
        });
    }

    /* ── Investigation: Success modal ───────────────────────────────── */
    function showErLabSuccessModal(info) {
        /* info: { patient, mrn, visitId, labOrderId, testsCount } */
        var existing = document.getElementById('erLabSuccessModal');
        if (existing) existing.remove();

        var html =
            '<div class="modal fade" id="erLabSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:420px">' +
            '<div class="modal-content" style="border-radius:16px;border:none;overflow:hidden">' +
                '<div style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:32px 24px;text-align:center">' +
                    '<div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">' +
                        '<i data-lucide="check-circle-2" style="width:30px;height:30px;color:#fff"></i>' +
                    '</div>' +
                    '<h4 style="margin:0;font-size:20px;font-weight:800;color:#fff">Sent to Lab!</h4>' +
                    '<p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8)">Investigation order dispatched successfully</p>' +
                '</div>' +
                '<div style="padding:20px 24px">' +
                    '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:14px">' +
                        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
                            '<span style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Lab Order ID</span>' +
                            '<span style="font-size:14px;font-weight:800;color:#16a34a;font-family:monospace">' + esc(info.labOrderId || '-') + '</span>' +
                        '</div>' +
                        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
                            '<span style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Tests Queued</span>' +
                            '<span style="font-size:14px;font-weight:700;color:var(--midnight-blue)">' + (info.testsCount || '-') + ' test(s)</span>' +
                        '</div>' +
                        '<div style="display:flex;align-items:center;justify-content:space-between">' +
                            '<span style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Patient</span>' +
                            '<span style="font-size:13px;font-weight:600;color:var(--midnight-blue)">' + esc(info.patient || '-') + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div style="text-align:center;font-size:12px;color:var(--color-muted-foreground)">' +
                        'The lab team has been notified. Results will be updated automatically.' +
                    '</div>' +
                '</div>' +
                '<div style="padding:0 24px 20px">' +
                    '<button type="button" data-bs-dismiss="modal" style="width:100%;padding:11px;border-radius:9px;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer">' +
                        'Close' +
                    '</button>' +
                '</div>' +
            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('erLabSuccessModal'));
        modal.show();
        $('#erLabSuccessModal').off('hidden.bs.modal').on('hidden.bs.modal', function() {
            document.getElementById('erLabSuccessModal') && document.getElementById('erLabSuccessModal').remove();
        });
    }

    /* ── Core AJAX helper (called AFTER confirmation) ────────────────── */
    function _erInvDoPassToLab(ids, patient, mrn, visitId, $restoreBtn, restoreHtml, onCardUpdate) {
        $restoreBtn.prop('disabled', true)
            .html('<i data-lucide="loader-2" style="width:14px;height:14px"></i> Sending...');
        lucide.createIcons();

        $.ajax({
            url: '/api/er/clinical-orders/pass-to-lab',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({ orderIds: ids }),
            success: function(res) {
                showErLabSuccessModal({
                    patient: patient, mrn: mrn, visitId: visitId,
                    labOrderId: res.labOrderId, testsCount: res.testsCount
                });
                if (typeof onCardUpdate === 'function') onCardUpdate(res);
                loadErInvestigations();
            },
            error: function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error)
                    ? xhr.responseJSON.error : 'Failed to pass order to lab';
                showToast(msg, 'error');
                /* Always restore the button — fixed: use captured $restoreBtn, not $(this) */
                $restoreBtn.prop('disabled', false).html(restoreHtml);
                lucide.createIcons();
            }
        });
    }

    function _erInvRenderDetailPanel(group) {
        var invs       = group.investigations || [];
        var labCount   = invs.filter(function(i) { return i.type === 'lab'; }).length;
        var ordCount   = invs.filter(function(i) { return i.status !== 'pending'; }).length;
        var pendingInvs= invs.filter(function(i) { return i.status === 'pending'; });
        var pendingIds = pendingInvs.map(function(i) { return i.id; });
        var allSent    = pendingIds.length === 0;

        /* ── Bulk Pass button ─────────────────────────────────── */
        var bulkPassBtn = allSent
            ? '<button disabled style="width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:600;background:#e2e8f0;color:#94a3b8;border:none;display:flex;align-items:center;justify-content:center;gap:8px;cursor:not-allowed">' +
                '<i data-lucide="check-circle-2" style="width:16px;height:16px"></i> All Orders Sent to Lab</button>'
            : '<button id="erInvPassAllBtn" style="width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:600;background:var(--aquamint);color:var(--midnight-blue);border:none;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer">' +
                '<i data-lucide="send" style="width:16px;height:16px"></i> Pass All to Lab (' + pendingIds.length + ' pending)</button>';

        /* ── Per-test cards ───────────────────────────────────── */
        var testsHtml = '';
        invs.forEach(function(inv, idx) {
            var isPending    = inv.status === 'pending';
            var statusDot    = inv.status === 'completed'   ? '#16a34a'
                             : inv.status === 'ordered'     ? '#2563eb'
                             : inv.status === 'in-progress' ? '#d97706'
                             : inv.status === 'collected'   ? '#0891b2'
                             : '#94a3b8';
            var statusLabel  = inv.status === 'completed'   ? 'Completed'
                             : inv.status === 'ordered'     ? 'Ordered'
                             : inv.status === 'in-progress' ? 'In Progress'
                             : inv.status === 'collected'   ? 'Collected'
                             : 'Pending';
            var deptBadge = inv.type === 'lab'
                ? '<span style="padding:3px 10px;border-radius:5px;background:#f5f3ff;color:#7c3aed;font-size:11px;font-weight:600;border:1px solid #e9d5ff">Laboratory</span>'
                : '<span style="padding:3px 10px;border-radius:5px;background:#ecfeff;color:#0891b2;font-size:11px;font-weight:600;border:1px solid #a5f3fc">Radiology</span>';
            var priorityLabel = (inv.priority || 'routine').toUpperCase();

            var indvBtn = isPending && inv.type === 'lab'
                ? '<button class="er-inv-send-one" data-id="' + inv.id + '" data-name="' + esc(inv.name || '') + '"' +
                    ' style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;' +
                    'background:#0d9488;color:#fff;border:none;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">' +
                    '<i data-lucide="send" style="width:12px;height:12px"></i> Send to Lab</button>'
                : isPending && inv.type !== 'lab'
                ? '<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;' +
                    'background:#fefce8;color:#854d0e;font-size:11px;font-weight:500;border:1px solid #fde68a">' +
                    '<i data-lucide="clock" style="width:11px;height:11px"></i> Radiology — handled separately</span>'
                : '<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;' +
                    'background:#f1f5f9;color:' + statusDot + ';font-size:12px;font-weight:600;border:1px solid #e2e8f0">' +
                    '<span style="width:7px;height:7px;border-radius:50%;background:' + statusDot + ';display:inline-block"></span>' +
                    statusLabel + '</span>';

            testsHtml +=
                '<div id="er-inv-card-' + esc(inv.id) + '" style="padding:16px;border:1px solid var(--color-border);border-radius:10px;margin-bottom:10px;background:var(--color-background)">' +
                    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">' +
                        '<div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1">' +
                            '<span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--midnight-blue);color:#fff;font-size:11px;font-weight:700">' + (idx + 1) + '</span>' +
                            '<span style="font-weight:700;font-size:14px;color:var(--midnight-blue);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(inv.name || '-') + '</span>' +
                        '</div>' +
                        '<div style="flex-shrink:0;margin-left:8px">' + deptBadge + '</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--color-muted-foreground);margin-bottom:10px">' +
                        '<span style="display:flex;align-items:center;gap:4px"><i data-lucide="calendar" style="width:12px;height:12px"></i>' + esc(inv.date || '-') + '</span>' +
                        '<span style="display:flex;align-items:center;gap:4px"><i data-lucide="user" style="width:12px;height:12px"></i>' + esc(inv.orderedBy || '-') + '</span>' +
                        '<span style="font-weight:700;color:' + (priorityLabel === 'STAT' ? '#dc2626' : priorityLabel === 'URGENT' ? '#ea580c' : 'var(--midnight-blue)') + '">' + priorityLabel + '</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;justify-content:space-between">' +
                        '<div style="display:flex;align-items:center;gap:6px">' +
                            '<span style="width:8px;height:8px;border-radius:50%;background:' + statusDot + ';display:inline-block"></span>' +
                            '<span style="font-size:12px;font-weight:600;color:' + statusDot + '">' + statusLabel + '</span>' +
                        '</div>' +
                        indvBtn +
                    '</div>' +
                '</div>';
        });

        /* ── Header stats card ────────────────────────────────── */
        var html =
            '<div style="background:var(--color-background);border-radius:10px;padding:16px;margin-bottom:16px">' +
                '<div style="font-weight:700;font-size:16px;color:var(--midnight-blue);margin-bottom:4px">' + esc(group.patient) + '</div>' +
                '<div style="font-size:12px;color:var(--color-muted-foreground)">' + esc(group.mrn) + ' &middot; ' + esc(group.admissionId) + '</div>' +
                '<div style="display:flex;gap:10px;margin-top:14px">' +
                    '<div style="text-align:center;min-width:60px">' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:2px">Total Tests</div>' +
                        '<div style="font-size:22px;font-weight:800;color:var(--midnight-blue)">' + invs.length + '</div>' +
                    '</div>' +
                    '<div style="padding:10px 18px;border:1px solid #e9d5ff;border-radius:8px;text-align:center;background:#fff">' +
                        '<div style="font-size:11px;color:#7c3aed;font-weight:600;margin-bottom:2px">Laboratory</div>' +
                        '<div style="font-size:22px;font-weight:800;color:#7c3aed">' + labCount + '</div>' +
                    '</div>' +
                    '<div style="padding:10px 18px;border:1px solid #e2e8f0;border-radius:8px;text-align:center;background:#fff">' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground);font-weight:600;margin-bottom:2px">Ordered</div>' +
                        '<div style="font-size:22px;font-weight:800;color:var(--midnight-blue)">' + ordCount + '</div>' +
                    '</div>' +
                    (pendingIds.length > 0
                        ? '<div style="padding:10px 18px;border:1px solid #fde68a;border-radius:8px;text-align:center;background:#fefce8">' +
                            '<div style="font-size:11px;color:#854d0e;font-weight:600;margin-bottom:2px">Pending</div>' +
                            '<div style="font-size:22px;font-weight:800;color:#854d0e">' + pendingIds.length + '</div>' +
                          '</div>'
                        : '') +
                '</div>' +
            '</div>' +
            '<div style="margin-bottom:16px">' + bulkPassBtn + '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
                '<i data-lucide="list" style="width:16px;height:16px;color:var(--midnight-blue)"></i>' +
                '<span style="font-size:15px;font-weight:700;color:var(--midnight-blue)">Investigation Orders</span>' +
                '<span style="margin-left:auto;font-size:11px;color:var(--color-muted-foreground)">' +
                    (pendingIds.length > 0 ? pendingIds.length + ' pending &mdash; send individually or all at once' : 'All orders dispatched') +
                '</span>' +
            '</div>' +
            testsHtml;

        $('#erInvDetailBody').html(html);
        $('#erInvDetailPanel').css('right', '0');
        $('#erInvDetailBackdrop').show();
        lucide.createIcons();

        /* ── Bulk pass binding ────────────────────────────────── */
        if (!allSent) {
            var bulkRestoreHtml = '<i data-lucide="send" style="width:16px;height:16px"></i> Pass All to Lab (' + pendingIds.length + ' pending)';
            $('#erInvPassAllBtn').off('click').on('click', function() {
                var $bulkBtn = $(this);
                var labPendingTests = pendingInvs.filter(function(i) { return i.type === 'lab'; });
                if (!labPendingTests.length) {
                    showToast('No laboratory tests pending — radiology orders are handled separately.', 'info');
                    return;
                }
                showErLabConfirmModal({
                    patient: group.patient, mrn: group.mrn, visitId: group.admissionId,
                    isBulk: true, count: labPendingTests.length,
                    tests: labPendingTests.map(function(i) { return { name: i.name, type: i.type }; }),
                    onConfirm: function() {
                        _erInvDoPassToLab(
                            labPendingTests.map(function(i) { return i.id; }),
                            group.patient, group.mrn, group.admissionId,
                            $bulkBtn, bulkRestoreHtml,
                            function() { closeErInvDetail(); }
                        );
                    }
                });
            });
        }

        /* ── Individual send binding (delegated) ─────────────── */
        $('#erInvDetailBody').off('click.erInvSendOne').on('click.erInvSendOne', '.er-inv-send-one', function() {
            var $btn      = $(this);                         /* capture NOW — no $(this) in callbacks */
            var $card     = $btn.closest('[id^="er-inv-card-"]');
            var id        = $btn.data('id');
            var testName  = $btn.data('name') || '';
            var sendHtml  = '<i data-lucide="send" style="width:12px;height:12px"></i> Send to Lab';

            showErLabConfirmModal({
                patient: group.patient, mrn: group.mrn, visitId: group.admissionId,
                isBulk: false, count: 1,
                tests: [{ name: testName, type: 'lab' }],
                onConfirm: function() {
                    _erInvDoPassToLab(
                        [id],
                        group.patient, group.mrn, group.admissionId,
                        $btn, sendHtml,
                        function() {
                            /* Replace button with "Ordered" badge on this card */
                            $card.find('.er-inv-send-one').replaceWith(
                                '<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;' +
                                'background:#f1f5f9;color:#2563eb;font-size:12px;font-weight:600;border:1px solid #e2e8f0">' +
                                '<span style="width:7px;height:7px;border-radius:50%;background:#2563eb;display:inline-block"></span>Ordered</span>'
                            );
                            /* Update pending count on bulk button */
                            var idx2 = pendingIds.indexOf(id);
                            if (idx2 > -1) pendingIds.splice(idx2, 1);
                            if (pendingIds.length === 0) {
                                $('#erInvPassAllBtn').prop('disabled', true)
                                    .html('<i data-lucide="check-circle-2" style="width:16px;height:16px"></i> All Orders Sent to Lab')
                                    .css({ background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' });
                            } else {
                                $('#erInvPassAllBtn')
                                    .html('<i data-lucide="send" style="width:16px;height:16px"></i> Pass All to Lab (' + pendingIds.length + ' pending)');
                            }
                            lucide.createIcons();
                        }
                    );
                }
            });
        });
    }

    function showErInvDetail(group) {
        _erInvRenderDetailPanel(group);
    }

    function closeErInvDetail() {
        $('#erInvDetailPanel').css('right', '-520px');
        $('#erInvDetailBackdrop').hide();
    }

    // ===== TAB 5: DISPOSITION =====
    function erDispPopulateFilterOptions() {
        var docs  = ['All Doctors'];
        var disps = ['All Types'];
        visits.forEach(function(v) {
            if (v.doctorName && docs.indexOf(v.doctorName) < 0)  docs.push(v.doctorName);
            if (v.disposition && disps.indexOf(v.disposition) < 0) disps.push(v.disposition);
        });
        var docWrap = document.getElementById('erDispCsDoctor');
        if (docWrap && docWrap.setOptions) docWrap.setOptions(docs);
        var dpWrap = document.getElementById('erDispCsDisposition');
        if (dpWrap && dpWrap.setOptions) dpWrap.setOptions(disps);
    }

    function renderDispositionTab() {
        erDispPopulateFilterOptions();

        /* Update stat tiles from full dataset */
        var cTotal = visits.length;
        var cAwaiting = 0, cCleared = 0, cDischarged = 0;
        visits.forEach(function(v) {
            var ds = v.dischargeStatus || '';
            if (ds === 'discharged')        cDischarged++;
            else if (ds === 'pending_clearance') cAwaiting++;
            else if (ds === 'cleared')      cCleared++;
        });
        $('#erDispStatTotal').text(cTotal);
        $('#erDispStatAwaiting').text(cAwaiting);
        $('#erDispStatCleared').text(cCleared);
        $('#erDispStatDischarged').text(cDischarged);

        var search = ($('#erDispSearch').val() || '').toLowerCase();
        var src    = erDispFiltered !== null ? erDispFiltered : visits;
        if (search) {
            src = src.filter(function(v) {
                return (v.patientName || '').toLowerCase().indexOf(search) >= 0 ||
                    (v.mrn || '').toLowerCase().indexOf(search) >= 0 ||
                    (v.visitId || '').toLowerCase().indexOf(search) >= 0 ||
                    (v.chiefComplaint || '').toLowerCase().indexOf(search) >= 0;
            });
        }
        _erDispRenderPagination(src);
    }

    function _erDispRenderPagination(source) {
        var total  = source.length;
        var pages  = Math.max(1, Math.ceil(total / erDispPerPageVal));
        if (erDispCurrentPage > pages) erDispCurrentPage = pages;
        var start  = (erDispCurrentPage - 1) * erDispPerPageVal;
        var slice  = source.slice(start, start + erDispPerPageVal);
        var end    = Math.min(start + erDispPerPageVal, total);

        if (total === 0) {
            $('#erDispositionBody').html('<tr><td colspan="6" class="text-center" style="padding:48px"><div style="color:var(--color-muted-foreground)"><i data-lucide="log-out" style="width:40px;height:40px;margin:0 auto 12px;display:block;opacity:0.3"></i><p style="font-weight:500">No visits found</p><p style="font-size:13px">Patients will appear here once registered</p></div></td></tr>');
            $('#erDispTableInfo').text('No results');
            $('#erDispPageNums').empty();
            $('#erDispPrevPage').prop('disabled', true);
            $('#erDispNextPage').prop('disabled', true);
            lucide.createIcons();
            return;
        }

        var html = '';
        slice.forEach(function(v) {
            var dispType    = v.disposition || '-';
            var dischStatus = v.dischargeStatus || '';
            var statusBadge, btnLabel, btnStyle, step;
            if (dischStatus === 'discharged') {
                statusBadge = '<span class="badge" style="background:rgba(16,185,129,0.12);color:#065F46;font-size:11px">✅ Discharged</span>';
                btnLabel = '<i data-lucide="eye" style="width:12px;height:12px"></i> View Summary';
                btnStyle = 'background:#6b7280;color:#fff';
                step = 5;
            } else if (dischStatus === 'pending_clearance') {
                statusBadge = '<span class="badge" style="background:rgba(245,158,11,0.12);color:#B45309;font-size:11px">⏳ Awaiting Clearance</span>';
                btnLabel = '<i data-lucide="shield-check" style="width:12px;height:12px"></i> Check Clearance';
                btnStyle = 'background:#F59E0B;color:#fff';
                step = 3;
            } else {
                statusBadge = '<span class="badge" style="background:rgba(59,130,246,0.1);color:#1D4ED8;font-size:11px">🔵 Not Started</span>';
                btnLabel = '<i data-lucide="log-out" style="width:12px;height:12px"></i> Initiate Discharge';
                btnStyle = 'background:#16a34a;color:#fff';
                step = 2;
            }
            html += '<tr style="transition:background 0.15s">' +
                '<td><div style="font-weight:500;font-size:14px">' + esc(v.patientName) + '</div><div style="font-size:12px;color:var(--color-muted-foreground)">' + esc(v.mrn || '-') + ' · ' + esc(v.visitId || '-') + '</div></td>' +
                '<td style="font-size:13px;color:var(--color-muted-foreground)">' + esc(v.chiefComplaint || '-') + '</td>' +
                '<td style="font-size:13px">' + getTimeInER(v.consultationDate) + '</td>' +
                '<td><span class="badge badge-outline" style="font-size:11px">' + esc(dispType) + '</span></td>' +
                '<td>' + statusBadge + '</td>' +
                '<td class="text-right"><button class="btn-sm" style="border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;' + btnStyle + '" onclick="showErDischStep(' + step + ',\'' + esc(v.visitId) + '\')">' + btnLabel + '</button></td>' +
            '</tr>';
        });
        $('#erDispositionBody').html(html);
        lucide.createIcons();

        $('#erDispTableInfo').text('Showing ' + (start + 1) + '\u2013' + end + ' of ' + total + ' results');
        var nums = ''; var maxBtn = 5; var half = Math.floor(maxBtn / 2);
        var pStart = Math.max(1, erDispCurrentPage - half);
        var pEnd   = Math.min(pages, pStart + maxBtn - 1);
        if (pEnd - pStart < maxBtn - 1) pStart = Math.max(1, pEnd - maxBtn + 1);
        for (var p = pStart; p <= pEnd; p++) {
            nums += '<button class="opd-page-num' + (p === erDispCurrentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
        }
        $('#erDispPageNums').html(nums);
        $('#erDispPrevPage').prop('disabled', erDispCurrentPage <= 1);
        $('#erDispNextPage').prop('disabled', erDispCurrentPage >= pages);
    }

    $('#erDispSearch').on('input', function() { erDispCurrentPage = 1; renderDispositionTab(); });
    $(document).on('click', '#erDispPageNums .opd-page-num', function() {
        erDispCurrentPage = parseInt($(this).data('p')); renderDispositionTab();
    });
    $(document).on('click', '#erDispPrevPage', function() {
        if (!$(this).prop('disabled') && erDispCurrentPage > 1) { erDispCurrentPage--; renderDispositionTab(); }
    });
    $(document).on('click', '#erDispNextPage', function() {
        if (!$(this).prop('disabled')) { erDispCurrentPage++; renderDispositionTab(); }
    });

    // ===== ER DETAIL SHEET =====
    var _erDetailPatient = null;

    function openERDetail(visitId) {
        var visit = visits.find(function(v) { return v.visitId === visitId; });
        if (!visit) return;

        var bill       = bills.find(function(b) { return b.visitId === visitId; });
        var currency   = (typeof hospitalInfo !== 'undefined' && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';
        var totalAmt   = bill ? Number(bill.totalAmount  || 0) : 0;
        var paidAmt    = bill ? Number(bill.paidAmount   || 0) : 0;
        var doctorFee  = bill ? Number(bill.doctorFee    || 0) : 0;
        var otherChg   = bill ? Number(bill.consultationCharges || bill.otherCharges || 0) : 0;
        var billId     = bill ? (bill.billId || '-') : '-';
        var payStatus  = bill ? (bill.paymentStatus || '-') : '-';

        var arrDate    = visit.consultationDate ? new Date(visit.consultationDate) : null;
        var arrDateStr = arrDate
            ? arrDate.toLocaleDateString('en-GB', {day:'2-digit',month:'2-digit',year:'numeric'}) + ', ' + arrDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
            : '-';

        var statusColor = visit.status === 'Active' ? '#EAB308' : visit.status === 'Discharged' ? '#6B7280' : '#3B82F6';
        var statusBadge = '<span style="background:' + statusColor + ';color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(visit.status || 'Active') + '</span>';

        var payBadge = '';
        if (payStatus === 'Paid')         payBadge = '<span style="background:#16A34A;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">Paid</span>';
        else if (payStatus === 'Pending') payBadge = '<span style="background:#EAB308;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">Pending</span>';
        else                              payBadge = '<span style="background:#6B7280;color:#fff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px">' + esc(payStatus) + '</span>';

        var mlcText = visit.isMLC ? 'Yes (MLC)' : 'No';

        function _buildBody(patient) {
            var patientName = patient ? patient.name  : visit.patientName;
            var cnic        = patient ? (patient.cnic || '-')   : '-';
            var phone       = patient ? (patient.phone || '-')  : '-';
            var ageGend     = patient ? (patient.age + ' / ' + patient.gender) : '-';

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
                            '<div><span style="font-size:12px;font-family:monospace;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;padding:3px 10px;border-radius:4px">' + esc(visit.mrn || '-') + '</span></div>' +
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

                /* ── EMERGENCY DETAILS + FINANCIAL DETAILS ── */
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +

                    /* Left — Emergency Details */
                    '<div style="background:var(--color-card);border-radius:12px;border:1px solid var(--color-border);padding:24px">' +
                        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">' +
                            '<i data-lucide="siren" style="width:18px;height:18px;color:var(--midnight-blue)"></i>' +
                            '<span style="font-size:14px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.5px">Emergency Details</span>' +
                        '</div>' +
                        '<table style="width:100%;font-size:13px;border-collapse:collapse">' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Visit ID</td><td style="padding:8px 0;text-align:right;font-weight:400;font-family:monospace;color:var(--color-foreground)">' + esc(visit.visitId || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Department</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(visit.department || 'Emergency') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Attending Doctor</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(visit.doctorName || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">ESI Level</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(visit.esi || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Triage Category</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(visit.triageCategory || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Mode of Arrival</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(visit.modeOfArrival || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Chief Complaint</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground);max-width:140px;word-break:break-word">' + esc(visit.chiefComplaint || '-') + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">MLC</td><td style="padding:8px 0;text-align:right;color:var(--color-foreground)">' + esc(mlcText) + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Arrival Date</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px;color:var(--color-foreground)">' + esc(arrDateStr) + '</td></tr>' +
                            '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Status</td><td style="padding:8px 0;text-align:right">' + statusBadge + '</td></tr>' +
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
                            (doctorFee > 0 ? '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Doctor Fee</td><td style="padding:8px 0;text-align:right;font-weight:500;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + doctorFee.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' : '') +
                            (otherChg  > 0 ? '<tr><td style="padding:8px 0;color:var(--color-muted-foreground)">Other Charges</td><td style="padding:8px 0;text-align:right;font-weight:500;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + otherChg.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' : '') +
                            '<tr><td colspan="2" style="padding:0"><hr style="margin:8px 0;border-color:var(--color-border)"></td></tr>' +
                            '<tr><td style="padding:8px 0;font-weight:700;font-size:13px;text-transform:uppercase;color:var(--color-foreground)">Net Total</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:18px;font-family:monospace;color:var(--color-foreground)">' + currency + ' ' + totalAmt.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + '</td></tr>' +
                        '</table>' +
                    '</div>' +
                '</div>'
            );
        }

        /* Render immediately with visit data, then update with full patient once fetched */
        $('#erDetailBody').html(_buildBody(null));
        $('#erDetailFooter').html(
            '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">' +
                '<button class="btn-outline" data-bs-dismiss="offcanvas">CLOSE</button>' +
                '<button class="btn-primary" id="btnErAdmPrint" style="display:flex;align-items:center;gap:6px">' +
                    '<i data-lucide="printer" style="width:16px;height:16px"></i> PRINT' +
                '</button>' +
            '</div>'
        );
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('erDetailSheet')).show();

        _erDetailPatient = null;
        $.get('/api/patients/' + encodeURIComponent(visit.mrn)).done(function(patient) {
            if (patient) {
                _erDetailPatient = patient;
                $('#erDetailBody').html(_buildBody(patient));
                lucide.createIcons();
            }
        });

        $(document).off('click.erAdmPrint').on('click.erAdmPrint', '#btnErAdmPrint', function() {
            printErRegistrationSlip(visit, _erDetailPatient, bill);
        });
    }

    // ===== REGISTRATION =====
    $('#btnNewERVisit, #btnNewERVisit2').on('click', function() {
        resetRegistration();
        renderRegistrationSheet();
        new bootstrap.Offcanvas(document.getElementById('erRegistrationSheet')).show();
    });

    function resetRegistration() {
        registrationStep = 'phone-search';
        phoneSearch = '';
        phoneSearchResults = null;
        selectedPatientMRN = null;
        patientForm = { name: '', age: '', gender: 'Male', cnic: '', contactType: 'SELF', guardianName: '', guardianCnic: '', relationshipToPatient: '' };
        visitForm = { doctorName: '', department: 'Emergency', visitType: 'ER Visit', doctorFee: '0', doctorFeeDiscount: 0, esi: '3 - Urgent', modeOfArrival: 'Walk-in', chiefComplaint: '', mechanismOfInjury: '', isMLC: false };
        selectedOptionalCharges = [];
        erChargesGrid = [];
        validationErrors = [];
    }

    function renderRegistrationSheet() {
        var titleMap = {
            'phone-search': 'New Emergency Arrival',
            'phone-results': 'Search Results',
            'new-patient': 'New Patient Details',
            'visit-details': 'Emergency Visit Details'
        };
        $('#erRegSheetTitle').html('<i data-lucide="siren" style="width:20px;height:20px;animation:pulse 2s infinite"></i> ' + titleMap[registrationStep]);

        var body = '';
        var footer = '';

        if (registrationStep === 'phone-search') {
            body = renderValidationErrors() +
                '<div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.1);padding:16px;border-radius:8px;margin-bottom:24px">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><i data-lucide="phone" style="width:16px;height:16px;color:var(--color-destructive)"></i><p style="font-size:14px;font-weight:600;color:#991b1b;margin:0">Phone-First Registration</p></div>' +
                    '<p style="font-size:12px;color:var(--color-destructive);margin:0">Enter the patient\'s phone number to check for existing records. If already registered in OPD, the same MRN will be used.</p>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>MOBILE NUMBER <span style="color:var(--color-destructive)">*</span></label>' +
                    '<input type="text" class="form-control" id="erPhoneSearchInput" placeholder="Enter phone number" value="' + esc(phoneSearch) + '">' +
                '</div>';
            footer = '<div style="display:flex;justify-content:space-between;width:100%">' +
                '<button class="btn-outline" onclick="bootstrap.Offcanvas.getInstance(document.getElementById(\'erRegistrationSheet\')).hide()">Cancel</button>' +
                '<button class="btn-destructive" id="btnERPhoneSearch">Search</button>' +
            '</div>';
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
            footer = '<div style="display:flex;justify-content:space-between;width:100%">' +
                '<button class="btn-outline" id="btnERBackToPhone"><i data-lucide="arrow-left"></i> Back</button>' +
                '<button class="btn-destructive" id="btnERNewPatient"><i data-lucide="user-plus"></i> Register New Patient</button>' +
            '</div>';
        } else if (registrationStep === 'new-patient') {
            body = renderValidationErrors() +
                '<div style="margin-bottom:24px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px">Patient Information</h4>' +
                '<div class="form-grid" style="gap:16px">' +
                    '<div class="form-group"><label>FULL NAME <span style="color:var(--color-destructive)">*</span></label><input type="text" class="form-control" id="erPatName" placeholder="Patient Name" value="' + esc(patientForm.name) + '"></div>' +
                    '<div class="form-grid form-grid-2">' +
                        '<div class="form-group"><label>AGE (YEARS) <span style="color:var(--color-destructive)">*</span></label><input type="number" class="form-control" id="erPatAge" placeholder="YY" value="' + esc(patientForm.age) + '"></div>' +
                        '<div class="form-group"><label>GENDER <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="erPatGender"><option value="Male"' + (patientForm.gender === 'Male' ? ' selected' : '') + '>Male</option><option value="Female"' + (patientForm.gender === 'Female' ? ' selected' : '') + '>Female</option><option value="Other"' + (patientForm.gender === 'Other' ? ' selected' : '') + '>Other</option></select></div>' +
                    '</div>' +
                    '<div class="form-group"><label>CNIC / NATIONAL ID</label><input type="text" class="form-control" id="erPatCnic" placeholder="XXXXX-XXXXXXX-X" value="' + esc(patientForm.cnic) + '"></div>' +
                '</div></div>' +
                '<div style="height:1px;background:var(--color-border);margin-bottom:24px"></div>' +
                '<div style="margin-bottom:24px"><h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px">Contact Type</h4>' +
                '<div style="display:flex;gap:16px;margin-bottom:16px">' +
                    '<label class="contact-type-option' + (patientForm.contactType === 'SELF' ? ' active' : '') + '"><input type="radio" name="erContactType" value="SELF"' + (patientForm.contactType === 'SELF' ? ' checked' : '') + ' style="accent-color:var(--aquamint)"> <div><p style="font-size:14px;font-weight:500;margin:0">Self</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Patient owns this phone</p></div></label>' +
                    '<label class="contact-type-option' + (patientForm.contactType === 'GUARDIAN' ? ' active' : '') + '"><input type="radio" name="erContactType" value="GUARDIAN"' + (patientForm.contactType === 'GUARDIAN' ? ' checked' : '') + ' style="accent-color:var(--aquamint)"> <div><p style="font-size:14px;font-weight:500;margin:0">Guardian</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0">Phone belongs to guardian</p></div></label>' +
                '</div>';

            if (patientForm.contactType === 'SELF' && phoneSearchResults && phoneSearchResults.hasSelf) {
                body += '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px;margin-bottom:16px"><p style="font-size:12px;color:var(--color-destructive);display:flex;align-items:center;gap:6px;margin:0"><i data-lucide="alert-triangle" style="width:16px;height:16px"></i> A SELF contact already exists for this phone number. Please choose GUARDIAN instead.</p></div>';
            }

            if (patientForm.contactType === 'GUARDIAN') {
                body += '<div style="border-left:2px solid rgba(127,255,212,0.2);padding-left:16px">' +
                    '<div class="form-grid" style="gap:16px">' +
                        '<div class="form-group"><label>GUARDIAN NAME</label><input type="text" class="form-control" id="erGuardianName" placeholder="Guardian Name" value="' + esc(patientForm.guardianName) + '"></div>' +
                        '<div class="form-group"><label>GUARDIAN PHONE</label><input type="text" class="form-control" disabled value="' + esc(phoneSearch) + '" style="background:var(--color-muted)"></div>' +
                        '<div class="form-group"><label>GUARDIAN CNIC</label><input type="text" class="form-control" id="erGuardianCnic" placeholder="XXXXX-XXXXXXX-X" value="' + esc(patientForm.guardianCnic) + '"></div>' +
                        '<div class="form-group"><label>RELATIONSHIP</label><select class="form-select" id="erRelationship"><option value="">-- Select Relationship --</option>' + relationshipOptions.map(function(r) { return '<option value="' + r + '"' + (patientForm.relationshipToPatient === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></div>' +
                    '</div></div>';
            }
            body += '</div>';
            footer = '<div style="display:flex;justify-content:space-between;width:100%">' +
                '<button class="btn-outline" id="btnERBackToResults"><i data-lucide="arrow-left"></i> Back</button>' +
                '<button class="btn-destructive" id="btnERSavePatient">Create & Continue</button>' +
            '</div>';
        } else if (registrationStep === 'visit-details') {
            var selectedName = getSelectedPatientName();
            var erDoctors = doctors.filter(function(d) { return d.department === 'Emergency' || d.department === 'Surgery'; });

            body = renderValidationErrors() +
                '<div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.1);padding:16px;border-radius:8px;margin-bottom:24px">' +
                    '<p style="font-size:10px;font-weight:700;color:var(--color-destructive);text-transform:uppercase;margin:0 0 4px">SELECTED PATIENT</p>' +
                    '<h3 style="font-size:16px;font-weight:700;color:var(--midnight-blue);margin:0">' + esc(selectedName) + '</h3>' +
                    '<p style="font-size:12px;color:var(--color-muted-foreground);font-family:monospace;margin:0">' + esc(selectedPatientMRN || 'GENERATING NEW MRN') + '</p>' +
                '</div>' +

                '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;display:flex;align-items:center;gap:8px"><i data-lucide="alert-triangle" style="width:16px;height:16px"></i> Quick Triage</h4>' +
                '<div style="padding:16px;background:rgba(245,246,250,0.3);border-radius:12px;border:1px solid var(--color-border)">' +
                    '<div class="form-group" style="margin-bottom:16px"><label>ESI LEVEL (TRIAGE) <span style="color:var(--color-destructive)">*</span></label>' +
                    '<div class="er-esi-selector">' +
                        renderESIButtons() +
                    '</div></div>' +
                    '<div class="form-grid form-grid-2" style="gap:16px">' +
                        '<div class="form-group"><label>MODE OF ARRIVAL</label><select class="form-select" id="erModeOfArrival"><option value="Walk-in"' + (visitForm.modeOfArrival === 'Walk-in' ? ' selected' : '') + '>Walk-in</option><option value="Ambulance"' + (visitForm.modeOfArrival === 'Ambulance' ? ' selected' : '') + '>Ambulance</option><option value="Referral"' + (visitForm.modeOfArrival === 'Referral' ? ' selected' : '') + '>Referral</option><option value="Police"' + (visitForm.modeOfArrival === 'Police' ? ' selected' : '') + '>Police</option></select></div>' +
                        '<div class="form-group"><label>CHIEF COMPLAINT</label><input type="text" class="form-control" id="erChiefComplaint" placeholder="Primary reason for visit..." value="' + esc(visitForm.chiefComplaint) + '" style="font-weight:500"></div>' +
                    '</div>' +
                '</div></div>' +

                '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px">Doctor Assignment</h4>' +
                '<div class="form-group"><label>ASSIGNED DOCTOR <span style="color:var(--color-destructive)">*</span></label>' +
                '<select class="form-select" id="erVisitDoctor"><option value="">-- Select ER Physician --</option>' +
                    (erDoctors.length > 0 ? erDoctors : doctors).map(function(d) {
                        var n = d.firstName + ' ' + d.lastName;
                        return '<option value="' + esc(n) + '" data-doctor-id="' + d.id + '"' + (visitForm.doctorName === n ? ' selected' : '') + '>' + esc(n) + ' - ' + esc(d.specialization || '') + '</option>';
                    }).join('') +
                '</select></div>' +
                (visitForm.doctorFee !== '0' ? '<div style="background:rgba(245,246,250,0.5);padding:12px;border-radius:8px;display:flex;align-items:center;justify-content:space-between;margin-top:12px"><span style="font-size:12px;color:var(--color-muted-foreground)">Doctor Fee (from config)</span><span style="font-size:14px;font-family:monospace;font-weight:600">' + hospitalInfo.currency + ' ' + Number(visitForm.doctorFee).toLocaleString() + '</span></div>' : '') +
                '</div>' +

                '<div style="margin-bottom:24px">' +
                '<h4 style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;display:flex;align-items:center;gap:8px"><i data-lucide="file-text" style="width:16px;height:16px"></i> Assessment & MLC</h4>' +
                '<div class="form-grid form-grid-2" style="gap:16px">' +
                    '<div class="form-group"><label>Mechanism of Injury (if Trauma)</label><select class="form-select" id="erMechanism"><option value="">Select...</option><option value="RTA"' + (visitForm.mechanismOfInjury === 'RTA' ? ' selected' : '') + '>Road Traffic Accident</option><option value="Fall"' + (visitForm.mechanismOfInjury === 'Fall' ? ' selected' : '') + '>Fall</option><option value="Assault"' + (visitForm.mechanismOfInjury === 'Assault' ? ' selected' : '') + '>Assault</option><option value="Burn"' + (visitForm.mechanismOfInjury === 'Burn' ? ' selected' : '') + '>Burn</option><option value="None"' + (visitForm.mechanismOfInjury === 'None' ? ' selected' : '') + '>Non-Trauma / Medical</option></select></div>' +
                    '<div class="form-group" style="display:flex;align-items:center;padding-top:24px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="erMLC"' + (visitForm.isMLC ? ' checked' : '') + ' style="accent-color:var(--color-destructive)"> <span style="font-weight:700;color:var(--color-destructive)">Medico-Legal Case (MLC)</span></label></div>' +
                '</div></div>';

            footer = '<div style="display:flex;justify-content:space-between;width:100%">' +
                '<button class="btn-outline" id="btnERBackToResults2"><i data-lucide="arrow-left"></i> Back</button>' +
                '<button class="btn-destructive" id="btnERProceedBilling">PROCEED TO BILLING</button>' +
            '</div>';
        }

        $('#erRegSheetBody').html(body);
        $('#erRegSheetFooter').html(footer);
        lucide.createIcons();
        bindERRegistrationEvents();
    }

    function renderESIButtons() {
        var options = [
            { val: '1 - Resuscitation', cls: 'esi-red', label: 'RED' },
            { val: '2 - Emergent', cls: 'esi-orange', label: 'ORANGE' },
            { val: '3 - Urgent', cls: 'esi-yellow', label: 'YELLOW' },
            { val: '4 - Less Urgent', cls: 'esi-green', label: 'GREEN' },
            { val: '5 - Non Urgent', cls: 'esi-blue', label: 'BLUE' }
        ];
        return options.map(function(o) {
            return '<button type="button" class="er-esi-btn ' + o.cls + (visitForm.esi === o.val ? ' active' : '') + '" data-esi="' + o.val + '">' + o.label + '</button>';
        }).join('');
    }

    function renderValidationErrors() {
        if (validationErrors.length === 0) return '';
        return '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px;margin-bottom:16px">' +
            '<p style="font-size:13px;font-weight:600;color:var(--color-destructive);display:flex;align-items:center;gap:6px;margin:0 0 4px"><i data-lucide="alert-triangle" style="width:16px;height:16px"></i> Please fix the following:</p>' +
            '<ul style="margin:0;padding-left:20px;font-size:12px;color:var(--color-destructive)">' + validationErrors.map(function(e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' +
        '</div>';
    }

    function renderPatientResult(p, type) {
        var badgeColor = type === 'SELF' ? 'background:#EFF6FF;color:#1D4ED8;border-color:#BFDBFE' : 'background:#FFF7ED;color:#C2410C;border-color:#FED7AA';
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--color-border);border-radius:8px;margin-bottom:8px;transition:background 0.15s" class="er-patient-result-item">' +
            '<div style="display:flex;align-items:center;gap:12px">' +
                '<div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff">' + getInitials(p.name) + '</div>' +
                '<div><p style="font-size:14px;font-weight:500;margin:0">' + esc(p.name) + '</p><p style="font-size:12px;color:var(--color-muted-foreground);margin:0"><span style="font-family:monospace">' + esc(p.mrn) + '</span> &middot; ' + (p.age || '-') + 'Y / ' + (p.gender || '-') + '</p></div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
                '<span class="badge" style="font-size:10px;' + badgeColor + '">' + type + '</span>' +
                '<button class="btn-outline btn-sm er-select-patient-btn" data-mrn="' + esc(p.mrn) + '">Select Patient</button>' +
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

    function bindERRegistrationEvents() {
        $('#btnERPhoneSearch').off('click').on('click', function() {
            phoneSearch = $('#erPhoneSearchInput').val().trim();
            if (!phoneSearch) { validationErrors = ['Please enter a phone number']; renderRegistrationSheet(); return; }
            validationErrors = [];
            var btn = $(this);
            btn.prop('disabled', true).text('Searching...');
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

        $('#erPhoneSearchInput').off('keydown').on('keydown', function(e) {
            if (e.key === 'Enter') $('#btnERPhoneSearch').click();
        });

        $(document).off('click.erSelectPatient').on('click.erSelectPatient', '.er-select-patient-btn', function(e) {
            e.stopPropagation();
            selectedPatientMRN = $(this).data('mrn');
            validationErrors = [];
            registrationStep = 'visit-details';
            renderRegistrationSheet();
        });

        $('#btnERNewPatient').off('click').on('click', function() {
            var hasSelf = phoneSearchResults ? phoneSearchResults.hasSelf : false;
            patientForm.contactType = hasSelf ? 'GUARDIAN' : 'SELF';
            validationErrors = [];
            registrationStep = 'new-patient';
            renderRegistrationSheet();
        });

        $('#btnERBackToPhone').off('click').on('click', function() {
            registrationStep = 'phone-search';
            validationErrors = [];
            renderRegistrationSheet();
        });

        $('#btnERBackToResults, #btnERBackToResults2').off('click').on('click', function() {
            registrationStep = 'phone-results';
            selectedPatientMRN = null;
            validationErrors = [];
            renderRegistrationSheet();
        });

        $('input[name="erContactType"]').off('change').on('change', function() {
            patientForm.contactType = $(this).val();
            saveERPatientFormValues();
            renderRegistrationSheet();
        });

        $(document).off('click.erEsi').on('click.erEsi', '.er-esi-btn', function() {
            visitForm.esi = $(this).data('esi');
            $('.er-esi-btn').removeClass('active');
            $(this).addClass('active');
        });

        $('#btnERSavePatient').off('click').on('click', function() {
            saveERPatientFormValues();
            var errors = [];
            if (!patientForm.name.trim()) errors.push('Patient Name is required');
            if (!patientForm.age.trim() || isNaN(Number(patientForm.age)) || Number(patientForm.age) <= 0) errors.push('Valid Age is required');
            if (!patientForm.gender) errors.push('Gender is required');
            if (patientForm.contactType === 'SELF' && phoneSearchResults && phoneSearchResults.hasSelf) errors.push('A SELF contact already exists. Please choose GUARDIAN.');
            if (errors.length > 0) { validationErrors = errors; renderRegistrationSheet(); return; }
            validationErrors = [];
            var btn = $(this);
            btn.prop('disabled', true).text('Creating...');
            var payload = {
                name: patientForm.name, age: Number(patientForm.age), gender: patientForm.gender,
                phone: phoneSearch, cnic: patientForm.cnic, contactType: patientForm.contactType
            };
            if (patientForm.contactType === 'GUARDIAN') {
                payload.guardianName = patientForm.guardianName;
                payload.guardianPhone = phoneSearch;
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
                    registrationStep = 'visit-details';
                    renderRegistrationSheet();
                },
                error: function(xhr) { validationErrors = [xhr.responseJSON?.message || 'Failed to create patient']; renderRegistrationSheet(); },
                complete: function() { btn.prop('disabled', false); }
            });
        });

        $('#erVisitDoctor').off('change').on('change', function() {
            var val = $(this).val();
            visitForm.doctorName = val;
            var doctorId = $(this).find(':selected').data('doctor-id');
            if (doctorId) {
                $.get('/api/config/doctor-fees/lookup', { doctorId: doctorId, serviceType: 'ER' }).done(function(config) {
                    visitForm.doctorFee = config && config.fee ? config.fee.toString() : '0';
                    renderRegistrationSheet();
                }).fail(function() { visitForm.doctorFee = '0'; renderRegistrationSheet(); });
            }
        });

        $('#btnERProceedBilling').off('click').on('click', function() {
            saveERVisitFormValues();
            var errors = [];
            if (!visitForm.doctorName) errors.push('Assigned Doctor is required');
            if (!visitForm.esi) errors.push('ESI Level is required');
            if (errors.length > 0) { validationErrors = errors; renderRegistrationSheet(); return; }
            validationErrors = [];
            bootstrap.Offcanvas.getInstance(document.getElementById('erRegistrationSheet')).hide();
            openERChargesSheet();
        });
    }

    function saveERPatientFormValues() {
        if ($('#erPatName').length) patientForm.name = $('#erPatName').val();
        if ($('#erPatAge').length) patientForm.age = $('#erPatAge').val();
        if ($('#erPatGender').length) patientForm.gender = $('#erPatGender').val();
        if ($('#erPatCnic').length) patientForm.cnic = $('#erPatCnic').val();
        if ($('#erGuardianName').length) patientForm.guardianName = $('#erGuardianName').val();
        if ($('#erGuardianCnic').length) patientForm.guardianCnic = $('#erGuardianCnic').val();
        if ($('#erRelationship').length) patientForm.relationshipToPatient = $('#erRelationship').val();
    }

    function saveERVisitFormValues() {
        if ($('#erModeOfArrival').length) visitForm.modeOfArrival = $('#erModeOfArrival').val();
        if ($('#erChiefComplaint').length) visitForm.chiefComplaint = $('#erChiefComplaint').val();
        if ($('#erVisitDoctor').length) visitForm.doctorName = $('#erVisitDoctor').val();
        if ($('#erMechanism').length) visitForm.mechanismOfInjury = $('#erMechanism').val();
        if ($('#erMLC').length) visitForm.isMLC = $('#erMLC').is(':checked');
    }

    // ===== CHARGES SHEET =====
    function erChargeKey(c) {
        return c.id ? String(c.id) : (c.name + '_' + c.amount);
    }

    function buildERChargesGrid() {
        erChargesGrid = [];
        var sr = 1;
        masterCharges.filter(function(c) { return c.isMandatory; }).forEach(function(c) {
            erChargesGrid.push({ sr: sr++, id: erChargeKey(c), name: c.name, qty: 1, discount: 0, unitPrice: Number(c.amount), mandatory: true, type: 'charge' });
        });
        masterCharges.filter(function(c) { return !c.isMandatory && selectedOptionalCharges.indexOf(erChargeKey(c)) > -1; }).forEach(function(c) {
            erChargesGrid.push({ sr: sr++, id: erChargeKey(c), name: c.name, qty: 1, discount: 0, unitPrice: Number(c.amount), mandatory: false, type: 'charge' });
        });
    }

    function calcERRowAmount(row) {
        var subtotal = row.unitPrice * row.qty;
        return Math.max(0, subtotal - Number(row.discount || 0));
    }

    function calcERChargesTotal() {
        return erChargesGrid.reduce(function(sum, row) { return sum + calcERRowAmount(row); }, 0);
    }

    function calcERDoctorFeeTotal() {
        var fee = Number(visitForm.doctorFee) || 0;
        var disc = Number(visitForm.doctorFeeDiscount) || 0;
        return Math.max(0, fee - disc);
    }

    function calcERGrandTotal() {
        return calcERDoctorFeeTotal() + calcERChargesTotal();
    }

    // ── ER Registration confirm modal ────────────────────────────────────────────
    function showERRegisterConfirmModal(info) {
        $('#erRegConfirmModal').remove();

        function _row(label, value, border) {
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;' + (border ? 'border-bottom:1px solid rgba(0,0,0,0.06)' : '') + '">' +
                '<span style="font-size:12.5px;color:#6C757D">' + label + '</span>' +
                '<span style="font-size:13px;font-weight:600;color:#2C3E50;text-align:right;max-width:60%">' + value + '</span>' +
                '</div>';
        }

        /* charges summary rows */
        var chargesHtml = '';
        info.charges.forEach(function(c, i) {
            chargesHtml += _row(esc(c.name), esc(info.currency) + ' ' + Number(c.amount).toLocaleString(), i < info.charges.length - 1);
        });
        if (!chargesHtml) chargesHtml = '<p style="font-size:12px;color:#6C757D;margin:8px 0">No additional charges</p>';

        var html =
            '<div class="modal fade" id="erRegConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:480px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* header */
            '<div style="background:#060740;padding:20px 24px;display:flex;align-items:center;gap:14px">' +
            '<div style="width:44px;height:44px;border-radius:50%;background:rgba(127,255,212,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<i data-lucide="siren" style="width:22px;height:22px;color:#7FFFD4"></i></div>' +
            '<div><h5 style="margin:0;font-size:17px;font-weight:700;color:#fff">Register & Activate Patient</h5>' +
            '<p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.6)">Please review before confirming</p></div></div>' +

            /* body */
            '<div style="padding:20px 24px">' +

            /* patient block */
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            _row('Patient',    esc(info.patientName),  true) +
            _row('MRN',        '<span style="font-family:monospace">' + esc(info.mrn) + '</span>', true) +
            _row('Doctor',     esc(info.doctorName),   true) +
            _row('ESI Level',  esc(info.esi),          true) +
            _row('Chief Complaint', esc(info.chiefComplaint || '—'), false) +
            '</div>' +

            /* charges block */
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            '<div style="font-size:11px;font-weight:700;color:#6C757D;text-transform:uppercase;letter-spacing:.05em;padding:10px 0 4px">Charges</div>' +
            chargesHtml +
            '</div>' +

            /* grand total */
            '<div style="background:#060740;border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center">' +
            '<span style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.8)">Grand Total</span>' +
            '<span style="font-size:20px;font-weight:700;font-family:monospace;color:#7FFFD4">' + esc(info.currency) + ' ' + Number(info.grandTotal).toLocaleString() + '</span>' +
            '</div>' +
            '</div>' +

            /* footer */
            '<div style="padding:14px 24px 20px;display:flex;gap:10px;justify-content:flex-end">' +
            '<button id="btnERRegCancel" style="height:40px;padding:0 20px;border:1px solid #DEE2E6;border-radius:8px;background:#fff;font-size:13.5px;font-weight:600;color:#6C757D;cursor:pointer">Cancel</button>' +
            '<button id="btnERRegConfirmSave" style="height:40px;padding:0 22px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px">' +
            '<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Register</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('erRegConfirmModal'), { backdrop: 'static' });
        modal.show();

        $('#btnERRegCancel').on('click', function() { modal.hide(); });

        var $pendingRegBtn = null;

        $('#btnERRegConfirmSave').off('click').on('click', function() {
            $pendingRegBtn = $(this);
            $pendingRegBtn.prop('disabled', true).html('<i data-lucide="loader-2" style="width:15px;height:15px"></i> Registering...');
            lucide.createIcons();
            modal.hide();
        });

        document.getElementById('erRegConfirmModal').addEventListener('hidden.bs.modal', function() {
            if ($pendingRegBtn) {
                info.onConfirm($pendingRegBtn);
                $pendingRegBtn = null;
            }
            $('#erRegConfirmModal').remove();
        });
    }

    // ── ER Registration success modal ────────────────────────────────────────────
    function showERRegisterSuccessModal(info) {
        $('#erRegSuccessModal').remove();

        var html =
            '<div class="modal fade" id="erRegSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:440px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* banner */
            '<div style="background:linear-gradient(135deg,#060740 0%,#1a1b7a 100%);padding:36px 24px;text-align:center">' +
            '<div style="width:68px;height:68px;border-radius:50%;background:#7FFFD4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 4px 20px rgba(127,255,212,0.4)">' +
            '<i data-lucide="check" style="width:36px;height:36px;color:#060740"></i></div>' +
            '<h4 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px">Patient Registered!</h4>' +
            '<p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0">Emergency visit activated successfully</p>' +
            '</div>' +

            /* details */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(0,0,0,0.06)">' +
            '<span style="font-size:12.5px;color:#6C757D">Patient</span><span style="font-size:13px;font-weight:600;color:#2C3E50">' + esc(info.patientName) + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(0,0,0,0.06)">' +
            '<span style="font-size:12.5px;color:#6C757D">MRN</span><span style="font-size:13px;font-weight:600;font-family:monospace;color:#060740">' + esc(info.mrn) + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0">' +
            '<span style="font-size:12.5px;color:#6C757D">Grand Total</span><span style="font-size:15px;font-weight:700;font-family:monospace;color:#060740">' + esc(info.currency) + ' ' + Number(info.grandTotal).toLocaleString() + '</span></div>' +
            '</div>' +
            '</div>' +

            /* footer */
            '<div style="padding:0 24px 20px;display:flex;justify-content:flex-end">' +
            '<button id="btnERRegCloseSuccess" style="height:40px;padding:0 28px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer">Close</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('erRegSuccessModal'));
        modal.show();
        $('#btnERRegCloseSuccess').on('click', function() { modal.hide(); });
        document.getElementById('erRegSuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#erRegSuccessModal').remove();
        });
    }

    function renderERChargesGridRows() {
        var tbody = '';
        erChargesGrid.forEach(function(row, idx) {
            var amt = calcERRowAmount(row);
            var deleteBtn = row.mandatory ? '' : '<button class="btn btn-sm p-0 border-0 er-charge-row-delete" data-idx="' + idx + '" title="Remove"><i data-lucide="x-circle" style="width:16px;height:16px;color:#dc3545"></i></button>';
            tbody += '<tr>' +
                '<td style="text-align:center;vertical-align:middle;width:50px">' + row.sr + '</td>' +
                '<td style="vertical-align:middle"><span style="font-weight:500">' + esc(row.name) + '</span>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);font-family:monospace">@ ' + hospitalInfo.currency + ' ' + Number(row.unitPrice).toLocaleString() + ' each</div></td>' +
                '<td style="width:80px;vertical-align:middle"><input type="number" class="form-control form-control-sm er-charge-qty" data-idx="' + idx + '" value="' + row.qty + '" min="1" style="text-align:center;font-family:monospace"></td>' +
                '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm er-charge-discount" data-idx="' + idx + '" value="' + row.discount + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
                '<td style="text-align:right;vertical-align:middle;font-weight:600;font-family:monospace;width:120px">' + hospitalInfo.currency + ' ' + amt.toLocaleString() + '</td>' +
                '<td style="text-align:center;vertical-align:middle;width:40px">' + deleteBtn + '</td>' +
                '</tr>';
        });
        return tbody;
    }

    function getAvailableEROptionalCharges() {
        var usedIds = erChargesGrid.map(function(r) { return r.id; });
        return masterCharges.filter(function(c) {
            return !c.isMandatory && usedIds.indexOf(erChargeKey(c)) === -1;
        });
    }

    function renderNewERChargeRow() {
        var available = getAvailableEROptionalCharges();
        if (available.length === 0) return '';
        var row = '<tr class="er-new-charge-row" style="background:#f8f9fa">' +
            '<td style="text-align:center;vertical-align:middle;width:50px"><i data-lucide="plus-circle" style="width:16px;height:16px;color:var(--aqua-mint-dark)"></i></td>' +
            '<td colspan="4" style="vertical-align:middle"><select class="form-select form-select-sm er-new-charge-select" style="font-size:13px"><option value="">Select a charge to add...</option>';
        available.forEach(function(c) {
            row += '<option value="' + erChargeKey(c) + '" data-amount="' + c.amount + '">' + esc(c.name) + ' — ' + hospitalInfo.currency + ' ' + Number(c.amount).toLocaleString() + '</option>';
        });
        row += '</select></td><td></td></tr>';
        return row;
    }

    function openERChargesSheet() {
        var patientName = getSelectedPatientName();
        if (!visitForm.doctorFeeDiscount) visitForm.doctorFeeDiscount = 0;
        buildERChargesGrid();
        var total = calcERGrandTotal();
        var doctorFee = Number(visitForm.doctorFee) || 0;
        var doctorDisc = Number(visitForm.doctorFeeDiscount) || 0;
        var doctorNet = calcERDoctorFeeTotal();

        var body = '<div style="display:flex;align-items:center;justify-content:space-between;background:#EFF6FF;border:1px solid #DBEAFE;padding:12px 16px;border-radius:8px;margin-bottom:20px">' +
            '<div><p style="font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;margin:0">CHARGES BREAKDOWN</p>' +
            '<h3 style="font-size:16px;font-weight:700;color:var(--midnight-blue);margin:0">' + esc(patientName) + '</h3>' +
            '<p style="font-size:12px;color:var(--color-muted-foreground);margin:0">' + esc(selectedPatientMRN || 'GENERATING NEW MRN') + '</p></div>' +
            '<div style="width:32px;height:32px;background:#DBEAFE;border-radius:50%;display:flex;align-items:center;justify-content:center"><i data-lucide="receipt" style="width:18px;height:18px;color:#2563EB"></i></div></div>';

        body += '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden;margin-bottom:16px">' +
            '<table class="table table-sm mb-0" style="font-size:13px" id="erDoctorFeeGrid">' +
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
            '<td style="vertical-align:middle"><span style="font-weight:500">ER Doctor Fee</span>' +
            '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(visitForm.doctorName || 'Doctor') + ' — ER</div></td>' +
            '<td style="width:80px;vertical-align:middle"><input type="number" class="form-control form-control-sm" value="1" disabled style="text-align:center;font-family:monospace;background:#f1f1f1"></td>' +
            '<td style="width:100px;vertical-align:middle"><input type="number" class="form-control form-control-sm" id="erDoctorFeeDiscount" value="' + doctorDisc + '" min="0" step="0.01" style="text-align:right;font-family:monospace"></td>' +
            '<td style="text-align:right;vertical-align:middle;font-weight:600;font-family:monospace;width:120px" id="erDoctorFeeAmount">' + hospitalInfo.currency + ' ' + doctorNet.toLocaleString() + '</td>' +
            '<td style="width:40px"></td>' +
            '</tr></tbody></table></div>';

        body += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<span style="font-size:12px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase">Hospital Charges</span>' +
            '<button class="btn btn-sm btn-outline-primary" id="btnERAddChargeRow" style="font-size:12px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add Row</button></div>';

        body += '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden;margin-bottom:16px">' +
            '<table class="table table-sm mb-0" style="font-size:13px" id="erChargesGridTable">' +
            '<thead><tr style="background:var(--midnight-blue);color:#fff">' +
            '<th style="text-align:center;width:50px;padding:10px 8px">Sr#</th>' +
            '<th style="padding:10px 8px">Charges</th>' +
            '<th style="text-align:center;width:80px;padding:10px 8px">QTY</th>' +
            '<th style="text-align:right;width:100px;padding:10px 8px">Discount</th>' +
            '<th style="text-align:right;width:120px;padding:10px 8px">Amount</th>' +
            '<th style="width:40px;padding:10px 8px"></th>' +
            '</tr></thead>' +
            '<tbody id="erChargesGridBody">' + renderERChargesGridRows();
        if (erChargesGrid.length === 0) {
            body += '<tr id="erChargesEmptyRow"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add charges.</td></tr>';
        }
        body += '</tbody></table></div>';

        body += '<div style="background:var(--midnight-blue);padding:16px;border-radius:8px;color:#fff;display:flex;align-items:center;justify-content:space-between">' +
            '<div><p style="font-size:12px;font-weight:500;opacity:0.8;text-transform:uppercase;margin:0">Grand Total</p>' +
            '<p style="font-size:10px;opacity:0.6;margin:0">DOCTOR FEE + ' + erChargesGrid.length + ' CHARGE' + (erChargesGrid.length !== 1 ? 'S' : '') + '</p></div>' +
            '<div style="font-size:24px;font-weight:700;font-family:monospace" id="erChargeTotalDisplay">' + hospitalInfo.currency + ' ' + total.toLocaleString() + '</div></div>';

        var footer = '<button class="btn-outline" id="btnERBackToReg">BACK</button><button class="btn-primary" id="btnERFinalize">REGISTER & ACTIVATE</button>';

        $('#erChargesSheetBody').html(body);
        $('#erChargesSheetFooter').html(footer);
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('erChargesSheet')).show();
        bindERChargesEvents();
    }

    function bindERChargesEvents() {
        $(document).off('input.erChargesGrid').on('input.erChargesGrid', '.er-charge-qty', function() {
            var idx = $(this).data('idx');
            var val = parseInt($(this).val()) || 1;
            if (val < 1) val = 1;
            erChargesGrid[idx].qty = val;
            refreshERChargesGrid();
        });

        $(document).off('input.erChargesDiscount').on('input.erChargesDiscount', '.er-charge-discount', function() {
            var idx = $(this).data('idx');
            var val = parseFloat($(this).val()) || 0;
            if (val < 0) val = 0;
            erChargesGrid[idx].discount = val;
            refreshERChargesGrid();
        });

        $(document).off('input.erDoctorDiscount').on('input.erDoctorDiscount', '#erDoctorFeeDiscount', function() {
            var val = parseFloat($(this).val()) || 0;
            if (val < 0) val = 0;
            visitForm.doctorFeeDiscount = val;
            var net = calcERDoctorFeeTotal();
            $('#erDoctorFeeAmount').text(hospitalInfo.currency + ' ' + net.toLocaleString());
            var total = calcERGrandTotal();
            $('#erChargeTotalDisplay').text(hospitalInfo.currency + ' ' + total.toLocaleString());
        });

        $(document).off('click.erChargesDelete').on('click.erChargesDelete', '.er-charge-row-delete', function() {
            var idx = $(this).data('idx');
            var row = erChargesGrid[idx];
            if (row && !row.mandatory) {
                selectedOptionalCharges = selectedOptionalCharges.filter(function(id) { return id !== row.id; });
                erChargesGrid.splice(idx, 1);
                erChargesGrid.forEach(function(r, i) { r.sr = i + 1; });
                refreshERChargesGrid();
                if (erChargesGrid.length === 0) {
                    $('#erChargesGridBody').html('<tr id="erChargesEmptyRow"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add charges.</td></tr>');
                }
            }
        });

        $(document).off('click.erAddRow').on('click.erAddRow', '#btnERAddChargeRow', function() {
            var available = getAvailableEROptionalCharges();
            if (available.length === 0) {
                HMS.toast('All available charges have already been added.', 'info');
                return;
            }
            $('#erChargesEmptyRow').remove();
            var existingNew = $('#erChargesGridBody .er-new-charge-row');
            if (existingNew.length > 0) return;
            $('#erChargesGridBody').append(renderNewERChargeRow());
            lucide.createIcons();
        });

        $(document).off('change.erNewCharge').on('change.erNewCharge', '.er-new-charge-select', function() {
            var chargeId = $(this).val();
            if (!chargeId) return;
            if (selectedOptionalCharges.indexOf(chargeId) === -1) {
                selectedOptionalCharges.push(chargeId);
            }
            var charge = masterCharges.find(function(c) { return erChargeKey(c) === chargeId; });
            if (charge) {
                var sr = erChargesGrid.length + 1;
                erChargesGrid.push({ sr: sr, id: chargeId, name: charge.name, qty: 1, discount: 0, unitPrice: Number(charge.amount), mandatory: false, type: 'charge' });
            }
            $('.er-new-charge-row').remove();
            refreshERChargesGrid();
            if (erChargesGrid.length === 0) {
                $('#erChargesGridBody').html('<tr id="erChargesEmptyRow"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add charges.</td></tr>');
            }
        });

        $('#btnERBackToReg').off('click').on('click', function() {
            try { var oc = bootstrap.Offcanvas.getInstance(document.getElementById('erChargesSheet')); if (oc) oc.hide(); } catch(e) {}
            renderRegistrationSheet();
            new bootstrap.Offcanvas(document.getElementById('erRegistrationSheet')).show();
        });

        $('#btnERFinalize').off('click').on('click', function() {
            /* build charges summary for the confirmation popup */
            var confirmCharges = [];
            /* doctor fee row */
            var docFeeNet = calcERDoctorFeeTotal();
            if (docFeeNet > 0) {
                confirmCharges.push({ name: 'ER Doctor Fee — ' + (visitForm.doctorName || ''), amount: docFeeNet });
            }
            /* hospital charges */
            erChargesGrid.forEach(function(row) {
                if (row.type === 'charge') {
                    confirmCharges.push({ name: row.name, amount: calcERRowAmount(row) });
                }
            });

            showERRegisterConfirmModal({
                patientName:    getSelectedPatientName(),
                mrn:            selectedPatientMRN || '(new)',
                doctorName:     visitForm.doctorName  || '—',
                esi:            visitForm.esi         || '—',
                chiefComplaint: visitForm.chiefComplaint || '',
                charges:        confirmCharges,
                grandTotal:     calcERGrandTotal(),
                currency:       hospitalInfo.currency,
                onConfirm: function($cb) {
                    var chargeIds = [];
                    erChargesGrid.forEach(function(row) {
                        if (row.type === 'charge') chargeIds.push(row.id);
                    });
                    $.ajax({
                        url: '/api/emergency/visits',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            mrn: selectedPatientMRN,
                            doctorName: visitForm.doctorName,
                            department: visitForm.department,
                            visitType: visitForm.visitType,
                            chargeIds: chargeIds,
                            doctorFee: Number(visitForm.doctorFee),
                            esi: visitForm.esi,
                            modeOfArrival: visitForm.modeOfArrival,
                            chiefComplaint: visitForm.chiefComplaint,
                            mechanismOfInjury: visitForm.mechanismOfInjury,
                            isMLC: visitForm.isMLC
                        }),
                        success: function() {
                            try { var cs = bootstrap.Offcanvas.getInstance(document.getElementById('erChargesSheet')); if (cs) cs.hide(); } catch(e) {}
                            try { var rs = bootstrap.Offcanvas.getInstance(document.getElementById('erRegistrationSheet')); if (rs) rs.hide(); } catch(e) {}
                            var snapshotName  = getSelectedPatientName();
                            var snapshotMRN   = selectedPatientMRN || '(new)';
                            var snapshotTotal = calcERGrandTotal();
                            resetRegistration();
                            setTimeout(function() { loadAllData(); }, 300);
                            showERRegisterSuccessModal({
                                patientName: snapshotName,
                                mrn:         snapshotMRN,
                                grandTotal:  snapshotTotal,
                                currency:    hospitalInfo.currency
                            });
                        },
                        error: function(xhr) {
                            if ($cb) $cb.prop('disabled', false).html('<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Register');
                            lucide.createIcons();
                            HMS.ajaxError(xhr, 'Failed to register ER visit');
                        }
                    });
                }
            });
        });
    }

    function refreshERChargesGrid() {
        var total = calcERGrandTotal();
        var rows = renderERChargesGridRows();
        if (erChargesGrid.length === 0) {
            rows = '<tr id="erChargesEmptyRow"><td colspan="6" style="text-align:center;padding:20px;color:var(--color-muted-foreground)">No charges added. Click "Add Row" to add charges.</td></tr>';
        }
        $('#erChargesGridBody').html(rows);
        $('#erChargeTotalDisplay').text(hospitalInfo.currency + ' ' + total.toLocaleString());
        lucide.createIcons();
    }

    // ===== ER CLINICAL ORDERS MANAGEMENT =====
    function openEROrdersDetail(visitId) {
        var visit = visits.find(function(v) { return v.visitId === visitId; });
        if (!visit) { return; }
        selectedEROrderVisit = visitId;
        erCustomOrderData = {};
        var avail = getAvailableErSections();
        erOrderActiveSection = avail.length > 0 ? avail[0].id : 'medication';
        erPrescriptionsList = [];
        erInvestigationsList = [];
        erIVFluidsList = [];
        erDietOrdersList = [];
        erNursingOrdersList = [];
        erProcedureOrdersList = [];
        var _eu = erPharmRxConfig.units[0] || 'mg';
        var _er = erPharmRxConfig.routes[0] || 'Oral';
        var _ef = erPharmRxConfig.frequencies[0];
        var _efn = _ef ? (typeof _ef === 'object' ? _ef.name : _ef) : 'OD';
        erRxForm = { medicine: '', medicineId: '', dose: '', unit: _eu, route: _er, frequency: _efn, duration: '' };
        erInvForm = { type: 'Laboratory', test: '', testCode: '', price: '', dept: '', sample: '', priority: 'Routine' };
        erIVForm = { fluidType: '', volume: '', rateMethod: 'rate', rate: '', additives: [], ivAccess: 'Peripheral IV (existing)', site: '', startTime: 'now', frequency: 'single', dailyFluidGoal: '', monitorIO: false, checkSite: false, watchOverload: false, specialInstructions: '', otherFluid: '' };
        erDietForm = { dietType: '', otherDiet: '', restrictions: [], foodAllergies: '', foodPreferences: '', feedingRoute: 'Oral Feeding', mealFrequency: '3 Main Meals + 2 Snacks', fluidRestriction: 'none', fluidRestrictAmount: '', startTime: 'next_meal', duration: 'until_further', durationDays: '', specialInstructions: '' };
        erNursingForm = { orderType: '', vitals: ['Blood Pressure', 'Heart Rate/Pulse', 'Respiratory Rate', 'Temperature', 'Oxygen Saturation (SpO2)'], frequency: 'Q4H', duration: 'until_further', durationHours: '', alertBPLow: '90/60', alertBPHigh: '180/100', alertHRLow: '50', alertHRHigh: '120', alertRRLow: '12', alertRRHigh: '24', alertTempLow: '35.5', alertTempHigh: '38.5', alertSpO2: '90', specialInstructions: '', otherType: '' };
        erProcForm = { procedure: '', indication: '', diagnosis: '', priority: 'Emergency', location: 'Bedside', consentObtained: false, consentBy: '', consentDate: '', consentWitness: '', preProc: [], specialInstructions: '', estimatedDuration: '', estimatedCost: '' };

        var ordersReq = $.get('/api/er/clinical-orders/' + visitId);
        var visitReq  = $.get('/api/emergency/visits');
        ordersReq.done(function(orders) {
            erExistingOrders = orders || [];
            orders.forEach(function(o) {
                if (o.status !== 'Active') return;
                var md = o.metadata || {};
                if (o.type === 'Medication') {
                    erPrescriptionsList.push({ medicine: md.medicine || o.details || '', dose: md.dose || '', unit: md.unit || 'mg', route: md.route || 'Oral', frequency: md.frequency || 'OD', duration: md.duration || '', orderId: o.orderId });
                } else if (o.type === 'Investigation') {
                    erInvestigationsList.push({ type: md.investigationType || 'Laboratory', test: md.test || o.details || '', priority: o.priority || 'Routine', orderId: o.orderId });
                } else if (o.type === 'IV Fluids') {
                    erIVFluidsList.push($.extend({ orderId: o.orderId }, md.fluidType ? md : { fluidType: o.details || '', volume: '', rate: '' }));
                } else if (o.type === 'Diet') {
                    erDietOrdersList.push($.extend({ orderId: o.orderId }, md.dietType ? md : { dietType: o.details || '' }));
                } else if (o.type === 'Nursing') {
                    erNursingOrdersList.push($.extend({ orderId: o.orderId }, md.orderType ? md : { orderType: o.details || '' }));
                } else if (o.type === 'Procedure') {
                    erProcedureOrdersList.push($.extend({ orderId: o.orderId }, md.procedure ? md : { procedure: o.details || '' }));
                }
            });
        }).fail(function() { erExistingOrders = []; });

        visitReq.done(function(allVisits) {
            var v = (allVisits || []).find(function(x) { return x.visitId === visitId; });
            erCustomOrderData = (v && v.customOrderData) ? v.customOrderData : {};
        }).fail(function() { erCustomOrderData = {}; });

        $.when(ordersReq, visitReq).always(function() {
            renderEROrdersSheet();
            new bootstrap.Offcanvas(document.getElementById('erOrdersDetailSheet')).show();
        });
    }

    function renderEROrdersSheet() {
        var visit = visits.find(function(v) { return v.visitId === selectedEROrderVisit; });
        if (!visit) return;
        var pName = visit.patientName || 'Unknown';
        var pInitials = getInitials(pName);
        var visitIdShort = visit.visitId || '';

        var body = '<div style="padding:24px">';

        body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:16px">' +
            '<div style="display:flex;align-items:center;gap:16px">' +
                '<div class="avatar avatar-md" style="background:var(--midnight-blue);color:#fff;font-size:16px;font-weight:700">' + pInitials + '</div>' +
                '<div style="flex:1">' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="font-size:16px;font-weight:600;margin:0">' + esc(pName) + '</h3>' +
                        '<span class="badge badge-outline" style="font-size:10px">' + esc(visitIdShort) + '</span>' +
                        '<span class="badge badge-success" style="font-size:10px">ACTIVE</span>' +
                    '</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:4px">' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground);font-family:monospace">' + esc(visit.mrn) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">Dr. ' + esc(visit.doctorName || '-') + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">ESI: ' + esc(visit.esi || '-') + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(visit.chiefComplaint || '') + '</span>' +
                    '</div>' +
                '</div>' +
            '</div></div>';

        var availSections = getAvailableErSections();
        body += '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:24px">';
        availSections.forEach(function(sec) {
            body += '<button class="consult-section-btn er-order-section-btn' + (erOrderActiveSection === sec.id ? ' active' : '') + '" data-section="' + sec.id + '"><i data-lucide="' + sec.icon + '"></i> ' + esc(sec.label) + '</button>';
        });
        body += '</div>';

        var activeSec = availSections.find(function(s) { return s.id === erOrderActiveSection; }) || availSections[0];
        var sectionTitles = { medication: 'Prescription', investigation: 'Investigation Orders', ivfluids: 'IV Fluid Order', diet: 'Diet Order', nursing: 'Nursing Care Order', procedure: 'Procedure Order', ordersummary: 'All Orders Summary' };
        var sectionTitle = activeSec ? (sectionTitles[activeSec.id] || activeSec.label) : 'Orders';

        body += '<div style="display:grid;grid-template-columns:2fr 1fr;gap:24px">';
        body += '<div><div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">';
        body += '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px;display:flex;align-items:center;justify-content:space-between">';
        body += '<h3 style="font-size:16px;font-weight:600;margin:0">' + esc(sectionTitle) + '</h3>';
        body += '</div>';
        body += '<div style="padding:20px">';

        if (erOrderActiveSection === 'medication') {
            body += renderERPrescriptionSection();
        } else if (erOrderActiveSection === 'investigation') {
            body += renderERInvestigationsSection();
        } else if (erOrderActiveSection === 'ivfluids') {
            body += renderERIVFluidsSection();
        } else if (erOrderActiveSection === 'diet') {
            body += renderERDietSection();
        } else if (erOrderActiveSection === 'nursing') {
            body += renderERNursingSection();
        } else if (erOrderActiveSection === 'procedure') {
            body += renderERProcedureSection();
        } else if (erOrderActiveSection === 'ordersummary') {
            body += renderEROrderSummarySection();
        } else if (activeSec && !activeSec.isDefault) {
            body += renderErCustomSection(activeSec);
        }

        body += '</div></div></div>';

        body += '<div>';
        body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:16px">' +
            '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h3 style="font-size:16px;font-weight:600;margin:0">Order Summary</h3></div>' +
            '<div style="padding:16px">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Medications</p><p style="font-size:16px;font-weight:700;margin:0">' + erPrescriptionsList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Investigations</p><p style="font-size:16px;font-weight:700;margin:0">' + erInvestigationsList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">IV Fluids</p><p style="font-size:16px;font-weight:700;margin:0">' + erIVFluidsList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Diet</p><p style="font-size:16px;font-weight:700;margin:0">' + erDietOrdersList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Nursing</p><p style="font-size:16px;font-weight:700;margin:0">' + erNursingOrdersList.length + '</p></div>' +
                    '<div style="border:1px solid var(--color-border);border-radius:8px;padding:10px"><p style="font-size:10px;color:var(--color-muted-foreground);margin:0 0 4px">Procedures</p><p style="font-size:16px;font-weight:700;margin:0">' + erProcedureOrdersList.length + '</p></div>' +
                '</div>' +
            '</div></div>';

        if (erExistingOrders.length > 0) {
            body += '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">' +
                '<div style="border-bottom:1px solid var(--color-border);padding:16px 20px"><h3 style="font-size:16px;font-weight:600;margin:0">All Orders</h3></div>' +
                '<div style="padding:16px;max-height:300px;overflow-y:auto">';
            erExistingOrders.forEach(function(o) {
                var sCls = o.status === 'Active' ? 'badge-success' : o.status === 'Discontinued' ? 'badge-destructive' : 'badge-info';
                var pCls = o.priority === 'STAT' ? 'color:var(--color-destructive)' : o.priority === 'Urgent' ? 'color:#F59E0B' : 'color:var(--color-muted-foreground)';
                body += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--color-border)">' +
                    '<div style="flex:1"><span class="badge badge-outline" style="font-size:10px;margin-right:4px">' + esc(o.type) + '</span><span style="font-size:13px;font-weight:500">' + esc(o.details) + '</span></div>' +
                    '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:10px;font-weight:600;text-transform:uppercase;' + pCls + '">' + esc(o.priority) + '</span><span class="badge ' + sCls + '" style="font-size:10px">' + esc(o.status) + '</span>' +
                    (o.status === 'Active' ? '<button class="btn-ghost er-discontinue-order" data-order-id="' + esc(o.orderId) + '" style="font-size:10px;color:var(--color-destructive);padding:2px 6px">Discontinue</button>' : '') +
                    '</div></div>';
            });
            body += '</div></div>';
        }
        body += '</div></div>';

        body += '<div style="display:flex;justify-content:flex-end;gap:12px;padding-top:16px;border-top:1px solid var(--color-border);margin-top:24px">' +
            '<button class="btn-outline" data-bs-dismiss="offcanvas">Close</button>' +
            '<button class="btn-primary" id="btnSaveEROrders"><i data-lucide="send" style="width:16px;height:16px"></i> Save Orders</button>' +
        '</div></div>';

        $('#erOrdersDetailBody').html(body);
        lucide.createIcons();
        bindEROrdersEvents();
    }

    function renderERPrescriptionSection() {
        var html = '';
        /* Single row: Medicine · Strength · Dose · Unit · Route · Frequency · Duration · Add */
        html += '<div style="display:grid;grid-template-columns:minmax(180px,2.4fr) minmax(90px,0.9fr) minmax(70px,0.65fr) minmax(80px,0.75fr) minmax(110px,1fr) minmax(110px,1fr) minmax(100px,0.9fr) auto;gap:8px;align-items:end;margin-bottom:16px">' +
            /* Medicine — search icon + chevron dropdown */
            '<div class="form-group" style="position:relative;margin-bottom:0">' +
                '<label style="font-size:12px;color:var(--color-muted-foreground)">Medicine</label>' +
                '<div style="position:relative">' +
                    '<i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--color-muted-foreground);pointer-events:none;z-index:1"></i>' +
                    '<input type="text" class="form-control" id="erRxMedInput" placeholder="Click or type to search..." value="' + esc(erRxForm.medicine) + '" style="padding-left:30px;padding-right:28px;cursor:pointer" autocomplete="off">' +
                    '<i data-lucide="chevron-down" id="erRxMedChevron" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--color-muted-foreground);pointer-events:none;transition:transform 0.2s"></i>' +
                '</div>' +
                '<div class="autocomplete-dropdown" id="erRxMedDropdown" style="display:none;top:calc(100% + 2px)"></div>' +
            '</div>' +
            /* Strength — readonly auto-filled */
            '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Strength</label>' +
            '<input type="text" class="form-control" id="erRxStrength" value="' + esc(erRxForm.strength || '') + '" placeholder="Auto" readonly style="background:var(--color-muted);cursor:default;color:var(--color-muted-foreground)"></div>' +
            /* Dose */
            '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Dose</label>' +
            '<input type="text" class="form-control" id="erRxDose" placeholder="e.g. 1" value="' + esc(erRxForm.dose) + '"></div>' +
            /* Unit */
            '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Unit</label>' +
            '<select class="form-select" id="erRxUnit">' + buildErRxOptions(erPharmRxConfig.units, erRxForm.unit) + '</select></div>' +
            /* Route */
            '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Route</label>' +
            '<select class="form-select" id="erRxRoute">' + buildErRxOptions(erPharmRxConfig.routes, erRxForm.route) + '</select></div>' +
            /* Frequency */
            '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Frequency</label>' +
            '<select class="form-select" id="erRxFrequency">' + buildErFreqOptions(erPharmRxConfig.frequencies, erRxForm.frequency) + '</select></div>' +
            /* Duration */
            '<div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration</label>' +
            '<input type="text" class="form-control" id="erRxDuration" placeholder="e.g. 5 days" value="' + esc(erRxForm.duration) + '"></div>' +
            /* Add button */
            '<button class="btn-primary btn-sm" id="btnAddERRx" style="height:38px;white-space:nowrap"><i data-lucide="plus" style="width:14px;height:14px"></i> Add</button>' +
        '</div>';
        if (erPrescriptionsList.length > 0) {
            html += '<div style="border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Medicine</th><th style="font-size:12px">Dose</th><th style="font-size:12px">Route</th><th style="font-size:12px">Frequency</th><th style="font-size:12px">Duration</th><th style="width:40px"></th></tr></thead><tbody>';
            erPrescriptionsList.forEach(function(rx, i) {
                html += '<tr><td style="font-size:12px;font-weight:500">' + (i + 1) + '</td><td style="font-size:14px;font-weight:500">' + esc(rx.medicine) + (rx.strength ? ' <span style="font-size:11px;font-weight:400;color:var(--color-muted-foreground)">' + esc(rx.strength) + '</span>' : '') + '</td><td style="font-size:12px">' + esc(rx.dose) + ' ' + esc(rx.unit) + '</td><td style="font-size:12px">' + esc(rx.route) + '</td><td><span class="badge badge-outline" style="font-size:10px">' + esc(rx.frequency) + '</span></td><td style="font-size:12px">' + esc(rx.duration) + '</td><td><button class="btn-ghost er-remove-rx" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        } else {
            html += '<p style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">No prescriptions added yet</p>';
        }
        return html;
    }

    function renderERInvestigationsSection() {
        var html = '';
        html += '<div style="display:grid;grid-template-columns:1fr 2fr 1fr auto;gap:8px;align-items:end;margin-bottom:16px">' +
            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Type</label><select class="form-select" id="erInvType"><option value="Laboratory"' + (erInvForm.type === 'Laboratory' ? ' selected' : '') + '>Laboratory</option><option value="Radiology"' + (erInvForm.type === 'Radiology' ? ' selected' : '') + '>Radiology</option></select></div>' +
            '<div class="form-group" style="position:relative"><label style="font-size:12px;color:var(--color-muted-foreground)">Test Name</label>' +
            '<div style="position:relative">' +
            '<i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--color-muted-foreground);pointer-events:none;z-index:1"></i>' +
            '<input type="text" class="form-control" id="erInvTestInput" placeholder="Click or type to search..." value="' + esc(erInvForm.test) + '" style="padding-left:30px;padding-right:28px;cursor:pointer" autocomplete="off">' +
            '<i data-lucide="chevron-down" id="erInvTestChevron" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--color-muted-foreground);pointer-events:none;transition:transform 0.2s"></i>' +
            '</div>' +
            '<div class="autocomplete-dropdown" id="erInvTestDropdown" style="display:none;top:calc(100% + 2px)"></div></div>' +
            '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Priority</label><select class="form-select" id="erInvPriority"><option value="Routine"' + (erInvForm.priority === 'Routine' ? ' selected' : '') + '>Routine</option><option value="Urgent"' + (erInvForm.priority === 'Urgent' ? ' selected' : '') + '>Urgent</option><option value="STAT"' + (erInvForm.priority === 'STAT' ? ' selected' : '') + '>STAT</option></select></div>' +
            '<button class="btn-primary btn-sm" id="btnAddERInv" style="height:38px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add</button>' +
        '</div>';
        if (erInvestigationsList.length > 0) {
            html += '<div style="border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">Type</th><th style="font-size:12px">Test</th><th style="font-size:12px">Priority</th><th style="width:40px"></th></tr></thead><tbody>';
            erInvestigationsList.forEach(function(inv, i) {
                var prioClass = inv.priority === 'STAT' ? 'color:var(--color-destructive)' : (inv.priority === 'Urgent' ? 'color:var(--color-warning)' : 'color:var(--color-muted-foreground)');
                var testDisplay = esc(inv.test);
                if (inv.testCode) testDisplay += ' <span style="font-size:10px;color:var(--color-muted-foreground);font-weight:400">(' + esc(inv.testCode) + ')</span>';
                html += '<tr><td style="font-size:12px">' + esc(inv.type) + '</td><td style="font-size:14px;font-weight:500">' + testDisplay + '</td><td><span style="font-size:10px;font-weight:600;text-transform:uppercase;' + prioClass + '">' + esc(inv.priority) + '</span></td><td><button class="btn-ghost er-remove-inv" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        } else {
            html += '<p style="font-size:12px;color:var(--color-muted-foreground);font-style:italic">No investigations added yet</p>';
        }
        return html;
    }

    function renderERIVFluidsSection() {
        var f = erIVForm;
        var fluidTypes = ['Normal Saline (0.9% NaCl)', "Ringer's Lactate", '5% Dextrose in Water (D5W)', '5% Dextrose in Normal Saline (D5NS)', '5% Dextrose in Half Normal Saline (D5 1/2 NS)', '10% Dextrose', 'Plasma Expanders (Dextran, Gelatin)', 'Blood Products (Whole blood, Packed cells)', 'Other'];
        var html = '';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Fluid Type <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="erIVFluidType">';
        fluidTypes.forEach(function(ft) { html += '<option value="' + esc(ft) + '"' + (f.fluidType === ft ? ' selected' : '') + '>' + esc(ft) + '</option>'; });
        html += '</select></div>';
        if (f.fluidType === 'Other') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Specify Fluid</label><input type="text" class="form-control" id="erIVOtherFluid" value="' + esc(f.otherFluid || '') + '" placeholder="Specify fluid type"></div>';
        }
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Volume (mL) <span style="color:var(--color-destructive)">*</span></label><input type="number" class="form-control" id="erIVVolume" value="' + esc(f.volume) + '" placeholder="1000"></div>';
        html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
        ['500', '1000', '1500', '2000'].forEach(function(v) { html += '<button class="btn-outline btn-sm er-iv-quick-vol" data-vol="' + v + '" style="font-size:11px">' + v + ' mL</button>'; });
        html += '</div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Infusion Rate</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Method <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="erIVRateMethod">';
        [{ v: 'rate', l: 'Rate (mL/hour)' }, { v: 'drops', l: 'Drops per minute' }, { v: 'duration', l: 'Duration (hours)' }].forEach(function(m) { html += '<option value="' + m.v + '"' + (f.rateMethod === m.v ? ' selected' : '') + '>' + m.l + '</option>'; });
        html += '</select></div>';
        var rateLabel = f.rateMethod === 'rate' ? 'Rate (mL/hr)' : f.rateMethod === 'drops' ? 'Drops/min' : 'Duration (hours)';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">' + rateLabel + '</label><input type="number" class="form-control" id="erIVRate" value="' + esc(f.rate) + '" placeholder="125"></div>';
        if (f.rateMethod === 'rate' && f.rate && f.volume) {
            var hrs = Math.round(parseInt(f.volume) / parseInt(f.rate) * 10) / 10;
            html += '<p style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:12px"><i data-lucide="clock" style="width:12px;height:12px;display:inline"></i> Auto-calculated duration: ' + hrs + ' hours</p>';
        }
        html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
        ['50', '100', '125', '150'].forEach(function(r) { html += '<button class="btn-outline btn-sm er-iv-quick-rate" data-rate="' + r + '" style="font-size:11px">' + r + ' mL/hr</button>'; });
        html += '</div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Additives <span style="font-weight:400;font-size:12px;color:var(--color-muted-foreground)">(Optional)</span></h4>';
        if (f.additives && f.additives.length > 0) {
            f.additives.forEach(function(ad, ai) {
                html += '<div style="display:flex;gap:8px;align-items:end;margin-bottom:8px"><div class="form-group" style="flex:2"><label style="font-size:11px;color:var(--color-muted-foreground)">Drug</label><input type="text" class="form-control er-iv-additive-drug" data-idx="' + ai + '" value="' + esc(ad.drug) + '" placeholder="e.g. KCl"></div><div class="form-group" style="flex:1"><label style="font-size:11px;color:var(--color-muted-foreground)">Dose</label><input type="text" class="form-control er-iv-additive-dose" data-idx="' + ai + '" value="' + esc(ad.dose) + '" placeholder="20 mEq"></div><button class="btn-ghost er-iv-remove-additive" data-idx="' + ai + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></div>';
            });
        }
        html += '<button class="btn-outline btn-sm" id="btnAddERIVAdditive" style="font-size:11px;margin-bottom:8px"><i data-lucide="plus" style="width:12px;height:12px"></i> Add Additive</button>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">IV Site & Access</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">IV Access</label><select class="form-select" id="erIVAccess">';
        ['Peripheral IV (existing)', 'Peripheral IV (new - to be inserted)', 'Central Line', 'PICC Line'].forEach(function(a) { html += '<option value="' + esc(a) + '"' + (f.ivAccess === a ? ' selected' : '') + '>' + esc(a) + '</option>'; });
        html += '</select></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Site</label><input type="text" class="form-control" id="erIVSite" value="' + esc(f.site) + '" placeholder="e.g. Right Subclavian"></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Schedule</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Start Time</label><select class="form-select" id="erIVStartTime"><option value="now"' + (f.startTime === 'now' ? ' selected' : '') + '>Now (Immediate)</option><option value="scheduled"' + (f.startTime === 'scheduled' ? ' selected' : '') + '>Scheduled</option></select></div>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Frequency / Continuation</label><select class="form-select" id="erIVFrequency">';
        [{ v: 'single', l: 'Single bag/bottle only' }, { v: 'continuous', l: 'Continuous (Replace when empty)' }, { v: 'repeat', l: 'Repeat for specified bags' }, { v: 'timed', l: 'Run for specified hours then stop' }].forEach(function(fr) { html += '<option value="' + fr.v + '"' + (f.frequency === fr.v ? ' selected' : '') + '>' + fr.l + '</option>'; });
        html += '</select></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Total Daily Fluid Goal (mL)</label><input type="number" class="form-control" id="erIVDailyGoal" value="' + esc(f.dailyFluidGoal) + '" placeholder="3000"></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Monitoring</h4>';
        html += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">';
        html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" id="erIVMonitorIO"' + (f.monitorIO ? ' checked' : '') + '> Monitor fluid input/output</label>';
        html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" id="erIVCheckSite"' + (f.checkSite ? ' checked' : '') + '> Check IV site every 4 hours</label>';
        html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" id="erIVWatchOverload"' + (f.watchOverload ? ' checked' : '') + '> Watch for signs of fluid overload</label>';
        html += '</div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Special Instructions</label><textarea class="form-control" id="erIVSpecialInst" rows="2" placeholder="e.g. Slow rate if patient develops SOB">' + esc(f.specialInstructions) + '</textarea></div>';
        html += '<button class="btn-primary" id="btnAddERIVFluid"><i data-lucide="plus" style="width:14px;height:14px"></i> Add to Order List</button>';
        if (erIVFluidsList.length > 0) {
            html += '<div style="margin-top:16px;border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Fluid</th><th style="font-size:12px">Volume</th><th style="font-size:12px">Rate</th><th style="font-size:12px">Access</th><th style="width:40px"></th></tr></thead><tbody>';
            erIVFluidsList.forEach(function(iv, i) {
                html += '<tr><td>' + (i + 1) + '</td><td style="font-size:13px;font-weight:500">' + esc(iv.fluidType || '') + '</td><td style="font-size:12px">' + esc(iv.volume || '') + ' mL</td><td style="font-size:12px">' + esc(iv.rate || '') + ' mL/hr</td><td style="font-size:12px">' + esc(iv.ivAccess || '') + '</td><td><button class="btn-ghost er-remove-iv" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderERDietSection() {
        var f = erDietForm;
        var dietTypes = ['NPO (Nothing Per Oral - Fasting)', 'Clear Liquid Diet', 'Full Liquid Diet', 'Soft Diet', 'Regular Diet', 'Diabetic Diet', 'Low Sodium Diet (Cardiac)', 'Renal Diet (Low protein, Low K+, Low Na+)', 'High Protein Diet', 'High Fiber Diet', 'Low Residue Diet', 'BRAT Diet (Banana, Rice, Applesauce, Toast)', 'Other'];
        var restrictions = ['Low Salt (Sodium restricted)', 'Low Sugar (Diabetic)', 'Low Fat', 'Low Cholesterol', 'Gluten Free', 'Lactose Free', 'No Red Meat', 'Vegetarian', 'Halal'];
        var html = '';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Diet Type <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="erDietType">';
        dietTypes.forEach(function(dt) { html += '<option value="' + esc(dt) + '"' + (f.dietType === dt ? ' selected' : '') + '>' + esc(dt) + '</option>'; });
        html += '</select></div>';
        if (f.dietType === 'Other') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Specify Diet</label><input type="text" class="form-control" id="erDietOther" value="' + esc(f.otherDiet || '') + '" placeholder="Specify diet type"></div>';
        }
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Restrictions / Modifications</h4>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
        restrictions.forEach(function(r) {
            var checked = f.restrictions && f.restrictions.indexOf(r) > -1 ? ' checked' : '';
            html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" class="er-diet-restriction" value="' + esc(r) + '"' + checked + '> ' + esc(r) + '</label>';
        });
        html += '</div>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Food Allergies</label><textarea class="form-control" id="erDietAllergies" rows="2" placeholder="e.g. Peanuts, Shellfish">' + esc(f.foodAllergies) + '</textarea></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Food Preferences / Dislikes</label><textarea class="form-control" id="erDietPreferences" rows="2" placeholder="e.g. No spicy food">' + esc(f.foodPreferences) + '</textarea></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Feeding Route</h4>';
        html += '<div class="form-group" style="margin-bottom:16px"><select class="form-select" id="erDietRoute">';
        ['Oral Feeding', 'Nasogastric Tube (NGT) Feeding', 'Gastrostomy Tube (G-tube) Feeding', 'Total Parenteral Nutrition (TPN)'].forEach(function(r) { html += '<option value="' + esc(r) + '"' + (f.feedingRoute === r ? ' selected' : '') + '>' + esc(r) + '</option>'; });
        html += '</select></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Meal Frequency</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><select class="form-select" id="erDietMealFreq">';
        ['3 Main Meals + 2 Snacks', '3 Main Meals', '6 Small Frequent Meals', 'Custom'].forEach(function(mf) { html += '<option value="' + esc(mf) + '"' + (f.mealFrequency === mf ? ' selected' : '') + '>' + esc(mf) + '</option>'; });
        html += '</select></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Fluid Restriction</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><select class="form-select" id="erDietFluidRestrict">';
        [{ v: 'none', l: 'No fluid restriction' }, { v: 'restricted', l: 'Fluid restricted (specify mL/day)' }, { v: 'encourage', l: 'Free fluids (encourage)' }].forEach(function(fr) { html += '<option value="' + fr.v + '"' + (f.fluidRestriction === fr.v ? ' selected' : '') + '>' + fr.l + '</option>'; });
        html += '</select></div>';
        if (f.fluidRestriction === 'restricted') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Fluid Limit (mL/day)</label><input type="number" class="form-control" id="erDietFluidAmount" value="' + esc(f.fluidRestrictAmount) + '" placeholder="1500"></div>';
        }
        html += '<hr style="border-color:var(--color-border);margin:16px 0">';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">';
        html += '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Start</label><select class="form-select" id="erDietStart"><option value="next_meal"' + (f.startTime === 'next_meal' ? ' selected' : '') + '>Next Meal</option><option value="scheduled"' + (f.startTime === 'scheduled' ? ' selected' : '') + '>Scheduled</option></select></div>';
        html += '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration</label><select class="form-select" id="erDietDuration"><option value="until_further"' + (f.duration === 'until_further' ? ' selected' : '') + '>Until further orders</option><option value="days"' + (f.duration === 'days' ? ' selected' : '') + '>For specified days</option></select></div>';
        html += '</div>';
        if (f.duration === 'days') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Number of Days</label><input type="number" class="form-control" id="erDietDays" value="' + esc(f.durationDays) + '" placeholder="3"></div>';
        }
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Special Instructions</label><textarea class="form-control" id="erDietSpecialInst" rows="2" placeholder="e.g. Patient may need assistance with meals">' + esc(f.specialInstructions) + '</textarea></div>';
        html += '<button class="btn-primary" id="btnAddERDietOrder"><i data-lucide="plus" style="width:14px;height:14px"></i> Add to Order List</button>';
        if (erDietOrdersList.length > 0) {
            html += '<div style="margin-top:16px;border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Diet Type</th><th style="font-size:12px">Route</th><th style="font-size:12px">Frequency</th><th style="font-size:12px">Restrictions</th><th style="width:40px"></th></tr></thead><tbody>';
            erDietOrdersList.forEach(function(d, i) {
                var rest = d.restrictions && d.restrictions.length > 0 ? d.restrictions.join(', ') : 'None';
                html += '<tr><td>' + (i + 1) + '</td><td style="font-size:13px;font-weight:500">' + esc(d.dietType || '') + '</td><td style="font-size:12px">' + esc(d.feedingRoute || 'Oral') + '</td><td style="font-size:12px">' + esc(d.mealFrequency || '') + '</td><td style="font-size:11px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(rest) + '">' + esc(rest) + '</td><td><button class="btn-ghost er-remove-diet" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderERNursingSection() {
        var f = erNursingForm;
        var orderTypes = ['Vital Signs Monitoring', 'Intake/Output Monitoring', 'Wound Care', 'Position Changes/Turning', 'Oxygen Therapy', 'Nebulization', 'Catheter Care', 'IV Line Care', 'Other'];
        var allVitals = ['Blood Pressure', 'Heart Rate/Pulse', 'Respiratory Rate', 'Temperature', 'Oxygen Saturation (SpO2)', 'Blood Glucose', 'Pain Score', 'GCS (Glasgow Coma Scale)'];
        var frequencies = [{ v: 'Continuous', l: 'Continuous (Cardiac monitor)' }, { v: 'Q15min', l: 'Q15 min (Every 15 minutes)' }, { v: 'Q30min', l: 'Q30 min (Every 30 minutes)' }, { v: 'Q1H', l: 'Q1H (Hourly)' }, { v: 'Q2H', l: 'Q2H (Every 2 hours)' }, { v: 'Q4H', l: 'Q4H (Every 4 hours)' }, { v: 'Q6H', l: 'Q6H (Every 6 hours)' }, { v: 'Q8H', l: 'Q8H (Every 8 hours)' }, { v: 'Daily', l: 'Daily' }, { v: 'Custom', l: 'Custom' }];
        var html = '';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Order Type <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="erNursingType"><option value="">-- Select --</option>';
        orderTypes.forEach(function(ot) { html += '<option value="' + esc(ot) + '"' + (f.orderType === ot ? ' selected' : '') + '>' + esc(ot) + '</option>'; });
        html += '</select></div>';
        if (f.orderType === 'Other') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Specify Order Type</label><input type="text" class="form-control" id="erNursingOther" value="' + esc(f.otherType || '') + '" placeholder="Specify nursing order type"></div>';
        }
        if (f.orderType === 'Vital Signs Monitoring' || f.orderType === '') {
            html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Vital Signs to Monitor</h4>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
            allVitals.forEach(function(v) {
                var checked = f.vitals && f.vitals.indexOf(v) > -1 ? ' checked' : '';
                html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" class="er-nursing-vital" value="' + esc(v) + '"' + checked + '> ' + esc(v) + '</label>';
            });
            html += '</div>';
        }
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Frequency <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="erNursingFreq">';
        frequencies.forEach(function(fr) { html += '<option value="' + esc(fr.v) + '"' + (f.frequency === fr.v ? ' selected' : '') + '>' + esc(fr.l) + '</option>'; });
        html += '</select></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration</label><select class="form-select" id="erNursingDuration"><option value="until_further"' + (f.duration === 'until_further' ? ' selected' : '') + '>Until further orders</option><option value="specified"' + (f.duration === 'specified' ? ' selected' : '') + '>For specified hours/days</option></select></div>';
        if (f.duration === 'specified') {
            html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Duration (hours/days)</label><input type="text" class="form-control" id="erNursingDurationVal" value="' + esc(f.durationHours) + '" placeholder="e.g. 24 hours"></div>';
        }
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Alert Parameters <span style="font-weight:400;font-size:12px;color:var(--color-muted-foreground)">(Notify doctor if:)</span></h4>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;font-size:12px">';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">BP:</span>< <input type="text" class="form-control" id="erAlertBPLow" value="' + esc(f.alertBPLow) + '" style="width:70px;font-size:12px;padding:4px 6px"> or > <input type="text" class="form-control" id="erAlertBPHigh" value="' + esc(f.alertBPHigh) + '" style="width:70px;font-size:12px;padding:4px 6px"> mmHg</div>';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">HR:</span>< <input type="text" class="form-control" id="erAlertHRLow" value="' + esc(f.alertHRLow) + '" style="width:50px;font-size:12px;padding:4px 6px"> or > <input type="text" class="form-control" id="erAlertHRHigh" value="' + esc(f.alertHRHigh) + '" style="width:50px;font-size:12px;padding:4px 6px"> bpm</div>';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">RR:</span>< <input type="text" class="form-control" id="erAlertRRLow" value="' + esc(f.alertRRLow) + '" style="width:50px;font-size:12px;padding:4px 6px"> or > <input type="text" class="form-control" id="erAlertRRHigh" value="' + esc(f.alertRRHigh) + '" style="width:50px;font-size:12px;padding:4px 6px"> /min</div>';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">Temp:</span>< <input type="text" class="form-control" id="erAlertTempLow" value="' + esc(f.alertTempLow) + '" style="width:50px;font-size:12px;padding:4px 6px"> or > <input type="text" class="form-control" id="erAlertTempHigh" value="' + esc(f.alertTempHigh) + '" style="width:50px;font-size:12px;padding:4px 6px"> C</div>';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="min-width:40px;font-weight:500">SpO2:</span>< <input type="text" class="form-control" id="erAlertSpO2" value="' + esc(f.alertSpO2) + '" style="width:50px;font-size:12px;padding:4px 6px"> %</div>';
        html += '</div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Special Instructions</label><textarea class="form-control" id="erNursingSpecialInst" rows="2" placeholder="e.g. Call if BP drops below 90 systolic">' + esc(f.specialInstructions) + '</textarea></div>';
        html += '<button class="btn-primary" id="btnAddERNursingOrder"><i data-lucide="plus" style="width:14px;height:14px"></i> Add to Order List</button>';
        if (erNursingOrdersList.length > 0) {
            html += '<div style="margin-top:16px;border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Order Type</th><th style="font-size:12px">Frequency</th><th style="font-size:12px">Duration</th><th style="width:40px"></th></tr></thead><tbody>';
            erNursingOrdersList.forEach(function(n, i) {
                html += '<tr><td>' + (i + 1) + '</td><td style="font-size:13px;font-weight:500">' + esc(n.orderType || '') + '</td><td style="font-size:12px">' + esc(n.frequency || '') + '</td><td style="font-size:12px">' + esc(n.duration === 'until_further' ? 'Until further orders' : n.durationHours || '') + '</td><td><button class="btn-ghost er-remove-nursing" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderERProcedureSection() {
        var f = erProcForm;
        var procedures = ['Wound Debridement', 'Chest Tube Insertion', 'Central Line Insertion', 'Lumbar Puncture', 'Pleural Tap', 'Ascitic Tap', 'Urinary Catheterization', 'Nasogastric Tube Insertion', 'Arterial Line Insertion', 'Endotracheal Intubation', 'Other'];
        var html = '';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Procedure <span style="color:var(--color-destructive)">*</span></label><select class="form-select" id="erProcProcedure"><option value="">-- Select --</option>';
        procedures.forEach(function(p) { html += '<option value="' + esc(p) + '"' + (f.procedure === p ? ' selected' : '') + '>' + esc(p) + '</option>'; });
        html += '</select></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Clinical Indication</h4>';
        html += '<div class="form-group" style="margin-bottom:12px"><label style="font-size:12px;color:var(--color-muted-foreground)">Indication <span style="color:var(--color-destructive)">*</span></label><textarea class="form-control" id="erProcIndication" rows="2" placeholder="e.g. Respiratory failure, unable to maintain airway">' + esc(f.indication) + '</textarea></div>';
        html += '<div class="form-group" style="margin-bottom:16px"><label style="font-size:12px;color:var(--color-muted-foreground)">Diagnosis</label><input type="text" class="form-control" id="erProcDiagnosis" value="' + esc(f.diagnosis) + '" placeholder="e.g. Acute Respiratory Distress Syndrome"></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Scheduling</h4>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
        html += '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Priority</label><select class="form-select" id="erProcPriority">';
        [{ v: 'Emergency', l: 'Emergency (STAT)' }, { v: 'Urgent', l: 'Urgent' }, { v: 'Elective', l: 'Elective / Scheduled' }].forEach(function(p) { html += '<option value="' + p.v + '"' + (f.priority === p.v ? ' selected' : '') + '>' + p.l + '</option>'; });
        html += '</select></div>';
        html += '<div class="form-group"><label style="font-size:12px;color:var(--color-muted-foreground)">Location</label><select class="form-select" id="erProcLocation">';
        ['Bedside', 'Procedure Room', 'Operating Theater', 'ICU'].forEach(function(loc) { html += '<option value="' + esc(loc) + '"' + (f.location === loc ? ' selected' : '') + '>' + esc(loc) + '</option>'; });
        html += '</select></div></div>';
        html += '<hr style="border-color:var(--color-border);margin:16px 0"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Consent</h4>';
        html += '<label style="font-size:12px;display:flex;align-items:center;gap:8px;margin-bottom:12px"><input type="checkbox" id="erProcConsent"' + (f.consentObtained ? ' checked' : '') + '> Informed consent obtained</label>';
        if (f.consentObtained) {
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
            html += '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground)">Signed by</label><select class="form-select" id="erProcConsentBy" style="font-size:12px"><option value="Patient"' + (f.consentBy === 'Patient' ? ' selected' : '') + '>Patient</option><option value="Guardian"' + (f.consentBy === 'Guardian' ? ' selected' : '') + '>Guardian</option></select></div>';
            html += '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground)">Date/Time</label><input type="datetime-local" class="form-control" id="erProcConsentDate" value="' + esc(f.consentDate) + '" style="font-size:12px"></div>';
            html += '<div class="form-group"><label style="font-size:11px;color:var(--color-muted-foreground)">Witness</label><input type="text" class="form-control" id="erProcConsentWitness" value="' + esc(f.consentWitness) + '" placeholder="e.g. Nurse Sara" style="font-size:12px"></div>';
            html += '</div>';
        }
        html += '<button class="btn-primary" id="btnAddERProcOrder" style="margin-top:16px"><i data-lucide="plus" style="width:14px;height:14px"></i> Add to Order List</button>';
        if (erProcedureOrdersList.length > 0) {
            html += '<div style="margin-top:16px;border-radius:8px;border:1px solid var(--color-border);overflow:hidden"><table class="data-table"><thead><tr><th style="font-size:12px">#</th><th style="font-size:12px">Procedure</th><th style="font-size:12px">Priority</th><th style="font-size:12px">Location</th><th style="font-size:12px">Consent</th><th style="width:40px"></th></tr></thead><tbody>';
            erProcedureOrdersList.forEach(function(pr, i) {
                var prioCls = pr.priority === 'Emergency' ? 'color:var(--color-destructive)' : pr.priority === 'Urgent' ? 'color:#F59E0B' : '';
                html += '<tr><td>' + (i + 1) + '</td><td style="font-size:13px;font-weight:500">' + esc(pr.procedure || '') + '</td><td><span style="font-size:11px;font-weight:600;text-transform:uppercase;' + prioCls + '">' + esc(pr.priority || '') + '</span></td><td style="font-size:12px">' + esc(pr.location || '') + '</td><td style="font-size:12px">' + (pr.consentObtained ? '<span style="color:var(--aqua-mint)">Yes</span>' : '<span style="color:var(--color-muted-foreground)">No</span>') + '</td><td><button class="btn-ghost er-remove-proc" data-idx="' + i + '"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--color-destructive)"></i></button></td></tr>';
            });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderEROrderSummarySection() {
        var allOrders = [];
        erPrescriptionsList.forEach(function(o) { allOrders.push({ type: 'Medication', icon: 'pill', detail: (o.medicine || 'Unnamed') + (o.dose ? ' ' + o.dose + ' ' + (o.unit || '') : '') + (o.route ? ' | ' + o.route : '') + (o.frequency ? ' | ' + o.frequency : ''), priority: 'Routine', status: o.orderId ? 'Saved' : 'Pending' }); });
        erInvestigationsList.forEach(function(o) { allOrders.push({ type: 'Investigation', icon: 'flask-conical', detail: (o.type || '') + ': ' + (o.test || 'Unnamed'), priority: o.priority || 'Routine', status: o.orderId ? 'Saved' : 'Pending' }); });
        erIVFluidsList.forEach(function(o) { allOrders.push({ type: 'IV Fluids', icon: 'droplets', detail: (o.fluidType || 'Unnamed') + ' ' + (o.volume ? o.volume + ' mL' : '') + (o.rate ? ' @ ' + o.rate + ' mL/hr' : ''), priority: 'Routine', status: o.orderId ? 'Saved' : 'Pending' }); });
        erDietOrdersList.forEach(function(o) { allOrders.push({ type: 'Diet', icon: 'utensils', detail: (o.dietType || 'Unnamed') + ' - ' + (o.feedingRoute || ''), priority: 'Routine', status: o.orderId ? 'Saved' : 'Pending' }); });
        erNursingOrdersList.forEach(function(o) { allOrders.push({ type: 'Nursing', icon: 'heart-pulse', detail: (o.orderType || 'Unnamed') + ' - ' + (o.frequency || ''), priority: 'Routine', status: o.orderId ? 'Saved' : 'Pending' }); });
        erProcedureOrdersList.forEach(function(o) { allOrders.push({ type: 'Procedure', icon: 'stethoscope', detail: (o.procedure || 'Unnamed') + (o.indication ? ' - ' + o.indication : ''), priority: o.priority || 'Routine', status: o.orderId ? 'Saved' : 'Pending' }); });
        if (allOrders.length === 0) {
            return '<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="clipboard-list" style="width:40px;height:40px;margin:0 auto 12px;display:block;opacity:0.3"></i><p style="font-weight:500">No orders yet</p><p style="font-size:13px">Switch to another tab to add clinical orders</p></div>';
        }
        var html = '';
        allOrders.forEach(function(o) {
            var statusCls = o.status === 'Saved' ? 'badge-success' : 'badge-outline';
            var prioStyle = o.priority === 'STAT' ? 'color:var(--color-destructive)' : o.priority === 'Urgent' ? 'color:#F59E0B' : 'color:var(--color-muted-foreground)';
            html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--color-border)">' +
                '<div style="display:flex;align-items:center;gap:8px"><i data-lucide="' + o.icon + '" style="width:14px;height:14px;color:var(--color-muted-foreground)"></i>' +
                '<div><span class="badge badge-outline" style="font-size:10px;margin-right:4px">' + esc(o.type) + '</span><span style="font-size:13px;font-weight:500">' + esc(o.detail) + '</span></div></div>' +
                '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:10px;font-weight:600;text-transform:uppercase;' + prioStyle + '">' + esc(o.priority) + '</span><span class="badge ' + statusCls + '" style="font-size:10px">' + esc(o.status) + '</span></div></div>';
        });
        return html;
    }

    function renderErCustomSection(sec) {
        var secKey = sec.id;
        var fields = sec.fields || [];
        var savedValues = (erCustomOrderData && erCustomOrderData[secKey]) ? erCustomOrderData[secKey] : {};
        if (fields.length === 0) {
            return '<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="layout-panel-left" style="width:40px;height:40px;margin:0 auto 12px;display:block;opacity:0.3"></i><p style="font-weight:500">No fields defined</p><p style="font-size:13px">Edit this section in ER Configuration to add fields.</p></div>';
        }
        var html = '<div style="display:flex;flex-direction:column;gap:16px" id="erCustomSectionForm" data-section-key="' + esc(secKey) + '">';
        fields.forEach(function(f) {
            var fid = 'erf_' + esc(f.id || f.label);
            var val = savedValues[f.id] !== undefined ? savedValues[f.id] : (savedValues[f.label] !== undefined ? savedValues[f.label] : '');
            var opts = Array.isArray(f.options) ? f.options : [];
            html += '<div class="form-group" style="margin:0">';
            html += '<label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;display:block">' + esc(f.label) + '</label>';
            if (f.type === 'text' || f.type === 'email' || f.type === 'password' || f.type === 'number') {
                html += '<input type="' + f.type + '" class="form-control er-custom-field" data-field-id="' + esc(f.id || f.label) + '" data-field-label="' + esc(f.label) + '" placeholder="Enter ' + esc(f.label.toLowerCase()) + '..." value="' + esc(String(val)) + '">';
            } else if (f.type === 'textarea') {
                html += '<textarea class="form-control er-custom-field" data-field-id="' + esc(f.id || f.label) + '" data-field-label="' + esc(f.label) + '" rows="3" placeholder="Enter ' + esc(f.label.toLowerCase()) + '...">' + esc(String(val)) + '</textarea>';
            } else if (f.type === 'date') {
                html += '<input type="date" class="form-control er-custom-field" data-field-id="' + esc(f.id || f.label) + '" data-field-label="' + esc(f.label) + '" value="' + esc(String(val)) + '">';
            } else if (f.type === 'time') {
                html += '<input type="time" class="form-control er-custom-field" data-field-id="' + esc(f.id || f.label) + '" data-field-label="' + esc(f.label) + '" value="' + esc(String(val)) + '">';
            } else if (f.type === 'dropdown') {
                html += '<select class="form-select er-custom-field" data-field-id="' + esc(f.id || f.label) + '" data-field-label="' + esc(f.label) + '">';
                html += '<option value="">-- Select --</option>';
                opts.forEach(function(o) { html += '<option value="' + esc(o) + '"' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; });
                html += '</select>';
            } else if (f.type === 'multi-select') {
                var selArr = Array.isArray(val) ? val : (val ? [val] : []);
                html += '<div class="er-custom-field-multisel" data-field-id="' + esc(f.id || f.label) + '" data-field-label="' + esc(f.label) + '" style="display:flex;flex-wrap:wrap;gap:8px">';
                opts.forEach(function(o) {
                    var checked = selArr.indexOf(o) > -1;
                    html += '<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;background:' + (checked ? 'rgba(127,255,212,0.15)' : 'var(--color-muted)') + ';border:1px solid ' + (checked ? 'var(--aquamint)' : 'var(--color-border)') + ';border-radius:6px;padding:5px 10px">' +
                        '<input type="checkbox" value="' + esc(o) + '"' + (checked ? ' checked' : '') + ' style="margin:0"> ' + esc(o) + '</label>';
                });
                html += '</div>';
            } else if (f.type === 'radio') {
                var radioArr = Array.isArray(val) ? val[0] : val;
                html += '<div style="display:flex;flex-wrap:wrap;gap:12px">';
                opts.forEach(function(o) {
                    html += '<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer">' +
                        '<input type="radio" name="' + fid + '" class="er-custom-field-radio" data-field-id="' + esc(f.id || f.label) + '" data-field-label="' + esc(f.label) + '" value="' + esc(o) + '"' + (radioArr === o ? ' checked' : '') + '> ' + esc(o) + '</label>';
                });
                html += '</div>';
            } else if (f.type === 'checkbox') {
                var chkArr = Array.isArray(val) ? val : (val ? [val] : []);
                html += '<div style="display:flex;flex-wrap:wrap;gap:12px">';
                opts.forEach(function(o) {
                    html += '<label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer">' +
                        '<input type="checkbox" class="er-custom-field-checkbox" data-field-id="' + esc(f.id || f.label) + '" data-field-label="' + esc(f.label) + '" value="' + esc(o) + '"' + (chkArr.indexOf(o) > -1 ? ' checked' : '') + '> ' + esc(o) + '</label>';
                });
                html += '</div>';
            }
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    function saveErCustomFormValues() {
        var $form = $('#erCustomSectionForm');
        if ($form.length === 0) return;
        var secKey = $form.data('section-key');
        if (!secKey) return;
        if (!erCustomOrderData) erCustomOrderData = {};
        var values = {};
        $form.find('.er-custom-field').each(function() {
            var fid   = $(this).data('field-id');
            var val   = $(this).val();
            values[fid] = val;
        });
        $form.find('.er-custom-field-radio:checked').each(function() {
            var fid = $(this).data('field-id');
            values[fid] = $(this).val();
        });
        var checkboxGroups = {};
        $form.find('.er-custom-field-checkbox').each(function() {
            var fid = $(this).data('field-id');
            if (!checkboxGroups[fid]) checkboxGroups[fid] = [];
            if ($(this).is(':checked')) checkboxGroups[fid].push($(this).val());
        });
        $.extend(values, checkboxGroups);
        var multiGroups = {};
        $form.find('.er-custom-field-multisel').each(function() {
            var fid = $(this).data('field-id');
            var selected = [];
            $(this).find('input[type=checkbox]:checked').each(function() { selected.push($(this).val()); });
            multiGroups[fid] = selected;
        });
        $.extend(values, multiGroups);
        erCustomOrderData[secKey] = values;
    }

    function bindEROrdersEvents() {
        $(document).off('click.erOrderSection').on('click.erOrderSection', '.er-order-section-btn', function() {
            saveErCustomFormValues();
            erOrderActiveSection = $(this).data('section');
            renderEROrdersSheet();
        });

        /* ── helpers (defined here, accessible by closures) ─────────── */
        function _erRxItemStr(v) { return typeof v === 'object' ? (v.name || v.label || '') : String(v); }
        function _erRxUnitFromStrength(s) {
            if (!s) return '';
            var sl = s.toLowerCase();
            if (sl.indexOf('iu')  > -1) return 'IU';
            if (sl.indexOf('mcg') > -1) return 'mcg';
            if (sl.indexOf('mg')  > -1) return 'mg';
            if (sl.indexOf('ml')  > -1) return 'ml';
            if (sl.indexOf('g')   > -1) return 'g';
            return '';
        }
        function _erRxMatchOption(items, keyword) {
            if (!keyword) return '';
            var kl   = keyword.toLowerCase();
            var strs = items.map(_erRxItemStr);
            for (var i = 0; i < strs.length; i++) { if (strs[i].toLowerCase() === kl) return strs[i]; }
            for (var i = 0; i < strs.length; i++) { if (strs[i].toLowerCase().indexOf(kl) === 0) return strs[i]; }
            for (var i = 0; i < strs.length; i++) { if (strs[i].toLowerCase().indexOf(kl) > -1) return strs[i]; }
            return '';
        }
        function _erRxBuildMedRow(m) {
            return '<button class="er-add-rx-med" type="button"' +
                ' data-med="'      + esc(m.label)    + '"' +
                ' data-med-id="'   + esc(m.id)       + '"' +
                ' data-strength="' + esc(m.strength) + '"' +
                ' data-form="'     + esc(m.form)     + '"' +
                ' style="display:flex;align-items:center;width:100%;padding:8px 12px;border:none;background:transparent;cursor:pointer;text-align:left;border-bottom:1px solid rgba(0,0,0,0.04)">' +
                '<div style="min-width:0;flex:1">' +
                    '<div style="font-size:13px;font-weight:600;color:var(--color-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
                        esc(m.name) +
                        (m.strength ? ' <span style="font-weight:400;color:var(--color-muted-foreground);font-size:12px">' + esc(m.strength) + '</span>' : '') +
                        (m.form     ? ' <span style="font-size:10px;color:var(--color-muted-foreground)">(' + esc(m.form) + ')</span>' : '') +
                    '</div>' +
                    (m.generic ? '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:1px">' + esc(m.generic) + '</div>' : '') +
                '</div>' +
            '</button>';
        }
        function _erRxShowDropdown() { $('#erRxMedChevron').css('transform', 'translateY(-50%) rotate(180deg)'); }
        function _erRxHideDropdown() { $('#erRxMedDropdown').hide(); $('#erRxMedChevron').css('transform', 'translateY(-50%) rotate(0deg)'); }
        function _erRxRefreshDropdown() {
            var query    = ($('#erRxMedInput').val() || '').toLowerCase();
            var filtered = query.length === 0
                ? erInventoryMedicines.slice(0, 20)
                : erInventoryMedicines.filter(function(m) {
                    return m.label.toLowerCase().indexOf(query) > -1 || (m.generic || '').toLowerCase().indexOf(query) > -1;
                }).slice(0, 15);
            if (filtered.length > 0) {
                var dh = '';
                filtered.forEach(function(m) { dh += _erRxBuildMedRow(m); });
                $('#erRxMedDropdown').html(dh).show();
                _erRxShowDropdown();
            } else {
                $('#erRxMedDropdown').html('<div style="padding:16px;text-align:center;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="search-x" style="width:20px;height:20px;margin:0 auto 6px;display:block;opacity:0.5"></i>No medicines found</div>').show();
                lucide.createIcons();
            }
        }

        /* ── Lab test (Investigation) helpers ───────────────────────── */
        function _erInvShowDropdown() { $('#erInvTestChevron').css('transform', 'translateY(-50%) rotate(180deg)'); }
        function _erInvHideDropdown() { $('#erInvTestDropdown').hide(); $('#erInvTestChevron').css('transform', 'translateY(-50%) rotate(0deg)'); }
        function _erInvBuildLabRow(t) {
            return '<button class="er-add-inv-test" type="button"' +
                ' data-test="'   + esc(t.test_name || '') + '"' +
                ' data-code="'   + esc(t.test_code || '') + '"' +
                ' data-price="'  + (t.standard_price || '') + '"' +
                ' data-dept="'   + esc(t.department || '') + '"' +
                ' data-sample="' + esc(t.sample_type || '') + '"' +
                ' style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 12px;border:none;background:transparent;cursor:pointer;text-align:left;border-bottom:1px solid rgba(0,0,0,0.04)">' +
                '<div style="min-width:0;flex:1">' +
                    '<div style="font-size:13px;font-weight:600;color:var(--color-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
                        esc(t.test_name || '') +
                        (t.short_name ? ' <span style="font-weight:400;font-size:11px;color:var(--color-muted-foreground)">(' + esc(t.short_name) + ')</span>' : '') +
                    '</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:1px">' +
                        esc(t.department || '') + (t.sample_type ? ' &middot; ' + esc(t.sample_type) : '') +
                    '</div>' +
                '</div>' +
                (t.standard_price ? '<div style="font-size:12px;font-weight:600;font-family:monospace;color:var(--aqua-mint);white-space:nowrap;margin-left:12px">PKR ' + Number(t.standard_price).toLocaleString() + '</div>' : '') +
            '</button>';
        }
        function _erInvSearchLab(q) {
            var url = '/api/test-master/search' + (q ? '?q=' + encodeURIComponent(q) : '');
            $('#erInvTestDropdown').html('<div style="padding:14px;text-align:center;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="loader-2" style="width:16px;height:16px;display:block;margin:0 auto 4px;opacity:0.6"></i>Searching...</div>').show();
            lucide.createIcons();
            _erInvShowDropdown();
            $.get(url, function(data) {
                var tests = data || [];
                if (!tests.length) {
                    $('#erInvTestDropdown').html('<div style="padding:16px;text-align:center;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="search-x" style="width:20px;height:20px;margin:0 auto 6px;display:block;opacity:0.5"></i>No tests found</div>');
                    lucide.createIcons();
                } else {
                    var dh = '';
                    tests.slice(0, 20).forEach(function(t) { dh += _erInvBuildLabRow(t); });
                    $('#erInvTestDropdown').html(dh);
                }
            }).fail(function() {
                $('#erInvTestDropdown').html('<div style="padding:12px;font-size:12px;color:var(--color-muted-foreground)">Failed to load tests</div>');
            });
        }

        /* ── Medicine dropdown events ────────────────────────────────── */
        $('#erRxMedInput').off('input focus click').on('input focus click', function() {
            erRxForm.medicine = $(this).val();
            if (!erMedicinesLoaded) {
                $('#erRxMedDropdown').html('<div style="padding:16px;text-align:center;font-size:12px;color:var(--color-muted-foreground)"><i data-lucide="loader-2" style="width:18px;height:18px;margin:0 auto 6px;display:block;opacity:0.6"></i>Loading medicines...</div>').show();
                lucide.createIcons();
                _erRxShowDropdown();
                loadErInventoryMedicines(function() { _erRxRefreshDropdown(); });
            } else {
                _erRxRefreshDropdown();
            }
        });

        $('#erRxMedInput').off('blur.erRxDrop').on('blur.erRxDrop', function() {
            setTimeout(_erRxHideDropdown, 80);
        });

        /* mousedown fires before blur — prevents focus loss during selection */
        $(document).off('mousedown.erAddRxMed').on('mousedown.erAddRxMed', '.er-add-rx-med', function(e) {
            e.preventDefault();
            var med      = $(this).data('med')      || '';
            var strength = $(this).data('strength') || '';
            var rawUnit  = _erRxUnitFromStrength(strength);
            var autoUnit = _erRxMatchOption(erPharmRxConfig.units, rawUnit);

            erRxForm.medicine   = med;
            erRxForm.medicineId = $(this).data('med-id') || '';
            erRxForm.strength   = strength;

            $('#erRxMedInput').val(med);
            $('#erRxStrength').val(strength);

            if (autoUnit) {
                $('#erRxUnit').val(autoUnit);
                erRxForm.unit = $('#erRxUnit').val() || erRxForm.unit;
            }
            _erRxHideDropdown();
        });

        $('#btnAddERRx').off('click').on('click', function() {
            var med = $('#erRxMedInput').val().trim();
            if (!med) { return; }
            erPrescriptionsList.push({
                medicine  : med,
                strength  : $('#erRxStrength').val().trim(),
                medicineId: erRxForm.medicineId || '',
                dose      : $('#erRxDose').val()      || '',
                unit      : $('#erRxUnit').val()      || 'mg',
                route     : $('#erRxRoute').val()     || 'Oral',
                frequency : $('#erRxFrequency').val() || 'OD',
                duration  : $('#erRxDuration').val()  || ''
            });
            var _eu2 = erPharmRxConfig.units[0]  || 'mg';
            var _er2 = erPharmRxConfig.routes[0] || 'Oral';
            var _ef2 = erPharmRxConfig.frequencies[0];
            var _efn2 = _ef2 ? (typeof _ef2 === 'object' ? _ef2.name : _ef2) : 'OD';
            erRxForm = { medicine: '', medicineId: '', strength: '', dose: '', unit: _eu2, route: _er2, frequency: _efn2, duration: '' };
            renderEROrdersSheet();
        });

        $(document).off('click.erRemoveRx').on('click.erRemoveRx', '.er-remove-rx', function() {
            var idx = $(this).data('idx');
            var rx = erPrescriptionsList[idx];
            if (rx && rx.orderId) { $.ajax({ url: '/api/er/clinical-orders/' + rx.orderId + '/discontinue', method: 'PATCH' }); }
            erPrescriptionsList.splice(idx, 1);
            renderEROrdersSheet();
        });

        /* ── Investigation test dropdown events ─────────────────────── */
        $('#erInvTestInput').off('input focus click').on('input focus click', function() {
            erInvForm.test = $(this).val();
            if ($('#erInvType').val() === 'Laboratory') {
                _erInvSearchLab(erInvForm.test);
            } else {
                _erInvHideDropdown();
            }
        });

        $('#erInvTestInput').off('blur.erInvDrop').on('blur.erInvDrop', function() {
            setTimeout(_erInvHideDropdown, 80);
        });

        $('#erInvType').off('change.erInvType').on('change.erInvType', function() {
            erInvForm.type = $(this).val();
            if ($(this).val() !== 'Laboratory') _erInvHideDropdown();
        });

        $(document).off('mousedown.erAddInvTest').on('mousedown.erAddInvTest', '.er-add-inv-test', function(e) {
            e.preventDefault();
            erInvForm.test     = $(this).data('test')   || '';
            erInvForm.testCode = $(this).data('code')   || '';
            erInvForm.price    = $(this).data('price')  || '';
            erInvForm.dept     = $(this).data('dept')   || '';
            erInvForm.sample   = $(this).data('sample') || '';
            $('#erInvTestInput').val(erInvForm.test);
            _erInvHideDropdown();
        });

        $('#btnAddERInv').off('click').on('click', function() {
            var test = $('#erInvTestInput').val().trim();
            if (!test) { return; }
            var invEntry = { type: $('#erInvType').val(), test: test, priority: $('#erInvPriority').val() };
            if ($('#erInvType').val() === 'Laboratory' && erInvForm.testCode) {
                invEntry.testCode   = erInvForm.testCode;
                invEntry.price      = erInvForm.price;
                invEntry.department = erInvForm.dept;
                invEntry.sampleType = erInvForm.sample;
            }
            erInvestigationsList.push(invEntry);
            erInvForm = { type: erInvForm.type, test: '', testCode: '', price: '', dept: '', sample: '', priority: erInvForm.priority };
            renderEROrdersSheet();
        });

        $(document).off('click.erRemoveInv').on('click.erRemoveInv', '.er-remove-inv', function() {
            var idx = $(this).data('idx');
            var inv = erInvestigationsList[idx];
            if (inv && inv.orderId) { $.ajax({ url: '/api/er/clinical-orders/' + inv.orderId + '/discontinue', method: 'PATCH' }); }
            erInvestigationsList.splice(idx, 1);
            renderEROrdersSheet();
        });

        $('#erIVFluidType').off('change').on('change', function() { erIVForm.fluidType = $(this).val(); renderEROrdersSheet(); });
        $('#erIVOtherFluid').off('input').on('input', function() { erIVForm.otherFluid = $(this).val(); });
        $('#erIVVolume').off('input').on('input', function() { erIVForm.volume = $(this).val(); });
        $(document).off('click.erIVQuickVol').on('click.erIVQuickVol', '.er-iv-quick-vol', function() { erIVForm.volume = $(this).data('vol'); renderEROrdersSheet(); });
        $('#erIVRateMethod').off('change').on('change', function() { erIVForm.rateMethod = $(this).val(); renderEROrdersSheet(); });
        $('#erIVRate').off('input').on('input', function() { erIVForm.rate = $(this).val(); });
        $(document).off('click.erIVQuickRate').on('click.erIVQuickRate', '.er-iv-quick-rate', function() { erIVForm.rate = $(this).data('rate'); renderEROrdersSheet(); });
        $('#btnAddERIVAdditive').off('click').on('click', function() { if (!erIVForm.additives) erIVForm.additives = []; erIVForm.additives.push({ drug: '', dose: '' }); renderEROrdersSheet(); });
        $(document).off('input.erIVAdditiveDrug').on('input.erIVAdditiveDrug', '.er-iv-additive-drug', function() { erIVForm.additives[$(this).data('idx')].drug = $(this).val(); });
        $(document).off('input.erIVAdditiveDose').on('input.erIVAdditiveDose', '.er-iv-additive-dose', function() { erIVForm.additives[$(this).data('idx')].dose = $(this).val(); });
        $(document).off('click.erIVRemoveAdditive').on('click.erIVRemoveAdditive', '.er-iv-remove-additive', function() { erIVForm.additives.splice($(this).data('idx'), 1); renderEROrdersSheet(); });
        $('#erIVAccess').off('change').on('change', function() { erIVForm.ivAccess = $(this).val(); });
        $('#erIVSite').off('input').on('input', function() { erIVForm.site = $(this).val(); });
        $('#erIVStartTime').off('change').on('change', function() { erIVForm.startTime = $(this).val(); });
        $('#erIVFrequency').off('change').on('change', function() { erIVForm.frequency = $(this).val(); });
        $('#erIVDailyGoal').off('input').on('input', function() { erIVForm.dailyFluidGoal = $(this).val(); });
        $('#erIVMonitorIO').off('change').on('change', function() { erIVForm.monitorIO = $(this).is(':checked'); });
        $('#erIVCheckSite').off('change').on('change', function() { erIVForm.checkSite = $(this).is(':checked'); });
        $('#erIVWatchOverload').off('change').on('change', function() { erIVForm.watchOverload = $(this).is(':checked'); });
        $('#erIVSpecialInst').off('input').on('input', function() { erIVForm.specialInstructions = $(this).val(); });
        $('#btnAddERIVFluid').off('click').on('click', function() {
            if (!erIVForm.fluidType) { return; }
            erIVFluidsList.push($.extend(true, {}, erIVForm));
            erIVForm = { fluidType: '', volume: '', rateMethod: 'rate', rate: '', additives: [], ivAccess: 'Peripheral IV (existing)', site: '', startTime: 'now', frequency: 'single', dailyFluidGoal: '', monitorIO: false, checkSite: false, watchOverload: false, specialInstructions: '', otherFluid: '' };
            renderEROrdersSheet();
        });
        $(document).off('click.erRemoveIV').on('click.erRemoveIV', '.er-remove-iv', function() {
            var idx = $(this).data('idx');
            var iv = erIVFluidsList[idx];
            if (iv && iv.orderId) { $.ajax({ url: '/api/er/clinical-orders/' + iv.orderId + '/discontinue', method: 'PATCH' }); }
            erIVFluidsList.splice(idx, 1);
            renderEROrdersSheet();
        });

        $('#erDietType').off('change').on('change', function() { erDietForm.dietType = $(this).val(); renderEROrdersSheet(); });
        $('#erDietOther').off('input').on('input', function() { erDietForm.otherDiet = $(this).val(); });
        $(document).off('change.erDietRestriction').on('change.erDietRestriction', '.er-diet-restriction', function() { erDietForm.restrictions = []; $('.er-diet-restriction:checked').each(function() { erDietForm.restrictions.push($(this).val()); }); });
        $('#erDietAllergies').off('input').on('input', function() { erDietForm.foodAllergies = $(this).val(); });
        $('#erDietPreferences').off('input').on('input', function() { erDietForm.foodPreferences = $(this).val(); });
        $('#erDietRoute').off('change').on('change', function() { erDietForm.feedingRoute = $(this).val(); });
        $('#erDietMealFreq').off('change').on('change', function() { erDietForm.mealFrequency = $(this).val(); });
        $('#erDietFluidRestrict').off('change').on('change', function() { erDietForm.fluidRestriction = $(this).val(); renderEROrdersSheet(); });
        $('#erDietFluidAmount').off('input').on('input', function() { erDietForm.fluidRestrictAmount = $(this).val(); });
        $('#erDietStart').off('change').on('change', function() { erDietForm.startTime = $(this).val(); });
        $('#erDietDuration').off('change').on('change', function() { erDietForm.duration = $(this).val(); renderEROrdersSheet(); });
        $('#erDietDays').off('input').on('input', function() { erDietForm.durationDays = $(this).val(); });
        $('#erDietSpecialInst').off('input').on('input', function() { erDietForm.specialInstructions = $(this).val(); });
        $('#btnAddERDietOrder').off('click').on('click', function() {
            if (!erDietForm.dietType) { return; }
            erDietOrdersList.push($.extend(true, {}, erDietForm, { restrictions: erDietForm.restrictions.slice() }));
            erDietForm = { dietType: '', otherDiet: '', restrictions: [], foodAllergies: '', foodPreferences: '', feedingRoute: 'Oral Feeding', mealFrequency: '3 Main Meals + 2 Snacks', fluidRestriction: 'none', fluidRestrictAmount: '', startTime: 'next_meal', duration: 'until_further', durationDays: '', specialInstructions: '' };
            renderEROrdersSheet();
        });
        $(document).off('click.erRemoveDiet').on('click.erRemoveDiet', '.er-remove-diet', function() {
            var idx = $(this).data('idx');
            var d = erDietOrdersList[idx];
            if (d && d.orderId) { $.ajax({ url: '/api/er/clinical-orders/' + d.orderId + '/discontinue', method: 'PATCH' }); }
            erDietOrdersList.splice(idx, 1);
            renderEROrdersSheet();
        });

        $('#erNursingType').off('change').on('change', function() { erNursingForm.orderType = $(this).val(); renderEROrdersSheet(); });
        $('#erNursingOther').off('input').on('input', function() { erNursingForm.otherType = $(this).val(); });
        $(document).off('change.erNursingVital').on('change.erNursingVital', '.er-nursing-vital', function() { erNursingForm.vitals = []; $('.er-nursing-vital:checked').each(function() { erNursingForm.vitals.push($(this).val()); }); });
        $('#erNursingFreq').off('change').on('change', function() { erNursingForm.frequency = $(this).val(); });
        $('#erNursingDuration').off('change').on('change', function() { erNursingForm.duration = $(this).val(); renderEROrdersSheet(); });
        $('#erNursingDurationVal').off('input').on('input', function() { erNursingForm.durationHours = $(this).val(); });
        $('#erAlertBPLow').off('input').on('input', function() { erNursingForm.alertBPLow = $(this).val(); });
        $('#erAlertBPHigh').off('input').on('input', function() { erNursingForm.alertBPHigh = $(this).val(); });
        $('#erAlertHRLow').off('input').on('input', function() { erNursingForm.alertHRLow = $(this).val(); });
        $('#erAlertHRHigh').off('input').on('input', function() { erNursingForm.alertHRHigh = $(this).val(); });
        $('#erAlertRRLow').off('input').on('input', function() { erNursingForm.alertRRLow = $(this).val(); });
        $('#erAlertRRHigh').off('input').on('input', function() { erNursingForm.alertRRHigh = $(this).val(); });
        $('#erAlertTempLow').off('input').on('input', function() { erNursingForm.alertTempLow = $(this).val(); });
        $('#erAlertTempHigh').off('input').on('input', function() { erNursingForm.alertTempHigh = $(this).val(); });
        $('#erAlertSpO2').off('input').on('input', function() { erNursingForm.alertSpO2 = $(this).val(); });
        $('#erNursingSpecialInst').off('input').on('input', function() { erNursingForm.specialInstructions = $(this).val(); });
        $('#btnAddERNursingOrder').off('click').on('click', function() {
            if (!$('#erNursingType').val()) { return; }
            erNursingOrdersList.push($.extend({}, erNursingForm, { vitals: erNursingForm.vitals.slice() }));
            erNursingForm = { orderType: '', vitals: ['Blood Pressure', 'Heart Rate/Pulse', 'Respiratory Rate', 'Temperature', 'Oxygen Saturation (SpO2)'], frequency: 'Q4H', duration: 'until_further', durationHours: '', alertBPLow: '90/60', alertBPHigh: '180/100', alertHRLow: '50', alertHRHigh: '120', alertRRLow: '12', alertRRHigh: '24', alertTempLow: '35.5', alertTempHigh: '38.5', alertSpO2: '90', specialInstructions: '', otherType: '' };
            renderEROrdersSheet();
        });
        $(document).off('click.erRemoveNursing').on('click.erRemoveNursing', '.er-remove-nursing', function() {
            var idx = $(this).data('idx');
            var n = erNursingOrdersList[idx];
            if (n && n.orderId) { $.ajax({ url: '/api/er/clinical-orders/' + n.orderId + '/discontinue', method: 'PATCH' }); }
            erNursingOrdersList.splice(idx, 1);
            renderEROrdersSheet();
        });

        $('#erProcProcedure').off('change').on('change', function() { erProcForm.procedure = $(this).val(); });
        $('#erProcIndication').off('input').on('input', function() { erProcForm.indication = $(this).val(); });
        $('#erProcDiagnosis').off('input').on('input', function() { erProcForm.diagnosis = $(this).val(); });
        $('#erProcPriority').off('change').on('change', function() { erProcForm.priority = $(this).val(); });
        $('#erProcLocation').off('change').on('change', function() { erProcForm.location = $(this).val(); });
        $('#erProcConsent').off('change').on('change', function() { erProcForm.consentObtained = $(this).is(':checked'); renderEROrdersSheet(); });
        $('#erProcConsentBy').off('change').on('change', function() { erProcForm.consentBy = $(this).val(); });
        $('#erProcConsentDate').off('change').on('change', function() { erProcForm.consentDate = $(this).val(); });
        $('#erProcConsentWitness').off('input').on('input', function() { erProcForm.consentWitness = $(this).val(); });
        $('#btnAddERProcOrder').off('click').on('click', function() {
            if (!$('#erProcProcedure').val()) { return; }
            if (!$('#erProcIndication').val().trim()) { return; }
            erProcedureOrdersList.push($.extend({}, erProcForm, { preProc: erProcForm.preProc.slice() }));
            erProcForm = { procedure: '', indication: '', diagnosis: '', priority: 'Emergency', location: 'Bedside', consentObtained: false, consentBy: '', consentDate: '', consentWitness: '', preProc: [], specialInstructions: '', estimatedDuration: '', estimatedCost: '' };
            renderEROrdersSheet();
        });
        $(document).off('click.erRemoveProc').on('click.erRemoveProc', '.er-remove-proc', function() {
            var idx = $(this).data('idx');
            var pr = erProcedureOrdersList[idx];
            if (pr && pr.orderId) { $.ajax({ url: '/api/er/clinical-orders/' + pr.orderId + '/discontinue', method: 'PATCH' }); }
            erProcedureOrdersList.splice(idx, 1);
            renderEROrdersSheet();
        });

        $(document).off('click.erDiscontinue').on('click.erDiscontinue', '.er-discontinue-order', function() {
            var orderId = $(this).data('order-id');
            $.ajax({ url: '/api/er/clinical-orders/' + orderId + '/discontinue', method: 'PATCH' }).done(function() {
                openEROrdersDetail(selectedEROrderVisit);
            }).fail(function() {});
        });

        $('#btnSaveEROrders').off('click').on('click', function() {
            var visit = visits.find(function(v) { return v.visitId === selectedEROrderVisit; });
            if (!visit) return;

            saveErCustomFormValues();

            var newMeds    = erPrescriptionsList.filter(function(rx)  { return !rx.orderId; });
            var newInvs    = erInvestigationsList.filter(function(inv) { return !inv.orderId; });
            var newIVs     = erIVFluidsList.filter(function(iv)        { return !iv.orderId; });
            var newDiets   = erDietOrdersList.filter(function(d)       { return !d.orderId; });
            var newNursing = erNursingOrdersList.filter(function(n)    { return !n.orderId; });
            var newProcs   = erProcedureOrdersList.filter(function(p)  { return !p.orderId; });
            var hasCustomData = erCustomOrderData && Object.keys(erCustomOrderData).length > 0;

            if (!newMeds.length && !newInvs.length && !newIVs.length && !newDiets.length && !newNursing.length && !newProcs.length && !hasCustomData) {
                return; /* nothing to save — silently ignore */
            }

            showEROrdersConfirmModal({
                patientName: visit.patientName || '—',
                mrn:         visit.mrn         || '—',
                visitId:     visit.visitId     || '—',
                doctorName:  visit.doctorName  || '—',
                newMeds:     newMeds.length,
                newInvs:     newInvs.length,
                newIVs:      newIVs.length,
                newDiets:    newDiets.length,
                newNursing:  newNursing.length,
                newProcs:    newProcs.length,
                onConfirm: function($cb) {
                    var requests = [];
                    newMeds.forEach(function(rx) {
                        requests.push($.ajax({ url: '/api/er/clinical-orders', method: 'POST', contentType: 'application/json', data: JSON.stringify({ mrn: visit.mrn, admissionId: visit.visitId, type: 'Medication', priority: 'Routine', details: rx.medicine + ' ' + rx.dose + rx.unit + ' - ' + rx.route + ' - ' + rx.frequency, orderedBy: visit.doctorName || '', department: 'ER', metadata: { medicineId: rx.medicineId || '', medicine: rx.medicine, dose: rx.dose, unit: rx.unit, route: rx.route, frequency: rx.frequency, duration: rx.duration } }) }));
                    });
                    newInvs.forEach(function(inv) {
                        requests.push($.ajax({ url: '/api/er/clinical-orders', method: 'POST', contentType: 'application/json', data: JSON.stringify({ mrn: visit.mrn, admissionId: visit.visitId, type: 'Investigation', priority: inv.priority, details: inv.type + ': ' + inv.test, orderedBy: visit.doctorName || '', metadata: { investigationType: inv.type, test: inv.test } }) }));
                    });
                    newIVs.forEach(function(iv) {
                        requests.push($.ajax({ url: '/api/er/clinical-orders', method: 'POST', contentType: 'application/json', data: JSON.stringify({ mrn: visit.mrn, admissionId: visit.visitId, type: 'IV Fluids', priority: 'Routine', details: iv.fluidType + ' ' + iv.volume + 'mL @ ' + iv.rate + ' mL/hr', orderedBy: visit.doctorName || '', metadata: iv }) }));
                    });
                    newDiets.forEach(function(d) {
                        requests.push($.ajax({ url: '/api/er/clinical-orders', method: 'POST', contentType: 'application/json', data: JSON.stringify({ mrn: visit.mrn, admissionId: visit.visitId, type: 'Diet', priority: 'Routine', details: d.dietType + ' - ' + d.feedingRoute, orderedBy: visit.doctorName || '', metadata: d }) }));
                    });
                    newNursing.forEach(function(n) {
                        requests.push($.ajax({ url: '/api/er/clinical-orders', method: 'POST', contentType: 'application/json', data: JSON.stringify({ mrn: visit.mrn, admissionId: visit.visitId, type: 'Nursing', priority: 'Routine', details: n.orderType + ' - ' + n.frequency, orderedBy: visit.doctorName || '', metadata: n }) }));
                    });
                    newProcs.forEach(function(p) {
                        requests.push($.ajax({ url: '/api/er/clinical-orders', method: 'POST', contentType: 'application/json', data: JSON.stringify({ mrn: visit.mrn, admissionId: visit.visitId, type: 'Procedure', priority: p.priority === 'Emergency' ? 'STAT' : (p.priority === 'Urgent' ? 'Urgent' : 'Routine'), details: p.procedure + ' - ' + p.indication, orderedBy: visit.doctorName || '', metadata: p }) }));
                    });
                    if (hasCustomData) {
                        requests.push($.ajax({
                            url: '/api/er/visits/' + visit.visitId + '/custom-order-data',
                            method: 'PATCH',
                            contentType: 'application/json',
                            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
                            data: JSON.stringify({ customOrderData: erCustomOrderData })
                        }));
                    }
                    var totalSaved = newMeds.length + newInvs.length + newIVs.length + newDiets.length + newNursing.length + newProcs.length;
                    $.when.apply($, requests).done(function() {
                        openEROrdersDetail(selectedEROrderVisit);
                        showEROrdersSuccessModal({
                            patientName: visit.patientName || '—',
                            visitId:     visit.visitId     || '—',
                            totalSaved:  totalSaved
                        });
                    }).fail(function(xhr) {
                        if ($cb) $cb.prop('disabled', false).html('<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Save');
                        lucide.createIcons();
                        HMS.ajaxError(xhr, 'Failed to save orders');
                    });
                }
            });
        });
    }

    // ── ER Save Orders confirm modal ─────────────────────────────────────────────
    function showEROrdersConfirmModal(info) {
        $('#erOrdersConfirmModal').remove();

        function _row(label, value, border) {
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;' + (border ? 'border-bottom:1px solid rgba(0,0,0,0.06)' : '') + '">' +
                '<span style="font-size:12.5px;color:#6C757D">' + label + '</span>' +
                '<span style="font-size:13px;font-weight:600;color:#2C3E50">' + value + '</span>' +
                '</div>';
        }

        /* order summary rows — only show categories that have new items */
        var summaryHtml = '';
        var hasAny = false;
        if (info.newMeds > 0)     { summaryHtml += _row('Medications',       info.newMeds    + ' new order(s)', true);  hasAny = true; }
        if (info.newInvs > 0)     { summaryHtml += _row('Investigations',    info.newInvs    + ' new order(s)', true);  hasAny = true; }
        if (info.newIVs > 0)      { summaryHtml += _row('IV Fluids',         info.newIVs     + ' new order(s)', true);  hasAny = true; }
        if (info.newDiets > 0)    { summaryHtml += _row('Diet Orders',       info.newDiets   + ' new order(s)', true);  hasAny = true; }
        if (info.newNursing > 0)  { summaryHtml += _row('Nursing Orders',    info.newNursing + ' new order(s)', true);  hasAny = true; }
        if (info.newProcs > 0)    { summaryHtml += _row('Procedures',        info.newProcs   + ' new order(s)', false); hasAny = true; }
        if (!hasAny) summaryHtml = '<p style="font-size:12px;color:#6C757D;margin:8px 0">No new orders to save.</p>';

        var html =
            '<div class="modal fade" id="erOrdersConfirmModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:480px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* header */
            '<div style="background:#060740;padding:20px 24px;display:flex;align-items:center;gap:14px">' +
            '<div style="width:44px;height:44px;border-radius:50%;background:rgba(127,255,212,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<i data-lucide="clipboard-list" style="width:22px;height:22px;color:#7FFFD4"></i></div>' +
            '<div><h5 style="margin:0;font-size:17px;font-weight:700;color:#fff">Save Clinical Orders</h5>' +
            '<p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.6)">Please review before confirming</p></div></div>' +

            /* body */
            '<div style="padding:20px 24px">' +
            /* patient block */
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            _row('Patient', esc(info.patientName), true) +
            _row('MRN',     '<span style="font-family:monospace">' + esc(info.mrn) + '</span>', true) +
            _row('Visit',   '<span style="font-family:monospace">' + esc(info.visitId) + '</span>', true) +
            _row('Doctor',  esc(info.doctorName), false) +
            '</div>' +
            /* orders summary block */
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:6px">' +
            '<div style="font-size:11px;font-weight:700;color:#6C757D;text-transform:uppercase;letter-spacing:.05em;padding:10px 0 4px">New Orders to be Saved</div>' +
            summaryHtml +
            '</div>' +
            '</div>' +

            /* footer */
            '<div style="padding:14px 24px 20px;display:flex;gap:10px;justify-content:flex-end">' +
            '<button id="btnEROrdersCancel" style="height:40px;padding:0 20px;border:1px solid #DEE2E6;border-radius:8px;background:#fff;font-size:13.5px;font-weight:600;color:#6C757D;cursor:pointer">Cancel</button>' +
            '<button id="btnEROrdersConfirmSave" style="height:40px;padding:0 22px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px">' +
            '<i data-lucide="check-circle" style="width:16px;height:16px"></i> Confirm & Save</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('erOrdersConfirmModal'), { backdrop: 'static' });
        modal.show();

        $('#btnEROrdersCancel').on('click', function() { modal.hide(); });

        var $pendingOrderBtn = null;

        $('#btnEROrdersConfirmSave').off('click').on('click', function() {
            $pendingOrderBtn = $(this);
            $pendingOrderBtn.prop('disabled', true).html('<i data-lucide="loader-2" style="width:15px;height:15px"></i> Saving...');
            lucide.createIcons();
            modal.hide();
        });

        document.getElementById('erOrdersConfirmModal').addEventListener('hidden.bs.modal', function() {
            if ($pendingOrderBtn) {
                info.onConfirm($pendingOrderBtn);
                $pendingOrderBtn = null;
            }
            $('#erOrdersConfirmModal').remove();
        });
    }

    // ── ER Save Orders success modal ─────────────────────────────────────────────
    function showEROrdersSuccessModal(info) {
        $('#erOrdersSuccessModal').remove();

        var html =
            '<div class="modal fade" id="erOrdersSuccessModal" tabindex="-1" style="z-index:9999">' +
            '<div class="modal-dialog modal-dialog-centered" style="max-width:420px">' +
            '<div class="modal-content" style="border:none;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25)">' +

            /* banner */
            '<div style="background:linear-gradient(135deg,#060740 0%,#1a1b7a 100%);padding:36px 24px;text-align:center">' +
            '<div style="width:68px;height:68px;border-radius:50%;background:#7FFFD4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 4px 20px rgba(127,255,212,0.4)">' +
            '<i data-lucide="check" style="width:36px;height:36px;color:#060740"></i></div>' +
            '<h4 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px">Orders Saved!</h4>' +
            '<p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0">Clinical orders have been recorded successfully</p>' +
            '</div>' +

            /* details */
            '<div style="padding:20px 24px">' +
            '<div style="background:#F8F9FA;border-radius:10px;padding:4px 16px;margin-bottom:14px">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(0,0,0,0.06)">' +
            '<span style="font-size:12.5px;color:#6C757D">Patient</span><span style="font-size:13px;font-weight:600;color:#2C3E50">' + esc(info.patientName) + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(0,0,0,0.06)">' +
            '<span style="font-size:12.5px;color:#6C757D">Visit</span><span style="font-size:13px;font-weight:600;font-family:monospace;color:#060740">' + esc(info.visitId) + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0">' +
            '<span style="font-size:12.5px;color:#6C757D">Total Orders Saved</span><span style="font-size:15px;font-weight:700;color:#060740">' + info.totalSaved + '</span></div>' +
            '</div>' +
            '</div>' +

            /* footer */
            '<div style="padding:0 24px 20px;display:flex;justify-content:flex-end">' +
            '<button id="btnEROrdersCloseSuccess" style="height:40px;padding:0 28px;border:none;border-radius:8px;background:#060740;color:#7FFFD4;font-size:13.5px;font-weight:700;cursor:pointer">Close</button>' +
            '</div>' +

            '</div></div></div>';

        $('body').append(html);
        lucide.createIcons();
        var modal = new bootstrap.Modal(document.getElementById('erOrdersSuccessModal'));
        modal.show();
        $('#btnEROrdersCloseSuccess').on('click', function() { modal.hide(); });
        document.getElementById('erOrdersSuccessModal').addEventListener('hidden.bs.modal', function() {
            $('#erOrdersSuccessModal').remove();
        });
    }

    // ===== MARK PAID =====
    window.erMarkPaid = function(billId) {
        $.ajax({
            url: '/api/billing/mark-paid',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ billId: billId, type: 'ER' }),
            success: function() { loadAllData(); },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed to mark as paid'); }
        });
    };

    window.closeErInvDetail = function() {
        closeErInvDetail();
    };

    // ===== ER DISCHARGE PROCESS =====
    var _erDischVisitId           = null;
    var _erDischStep3Interval     = null;
    var _erDispClearanceSettings  = null;  // cached from /api/hospital-info/settings/er_discharge

    window.showErDischStep = function(n, visitId) {
        if (visitId) _erDischVisitId = visitId;

        // Update stepper crumbs
        var steps = [2, 3, 4, 5];
        steps.forEach(function(s) {
            var $c = $('.er-disch-step-crumb[data-step="' + s + '"]');
            $c.removeClass('active done');
            if (s < n) $c.addClass('done');
            else if (s === n) $c.addClass('active');
        });

        // Show/hide panels
        steps.forEach(function(s) { $('#erDischStep' + s).hide(); });
        $('#erDischStep' + n).show();

        // Open offcanvas if not already open
        var oc = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('erDischargeStepSheet'));
        oc.show();

        // Render the requested step
        if (n === 2) renderErDischStep2();
        else if (n === 3) renderErDischStep3();
        else if (n === 4) renderErDischStep4();
        else if (n === 5) {
            var visit = visits.find(function(v) { return v.visitId === _erDischVisitId; });
            renderErDischStep5({ dischargeInfo: (visit && visit.dischargeInfo) ? visit.dischargeInfo : {} });
        }

        lucide.createIcons();
    };

    function renderErDischStep2() {
        var visit = visits.find(function(v) { return v.visitId === _erDischVisitId; });
        if (!visit) return;

        var arrDate = visit.consultationDate ? new Date(visit.consultationDate) : null;
        var timeInER = arrDate ? Math.max(0, Math.floor((Date.now() - arrDate.getTime()) / 3600000)) : 0;
        var today = new Date().toISOString().split('T')[0];

        var medItems = ['Patient is hemodynamically stable', 'No acute life-threatening condition', 'Pain / distress adequately controlled'];
        var clinItems = ['All acute orders completed', 'Disposition decision documented', 'Follow-up plan established'];

        var checklistHtml = function(items, prefix) {
            return items.map(function(item, i) {
                var id = prefix + i;
                return '<div class="er-disch-checklist-item" data-check="' + id + '" onclick="toggleErDischCheck(this)">' +
                    '<div class="er-disch-check-box"><i data-lucide="check" style="width:13px;height:13px;color:var(--midnight-blue);display:none"></i></div>' +
                    '<span style="font-size:13px">' + esc(item) + '</span>' +
                '</div>';
            }).join('');
        };

        var html = '<div style="max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:20px">' +
            '<div style="display:flex;align-items:center;gap:16px;background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:18px 22px">' +
                '<div class="avatar" style="width:50px;height:50px;background:var(--color-destructive);color:#fff;font-size:18px;font-weight:700;flex-shrink:0">' + getInitials(visit.patientName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="font-size:17px;font-weight:700">' + esc(visit.patientName) + '</div>' +
                    '<div style="display:flex;gap:10px;margin-top:5px;flex-wrap:wrap">' +
                        '<span class="badge badge-outline" style="font-size:10px">' + esc(visit.visitId) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(visit.mrn) + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">' + esc(visit.esi || '-') + '</span>' +
                        '<span style="font-size:12px;color:var(--color-muted-foreground)">Dr. ' + esc(visit.doctorName) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="text-align:center;padding:10px 20px;background:var(--color-muted);border-radius:10px">' +
                    '<div style="font-size:28px;font-weight:800;color:var(--midnight-blue)">' + timeInER + '</div>' +
                    '<div style="font-size:10px;color:var(--color-muted-foreground);font-weight:600">HRS IN ER</div>' +
                '</div>' +
            '</div>' +
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden">' +
                '<div style="padding:16px 22px;border-bottom:1px solid var(--color-border);background:var(--color-muted)">' +
                    '<div style="font-size:15px;font-weight:700;color:var(--midnight-blue)">Discharge Readiness Checklist</div>' +
                    '<div style="font-size:12px;color:var(--color-muted-foreground);margin-top:2px">Complete all items before initiating discharge</div>' +
                '</div>' +
                '<div style="padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
                    '<div>' +
                        '<div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px">Medical Status</div>' +
                        '<div style="display:flex;flex-direction:column;gap:8px" id="erMedChecklist">' + checklistHtml(medItems, 'ermed') + '</div>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px">Clinical Clearance</div>' +
                        '<div style="display:flex;flex-direction:column;gap:8px" id="erClinChecklist">' + checklistHtml(clinItems, 'erclin') + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden">' +
                '<div style="padding:16px 22px;border-bottom:1px solid var(--color-border);background:var(--color-muted)">' +
                    '<div style="font-size:15px;font-weight:700;color:var(--midnight-blue)">Discharge Details</div>' +
                '</div>' +
                '<div style="padding:20px;display:flex;flex-direction:column;gap:16px">' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
                        '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Planned Discharge Date</label><input type="date" id="erDischPlanDate" class="form-control" style="margin-top:6px" value="' + today + '"></div>' +
                        '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Planned Discharge Time</label><input type="time" id="erDischPlanTime" class="form-control" style="margin-top:6px" value="12:00"></div>' +
                    '</div>' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:10px;display:block">Discharge Type</label>' +
                        '<div style="display:flex;gap:8px;flex-wrap:wrap" id="erDischTypeGroup">' +
                            ['Discharged','Admitted to IPD','Transferred','DAMA','Death'].map(function(t) {
                                return '<button class="er-disch-type-btn' + (t === 'Discharged' ? ' active' : '') + '" data-type="' + t + '" onclick="toggleErDischType(this)">' + t + '</button>';
                            }).join('') +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:flex-start;gap:14px;background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:16px 18px">' +
                '<i data-lucide="info" style="width:18px;height:18px;color:#3B82F6;flex-shrink:0;margin-top:2px"></i>' +
                '<div style="font-size:13px;color:#1D4ED8"><strong>What happens next:</strong> The Billing Department will be notified and will collect payment for ER, Pharmacy, and Laboratory charges. You will be notified here once all 3 departments have cleared. You can then complete the final disposition form.</div>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<button class="btn-outline" onclick="var oc=bootstrap.Offcanvas.getOrCreateInstance(document.getElementById(\'erDischargeStepSheet\'));oc.hide();"><i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back to List</button>' +
                '<button class="btn-primary" style="background:var(--aquamint);color:var(--midnight-blue);border-color:var(--aquamint);font-weight:700;padding:12px 28px;font-size:14px" onclick="submitErDischStep2()"><i data-lucide="send" style="width:16px;height:16px"></i> Initiate Discharge &amp; Notify Billing</button>' +
            '</div>' +
        '</div>';
        $('#erDischStep2Content').html(html);
        lucide.createIcons();
    }

    window.toggleErDischCheck = function(el) {
        var $el = $(el);
        $el.toggleClass('checked');
        var icon = $el.find('i');
        if ($el.hasClass('checked')) icon.show(); else icon.hide();
    };

    window.toggleErDischType = function(el) {
        $(el).closest('#erDischTypeGroup').find('.er-disch-type-btn').removeClass('active');
        $(el).addClass('active');
    };

    window.toggleErDischCondition = function(el) {
        $(el).closest('.er-disch-condition-group').find('.er-disch-condition-btn').removeClass('active');
        $(el).addClass('active');
    };

    window.submitErDischStep2 = function() {
        var checkedMed  = $('#erMedChecklist .er-disch-checklist-item.checked').length;
        var checkedClin = $('#erClinChecklist .er-disch-checklist-item.checked').length;
        var planDate    = $('#erDischPlanDate').val();
        var planTime    = $('#erDischPlanTime').val();
        var dischType   = $('#erDischTypeGroup .er-disch-type-btn.active').data('type') || 'Discharged';

        if (checkedMed < 3 || checkedClin < 3) {
            if (!confirm('Not all readiness items are checked. Initiate discharge anyway?')) return;
        }

        var $btn = $('[onclick="submitErDischStep2()"]').prop('disabled', true).text('Initiating...');
        $.ajax({
            url: '/api/er/discharge/' + _erDischVisitId + '/initiate',
            type: 'POST', contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                plannedDischargeDate: planDate,
                plannedDischargeTime: planTime,
                dischargeType: dischType,
                readinessChecklist: { medical: checkedMed, clinical: checkedClin }
            })
        }).done(function(res) {
            // Refresh visit data
            var idx = visits.findIndex(function(v) { return v.visitId === _erDischVisitId; });
            if (idx >= 0 && res.visit) {
                visits[idx] = res.visit;
            }
            renderDispositionTab();
            showErDischStep(3, _erDischVisitId);
        }).fail(function() {
            $btn.prop('disabled', false).text('Initiate Discharge & Notify Billing');
            HMS.toast('Failed to initiate discharge. Please try again.', 'error');
        });
    };

    function renderErDischStep3() {
        var visit = visits.find(function(v) { return v.visitId === _erDischVisitId; });
        if (!visit) return;

        $('#erDischStep3Content').html('<div style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="loader" style="width:20px;height:20px;animation:spin 1s linear infinite"></i> Checking billing clearances...</div>');
        lucide.createIcons();

        var duesData = null;
        var duesReq = $.get('/api/er/discharge/' + _erDischVisitId + '/clearance-dues')
            .done(function(d) { duesData = d; });

        // Fetch clearance settings once; reuse cache on polling re-renders
        var settingsReq = _erDispClearanceSettings !== null
            ? $.Deferred().resolve().promise()
            : $.get('/api/hospital-info/settings/er_discharge')
                .done(function(res) { _erDispClearanceSettings = (res && res.settings) || {}; })
                .fail(function()    { _erDispClearanceSettings = {}; });

        $.when(duesReq, settingsReq).always(function() {
            $.get('/api/emergency/visits')
                .done(function(data) {
                    if (data && data.length) visits = data;
                    visit = visits.find(function(v) { return v.visitId === _erDischVisitId; }) || visit;
                })
                .always(function() {
                    _buildErDischStep3(visit, duesData, _erDispClearanceSettings || {});
                    startErStep3Polling();
                });
        });
    }

    function _buildErDischStep3(visit, dues, clearSettings) {
        var di    = visit.dischargeInfo || {};
        var dHosp = (dues && dues.hospital) || {};
        var dPhrm = (dues && dues.pharmacy) || {};
        var dLab  = (dues && dues.lab)      || {};

        var hospCleared  = dues ? !!dHosp.cleared : false;
        var pharmCleared = dues ? !!dPhrm.cleared : false;
        var labCleared   = dues ? !!dLab.cleared  : false;

        // ── Which clearances are required (from ER Configuration) ──
        var cs        = clearSettings || {};
        var needHosp  = cs.er_discharge_require_hospital_clearance  !== '0';
        var needPhrm  = cs.er_discharge_require_pharmacy_clearance  !== '0';
        var needLab   = cs.er_discharge_require_lab_clearance       !== '0';

        var required      = [needHosp, needPhrm, needLab];
        var statuses      = [hospCleared, pharmCleared, labCleared];
        var totalRequired = required.filter(Boolean).length;
        var clearedCount  = required.reduce(function(n, req, i) { return n + (req && statuses[i] ? 1 : 0); }, 0);
        var allCleared    = totalRequired === 0 || clearedCount === totalRequired;
        var estimatedTotal= (needHosp ? dHosp.total || 0 : 0) + (needPhrm ? dPhrm.total || 0 : 0) + (needLab ? dLab.total || 0 : 0);

        function statusBadge(isCleared) {
            return isCleared
                ? '<span class="clearance-status-badge clearance-cleared" style="white-space:nowrap">✅ Cleared</span>'
                : '<span class="clearance-status-badge clearance-pending"  style="white-space:nowrap">⏳ Pending</span>';
        }

        function fmt(n) { return parseFloat(n || 0).toLocaleString(); }

        function breakdownTable(items, cleared, pendingAmt, paidAmt) {
            if (!items || !items.length) {
                return cleared
                    ? '<div style="margin-top:8px;padding:8px 12px;border-radius:6px;background:rgba(16,185,129,0.07);font-size:11px;color:#065F46">No charges on record — cleared automatically</div>'
                    : '<div style="margin-top:8px;padding:8px 12px;border-radius:6px;background:rgba(245,158,11,0.07);font-size:11px;color:#B45309">No detailed breakdown available yet</div>';
            }
            var rows = '';
            items.forEach(function(it) {
                var isPaid = (it.status === 'Paid') || cleared;
                rows += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--color-border);gap:8px">' +
                    '<span style="font-size:11px;color:var(--color-muted-foreground);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(it.label) + '</span>' +
                    '<span style="font-size:11px;font-weight:600;white-space:nowrap;color:' + (isPaid ? '#10B981' : 'var(--midnight-blue)') + '">' + fmt(it.amount) + '</span>' +
                    (isPaid ? '<span style="font-size:9px;padding:1px 6px;border-radius:10px;background:rgba(16,185,129,0.12);color:#10B981;white-space:nowrap">Paid</span>'
                            : '<span style="font-size:9px;padding:1px 6px;border-radius:10px;background:rgba(239,68,68,0.1);color:#DC2626;white-space:nowrap">Due</span>') +
                '</div>';
            });
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
            var items   = dept.breakdown || [];
            var pending = dept.pending  || 0;
            var paid    = dept.paid     || 0;
            var total   = dept.total    || 0;
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

        var arrDate = visit.consultationDate ? new Date(visit.consultationDate) : null;
        var timeInER = arrDate ? Math.max(0, Math.floor((Date.now() - arrDate.getTime()) / 3600000)) : 0;

        var html = '<div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:20px">' +
            '<div style="display:flex;align-items:center;gap:14px;background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:16px 20px">' +
                '<div class="avatar" style="width:42px;height:42px;background:var(--color-destructive);color:#fff;font-size:16px;font-weight:700;flex-shrink:0">' + getInitials(visit.patientName) + '</div>' +
                '<div style="flex:1">' +
                    '<div style="font-size:15px;font-weight:700">' + esc(visit.patientName) + '</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(visit.visitId) + ' · ' + esc(visit.mrn) + ' · ' + timeInER + ' hrs in ER</div>' +
                '</div>' +
                '<span class="badge" style="font-size:12px;padding:6px 14px;background:' + (allCleared ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)') + ';color:' + (allCleared ? '#065F46' : '#B45309') + ';font-weight:700">' +
                    (totalRequired === 0 ? 'No Clearance Required' : allCleared ? 'All Cleared' : 'Awaiting Clearance (' + clearedCount + '/' + totalRequired + ')') +
                '</span>' +
            '</div>' +
            (totalRequired > 0
                ? '<div>' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Clearance Progress</span><span style="font-size:12px;font-weight:700;color:' + progressColor + '">' + progressPct + '%</span></div>' +
                    '<div style="height:10px;background:var(--color-muted);border-radius:10px;overflow:hidden"><div style="height:100%;width:' + progressPct + '%;background:' + progressColor + ';border-radius:10px;transition:width 0.5s"></div></div>' +
                  '</div>'
                : '') +
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;overflow:hidden">' +
                '<div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:var(--color-muted)">' +
                    '<div style="font-size:14px;font-weight:700;color:var(--midnight-blue)">Billing Department Clearances</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">' + (totalRequired === 0 ? 'No approvals configured — disposition can proceed directly.' : 'Itemized dues from each department') + '</div>' +
                '</div>' +
                '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +
                    (needHosp ? clearRow('🏥', 'ER Charges',          'Consultation · Doctor Fee',             hospCleared, dHosp) : '') +
                    (needPhrm ? clearRow('💊', 'Pharmacy Charges',     'Medications dispensed (ER account)',    pharmCleared, dPhrm) : '') +
                    (needLab  ? clearRow('🔬', 'Laboratory Charges',   'Tests &amp; investigations',            labCleared,  dLab)  : '') +
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
            (allCleared
                ? '<div style="background:rgba(16,185,129,0.08);border:2px solid #10B981;border-radius:12px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px">' +
                    '<div><div style="font-size:15px;font-weight:700;color:#10B981">' + (totalRequired === 0 ? 'No Approvals Required!' : totalRequired === 1 ? '1 Department Cleared!' : 'All ' + totalRequired + ' Departments Cleared!') + '</div><div style="font-size:12px;color:var(--color-muted-foreground);margin-top:4px">You can now complete the final disposition form.</div></div>' +
                    '<button class="btn-primary" style="background:var(--aquamint);color:var(--midnight-blue);border-color:var(--aquamint);font-weight:700;font-size:14px;padding:12px 24px;white-space:nowrap;flex-shrink:0" onclick="showErDischStep(4)">Complete Discharge <i data-lucide="arrow-right" style="width:16px;height:16px"></i></button>' +
                  '</div>'
                : '<div style="display:flex;align-items:flex-start;gap:14px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:16px 18px">' +
                    '<i data-lucide="clock" style="width:18px;height:18px;color:#F59E0B;flex-shrink:0;margin-top:2px"></i>' +
                    '<div style="font-size:13px;color:#B45309"><strong>Waiting for Billing Department</strong><br>Pending dues must be settled before discharge can proceed. This page auto-refreshes every 15 seconds.</div>' +
                  '</div>') +
            '<div><button class="btn-outline" onclick="showErDischStep(2)"><i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back</button></div>' +
        '</div>';
        $('#erDischStep3Content').html(html);
        lucide.createIcons();
    }

    function startErStep3Polling() {
        if (_erDischStep3Interval) clearInterval(_erDischStep3Interval);
        _erDischStep3Interval = setInterval(function() {
            if ($('#erDischStep3').is(':visible')) {
                var visit = visits.find(function(v) { return v.visitId === _erDischVisitId; });
                if (visit) {
                    $.get('/api/er/discharge/' + _erDischVisitId + '/clearance-dues').done(function(dues) {
                        visit = visits.find(function(v) { return v.visitId === _erDischVisitId; }) || visit;
                        _buildErDischStep3(visit, dues, _erDispClearanceSettings || {});
                        lucide.createIcons();
                    });
                }
            } else {
                clearInterval(_erDischStep3Interval);
                _erDischStep3Interval = null;
            }
        }, 15000);
    }

    // Reset clearance settings cache when discharge sheet closes so next open fetches fresh config
    var _erDischSheetEl = document.getElementById('erDischargeStepSheet');
    if (_erDischSheetEl) {
        _erDischSheetEl.addEventListener('hidden.bs.offcanvas', function() {
            if (_erDischStep3Interval) { clearInterval(_erDischStep3Interval); _erDischStep3Interval = null; }
            _erDispClearanceSettings = null;
        });
    }

    function renderErDischStep4() {
        var visit = visits.find(function(v) { return v.visitId === _erDischVisitId; });
        if (!visit) return;
        var di = visit.dischargeInfo || {};
        var today = new Date().toISOString().split('T')[0];
        var now   = new Date().toTimeString().slice(0, 5);

        var html = '<div style="max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:20px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(16,185,129,0.08);border:2px solid #10B981;border-radius:12px;padding:16px 22px">' +
                '<div><div style="font-size:14px;font-weight:700;color:#10B981">All Clearances Obtained</div><div style="font-size:12px;color:var(--color-muted-foreground);margin-top:4px">Patient is authorized to be discharged.</div></div>' +
                '<div style="text-align:right"><div style="font-size:11px;color:var(--color-muted-foreground)">Visit ID</div><div style="font-size:16px;font-weight:800;color:var(--midnight-blue)">' + esc(visit.visitId) + '</div></div>' +
            '</div>' +
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:22px;display:flex;flex-direction:column;gap:16px">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Discharge Date</label><input type="date" id="erFinalDischDate" class="form-control" style="margin-top:6px" value="' + today + '"></div>' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Discharge Time</label><input type="time" id="erFinalDischTime" class="form-control" style="margin-top:6px" value="' + now + '"></div>' +
                '</div>' +
                '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:10px;display:block">Discharge Type</label>' +
                    '<div style="display:flex;gap:8px;flex-wrap:wrap" id="erFinalDischTypeGroup">' +
                        ['Discharged','Admitted to IPD','Transferred','DAMA','Death'].map(function(t) {
                            var active = (di.discharge_type || 'Discharged') === t;
                            return '<button class="er-disch-type-btn' + (active ? ' active' : '') + '" data-type="' + t + '" onclick="$(\'#erFinalDischTypeGroup .er-disch-type-btn\').removeClass(\'active\');$(this).addClass(\'active\')">' + t + '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Final Diagnosis / Impression</label><textarea id="erFinalDiagnosis" class="form-control" rows="2" style="margin-top:6px;font-size:14px;resize:vertical" placeholder="Enter final diagnosis or clinical impression...">' + esc(di.final_diagnosis || '') + '</textarea></div>' +
                '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:10px;display:block">Condition at Discharge</label>' +
                    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:500px" class="er-disch-condition-group">' +
                        [['😊','Improved'],['😐','Stable'],['😔','Deteriorated'],['🏥','Admitted'],['🕊️','Expired']].map(function(c) {
                            return '<button class="er-disch-condition-btn" onclick="toggleErDischCondition(this)">' + c[0] + '<br><span style="font-size:11px;margin-top:4px;display:block">' + c[1] + '</span></button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div style="background:#F8F9FA;border:1px solid var(--color-border);border-radius:12px;padding:20px">' +
                '<div style="font-size:14px;font-weight:700;color:var(--midnight-blue);margin-bottom:14px">Follow-up Plan</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Doctor Name</label><input type="text" id="erFuDoctor" class="form-control" style="margin-top:6px" placeholder="Dr. Name" value="' + esc(visit.doctorName || '') + '"></div>' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Follow-up Date</label><input type="date" id="erFuDate" class="form-control" style="margin-top:6px"></div>' +
                    '<div><label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Location / Clinic</label><input type="text" id="erFuLocation" class="form-control" style="margin-top:6px" placeholder="OPD Room, Clinic..."></div>' +
                '</div>' +
            '</div>' +
            '<div style="background:var(--color-card);border:1px solid var(--color-border);border-radius:12px;padding:20px">' +
                '<label style="font-size:14px;font-weight:700;color:var(--midnight-blue)">Discharge Instructions</label>' +
                '<textarea id="erSpecialInstructions" class="form-control" rows="3" style="margin-top:10px;font-size:14px;resize:vertical" placeholder="Medication instructions, activity restrictions, dietary advice, red flag symptoms...">' + esc(di.special_instructions || '') + '</textarea>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<button class="btn-outline" onclick="showErDischStep(3)"><i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back</button>' +
                '<button class="btn-primary" id="btnErCompleteDischarge" style="background:var(--midnight-blue);color:var(--aquamint);border-color:var(--midnight-blue);font-weight:700;padding:12px 28px;font-size:14px" onclick="submitErFinalDischarge()"><i data-lucide="check-circle-2" style="width:16px;height:16px"></i> Complete Discharge</button>' +
            '</div>' +
        '</div>';
        $('#erDischStep4Content').html(html);
        lucide.createIcons();
    }

    window.submitErFinalDischarge = function() {
        var condition = $('.er-disch-condition-btn.active').text().trim();
        var dischType = $('#erFinalDischTypeGroup .er-disch-type-btn.active').data('type') || 'Discharged';
        var $btn = $('#btnErCompleteDischarge').prop('disabled', true).html('<i data-lucide="loader-2" style="width:16px;height:16px"></i> Completing...');
        $.ajax({
            url: '/api/er/discharge/' + _erDischVisitId + '/complete',
            type: 'POST', contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                dischargeDate: $('#erFinalDischDate').val(),
                dischargeTime: $('#erFinalDischTime').val(),
                dischargeType: dischType,
                finalDiagnosis: $('#erFinalDiagnosis').val(),
                conditionAtDischarge: condition,
                followUpInfo: { doctor: $('#erFuDoctor').val(), date: $('#erFuDate').val(), location: $('#erFuLocation').val() },
                specialInstructions: $('#erSpecialInstructions').val(),
                dischargedBy: 'Doctor'
            })
        }).done(function(res) {
            // Update local visit
            $.get('/api/emergency/visits').done(function(data) { if (data && data.length) visits = data; });
            renderDispositionTab();
            renderErDischStep5(res);
            showErDischStep(5, _erDischVisitId);
        }).fail(function() {
            $btn.prop('disabled', false).html('<i data-lucide="check-circle-2"></i> Complete Discharge');
            HMS.toast('Failed to complete discharge. Please try again.', 'error');
        });
    };

    function renderErDischStep5(res) {
        var visit = visits.find(function(v) { return v.visitId === _erDischVisitId; }) || {};
        var di = (res && res.dischargeInfo) ? res.dischargeInfo : (visit.dischargeInfo || {});
        var arrDate = visit.consultationDate ? new Date(visit.consultationDate) : null;
        var timeInER = arrDate ? Math.max(0, Math.floor((Date.now() - arrDate.getTime()) / 3600000)) : '-';

        var html = '<div style="max-width:660px;margin:40px auto;background:var(--midnight-blue);border-radius:20px;padding:40px;color:#fff;text-align:center;box-shadow:0 20px 60px rgba(0,51,102,0.3)">' +
            '<div style="font-size:52px;margin-bottom:16px">🎉</div>' +
            '<div style="font-size:24px;font-weight:800;color:var(--aquamint);margin-bottom:8px">Patient Discharged Successfully</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:28px">Discharge has been completed and all records have been updated.</div>' +
            '<div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:24px;text-align:left">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
                    [['Patient', esc(visit.patientName || '-')],
                     ['Visit ID', esc(visit.visitId || '-')],
                     ['MRN', esc(visit.mrn || '-')],
                     ['Time in ER', timeInER + ' hrs'],
                     ['Discharge Date', esc(di.discharge_date || new Date().toLocaleDateString())],
                     ['Discharge Type', esc(di.discharge_type || '-')]
                    ].map(function(row) {
                        return '<div style="font-size:11px;color:rgba(255,255,255,0.5)">' + row[0] + '</div><div style="font-size:13px;font-weight:600;color:var(--aquamint)">' + row[1] + '</div>';
                    }).join('') +
                '</div>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:28px">' +
                ['✅ Visit Closed','✅ Summary Finalized','✅ Records Updated','✅ Follow-up Scheduled'].map(function(chip) {
                    return '<span style="background:rgba(127,255,212,0.15);color:var(--aquamint);border:1px solid rgba(127,255,212,0.3);border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600">' + chip + '</span>';
                }).join('') +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
                [['file-text','Discharge Summary'],['pill','Medication List'],['flask-conical','Lab Reports'],['folder-open','Full Discharge Packet']].map(function(btn) {
                    return '<button style="display:flex;align-items:center;gap:8px;justify-content:center;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:12px;color:#fff;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.2s" onmouseover="this.style.background=\'rgba(127,255,212,0.15)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.1)\'"><i data-lucide="' + btn[0] + '" style="width:15px;height:15px"></i>' + btn[1] + '</button>';
                }).join('') +
            '</div>' +
            '<button class="btn-outline" style="margin-top:24px;color:#fff;border-color:rgba(255,255,255,0.3);width:100%" onclick="var oc=bootstrap.Offcanvas.getOrCreateInstance(document.getElementById(\'erDischargeStepSheet\'));oc.hide();renderDispositionTab();"><i data-lucide="arrow-left" style="width:15px;height:15px"></i> Back to Patient List</button>' +
        '</div>';
        $('#erDischStep5Content').html(html);
        lucide.createIcons();
    }

    // ===== ER REGISTRATION SLIP PRINT =====

    function printErRegistrationSlip(visit, patient, bill) {
        var currency = (typeof hospitalInfo !== 'undefined' && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';
        $.when(
            $.get('/api/hospital-info/settings/letterhead'),
            $.get('/api/hospital-info/settings/footer'),
            $.get('/api/hospital-info/settings/basic'),
            $.get('/api/hospital-info/settings/doc_format_er_registration')
        ).done(function(lhRes, ftRes, prRes, fmtRes) {
            var savedFormat = (fmtRes[0].settings && fmtRes[0].settings['doc_format_er_registration']) || 'a4';
            if (savedFormat === 'thermal') {
                _printErThermal(visit, patient, bill);
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
                ? [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean) : [];
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

            var patientName = patient ? (patient.name  || visit.patientName || '-') : (visit.patientName || '-');
            var mrn         = visit.mrn        || '-';
            var visitId     = visit.visitId    || '-';
            var billId      = bill ? (bill.billId  || '-') : '-';
            var doctorName  = visit.doctorName  || '-';
            var department  = visit.department  || 'Emergency';
            var triage      = visit.triageCategory || '-';
            var esi         = visit.esi         || '-';
            var phone       = patient ? (patient.phone  || '-') : '-';
            var cnic        = patient ? (patient.cnic   || '-') : '-';
            var age         = patient ? (patient.age    || '-') : '-';
            var gender      = patient ? (patient.gender || '-') : '-';
            var arrDate     = visit.consultationDate ? new Date(visit.consultationDate) : null;
            var arrDateStr  = arrDate ? arrDate.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) + ', ' + arrDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '-';
            var modeArr     = visit.modeOfArrival  || '-';
            var complaint   = visit.chiefComplaint || '-';
            var mlcText     = visit.isMLC ? 'Yes (MLC)' : 'No';
            var regBy       = visit.registeredBy || visit.createdByName || visit.createdBy || '';

            var doctorFee   = bill ? Number(bill.doctorFee || 0) : 0;
            var otherChg    = bill ? Number(bill.consultationCharges || bill.otherCharges || 0) : 0;
            var chargeLineItems = [];
            if (bill && bill.chargeIds && bill.chargeIds.length > 0) {
                bill.chargeIds.forEach(function(cid) {
                    var mc = (typeof masterCharges !== 'undefined') && masterCharges.find(function(m){ return String(m.chargeId||m.id)===String(cid); });
                    if (mc) chargeLineItems.push({ name: mc.name, amount: Number(mc.amount||0) });
                });
            } else if (otherChg > 0) {
                chargeLineItems.push({ name: 'ER Consultation Charges', amount: otherChg });
            }
            var netTotal = bill ? Number(bill.totalAmount||0) : (doctorFee + chargeLineItems.reduce(function(s,c){return s+c.amount;},0));

            var footerLines = [ft.footer_line1, ft.footer_line2, ft.footer_line3].filter(Boolean);
            var metaParts = [];
            if (ft.footer_show_page_number === '1') metaParts.push('Page 1 of 1');
            if (ft.footer_show_date === '1') { var _n = new Date(); metaParts.push('Printed: ' + _n.toLocaleDateString('en-GB') + ', ' + _n.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})); }
            if (ft.footer_show_disclaimer === '1') metaParts.push('Confidential \u2014 For medical use only');

            var logoHtml = '';
            if (lh.lh_show_logo !== '0') {
                logoHtml = '<div style="width:' + logoSize + ';height:' + logoSize + ';background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e2e8f0;flex-shrink:0">'
                         + (logoPath ? '<img src="' + logoPath + '" style="max-width:100%;max-height:100%;object-fit:contain">' : '<span style="font-size:9px;color:#94a3b8">Logo</span>')
                         + '</div>';
            }

            var sno = 1;
            var chargeRows = '';
            if (doctorFee > 0) {
                chargeRows += '<tr style="background:#fff;border-top:1px solid #f1f5f9"><td style="padding:8px 10px;font-size:10px;color:#64748b">' + sno + '</td><td style="padding:8px 10px;font-size:10px;color:#334155;font-weight:500">Doctor Fee \u2014 ' + e(doctorName) + '</td><td style="padding:8px 10px;font-size:10px;text-align:right">1</td><td style="padding:8px 10px;font-size:10px;text-align:right">' + fmt(doctorFee) + '</td><td style="padding:8px 10px;font-size:10px;text-align:right">\u2014</td><td style="padding:8px 10px;font-size:10px;font-weight:600;text-align:right">' + fmt(doctorFee) + '</td></tr>';
                sno++;
            }
            chargeLineItems.forEach(function(ci) {
                var bg = sno % 2 === 0 ? '#f8fafc' : '#fff';
                chargeRows += '<tr style="background:' + bg + ';border-top:1px solid #f1f5f9"><td style="padding:8px 10px;font-size:10px;color:#64748b">' + sno + '</td><td style="padding:8px 10px;font-size:10px;color:#334155;font-weight:500">' + e(ci.name) + '</td><td style="padding:8px 10px;font-size:10px;text-align:right">1</td><td style="padding:8px 10px;font-size:10px;text-align:right">' + fmt(ci.amount) + '</td><td style="padding:8px 10px;font-size:10px;text-align:right">\u2014</td><td style="padding:8px 10px;font-size:10px;font-weight:600;text-align:right">' + fmt(ci.amount) + '</td></tr>';
                sno++;
            });
            if (!chargeRows) chargeRows = '<tr><td colspan="6" style="padding:14px 10px;font-size:10px;color:#94a3b8;text-align:center">No charges recorded</td></tr>';

            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ER Registration Slip \u2014 ' + e(patientName) + '</title>'
                + '<style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:"SF Pro Text","Segoe UI",Arial,sans-serif; background:#fff; color:#1e293b; } @page { size:A4; margin:12mm 12mm 10mm 12mm; } @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } } table { border-collapse:collapse; width:100%; }</style>'
                + '</head><body>'
                + '<div style="max-width:740px;margin:0 auto;background:#fff">'
                + '<div style="height:4px;background:' + color + '"></div>'
                + '<div style="padding:24px 32px 16px"><div style="display:flex;align-items:flex-start;gap:20px">'
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
                + '<span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">EMERGENCY REGISTRATION SLIP</span>'
                + '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:9px;font-weight:600;padding:2px 9px;border-radius:20px;letter-spacing:0.5px">ORIGINAL</span>'
                + '</div>'
                + '<div style="padding:16px 32px">'
                + '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '<table style="table-layout:fixed">'
                + '<tr style="border-bottom:1px solid #e8edf2">' + infoCell('PATIENT NAME',patientName,true,'#fff') + infoCell('MRN',mrn,true,'#fff') + infoCell('VISIT ID',visitId,true,'#fff') + infoCell('BILL ID',billId,false,'#fff') + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">' + infoCell('ER DOCTOR',doctorName,true,'#f8fafc') + infoCell('DEPARTMENT',department,true,'#f8fafc') + infoCell('TRIAGE CATEGORY',triage,true,'#f8fafc') + infoCell('ESI LEVEL',esi,false,'#f8fafc') + '</tr>'
                + '<tr style="border-bottom:1px solid #e8edf2">' + infoCell('PHONE NO.',phone,true,'#fff') + infoCell('CNIC',cnic,true,'#fff') + infoCell('AGE',(age!=='-'?age+' Years':'-'),true,'#fff') + infoCell('GENDER',gender,false,'#fff') + '</tr>'
                + '<tr>' + infoCell('ARRIVAL DATE/TIME',arrDateStr,true,'#f8fafc') + infoCell('MODE OF ARRIVAL',modeArr,true,'#f8fafc') + infoCell('CHIEF COMPLAINT',complaint,true,'#f8fafc') + infoCell('MLC',mlcText,false,'#f8fafc') + '</tr>'
                + '</table></div>'
                + '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">'
                + '<table style="table-layout:fixed"><thead><tr style="background:' + color + '">'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;width:36px;text-align:left">S.NO</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:left">DESCRIPTION</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:50px">QTY</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:100px">RATE</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:60px">DISC.</th>'
                + '<th style="padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;text-align:right;width:100px">NET</th>'
                + '</tr></thead><tbody>' + chargeRows + '</tbody></table></div>'
                + '<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 18px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                + '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</span>'
                + '<span style="font-size:16px;font-weight:800;color:#fff">' + fmt(netTotal) + '</span>'
                + '</div>'
                + '<div style="display:flex;justify-content:flex-end;margin-top:24px"><div style="width:220px;text-align:center">'
                + (regBy ? '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">' + e(regBy) + '</div>' : '<div style="height:40px"></div>')
                + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                + '</div></div>'
                + '</div>'
                + '<div style="margin:0 32px;height:1.5px;background:linear-gradient(to right,' + color + ',rgba(0,0,0,0.05));border-radius:2px"></div>'
                + '<div style="padding:12px 32px;display:flex;justify-content:space-between;align-items:flex-start">'
                + '<div style="font-size:9px;color:#64748b;line-height:1.6">' + footerLines.map(function(l){return '<div>'+e(l)+'</div>';}).join('') + '</div>'
                + '<div style="font-size:9px;color:#64748b;text-align:right;line-height:1.6">' + metaParts.map(function(p){return '<div>'+e(p)+'</div>';}).join('') + '</div>'
                + '</div>'
                + '<div style="height:3px;background:' + color + '"></div>'
                + '</div>'
                + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>'
                + '</body></html>';

            var w = window.open('', '_blank', 'width=900,height=700');
            if (w) { w.document.write(html); w.document.close(); }
        });
    }

    function _printErThermal(visit, patient, bill) {
        var currency = (typeof hospitalInfo !== 'undefined' && hospitalInfo.currency) ? hospitalInfo.currency : 'PKR';
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

            function e(v) { return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
            function fmt(n) { return currency + ' ' + Number(n).toLocaleString(); }
            function row(label, val) {
                return '<tr><td style="color:#555;padding:2px 4px;white-space:nowrap">' + e(label) + '</td>'
                     + '<td style="font-weight:600;padding:2px 4px;text-align:right">' + e(val) + '</td></tr>';
            }
            function chargeRow(desc, qty, disc, net, total) {
                return '<tr><td style="padding:2px 4px">' + e(desc) + '</td><td style="text-align:center;padding:2px 4px">' + qty + '</td><td style="text-align:right;padding:2px 4px">' + disc + '</td><td style="text-align:right;padding:2px 4px">' + net + '</td><td style="text-align:right;padding:2px 4px">' + total + '</td></tr>';
            }

            var patientName = patient ? (patient.name  || visit.patientName || '-') : (visit.patientName || '-');
            var mrn         = visit.mrn        || '\u2014';
            var visitId     = visit.visitId    || '\u2014';
            var billId      = bill ? (bill.billId  || '\u2014') : '\u2014';
            var doctorName  = visit.doctorName  || '\u2014';
            var department  = visit.department  || 'Emergency';
            var esi         = visit.esi         || '\u2014';
            var triage      = visit.triageCategory || '\u2014';
            var modeArr     = visit.modeOfArrival  || '\u2014';
            var complaint   = visit.chiefComplaint || '\u2014';
            var mlcText     = visit.isMLC ? 'Yes (MLC)' : 'No';
            var patPhone    = patient ? (patient.phone  || '\u2014') : '\u2014';
            var cnic        = patient ? (patient.cnic   || '\u2014') : '\u2014';
            var age         = patient ? (patient.age    || '\u2014') : '\u2014';
            var gender      = patient ? (patient.gender || '\u2014') : '\u2014';
            var arrDate     = visit.consultationDate ? new Date(visit.consultationDate) : null;
            var arrDateStr  = arrDate ? arrDate.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) + ', ' + arrDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '\u2014';
            var createdBy   = visit.registeredBy || visit.createdByName || visit.createdBy || (bill && (bill.createdByName||bill.createdBy)) || 'Staff';

            var doctorFee   = bill ? Number(bill.doctorFee || 0) : 0;
            var otherChg    = bill ? Number(bill.consultationCharges || bill.otherCharges || 0) : 0;
            var chargeLineItems = [];
            if (bill && bill.chargeIds && bill.chargeIds.length > 0) {
                bill.chargeIds.forEach(function(cid) {
                    var mc = (typeof masterCharges !== 'undefined') && masterCharges.find(function(m){ return String(m.chargeId||m.id)===String(cid); });
                    if (mc) chargeLineItems.push({ name: mc.name, amount: Number(mc.amount||0) });
                });
            } else if (otherChg > 0) {
                chargeLineItems.push({ name: 'ER Consultation Charges', amount: otherChg });
            }
            var netTotal = bill ? Number(bill.totalAmount||0) : (doctorFee + chargeLineItems.reduce(function(s,c){return s+c.amount;},0));

            var thStyle = 'style="font-weight:700;padding:2px 4px;border-bottom:1px dashed #999"';
            var chargeRows = '<tr><th ' + thStyle + ' align="left">Description</th><th ' + thStyle + ' align="center">Qty</th><th ' + thStyle + ' align="right">Disc</th><th ' + thStyle + ' align="right">Net</th><th ' + thStyle + ' align="right">Total</th></tr>';
            if (doctorFee > 0) chargeRows += chargeRow('Doctor Fee', 1, '0', fmt(doctorFee), fmt(doctorFee));
            chargeLineItems.forEach(function(ci) { chargeRows += chargeRow(ci.name, 1, '0', fmt(ci.amount), fmt(ci.amount)); });
            if (!doctorFee && !chargeLineItems.length) chargeRows += '<tr><td colspan="5" style="padding:4px;color:#999;text-align:center">No charges</td></tr>';

            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ER Slip</title>'
                + '<style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:monospace; font-size:12px; color:#111; background:#fff; width:80mm; margin:0 auto; } @page { size:80mm auto; margin:4mm; } table { width:100%; border-collapse:collapse; } .divider { border-top:1px dashed #999; margin:6px 0; } .center { text-align:center; } .no-print { text-align:center; margin:12px 0; } .no-print button { padding:6px 20px;font-size:12px;background:#060740;color:#fff;border:none;border-radius:6px;cursor:pointer } @media print { .no-print { display:none } }</style>'
                + '</head><body>'
                + '<div class="center" style="padding:8px 0 4px">'
                + '<div style="font-size:14px;font-weight:700">' + e(hospName) + '</div>'
                + (phone   ? '<div style="font-size:10px;color:#555">Tel: ' + e(phone) + '</div>' : '')
                + (website ? '<div style="font-size:10px;color:#555">' + e(website) + '</div>' : '')
                + '</div>'
                + '<div class="divider"></div>'
                + '<div class="center" style="font-size:11px;font-weight:700;letter-spacing:1px">EMERGENCY REGISTRATION SLIP</div>'
                + '<div class="center" style="font-size:10px;color:#555">' + e(dateStr) + ' | ' + e(timeStr) + '</div>'
                + '<div class="divider"></div>'
                + '<table>'
                + row('Patient',    patientName)
                + row('MRN',        mrn)
                + row('Visit ID',   visitId)
                + row('Bill ID',    billId)
                + row('Doctor',     doctorName)
                + row('Dept',       department)
                + row('ESI Level',  esi)
                + row('Triage',     triage)
                + row('Arrival',    modeArr)
                + row('Phone',      patPhone)
                + row('CNIC',       cnic)
                + row('Age/Gender', age + (gender !== '\u2014' ? ' / ' + gender : ''))
                + row('Arr. Date',  arrDateStr)
                + row('Complaint',  complaint)
                + row('MLC',        mlcText)
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

    /* ══════════════════ TREATMENT TOOLBAR WINDOW FUNCTIONS ══════════════════ */
    window.toggleErOrdFilter = function() {
        var pane = document.getElementById('erOrdFilterPane');
        var btn  = document.getElementById('btnErOrdFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        if (btn) btn.classList.toggle('active', !open);
        lucide.createIcons();
    };

    window.applyErOrdFilters = function() {
        var status   = ($('#erOrdStatusFilter').val()  || '');
        var doctor   = ($('#erOrdDoctorFilter').val()  || '');
        var esi      = ($('#erOrdEsiFilter').val()     || '');
        var dateFrom = ($('#erOrdDateFrom').val()      || '');
        var dateTo   = ($('#erOrdDateTo').val()        || '');
        var stVal    = (!status || status === 'All Status')     ? 'all' : status;
        var docVal   = (!doctor || doctor === 'All Doctors')    ? 'all' : doctor.replace(/^Dr\. /, '');
        var esiVal   = (!esi    || esi    === 'All ESI Levels') ? 'all' : esi;
        var allVisits = visits.filter(function(v) {
            return v.status === 'Active' || v.status === 'In Treatment' || v.status === 'Under Observation' || !v.status || v.status === 'Waiting';
        });
        erOrdFiltered = allVisits.filter(function(v) {
            if (stVal  !== 'all' && (v.clinicalStatus || v.status || '') !== stVal)  return false;
            if (docVal !== 'all' && (v.doctorName || '') !== docVal) return false;
            if (esiVal !== 'all' && (v.esi || '') !== esiVal) return false;
            var d = v.consultationDate ? v.consultationDate.split('T')[0] : '';
            if (dateFrom && d && d < dateFrom) return false;
            if (dateTo   && d && d > dateTo)   return false;
            return true;
        });
        var active = [stVal !== 'all', docVal !== 'all', esiVal !== 'all', !!dateFrom, !!dateTo].filter(Boolean).length;
        var badge = document.getElementById('erOrdFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
        erOrdCurrentPage = 1;
        renderTreatmentTab();
        var pane = document.getElementById('erOrdFilterPane'); if (pane) pane.style.display = 'none';
    };

    window.resetErOrdFilters = function() {
        ['erOrdCsStatus','erOrdCsDoctor','erOrdCsEsi'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        ['erOrdDpDateFrom','erOrdDpDateTo'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        var badge = document.getElementById('erOrdFilterBadge'); if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        erOrdFiltered = null; erOrdCurrentPage = 1;
        renderTreatmentTab();
    };

    window.toggleErOrdRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erOrdRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setErOrdRowsPer = function(n) {
        erOrdPerPageVal = n; erOrdCurrentPage = 1;
        var m = document.getElementById('erOrdRowsMenu'); if (m) m.classList.remove('open');
        renderTreatmentTab();
    };

    window.toggleErOrdColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erOrdColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.erOrdColVisSelectAll = function() {
        $('#erOrdColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyErOrdColVis = function() {
        var m = document.getElementById('erOrdColVisMenu'); if (m) m.classList.remove('open');
        $('#erOrdColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col')); var show = $(this).is(':checked');
            $('#erOrdTable thead tr th:eq(' + col + ')').toggle(show);
            $('#erOrdTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleErOrdExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erOrdExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportErOrd = function(type) {
        var m = document.getElementById('erOrdExportMenu'); if (m) m.classList.remove('open');
        var allVisits = visits.filter(function(v) {
            return v.status === 'Active' || v.status === 'In Treatment' || v.status === 'Under Observation' || !v.status || v.status === 'Waiting';
        });
        var src = erOrdFiltered !== null ? erOrdFiltered : allVisits;
        var hdrs = ['Patient Name','Visit ID / ESI','Chief Complaint','Doctor','Pending Orders','Active Meds','Last Order','Status'];
        var rows = src.map(function(v) {
            var esiLabel = (v.esi || '').replace(/^\d\s*-\s*/, '') || '-';
            var visitIdShort = (v.visitId || '').split('-').slice(-2).join('-') || v.visitId || '-';
            var visitDate = v.visitDate || v.createdAt || null;
            var hoursAgo = '-';
            if (visitDate) { var diff = Math.floor((Date.now() - new Date(visitDate).getTime()) / 3600000); hoursAgo = diff < 1 ? 'Just now' : diff < 24 ? diff + 'h ago' : Math.floor(diff/24) + 'd ago'; }
            return [v.patientName || '', visitIdShort + ' / ' + esiLabel, v.chiefComplaint || '', v.doctorName || '', '-', '-', hoursAgo, v.status || ''];
        });
        if (type === 'csv') {
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(','));});
            var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href=url; a.download='er-orders.csv'; a.click(); URL.revokeObjectURL(url);
        } else if (type === 'print') { window.print(); }
    };

    /* ══════════════════ TRIAGE TOOLBAR WINDOW FUNCTIONS ══════════════════ */
    window.toggleErTriFilter = function() {
        var pane = document.getElementById('erTriFilterPane');
        var btn  = document.getElementById('btnErTriFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        if (btn) btn.classList.toggle('active', !open);
        lucide.createIcons();
    };

    window.applyErTriFilters = function() {
        var category = ($('#erTriCategoryFilter').val() || '');
        var status   = ($('#erTriStatusFilter').val()   || '');
        var doctor   = ($('#erTriDoctorFilter').val()   || '');
        var dateFrom = ($('#erTriDateFrom').val()        || '');
        var dateTo   = ($('#erTriDateTo').val()          || '');
        var catVal   = (!category || category === 'All Categories') ? 'all' : category.split(' — ')[0];
        var stVal    = (!status   || status   === 'All Status')     ? 'all' : status;
        var docVal   = (!doctor   || doctor   === 'All Doctors')    ? 'all' : doctor.replace(/^Dr\. /,'');
        erTriFiltered = visits.filter(function(v) {
            if (catVal !== 'all' && (v.triageCategory || '') !== catVal) return false;
            if (stVal  !== 'all' && (v.clinicalStatus  || '') !== stVal)  return false;
            if (docVal !== 'all' && (v.doctorName       || '') !== docVal) return false;
            var d = v.consultationDate ? v.consultationDate.split('T')[0] : '';
            if (dateFrom && d && d < dateFrom) return false;
            if (dateTo   && d && d > dateTo)   return false;
            return true;
        });
        var active = [catVal !== 'all', stVal !== 'all', docVal !== 'all', !!dateFrom, !!dateTo].filter(Boolean).length;
        var badge = document.getElementById('erTriFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
        erTriCurrentPage = 1;
        renderTriageTable();
        var pane = document.getElementById('erTriFilterPane'); if (pane) pane.style.display = 'none';
    };

    window.resetErTriFilters = function() {
        ['erTriCsCategory','erTriCsStatus','erTriCsDoctor'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        ['erTriDpDateFrom','erTriDpDateTo'].forEach(function(id){ var w=document.getElementById(id); if(w&&w._reset) w._reset(); });
        var badge = document.getElementById('erTriFilterBadge'); if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        erTriFiltered = null; erTriCurrentPage = 1;
        renderTriageTable();
    };

    window.toggleErTriRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erTriRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setErTriRowsPer = function(n) {
        erTriPerPageVal = n; erTriCurrentPage = 1;
        var m = document.getElementById('erTriRowsMenu'); if (m) m.classList.remove('open');
        renderTriageTable();
    };

    window.toggleErTriColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erTriColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.erTriColVisSelectAll = function() {
        $('#erTriColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyErTriColVis = function() {
        var m = document.getElementById('erTriColVisMenu'); if (m) m.classList.remove('open');
        $('#erTriColVisList input[type=checkbox]').each(function() {
            var col = parseInt($(this).data('col')); var show = $(this).is(':checked');
            $('#erTriageTable thead tr th:eq(' + col + ')').toggle(show);
            $('#erTriageTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleErTriExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erTriExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportErTri = function(type) {
        var m = document.getElementById('erTriExportMenu'); if (m) m.classList.remove('open');
        var src = erTriFiltered !== null ? erTriFiltered : visits;
        var hdrs = ['MRN','Patient Name','Visit ID','Arrival Time','Triage Category','Chief Complaint','Assigned To','Time in ER','Status','Date & Time'];
        var rows = src.slice().sort(function(a,b){ return new Date(b.consultationDate) - new Date(a.consultationDate); }).map(function(v) {
            return [v.mrn, v.patientName, v.visitId,
                new Date(v.consultationDate).toLocaleString(),
                v.triageCategory || '', v.chiefComplaint || '',
                'Dr. ' + (v.doctorName || ''),
                getMinutesAgo(v.consultationDate) + 'm',
                v.clinicalStatus || '',
                new Date(v.consultationDate).toLocaleString()];
        });
        if (type === 'csv') {
            var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
            rows.forEach(function(r){lines.push(r.map(function(c){return '"'+(c+'').replace(/"/g,'""')+'"';}).join(','));});
            var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href=url; a.download='er-triage.csv'; a.click(); URL.revokeObjectURL(url);
        } else if (type === 'print') { window.print(); }
    };

    /* ══════════════════ DISPOSITION TOOLBAR WINDOW FUNCTIONS ══════════════════ */
    window.toggleErDispFilter = function() {
        var pane = document.getElementById('erDispFilterPane');
        var btn  = document.getElementById('btnErDispFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        if (btn) btn.classList.toggle('active', !open);
        lucide.createIcons();
    };

    window.applyErDispFilters = function() {
        var status = ($('#erDispStatusFilter').val()      || '');
        var disp   = ($('#erDispDispositionFilter').val() || '');
        var doctor = ($('#erDispDoctorFilter').val()      || '');
        var dateFrom = ($('#erDispDateFrom').val()        || '');
        var dateTo   = ($('#erDispDateTo').val()          || '');
        var stVal  = (!status || status === 'All Status')  ? 'all' : status;
        var dpVal  = (!disp   || disp   === 'All Types')   ? 'all' : disp;
        var docVal = (!doctor || doctor === 'All Doctors') ? 'all' : doctor.replace(/^Dr\. /, '');

        erDispFiltered = visits.filter(function(v) {
            if (stVal !== 'all') {
                var ds = v.dischargeStatus || '';
                var mapped = ds === 'discharged' ? 'Discharged' : ds === 'pending_clearance' ? 'Awaiting Clearance' : 'Not Started';
                if (mapped !== stVal) return false;
            }
            if (dpVal  !== 'all' && (v.disposition || '-') !== dpVal)  return false;
            if (docVal !== 'all' && (v.doctorName  || '')  !== docVal) return false;
            if (dateFrom || dateTo) {
                var d = v.consultationDate ? new Date(v.consultationDate) : null;
                if (d) {
                    if (dateFrom && d < new Date(dateFrom))                   return false;
                    if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false;
                }
            }
            return true;
        });

        var active = [stVal !== 'all', dpVal !== 'all', docVal !== 'all', !!dateFrom, !!dateTo].filter(Boolean).length;
        var badge = document.getElementById('erDispFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
        erDispCurrentPage = 1;
        renderDispositionTab();
        var pane = document.getElementById('erDispFilterPane'); if (pane) pane.style.display = 'none';
    };

    window.resetErDispFilters = function() {
        ['erDispCsStatus','erDispCsDisposition','erDispCsDoctor'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        ['erDispDpDateFrom','erDispDpDateTo'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        var badge = document.getElementById('erDispFilterBadge'); if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        erDispFiltered = null; erDispCurrentPage = 1;
        renderDispositionTab();
    };

    window.toggleErDispRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erDispRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setErDispRowsPer = function(n) {
        erDispPerPageVal = n; erDispCurrentPage = 1;
        var m = document.getElementById('erDispRowsMenu'); if (m) m.classList.remove('open');
        renderDispositionTab();
    };

    window.toggleErDispColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erDispColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.erDispColVisSelectAll = function() {
        $('#erDispColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyErDispColVis = function() {
        var m = document.getElementById('erDispColVisMenu'); if (m) m.classList.remove('open');
        $('#erDispColVisList input[type=checkbox]').each(function() {
            var col  = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#erDispositionTable thead tr th:eq(' + col + ')').toggle(show);
            $('#erDispositionTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleErDispExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erDispExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportErDisp = function(type) {
        var m = document.getElementById('erDispExportMenu'); if (m) m.classList.remove('open');
        var src  = erDispFiltered !== null ? erDispFiltered : visits;
        var hdrs = ['Patient','MRN','Visit ID','Chief Complaint','Time in ER','Disposition','Discharge Status'];
        var rows = src.map(function(v) {
            var ds     = v.dischargeStatus || '';
            var mapped = ds === 'discharged' ? 'Discharged' : ds === 'pending_clearance' ? 'Awaiting Clearance' : 'Not Started';
            return [v.patientName || '-', v.mrn || '-', v.visitId || '-', v.chiefComplaint || '-',
                getTimeInER(v.consultationDate), v.disposition || '-', mapped];
        });
        if (type === 'csv') {
            var lines = [hdrs.join(',')].concat(rows.map(function(r) {
                return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
            }));
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'er-disposition.csv'; a.click(); URL.revokeObjectURL(url);
        } else if (type === 'print') { window.print(); }
    };

    /* ══════════════════ INVESTIGATIONS TOOLBAR WINDOW FUNCTIONS ══════════════════ */
    window.toggleErInvFilter = function() {
        var pane = document.getElementById('erInvFilterPane');
        var btn  = document.getElementById('btnErInvFilter');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        if (btn) btn.classList.toggle('active', !open);
        lucide.createIcons();
    };

    window.applyErInvFilters = function() {
        var status   = ($('#erInvStatusFilter').val()   || '');
        var type     = ($('#erInvTypeFilter').val()     || '');
        var priority = ($('#erInvPriorityFilter').val() || '');
        var dateFrom = ($('#erInvDateFrom').val()       || '');
        var dateTo   = ($('#erInvDateTo').val()         || '');
        var stVal    = (!status   || status   === 'All Status')     ? 'all' : status;
        var typeVal  = (!type     || type     === 'All Types')      ? 'all' : type.toLowerCase();
        var prioVal  = (!priority || priority === 'All Priorities') ? 'all' : priority.toLowerCase();

        var grouped = (erClinicalInvestigations && erClinicalInvestigations.grouped) ? erClinicalInvestigations.grouped : [];
        erInvFiltered = grouped.filter(function(g) {
            var invs     = g.investigations || [];
            var firstInv = invs[0] || {};
            if (stVal !== 'all') {
                var allOrdered  = invs.every(function(i) { return i.status !== 'pending'; });
                var anyComplete = invs.some(function(i)  { return i.status === 'completed'; });
                var gs = allOrdered && anyComplete ? 'completed' : allOrdered ? 'in progress' : 'pending';
                if (stVal === 'Pending'     && gs !== 'pending')     return false;
                if (stVal === 'In Progress' && gs !== 'in progress') return false;
                if (stVal === 'Completed'   && gs !== 'completed')   return false;
            }
            if (typeVal !== 'all') {
                if (!invs.some(function(i) { return (i.type || '').toLowerCase() === typeVal; })) return false;
            }
            if (prioVal !== 'all') {
                if ((firstInv.priority || 'routine').toLowerCase() !== prioVal) return false;
            }
            if (dateFrom || dateTo) {
                var d = firstInv.date ? new Date(firstInv.date) : null;
                if (d) {
                    if (dateFrom && d < new Date(dateFrom))                    return false;
                    if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false;
                }
            }
            return true;
        });

        var active = [stVal !== 'all', typeVal !== 'all', prioVal !== 'all', !!dateFrom, !!dateTo].filter(Boolean).length;
        var badge = document.getElementById('erInvFilterBadge');
        if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
        erInvCurrentPage = 1;
        renderInvestigationsTab();
        var pane = document.getElementById('erInvFilterPane'); if (pane) pane.style.display = 'none';
    };

    window.resetErInvFilters = function() {
        ['erInvCsStatus','erInvCsType','erInvCsPriority'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        ['erInvDpDateFrom','erInvDpDateTo'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
        var badge = document.getElementById('erInvFilterBadge'); if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        erInvFiltered = null; erInvCurrentPage = 1;
        renderInvestigationsTab();
    };

    window.toggleErInvRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erInvRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setErInvRowsPer = function(n) {
        erInvPerPageVal = n; erInvCurrentPage = 1;
        var m = document.getElementById('erInvRowsMenu'); if (m) m.classList.remove('open');
        renderInvestigationsTab();
    };

    window.toggleErInvColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erInvColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.erInvColVisSelectAll = function() {
        $('#erInvColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyErInvColVis = function() {
        var m = document.getElementById('erInvColVisMenu'); if (m) m.classList.remove('open');
        $('#erInvColVisList input[type=checkbox]').each(function() {
            var col  = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#erInvestigationsTable thead tr th:eq(' + col + ')').toggle(show);
            $('#erInvestigationsTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleErInvExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('erInvExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportErInv = function(type) {
        var m = document.getElementById('erInvExportMenu'); if (m) m.classList.remove('open');
        var grouped = (erClinicalInvestigations && erClinicalInvestigations.grouped) ? erClinicalInvestigations.grouped : [];
        var src  = erInvFiltered !== null ? erInvFiltered : grouped;
        var hdrs = ['Date/Time','Patient','MRN','Visit ID','Type','Tests','Ordered By','Priority','Status'];
        var rows = src.map(function(g) {
            var invs = g.investigations || [];
            var firstInv    = invs[0] || {};
            var allOrdered  = invs.every(function(i) { return i.status !== 'pending'; });
            var anyComplete = invs.some(function(i)  { return i.status === 'completed'; });
            var st          = allOrdered && anyComplete ? 'Completed' : allOrdered ? 'Sent to Lab' : 'Pending';
            var labC = invs.filter(function(i) { return i.type === 'lab'; }).length;
            var radC = invs.filter(function(i) { return i.type === 'radiology'; }).length;
            var typeStr = [labC > 0 ? 'Lab x' + labC : '', radC > 0 ? 'Rad x' + radC : ''].filter(Boolean).join(', ');
            return [firstInv.date || '-', g.patient || '-', g.mrn || '-', g.admissionId || '-', typeStr,
                invs.length + ' test(s)', firstInv.orderedBy || '-', (firstInv.priority || 'Routine').toUpperCase(), st];
        });
        if (type === 'csv') {
            var lines = [hdrs.join(',')].concat(rows.map(function(r) {
                return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
            }));
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'er-investigations.csv'; a.click(); URL.revokeObjectURL(url);
        } else if (type === 'print') { window.print(); }
    };

    /* close ER triage dropdowns on outside click */
    $(document).on('click.erTriDropdowns', function(e) {
        var $t = $(e.target);
        if (!$t.closest('.opd-rows-wrap').length)    { var m = document.getElementById('erTriRowsMenu');   if (m) m.classList.remove('open'); }
        if (!$t.closest('.opd-col-vis-wrap').length) { var c = document.getElementById('erTriColVisMenu'); if (c) c.classList.remove('open'); }
        if (!$t.closest('.opd-export-wrap').length)  { var x = document.getElementById('erTriExportMenu'); if (x) x.classList.remove('open'); }
        /* treatment dropdowns */
        if (!$t.closest('.opd-rows-wrap').length)    { var m2 = document.getElementById('erOrdRowsMenu');   if (m2) m2.classList.remove('open'); }
        if (!$t.closest('.opd-col-vis-wrap').length) { var c2 = document.getElementById('erOrdColVisMenu'); if (c2) c2.classList.remove('open'); }
        if (!$t.closest('.opd-export-wrap').length)  { var x2 = document.getElementById('erOrdExportMenu'); if (x2) x2.classList.remove('open'); }
        /* investigations dropdowns */
        if (!$t.closest('.opd-rows-wrap').length)    { var m3 = document.getElementById('erInvRowsMenu');   if (m3) m3.classList.remove('open'); }
        if (!$t.closest('.opd-col-vis-wrap').length) { var c3 = document.getElementById('erInvColVisMenu'); if (c3) c3.classList.remove('open'); }
        if (!$t.closest('.opd-export-wrap').length)  { var x3 = document.getElementById('erInvExportMenu'); if (x3) x3.classList.remove('open'); }
        /* disposition dropdowns */
        if (!$t.closest('.opd-rows-wrap').length)    { var m4 = document.getElementById('erDispRowsMenu');   if (m4) m4.classList.remove('open'); }
        if (!$t.closest('.opd-col-vis-wrap').length) { var c4 = document.getElementById('erDispColVisMenu'); if (c4) c4.classList.remove('open'); }
        if (!$t.closest('.opd-export-wrap').length)  { var x4 = document.getElementById('erDispExportMenu'); if (x4) x4.classList.remove('open'); }
    });

    /* ══════════════════ CUSTOM DATE PICKER & SEARCHABLE SELECT ══════════════════ */
    var MONTHS_ER = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DAYS_ER   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function erCloseAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) { p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open'); });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) { p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open'); });
    }
    document.addEventListener('click', erCloseAll);

    function erRepositionOpen() {
        document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
            if (!p._trigger) return;
            var rect = p._trigger.getBoundingClientRect();
            p.style.top  = (rect.bottom + 6) + 'px';
            p.style.left = rect.left + 'px';
        });
    }
    window.addEventListener('scroll', erRepositionOpen, true);
    window.addEventListener('resize', erRepositionOpen);

    function erInitDp(wrapId) {
        var wrap = document.getElementById(wrapId);
        if (!wrap) return;
        var hiddenId = wrap.dataset.target;
        var ph       = wrap.dataset.placeholder || 'Select date';
        var trigger  = wrap.querySelector('.opd-dp-trigger');
        var valEl    = wrap.querySelector('.opd-dp-val');
        var popup    = wrap.querySelector('.opd-dp-popup');
        var hidden   = document.getElementById(hiddenId);
        var selDate  = null;
        var viewYear = new Date().getFullYear();
        var viewMonth= new Date().getMonth();

        function render() {
            var firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
            var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
            var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + MONTHS_ER[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
            DAYS_ER.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
            for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= daysInMonth; d++) {
                var cur = new Date(viewYear, viewMonth, d);
                var cls = 'opd-dp-day' + (selDate && cur.toDateString() === selDate.toDateString() ? ' selected' : '');
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
                    erCloseAll();
                });
            });
        }
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = popup.classList.contains('open');
            erCloseAll();
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

    function erInitCs(wrapId) {
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
                    erCloseAll();
                });
            });
        }
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = popup.classList.contains('open');
            erCloseAll();
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

    /* Initialize all ER custom components */
    $(function() {
        /* Triage date pickers & searchable selects */
        ['erTriDpDateFrom','erTriDpDateTo'].forEach(erInitDp);
        ['erTriCsCategory','erTriCsStatus','erTriCsDoctor'].forEach(erInitCs);
        var catWrap = document.getElementById('erTriCsCategory');
        if (catWrap && catWrap.setOptions) catWrap.setOptions(['All Categories','Red — Critical','Orange — Very Urgent','Yellow — Urgent','Green — Less Urgent','Blue — Non-Urgent']);
        var stWrap = document.getElementById('erTriCsStatus');
        if (stWrap && stWrap.setOptions) stWrap.setOptions(['All Status','Waiting','In Treatment','Discharged','Admitted']);

        /* Treatment & Orders date pickers & searchable selects */
        ['erOrdDpDateFrom','erOrdDpDateTo'].forEach(erInitDp);
        ['erOrdCsStatus','erOrdCsDoctor','erOrdCsEsi'].forEach(erInitCs);
        var ordStWrap = document.getElementById('erOrdCsStatus');
        if (ordStWrap && ordStWrap.setOptions) ordStWrap.setOptions(['All Status','Waiting','In Treatment','Under Observation','Discharged']);
        var ordEsiWrap = document.getElementById('erOrdCsEsi');
        if (ordEsiWrap && ordEsiWrap.setOptions) ordEsiWrap.setOptions(['All ESI Levels','1 - Immediate','2 - Emergent','3 - Urgent','4 - Less Urgent','5 - Non-Urgent']);

        /* Disposition date pickers & searchable selects */
        ['erDispDpDateFrom','erDispDpDateTo'].forEach(erInitDp);
        ['erDispCsStatus','erDispCsDisposition','erDispCsDoctor'].forEach(erInitCs);
        var dispStWrap = document.getElementById('erDispCsStatus');
        if (dispStWrap && dispStWrap.setOptions) dispStWrap.setOptions(['All Status','Not Started','Awaiting Clearance','Discharged']);

        /* Investigations date pickers & searchable selects */
        ['erInvDpDateFrom','erInvDpDateTo'].forEach(erInitDp);
        ['erInvCsStatus','erInvCsType','erInvCsPriority'].forEach(erInitCs);
        var invStWrap = document.getElementById('erInvCsStatus');
        if (invStWrap && invStWrap.setOptions) invStWrap.setOptions(['All Status','Pending','In Progress','Completed']);
        var invTypeWrap = document.getElementById('erInvCsType');
        if (invTypeWrap && invTypeWrap.setOptions) invTypeWrap.setOptions(['All Types','Lab','Radiology']);
        var invPrioWrap = document.getElementById('erInvCsPriority');
        if (invPrioWrap && invPrioWrap.setOptions) invPrioWrap.setOptions(['All Priorities','Routine','Urgent','STAT']);

        if (window.lucide) lucide.createIcons();
    });
});
