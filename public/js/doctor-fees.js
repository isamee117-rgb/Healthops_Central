$(document).ready(function() {
    var fees = [];
    var doctors = [];
    var editingFeeId = null;
    var hospitalInfo = { currency: 'PKR' };

    // ── Toolbar state ─────────────────────────────────────────────────────────
    var dfCurrentPage = 1;
    var dfPerPageVal  = 10;
    var dfFiltered    = null;

    function esc(s) { return $('<span>').text(s || '').html(); }
    function fmt(n) { return (hospitalInfo.currency || 'PKR') + ' ' + Number(n || 0).toLocaleString(); }
    function getInitials(name) {
        var parts = (name || '').replace(/^Dr\.?\s*/i, '').split(' ');
        return (parts[0] || '')[0] + (parts[1] || '')[0] || '';
    }

    var serviceCategories = [
        { id: 'OPD', label: 'OPD', desc: 'Out-Patient Department', icon: 'stethoscope', color: '#16a34a', bgColor: 'rgba(22,163,74,0.08)' },
        { id: 'IPD', label: 'IPD', desc: 'In-Patient Department', icon: 'building-2', color: '#9333ea', bgColor: 'rgba(147,51,234,0.08)' },
        { id: 'OT_SURGEON', label: 'OT (Surgeon)', desc: 'Operation Theatre - Surgeon', icon: 'scissors', color: '#ea580c', bgColor: 'rgba(234,88,12,0.08)' },
        { id: 'OT_ANAESTHETIST', label: 'OT (Anaesthetist)', desc: 'Operation Theatre - Anaesthetist', icon: 'wind', color: '#0891b2', bgColor: 'rgba(8,145,178,0.08)' },
        { id: 'ER', label: 'ER', desc: 'Emergency Room', icon: 'siren', color: '#dc2626', bgColor: 'rgba(220,38,38,0.08)' }
    ];

    var procedures = [
        'Appendectomy','Cataract Surgery','Knee Arthroscopy','Hernia Repair',
        'Gall Bladder Removal','Hysterectomy','Prostate Surgery','Cardiac Bypass',
        'Cesarean Section (C-Section)','Tonsillectomy','Hip Replacement',
        'Spinal Fusion','Laparoscopic Surgery','Mastectomy','Thyroidectomy',
        'Colectomy','Coronary Angioplasty','Kidney Stone Removal',
        'Endoscopy','Colonoscopy','Breast Biopsy','Skin Grafting',
        'Fracture Fixation','Cystoscopy','Dental Extraction'
    ];

    var visitTypes = [
        'New Patient Visit', 'Follow-up Visit', 'Consultation', 'Referral Visit', 'Routine Checkup',
        'Pre-Operative Visit', 'Post-Operative Visit', 'Specialist Consultation', 'Telemedicine Visit'
    ];

    function safeGet(url) {
        return $.get(url).then(function(d) { return d; }, function() { return null; });
    }

    function loadAllData() {
        $.when(
            safeGet('/api/config/doctor-fees'),
            safeGet('/api/doctors'),
            safeGet('/api/config/hospital-info')
        ).done(function(feesData, doctorsData, infoData) {
            fees = feesData || [];
            doctors = (doctorsData || []).filter(function(d) { return d.status === 'ACTIVE'; });
            if (infoData) hospitalInfo = $.extend({ currency: 'PKR' }, infoData);
            renderStats();
            renderTable();
            populateDoctorFilter();
        });
    }

    function populateDoctorFilter() {
        var docMap = {};
        fees.forEach(function(f) { if (f.doctorId && f.doctorName) docMap[f.doctorId] = f.doctorName; });
        var names = ['All Doctors'].concat(
            Object.keys(docMap).sort(function(a, b) { return docMap[a].localeCompare(docMap[b]); }).map(function(id) { return docMap[id]; })
        );
        var docWrap = document.getElementById('dfCsDoctor');
        if (docWrap && docWrap.setOptions) docWrap.setOptions(names);
        // store id→name map for filter lookup
        docWrap._docMap = docMap;
    }

    function renderStats() {
        var total = fees.length;
        var opd = fees.filter(function(f) { return f.serviceType === 'OPD'; }).length;
        var ipd = fees.filter(function(f) { return f.serviceType === 'IPD'; }).length;
        var otSurgeon = fees.filter(function(f) { return f.serviceType === 'OT_SURGEON'; }).length;
        var otAnaes = fees.filter(function(f) { return f.serviceType === 'OT_ANAESTHETIST'; }).length;
        var er = fees.filter(function(f) { return f.serviceType === 'ER'; }).length;
        $('#statTotalFees').text(total);
        $('#statOPD').text(opd);
        $('#statIPD').text(ipd);
        $('#statOTSurgeon').text(otSurgeon);
        $('#statOTAnaes').text(otAnaes);
        $('#statER').text(er);
    }

    function getFiltered() {
        var search  = ($('#feeSearch').val()    || '').toLowerCase();
        var catVal  = ($('#dfCatFilter').val()  || '').toLowerCase();
        var docName = ($('#dfDocFilter').val()  || '').toLowerCase();
        var dfVal   = $('#dfDateFrom').val() || '';
        var dtVal   = $('#dfDateTo').val()   || '';

        // Map display label → serviceType code
        var catCode = { 'ot (surgeon)': 'ot_surgeon', 'ot (anaesthetist)': 'ot_anaesthetist' };
        var resolvedCat = catCode[catVal] || catVal;

        var base = dfFiltered !== null ? dfFiltered : fees;
        return base.filter(function(f) {
            if (search && (f.doctorName||'').toLowerCase().indexOf(search) < 0 && (f.serviceType||'').toLowerCase().indexOf(search) < 0 && (f.procedure||'').toLowerCase().indexOf(search) < 0 && (f.visitType||'').toLowerCase().indexOf(search) < 0 && (f.feeId||'').toLowerCase().indexOf(search) < 0) return false;
            if (resolvedCat && resolvedCat !== 'all categories' && (f.serviceType||'').toLowerCase() !== resolvedCat) return false;
            if (docName     && docName     !== 'all doctors'    && (f.doctorName||'').toLowerCase()  !== docName)     return false;
            var dateStr = f.createdAt ? f.createdAt.substring(0, 10) : '';
            if (dfVal && dateStr && dateStr < dfVal) return false;
            if (dtVal && dateStr && dateStr > dtVal) return false;
            return true;
        });
    }

    function catInfo(type) {
        return serviceCategories.find(function(c) { return c.id === type; }) || { label: type || 'N/A', color: '#6b7280', icon: 'file-text' };
    }

    function catBadge(type) {
        var c = catInfo(type);
        return '<span class="badge" style="background:' + c.bgColor + ';color:' + c.color + ';font-size:10px;font-weight:600">' +
            '<i data-lucide="' + c.icon + '" style="width:12px;height:12px;margin-right:4px"></i>' + esc(c.label) + '</span>';
    }

    function renderTable() {
        _dfRenderPagination(getFiltered());
    }

    function _dfRenderPagination(source) {
        var total    = source.length;
        var totalPgs = Math.max(1, Math.ceil(total / dfPerPageVal));
        if (dfCurrentPage > totalPgs) dfCurrentPage = totalPgs;
        var start = (dfCurrentPage - 1) * dfPerPageVal;
        var page  = source.slice(start, start + dfPerPageVal);

        var html = '';
        if (page.length === 0) {
            html = '<tr><td colspan="7"><div class="empty-state"><i data-lucide="receipt"></i><p>No fee records found</p><p class="empty-sub">Get started by adding your first doctor fee</p><button class="btn-primary" onclick="$(\'#btnAddDoctorFee\').click()"><i data-lucide="plus-circle"></i> Add Doctor Fee</button></div></td></tr>';
        } else {
            page.forEach(function(f) {
                var c = catInfo(f.serviceType);
                var dateStr = f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '-';
                html += '<tr class="fee-row" data-fee-id="' + esc(f.feeId) + '" style="cursor:pointer;border-left:3px solid ' + c.color + '">' +
                    '<td class="font-mono" style="font-size:12px;font-weight:500;color:var(--midnight-blue)">' + esc(f.feeId) + '</td>' +
                    '<td><div style="display:flex;align-items:center;gap:10px">' +
                        '<div class="avatar avatar-sm" style="background:var(--midnight-blue);color:#fff;font-size:11px">' + esc(getInitials(f.doctorName)) + '</div>' +
                        '<div><span style="font-weight:600;font-size:13px;color:var(--midnight-blue)">' + esc(f.doctorName) + '</span>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(f.doctorId) + '</div></div></div></td>' +
                    '<td>' + catBadge(f.serviceType) + '</td>' +
                    '<td style="font-size:13px">' + esc(f.serviceType === 'OPD' ? (f.visitType || 'Consultation') : f.procedure || (f.serviceType === 'IPD' ? 'Per-Round Visit' : f.serviceType === 'ER' ? 'ER Consultation' : '-')) + '</td>' +
                    '<td style="text-align:right;font-weight:700;font-size:14px;color:var(--midnight-blue)">' + fmt(f.fee) + '</td>' +
                    '<td style="font-size:12px;color:var(--color-muted-foreground)">' + dateStr + '</td>' +
                    '<td><div class="dropdown" onclick="event.stopPropagation()"><button class="btn-ghost btn-icon" data-bs-toggle="dropdown"><i data-lucide="more-vertical"></i></button>' +
                        '<ul class="dropdown-menu dropdown-menu-end">' +
                            '<li><a class="dropdown-item fee-action" data-action="edit" data-id="' + esc(f.feeId) + '"><i data-lucide="pencil" style="width:14px;height:14px"></i> Edit Fee</a></li>' +
                            '<li><hr class="dropdown-divider"></li>' +
                            '<li><a class="dropdown-item fee-action text-danger" data-action="delete" data-id="' + esc(f.feeId) + '"><i data-lucide="trash-2" style="width:14px;height:14px"></i> Delete</a></li>' +
                        '</ul></div></td>' +
                    '</tr>';
            });
        }
        $('#feesTableBody').html(html);

        var from = total === 0 ? 0 : start + 1;
        var to   = Math.min(start + dfPerPageVal, total);
        $('#dfTableInfo').text('Showing ' + from + '\u2013' + to + ' of ' + total + ' records');

        var numsHtml = '';
        var maxBtns = 5, half = Math.floor(maxBtns / 2);
        var pStart = Math.max(1, dfCurrentPage - half);
        var pEnd   = Math.min(totalPgs, pStart + maxBtns - 1);
        if (pEnd - pStart < maxBtns - 1) pStart = Math.max(1, pEnd - maxBtns + 1);
        for (var pg = pStart; pg <= pEnd; pg++) {
            numsHtml += '<button class="opd-page-num' + (pg === dfCurrentPage ? ' active' : '') + '" data-page="' + pg + '">' + pg + '</button>';
        }
        $('#dfPageNums').html(numsHtml);
        $('#dfPrevPage').prop('disabled', dfCurrentPage <= 1);
        $('#dfNextPage').prop('disabled', dfCurrentPage >= totalPgs);

        lucide.createIcons();
    }

    $('#feeSearch').on('input', function() { dfCurrentPage = 1; renderTable(); });

    $(document).on('click', '#dfPageNums .opd-page-num', function() {
        dfCurrentPage = parseInt($(this).data('page')); renderTable();
    });
    $(document).on('click', '#dfPrevPage', function() {
        if (dfCurrentPage > 1) { dfCurrentPage--; renderTable(); }
    });
    $(document).on('click', '#dfNextPage', function() {
        dfCurrentPage++; renderTable();
    });

    $(document).on('click', '.fee-action', function(e) {
        e.preventDefault(); e.stopPropagation();
        var action = $(this).data('action');
        var id = $(this).data('id');
        if (action === 'edit') openEditForm(id);
        else if (action === 'delete') deleteFee(id);
    });

    $(document).on('click', '.fee-row', function() {
        openEditForm($(this).data('fee-id'));
    });

    function buildAddFormHtml() {
        var h = '';
        var secStyle = 'font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;padding-bottom:6px;border-bottom:2px solid var(--aqua-mint)';

        h += '<div class="form-section-title" style="' + secStyle + '"><i data-lucide="list-checks" style="width:16px;height:16px;margin-right:6px"></i> Select Service Categories</div>';
        h += '<p style="font-size:13px;color:var(--color-muted-foreground);margin-bottom:16px">Select a service category to define the fee for.</p>';

        h += '<div id="categoryCheckboxes" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px">';
        serviceCategories.forEach(function(cat) {
            h += '<label class="cat-checkbox-card" data-cat="' + cat.id + '" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid var(--color-border);border-radius:10px;cursor:pointer;transition:all 0.2s;background:#fff">' +
                '<input type="radio" name="cat_select" class="cat-check" value="' + cat.id + '" style="width:18px;height:18px;accent-color:' + cat.color + '">' +
                '<div style="width:36px;height:36px;border-radius:8px;background:' + cat.bgColor + ';display:flex;align-items:center;justify-content:center;flex-shrink:0"><i data-lucide="' + cat.icon + '" style="width:18px;height:18px;color:' + cat.color + '"></i></div>' +
                '<div><div style="font-weight:600;font-size:14px;color:var(--midnight-blue)">' + cat.label + '</div>' +
                '<div style="font-size:11px;color:var(--color-muted-foreground)">' + cat.desc + '</div></div>' +
                '</label>';
        });
        h += '</div>';

        h += '<div id="feeFormError"></div>';
        h += '<div id="categoryForms"></div>';

        h += '<div id="noCategory" style="text-align:center;padding:40px;color:var(--color-muted-foreground)"><i data-lucide="hand-pointing" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i><p style="font-size:14px;font-weight:500">Select a category above to configure fees</p></div>';

        return h;
    }

    function buildCategoryForm(catId) {
        var cat = catInfo(catId);
        var h = '';
        h += '<div class="cat-form-section" data-cat-form="' + catId + '" style="border:2px solid ' + cat.color + ';border-radius:12px;padding:20px;margin-bottom:16px;background:' + cat.bgColor.replace('0.08', '0.03') + '">';
        h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
             '<div style="width:32px;height:32px;border-radius:8px;background:' + cat.bgColor + ';display:flex;align-items:center;justify-content:center"><i data-lucide="' + cat.icon + '" style="width:16px;height:16px;color:' + cat.color + '"></i></div>' +
             '<div><div style="font-weight:700;font-size:15px;color:' + cat.color + '">' + cat.label + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + cat.desc + '</div></div></div>';

        var doctorLabel = 'Select Doctor';
        var feeLabel = 'Fee Amount';
        var feePlaceholder = 'Enter fee amount';
        var showProcedure = false;
        var filterDoctors = doctors;

        var showVisitType = false;
        if (catId === 'OPD') {
            feeLabel = 'OPD Consultation Fee';
            feePlaceholder = 'Enter consultation fee';
            showVisitType = true;
        } else if (catId === 'IPD') {
            feeLabel = 'Per-Round IPD Fee';
            feePlaceholder = 'Enter per-round fee';
        } else if (catId === 'OT_SURGEON') {
            doctorLabel = 'Select Surgeon';
            feeLabel = 'Surgeon Fee Amount';
            feePlaceholder = 'Enter surgeon fee';
            showProcedure = true;
            filterDoctors = doctors.filter(function(d) {
                var s = (d.specialization || '').toLowerCase();
                var dept = (d.department || '').toLowerCase();
                return s.indexOf('surgeon') > -1 || s.indexOf('surgery') > -1 || dept.indexOf('surgery') > -1 || dept === 'ot';
            });
            if (filterDoctors.length === 0) filterDoctors = doctors;
        } else if (catId === 'OT_ANAESTHETIST') {
            doctorLabel = 'Select Anaesthetist';
            feeLabel = 'Anaesthetist Fee Amount';
            feePlaceholder = 'Enter anaesthetist fee';
            showProcedure = true;
            filterDoctors = doctors.filter(function(d) {
                var s = (d.specialization || '').toLowerCase();
                var dept = (d.department || '').toLowerCase();
                return s.indexOf('anesth') > -1 || s.indexOf('anaesth') > -1 || dept.indexOf('anesth') > -1 || dept.indexOf('anaesth') > -1;
            });
            if (filterDoctors.length === 0) filterDoctors = doctors;
        } else if (catId === 'ER') {
            feeLabel = 'ER Consultation Fee';
            feePlaceholder = 'Enter emergency consultation fee';
        }

        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
        h += '<div class="form-group"><label class="form-label">' + doctorLabel + ' <span style="color:#dc2626">*</span></label>';
        h += '<select class="form-select cat-doctor-select" id="fee_doctor_' + catId + '" style="height:40px;font-size:14px" data-cat="' + catId + '">';
        h += '<option value="">-- Select Doctor --</option>';
        filterDoctors.forEach(function(d) {
            h += '<option value="' + esc(d.doctorId) + '" data-name="Dr. ' + esc(d.firstName) + ' ' + esc(d.lastName) + '">Dr. ' + esc(d.firstName) + ' ' + esc(d.lastName) + ' — ' + esc(d.specialization || d.department || '') + '</option>';
        });
        h += '</select>';
        h += '<div class="invalid-feedback" id="err_doctor_' + catId + '"></div></div>';

        if (showVisitType) {
            h += '<div class="form-group"><label class="form-label">Visit Type <span style="color:#dc2626">*</span></label>';
            h += '<select class="form-select cat-visit-type-select" id="fee_visit_type_' + catId + '" style="height:40px;font-size:14px" data-cat="' + catId + '">';
            h += '<option value="">-- Select Visit Type --</option>';
            visitTypes.forEach(function(v) {
                h += '<option value="' + esc(v) + '">' + esc(v) + '</option>';
            });
            h += '</select>';
            h += '<div class="invalid-feedback" id="err_visit_type_' + catId + '"></div></div>';
        } else if (showProcedure) {
            h += '<div class="form-group"><label class="form-label">Procedure & Surgery <span style="color:#dc2626">*</span></label>';
            h += '<select class="form-select" id="fee_procedure_' + catId + '" style="height:40px;font-size:14px">';
            h += '<option value="">-- Select Procedure --</option>';
            procedures.forEach(function(p) {
                h += '<option value="' + esc(p) + '">' + esc(p) + '</option>';
            });
            h += '</select>';
            h += '<div class="invalid-feedback" id="err_procedure_' + catId + '"></div></div>';
        } else {
            h += '<div></div>';
        }

        h += '</div>';

        h += '<div style="margin-top:12px">';
        h += '<div class="form-group"><label class="form-label">' + feeLabel + ' <span style="color:#dc2626">*</span></label>';
        h += '<div style="position:relative"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-weight:700;color:var(--midnight-blue);font-size:14px">' + esc(hospitalInfo.currency || 'PKR') + '</span>';
        h += '<input type="number" class="form-control cat-fee-input" id="fee_amount_' + catId + '" min="0" step="100" placeholder="' + feePlaceholder + '" style="padding-left:50px;height:40px;font-size:14px;font-weight:600" data-cat="' + catId + '">';
        h += '</div><div class="invalid-feedback" id="err_amount_' + catId + '"></div></div>';
        h += '</div>';

        h += '</div>';
        return h;
    }

    function validateForm() {
        var valid = true;
        var anyChecked = false;
        $('.cat-check:checked').each(function() {
            anyChecked = true;
            var catId = $(this).val();
            var docVal = $('#fee_doctor_' + catId).val();
            var feeVal = $('#fee_amount_' + catId).val();
            if (!docVal) { $('#err_doctor_' + catId).text('Please select a doctor').show(); valid = false; }
            else { $('#err_doctor_' + catId).hide(); }

            if (catId === 'OPD' && !$('#fee_visit_type_' + catId).val()) {
                $('#err_visit_type_' + catId).text('Please select a visit type').show(); valid = false;
            } else if ($('#err_visit_type_' + catId).length) { $('#err_visit_type_' + catId).hide(); }

            if ((catId === 'OT_SURGEON' || catId === 'OT_ANAESTHETIST') && !$('#fee_procedure_' + catId).val()) {
                $('#err_procedure_' + catId).text('Please select a procedure').show(); valid = false;
            } else if ($('#err_procedure_' + catId).length) { $('#err_procedure_' + catId).hide(); }

            if (!feeVal || parseFloat(feeVal) < 0) { $('#err_amount_' + catId).text('Please enter a valid fee amount').show(); valid = false; }
            else { $('#err_amount_' + catId).hide(); }
        });
        if (!anyChecked) valid = false;
        $('#btnSaveFees').prop('disabled', !valid);
        return valid;
    }

    $(document).on('click', '#btnAddDoctorFee', function() {
        editingFeeId = null;
        $('#feeFormTitle').text('Add Doctor Fee');
        $('#btnSaveFees').html('<i data-lucide="check"></i> Add Fee').prop('disabled', true);
        $('#feeFormBody').html(buildAddFormHtml());
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('feeFormSheet')).show();
    });

    $(document).on('change', '.cat-check', function() {
        var catId = $(this).val();

        $('.cat-checkbox-card').css({ borderColor: 'var(--color-border)', background: '#fff' });
        $('#categoryForms').empty();
        $('#feeFormError').empty();

        var card = $(this).closest('.cat-checkbox-card');
        card.css({ borderColor: catInfo(catId).color, background: catInfo(catId).bgColor });
        $('#categoryForms').append(buildCategoryForm(catId));
        lucide.createIcons();

        $('#noCategory').hide();
        validateForm();
    });

    $(document).on('input change', '.cat-doctor-select, .cat-fee-input, .cat-visit-type-select, .form-select[id^="fee_procedure_"]', function() {
        validateForm();
    });

    $(document).on('click', '#btnClearFeeForm', function() {
        $('.cat-check').prop('checked', false);
        $('.cat-checkbox-card').css({ borderColor: 'var(--color-border)', background: '#fff' });
        $('#categoryForms').empty();
        $('#noCategory').show();
        $('#btnSaveFees').prop('disabled', true);
    });

    $(document).on('click', '#btnSaveFees', function() {
        if (!validateForm()) return;
        var btn = $(this);
        btn.prop('disabled', true).html('<i data-lucide="loader-2" class="spin"></i> Saving...');

        var catId = $('.cat-check:checked').val();
        var docSelect = $('#fee_doctor_' + catId);
        var payload = {
            doctorId: docSelect.val(),
            doctorName: docSelect.find('option:selected').data('name'),
            serviceType: catId,
            visitType: $('#fee_visit_type_' + catId).val() || null,
            procedure: $('#fee_procedure_' + catId).val() || null,
            fee: parseFloat($('#fee_amount_' + catId).val())
        };

        $.ajax({
            url: '/api/config/doctor-fees',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function() { onSaveComplete(null); },
            error: function(xhr) { onSaveComplete(xhr.responseJSON?.error || 'Failed to save fee'); }
        });
    });

    function onSaveComplete(error) {
        if (error) {
            $('#feeFormError').html('<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#dc2626;font-size:13px;font-weight:500"><i data-lucide="alert-circle" style="width:14px;height:14px;margin-right:6px;vertical-align:-2px"></i>' + error + '</div>');
            lucide.createIcons();
            $('#btnSaveFees').prop('disabled', false).html('<i data-lucide="check"></i> Add Fee');
            lucide.createIcons();
            return;
        }
        try { bootstrap.Offcanvas.getInstance(document.getElementById('feeFormSheet'))?.hide(); } catch(e) {}
        loadAllData();
    }

    function openEditForm(feeId) {
        var f = fees.find(function(fee) { return fee.feeId === feeId; });
        if (!f) return;
        editingFeeId = feeId;
        var c = catInfo(f.serviceType);

        var h = '';
        h += '<div style="background:' + c.bgColor + ';border:2px solid ' + c.color + ';border-radius:10px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:12px">';
        h += '<div style="width:40px;height:40px;border-radius:8px;background:' + c.color + ';display:flex;align-items:center;justify-content:center"><i data-lucide="' + c.icon + '" style="width:20px;height:20px;color:#fff"></i></div>';
        h += '<div><div style="font-weight:700;font-size:16px;color:' + c.color + '">' + esc(c.label) + '</div><div style="font-size:12px;color:var(--color-muted-foreground)">' + esc(c.desc) + '</div></div></div>';

        h += '<div class="form-group" style="margin-bottom:16px"><label class="form-label">Doctor</label>';
        h += '<select class="form-select" id="editFeeDoctor" style="height:40px;font-size:14px"><option value="">-- Select --</option>';
        doctors.forEach(function(d) {
            var sel = d.doctorId === f.doctorId ? ' selected' : '';
            h += '<option value="' + esc(d.doctorId) + '" data-name="Dr. ' + esc(d.firstName) + ' ' + esc(d.lastName) + '"' + sel + '>Dr. ' + esc(d.firstName) + ' ' + esc(d.lastName) + '</option>';
        });
        h += '</select></div>';

        if (f.serviceType === 'OPD') {
            h += '<div class="form-group" style="margin-bottom:16px"><label class="form-label">Visit Type</label>';
            h += '<select class="form-select" id="editFeeVisitType" style="height:40px;font-size:14px"><option value="">-- Select --</option>';
            visitTypes.forEach(function(v) {
                var sel = v === f.visitType ? ' selected' : '';
                h += '<option value="' + esc(v) + '"' + sel + '>' + esc(v) + '</option>';
            });
            h += '</select></div>';
        }

        if (f.serviceType === 'OT_SURGEON' || f.serviceType === 'OT_ANAESTHETIST') {
            h += '<div class="form-group" style="margin-bottom:16px"><label class="form-label">Procedure & Surgery</label>';
            h += '<select class="form-select" id="editFeeProcedure" style="height:40px;font-size:14px"><option value="">-- Select --</option>';
            procedures.forEach(function(p) {
                var sel = p === f.procedure ? ' selected' : '';
                h += '<option value="' + esc(p) + '"' + sel + '>' + esc(p) + '</option>';
            });
            h += '</select></div>';
        }

        h += '<div class="form-group" style="margin-bottom:16px"><label class="form-label">Fee Amount</label>';
        h += '<div style="position:relative"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-weight:700;color:var(--midnight-blue);font-size:14px">' + esc(hospitalInfo.currency || 'PKR') + '</span>';
        h += '<input type="number" class="form-control" id="editFeeAmount" min="0" step="100" value="' + (f.fee || 0) + '" style="padding-left:50px;height:40px;font-size:14px;font-weight:600">';
        h += '</div></div>';

        $('#feeEditTitle').text('Edit Fee - ' + f.feeId);
        $('#feeEditBody').html(h);
        lucide.createIcons();
        new bootstrap.Offcanvas(document.getElementById('feeEditSheet')).show();
    }

    $(document).on('click', '#btnUpdateFee', function() {
        if (!editingFeeId) return;
        var docSelect = $('#editFeeDoctor');
        var doctorId = docSelect.val();
        var doctorName = docSelect.find('option:selected').data('name');
        var feeAmount = parseFloat($('#editFeeAmount').val());
        if (!doctorId) { HMS.toast('Please select a doctor', 'warning'); return; }
        if (!feeAmount || feeAmount < 0) { HMS.toast('Please enter a valid fee amount', 'warning'); return; }

        var payload = {
            doctorId: doctorId,
            doctorName: doctorName,
            fee: feeAmount
        };

        if ($('#editFeeVisitType').length) {
            payload.visitType = $('#editFeeVisitType').val();
        }

        if ($('#editFeeProcedure').length) {
            payload.procedure = $('#editFeeProcedure').val();
        }

        var btn = $(this);
        btn.prop('disabled', true);

        $.ajax({
            url: '/api/config/doctor-fees/' + editingFeeId,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function() {
                try { bootstrap.Offcanvas.getInstance(document.getElementById('feeEditSheet'))?.hide(); } catch(e) {}
                loadAllData();
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Failed to update fee');
            },
            complete: function() { btn.prop('disabled', false); }
        });
    });

    function deleteFee(feeId) {
        if (!confirm('Are you sure you want to delete this fee record?')) return;
        $.ajax({
            url: '/api/config/doctor-fees/' + feeId,
            method: 'DELETE',
            success: function() { loadAllData(); },
            error: function(xhr) { HMS.ajaxError(xhr, 'Failed to delete fee'); }
        });
    }

    // ── Toolbar window functions ──────────────────────────────────────────────
    window.toggleDfFilter = function(e) {
        if (e) e.stopPropagation();
        var pane = document.getElementById('dfFilterPane');
        if (!pane) return;
        var open = pane.style.display !== 'none';
        pane.style.display = open ? 'none' : 'block';
        var btn = document.getElementById('btnDfFilter');
        if (btn) btn.classList.toggle('active', !open);
    };

    window.applyDfFilters = function() {
        var catVal  = ($('#dfCatFilter').val()  || '').toLowerCase();
        var docName = ($('#dfDocFilter').val()  || '').toLowerCase();
        var dfVal   = $('#dfDateFrom').val() || '';
        var dtVal   = $('#dfDateTo').val()   || '';

        var catCode2 = { 'ot (surgeon)': 'ot_surgeon', 'ot (anaesthetist)': 'ot_anaesthetist' };
        var resolvedCat2 = catCode2[catVal] || catVal;
        dfFiltered = fees.filter(function(f) {
            if (resolvedCat2 && resolvedCat2 !== 'all categories' && (f.serviceType||'').toLowerCase() !== resolvedCat2) return false;
            if (docName      && docName      !== 'all doctors'    && (f.doctorName||'').toLowerCase()  !== docName)       return false;
            var ds = f.createdAt ? f.createdAt.substring(0, 10) : '';
            if (dfVal && ds && ds < dfVal) return false;
            if (dtVal && ds && ds > dtVal) return false;
            return true;
        });

        var count = 0;
        if (catVal  && catVal  !== 'all categories') count++;
        if (docName && docName !== 'all doctors')    count++;
        if (dfVal) count++;
        if (dtVal) count++;
        var badge = document.getElementById('dfFilterBadge');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }

        dfCurrentPage = 1;
        renderTable();
        toggleDfFilter();
    };

    window.resetDfFilters = function() {
        dfFiltered = null; dfCurrentPage = 1;
        ['dfCsCategory','dfCsDoctor'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        ['dfDpDateFrom','dfDpDateTo'].forEach(function(id) {
            var w = document.getElementById(id); if (w && w._reset) w._reset();
        });
        var badge = document.getElementById('dfFilterBadge');
        if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
        renderTable();
    };

    window.toggleDfRowsMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('dfRowsMenu'); if (m) m.classList.toggle('open');
    };
    window.setDfRowsPer = function(n) {
        dfPerPageVal = n; dfCurrentPage = 1;
        var m = document.getElementById('dfRowsMenu'); if (m) m.classList.remove('open');
        renderTable();
    };

    window.toggleDfColVis = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('dfColVisMenu'); if (m) m.classList.toggle('open');
    };
    window.dfColVisSelectAll = function() {
        $('#dfColVisList input[type=checkbox]').prop('checked', true);
    };
    window.applyDfColVis = function() {
        var m = document.getElementById('dfColVisMenu'); if (m) m.classList.remove('open');
        $('#dfColVisList input[type=checkbox]').each(function() {
            var col  = parseInt($(this).data('col'));
            var show = $(this).is(':checked');
            $('#feesTable thead tr th:eq(' + col + ')').toggle(show);
            $('#feesTable tbody tr').each(function() { $(this).find('td:eq(' + col + ')').toggle(show); });
        });
    };

    window.toggleDfExportMenu = function(e) {
        if (e) e.stopPropagation();
        var m = document.getElementById('dfExportMenu'); if (m) m.classList.toggle('open');
    };
    window.exportDf = function(type) {
        var m = document.getElementById('dfExportMenu'); if (m) m.classList.remove('open');
        var source = dfFiltered !== null ? dfFiltered : fees;
        if (type === 'csv') {
            var hdrs = ['Fee ID','Doctor Name','Doctor ID','Category','Visit/Procedure','Fee Amount','Date Added'];
            var rows = source.map(function(f) {
                var proc = f.serviceType === 'OPD' ? (f.visitType || 'Consultation') : f.procedure || (f.serviceType === 'IPD' ? 'Per-Round Visit' : f.serviceType === 'ER' ? 'ER Consultation' : '');
                var ds = f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '';
                return [f.feeId||'', f.doctorName||'', f.doctorId||'', f.serviceType||'', proc, f.fee||0, ds];
            });
            var lines = [hdrs.map(function(h) { return '"' + h + '"'; }).join(',')];
            rows.forEach(function(r) { lines.push(r.map(function(c) { return '"' + (c+'').replace(/"/g,'""') + '"'; }).join(',')); });
            var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob); var a = document.createElement('a');
            a.href = url; a.download = 'doctor-fees.csv'; a.click(); URL.revokeObjectURL(url);
        } else { window.print(); }
    };

    // ── Outside-click handler ─────────────────────────────────────────────────
    $(document).on('click.dfMenus', function(e) {
        if (!$(e.target).closest('#dfRowsMenu, #dfRowsBtn').length)          $('#dfRowsMenu').removeClass('open');
        if (!$(e.target).closest('#dfColVisMenu, .opd-col-vis-wrap').length) $('#dfColVisMenu').removeClass('open');
        if (!$(e.target).closest('#dfExportMenu, .opd-export-wrap').length)  $('#dfExportMenu').removeClass('open');
        if (!$(e.target).closest('.opd-dp-trigger,.opd-dp-popup,.opd-cs-trigger,.opd-cs-popup').length) dfCloseAll();
    });

    // ── Custom date picker & searchable select ────────────────────────────────
    var DF_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DF_DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    function dfCloseAll() {
        document.querySelectorAll('.opd-dp-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
        document.querySelectorAll('.opd-cs-popup.open').forEach(function(p) {
            p.classList.remove('open'); if (p._trigger) p._trigger.classList.remove('open');
        });
    }
    document.addEventListener('click', dfCloseAll);
    window.addEventListener('scroll', function() {
        document.querySelectorAll('.opd-dp-popup.open, .opd-cs-popup.open').forEach(function(p) {
            if (!p._trigger) return;
            var rect = p._trigger.getBoundingClientRect();
            p.style.top = (rect.bottom + 6) + 'px'; p.style.left = rect.left + 'px';
        });
    }, true);

    function dfInitDp(wrapId) {
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
            var h = '<div class="opd-dp-header"><button class="opd-dp-nav" data-a="p">&#8249;</button><span class="opd-dp-month-year">' + DF_MONTHS[viewMonth] + ' ' + viewYear + '</span><button class="opd-dp-nav" data-a="n">&#8250;</button></div><div class="opd-dp-grid">';
            DF_DAYS.forEach(function(d) { h += '<div class="opd-dp-dayname">' + d + '</div>'; });
            for (var i = 0; i < firstDow; i++) h += '<div class="opd-dp-day empty"></div>';
            for (var d = 1; d <= dim; d++) {
                var ds = viewYear + '-' + String(viewMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
                h += '<div class="opd-dp-day' + (selDate === ds ? ' selected' : '') + '" data-date="' + ds + '">' + d + '</div>';
            }
            popup.innerHTML = h + '</div>';
        }
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation(); var isOpen = popup.classList.contains('open'); dfCloseAll();
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
            else if(tgt.dataset.date){selDate=tgt.dataset.date;valEl.textContent=selDate;valEl.classList.remove('opd-ph');if(hidden)hidden.value=selDate;dfCloseAll();}
        });
        wrap._reset=function(){selDate=null;viewYear=new Date().getFullYear();viewMonth=new Date().getMonth();valEl.textContent=ph;valEl.classList.add('opd-ph');if(hidden)hidden.value='';};
    }

    function dfInitCs(wrapId) {
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
        var valEl=triggerEl.querySelector('.opd-cs-val'), srch=popup.querySelector('.opd-cs-search'), list=popup.querySelector('.opd-cs-list');
        function renderList(q) {
            q=(q||'').toLowerCase();
            var filt=q?options.filter(function(o){return o.toLowerCase().indexOf(q)>-1;}):options;
            if(!filt.length){list.innerHTML='<div class="opd-cs-empty">No options</div>';return;}
            list.innerHTML=filt.map(function(o){return '<div class="opd-cs-option'+(o===selVal?' selected':'')+'" data-v="'+o.replace(/"/g,'&quot;')+'">'+o+'</div>';}).join('');
            list.querySelectorAll('.opd-cs-option').forEach(function(el){
                el.addEventListener('click',function(e){e.stopPropagation();selVal=this.dataset.v;valEl.textContent=selVal;valEl.classList.remove('opd-ph');if(hidden)hidden.value=selVal;dfCloseAll();});
            });
        }
        triggerEl.addEventListener('click',function(e){
            e.stopPropagation();var isOpen=popup.classList.contains('open');dfCloseAll();
            if(!isOpen){
                var rect=triggerEl.getBoundingClientRect();
                popup.style.top=(rect.bottom+6)+'px';popup.style.left=rect.left+'px';popup.style.width=rect.width+'px';
                popup._trigger=triggerEl;
                if(popup.parentNode!==document.body)document.body.appendChild(popup);
                popup.classList.add('open');triggerEl.classList.add('open');srch.value='';renderList('');
                setTimeout(function(){srch.focus();},40);
            }
        });
        srch.addEventListener('input',function(e){e.stopPropagation();renderList(this.value);});
        srch.addEventListener('click',function(e){e.stopPropagation();});
        popup.addEventListener('click',function(e){e.stopPropagation();});
        wrap.setOptions=function(opts){options=opts||[];};
        wrap._reset=function(){selVal='';valEl.textContent=ph;valEl.classList.add('opd-ph');if(hidden)hidden.value='';};
    }

    // ── Initialize toolbar components ─────────────────────────────────────────
    ['dfDpDateFrom','dfDpDateTo'].forEach(dfInitDp);
    ['dfCsCategory','dfCsDoctor'].forEach(dfInitCs);

    var catWrap = document.getElementById('dfCsCategory');
    if (catWrap && catWrap.setOptions) catWrap.setOptions(['All Categories','OPD','IPD','OT (Surgeon)','OT (Anaesthetist)','ER']);

    loadAllData();
});
