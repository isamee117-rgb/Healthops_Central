function showToast(msg, type) {
    var bg = type === 'success' ? '#166534' : type === 'error' ? '#991B1B' : '#1E40AF';
    var icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
    var $t = $('<div style="position:fixed;top:20px;right:20px;z-index:99999;background:' + bg + ';color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn .3s ease"><i data-lucide="' + icon + '" style="width:16px;height:16px"></i> ' + msg + '</div>');
    $('body').append($t);
    lucide.createIcons();
    setTimeout(function() { $t.fadeOut(300, function() { $t.remove(); }); }, 3000);
}

$(document).ready(function() {
    var activeTab = 'profile';
    var departments = [];
    var signatories = [];
    var bankAccounts = [];
    var insurancePanels = [];
    var editingDeptId = null;
    var editingSignatoryId = null;
    var editingBankId = null;
    var editingPanelId = null;
    var deletingType = null;
    var deletingId = null;

    var deptSheet = document.getElementById('deptSheet') ? new bootstrap.Offcanvas(document.getElementById('deptSheet')) : null;
    var signatorySheet = document.getElementById('signatorySheet') ? new bootstrap.Offcanvas(document.getElementById('signatorySheet')) : null;
    var bankModal = document.getElementById('bankModal') ? new bootstrap.Modal(document.getElementById('bankModal')) : null;
    var panelModal = document.getElementById('insuranceModal') ? new bootstrap.Modal(document.getElementById('insuranceModal')) : null;
    var deleteModal = document.getElementById('hiDeleteModal') ? new bootstrap.Modal(document.getElementById('hiDeleteModal')) : null;

    function esc(str) { return $('<span>').text(str || '').html(); }
    function fmtDate(d) { if (!d) return '—'; var dt = new Date(d); return dt.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
    function todayStr() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

    $('.module-tab').on('click', function() {
        var tab = $(this).data('tab');
        activeTab = tab;
        $('.module-tab').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').hide();
        $('#tab-' + tab).show();
        onTabActivated(tab);
        lucide.createIcons();
    });

    function onTabActivated(tab) {
        if (tab === 'profile') loadSettings('basic');
        if (tab === 'legal') loadSettings('legal');
        if (tab === 'signatories') loadSignatories();
        if (tab === 'departments') loadDepartments();
        if (tab === 'banking') loadBankAccounts();
        if (tab === 'templates') { loadSettings('letterhead'); loadSettings('footer'); }
        if (tab === 'insurance') loadInsurancePanels();
        if (tab === 'hours') loadSettings('hours');
        if (tab === 'system') loadSettings('system');
    }

    function loadSettings(group) {
        $.get('/api/hospital-info/settings/' + group, function(response) {
            var settings = response.settings || response.data || {};
            populateSettingsForm(group, settings);
        }).fail(function() {
            showToast('Failed to load ' + group + ' settings', 'error');
        });
    }

    function populateSettingsForm(group, settings) {
        if (typeof settings === 'object' && !Array.isArray(settings)) {
            Object.keys(settings).forEach(function(key) {
                var $el = $('#' + key);
                if ($el.length === 0) $el = $('[name="' + key + '"]');
                if ($el.length === 0) return;
                var val = settings[key];
                if ($el.is(':checkbox')) {
                    $el.prop('checked', val === '1' || val === 'true' || val === true || val === 1);
                } else if ($el.is(':radio')) {
                    $el.filter('[value="' + val + '"]').prop('checked', true);
                } else {
                    $el.val(val || '');
                }
            });
        }

        if (group === 'basic' && settings.logo_path) {
            showLogoPreview(settings.logo_path);
        }
    }

    function collectSettingsForm(group) {
        var data = {};
        var $container = $('#tab-' + getTabForGroup(group));
        if ($container.length === 0) $container = $(document);

        $container.find('input[id], select[id], textarea[id]').each(function() {
            var $el = $(this);
            var key = $el.attr('id');
            if (!key) return;
            if ($el.is(':checkbox')) {
                data[key] = $el.is(':checked') ? '1' : '0';
            } else if ($el.is(':radio')) {
                if ($el.is(':checked')) data[key] = $el.val();
            } else if ($el.attr('type') !== 'file') {
                data[key] = $el.val();
            }
        });
        return data;
    }

    function getTabForGroup(group) {
        var map = { basic: 'profile', contact: 'profile', address: 'profile', legal: 'legal', letterhead: 'templates', footer: 'templates', hours: 'hours', system: 'system', signatories: 'signatories', departments: 'departments', banking: 'banking', insurance: 'insurance' };
        return map[group] || group;
    }

    function saveSettings(group, extraData) {
        var data = extraData || collectSettingsForm(group);
        var $btn = $('#btnSave_' + group);
        if ($btn.length) $btn.prop('disabled', true);

        $.ajax({
            url: '/api/hospital-info/settings/' + group,
            method: 'POST',
            data: data,
            success: function() {
                showToast('Settings saved successfully', 'success');
                if ($btn.length) $btn.prop('disabled', false);
            },
            error: function(xhr) {
                showToast(xhr.responseJSON?.message || 'Failed to save settings', 'error');
                if ($btn.length) $btn.prop('disabled', false);
            }
        });
    }

    $(document).on('click', '[data-save-group]', function() {
        var group = $(this).data('save-group');
        saveSettings(group);
    });

    $(document).on('click', '#btnSaveProfile', function() {
        var profileData = {};
        $('#tab-profile').find('input[id], select[id], textarea[id]').each(function() {
            var $el = $(this);
            var key = $el.attr('id');
            if (!key || $el.attr('type') === 'file') return;
            if ($el.is(':checkbox')) {
                profileData[key] = $el.is(':checked') ? '1' : '0';
            } else if ($el.is(':radio')) {
                if ($el.is(':checked')) profileData[key] = $el.val();
            } else {
                profileData[key] = $el.val();
            }
        });

        var $btn = $(this);
        $btn.prop('disabled', true);
        $.ajax({
            url: '/api/hospital-info/settings/basic',
            method: 'POST',
            data: profileData,
            success: function() {
                showToast('Hospital profile saved successfully', 'success');
                $btn.prop('disabled', false);
                var newName      = $('#basic_name').val();
                var newShortName = $('#basic_short_name').val();
                if (newName) $('#topnavHospitalName').text(newName);
                if (newShortName) {
                    $('#topnavHospitalShortName').text(newShortName).show();
                } else {
                    $('#topnavHospitalShortName').hide();
                }
            },
            error: function(xhr) {
                showToast(xhr.responseJSON?.message || 'Failed to save profile', 'error');
                $btn.prop('disabled', false);
            }
        });
    });

    $(document).on('click', '#btnSaveLegal', function() {
        saveSettings('legal');
    });

    $(document).on('click', '#btnSaveTemplates', function() {
        var letterheadData = {};
        var footerData = {};

        $('#tab-templates').find('input[id], select[id], textarea[id]').each(function() {
            var $el = $(this);
            var key = $el.attr('id');
            if (!key || $el.attr('type') === 'file') return;
            var val;
            if ($el.is(':checkbox')) {
                val = $el.is(':checked') ? '1' : '0';
            } else if ($el.is(':radio')) {
                if (!$el.is(':checked')) return;
                val = $el.val();
            } else {
                val = $el.val();
            }
            if (key.indexOf('footer_') === 0) {
                footerData[key] = val;
            } else {
                letterheadData[key] = val;
            }
        });

        var $btn = $(this);
        $btn.prop('disabled', true);

        $.ajax({
            url: '/api/hospital-info/settings/letterhead',
            method: 'POST',
            data: letterheadData,
            success: function() {
                $.ajax({
                    url: '/api/hospital-info/settings/footer',
                    method: 'POST',
                    data: footerData,
                    success: function() {
                        showToast('Document template settings saved', 'success');
                        $btn.prop('disabled', false);
                    },
                    error: function(xhr) {
                        showToast(xhr.responseJSON?.message || 'Failed to save footer settings', 'error');
                        $btn.prop('disabled', false);
                    }
                });
            },
            error: function(xhr) {
                showToast(xhr.responseJSON?.message || 'Failed to save letterhead settings', 'error');
                $btn.prop('disabled', false);
            }
        });
    });

    // ── Document Type Settings & Preview ────────────────────────────────────

    var DOC_TYPE_OPTIONS = {
        invoice:      { label: 'Invoice / Bill',      options: [
            { value: 'opd_bill',          label: 'OPD — Billing Print' },
            { value: 'ipd_bill',          label: 'IPD — Billing Print' },
            { value: 'er_bill',           label: 'Emergency — Billing Print' },
            { value: 'ot_bill',           label: 'Operation Theater — Bill' },
            { value: 'pharmacy_receipt',  label: 'Pharmacy — POS Receipt' },
            { value: 'lab_bill',          label: 'Laboratory — Billing Print' },
        ]},
        prescription: { label: 'Prescription',        options: [
            { value: 'opd_prescription',  label: 'OPD — Consultation Prescription' },
            { value: 'ipd_prescription',  label: 'IPD — Medication Prescription' },
            { value: 'er_prescription',   label: 'Emergency — Prescription' },
        ]},
        lab_report:   { label: 'Lab Report',          options: [
            { value: 'lab_result',        label: 'Laboratory — Result Report' },
            { value: 'lab_walk_in',       label: 'Laboratory — Walk-in Report' },
        ]},
        discharge:    { label: 'Discharge Summary',   options: [
            { value: 'ipd_discharge',     label: 'IPD — Discharge Summary' },
            { value: 'er_discharge',      label: 'Emergency — Discharge Summary' },
        ]},
        medical_cert: { label: 'Medical Certificate', options: [
            { value: 'opd_medical_cert',  label: 'OPD — Medical Certificate' },
            { value: 'ipd_medical_cert',  label: 'IPD — Medical Certificate' },
            { value: 'er_medical_cert',   label: 'Emergency — Medical Certificate' },
        ]},
        referral:     { label: 'Referral Letter',     options: [
            { value: 'opd_referral',      label: 'OPD — Referral Letter' },
            { value: 'ipd_referral',      label: 'IPD — Referral' },
            { value: 'er_referral',       label: 'Emergency — Referral' },
        ]},
        opd_registration:   { label: 'OPD Registration Slip',       options: [
            { value: 'opd_reg_slip',          label: 'OPD — Registration Slip' },
        ]},
        doctor_prescription: { label: 'Doctor Prescription',         options: [
            { value: 'opd_doctor_rx',         label: 'OPD — Doctor Prescription' },
            { value: 'ipd_doctor_rx',         label: 'IPD — Doctor Prescription' },
            { value: 'er_doctor_rx',          label: 'Emergency — Doctor Prescription' },
        ]},
        ipd_registration:   { label: 'IPD Registration Slip',        options: [
            { value: 'ipd_reg_slip',          label: 'IPD — Registration Slip' },
        ]},
        patient_mar:        { label: 'Patient Wise MAR',             options: [
            { value: 'ipd_patient_mar',       label: 'IPD — Patient Wise MAR' },
        ]},
        complete_mar:       { label: 'Complete MAR Slip',            options: [
            { value: 'ipd_complete_mar',      label: 'IPD — Complete MAR Slip' },
        ]},
        ipd_discharge_slip: { label: 'IPD Discharge Slip',           options: [
            { value: 'ipd_discharge_slip',    label: 'IPD — Discharge Slip' },
        ]},
        er_registration:    { label: 'Emergency Registration Slip',  options: [
            { value: 'er_reg_slip',           label: 'Emergency — Registration Slip' },
        ]},
        er_discharge_slip:  { label: 'Emergency Discharge Slip',     options: [
            { value: 'er_discharge_slip',     label: 'Emergency — Discharge Slip' },
        ]},
        scheduling_reg:     { label: 'Scheduling Registration',      options: [
            { value: 'opd_scheduling',        label: 'OPD — Scheduling Registration' },
            { value: 'ipd_scheduling',        label: 'IPD — Scheduling Registration' },
        ]},
        pre_ops:            { label: 'Pre-ops Check List',           options: [
            { value: 'ot_pre_ops',            label: 'OT — Pre-operative Check List' },
        ]},
        intra_ops:          { label: 'Intra-ops Check Notes',        options: [
            { value: 'ot_intra_ops',          label: 'OT — Intra-operative Check Notes' },
        ]},
        post_ops:           { label: 'Post-ops Notes',               options: [
            { value: 'ot_post_ops',           label: 'OT — Post-operative Notes' },
        ]},
        bed_doc:            { label: 'Bed',                          options: [
            { value: 'ipd_bed_alloc',         label: 'IPD — Bed Allocation Document' },
        ]},
    };

    var docTypeSheet  = document.getElementById('docTypeSheet')  ? new bootstrap.Offcanvas(document.getElementById('docTypeSheet'))  : null;
    var docPreviewModal = document.getElementById('docPreviewModal') ? new bootstrap.Modal(document.getElementById('docPreviewModal')) : null;

    // Doc types that support multiple print formats: key → array of {value, label, desc}
    var DOC_FORMAT_OPTIONS = {
        opd_registration: [
            { value: 'a4',      label: 'A4',                     desc: 'Standard A4 page with full letterhead' },
            { value: 'thermal', label: 'Thermal / Small Receipt', desc: '80 mm thermal printer compact slip' },
        ],
        ipd_registration: [
            { value: 'a4',      label: 'A4',                     desc: 'Standard A4 page with full letterhead' },
            { value: 'thermal', label: 'Thermal / Small Receipt', desc: '80 mm thermal printer compact slip' },
        ],
        er_registration: [
            { value: 'a4',      label: 'A4',                     desc: 'Standard A4 page with full letterhead' },
            { value: 'thermal', label: 'Thermal / Small Receipt', desc: '80 mm thermal printer compact slip' },
        ],
        scheduling_reg: [
            { value: 'a4',      label: 'A4',                     desc: 'Standard A4 page with full letterhead' },
            { value: 'thermal', label: 'Thermal / Small Receipt', desc: '80 mm thermal printer compact slip' },
        ],
    };

    $(document).on('click', '.doc-type-settings', function() {
        var type  = $(this).data('doc-type');
        var label = $(this).data('doc-label');
        var def   = DOC_TYPE_OPTIONS[type];
        if (!def) return;

        $('#docTypeSheetTitle').text('Configure — ' + label);
        $('#docTypeKey').val(type);

        // Show / hide format picker
        var formatOptions = DOC_FORMAT_OPTIONS[type];
        if (formatOptions) {
            $.get('/api/hospital-info/settings/doc_format_' + type, function(res) {
                var savedFormat = (res.settings && res.settings['doc_format_' + type]) || 'a4';
                var fHtml = '';
                formatOptions.forEach(function(f) {
                    var checked = savedFormat === f.value ? 'checked' : '';
                    fHtml += '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--color-muted);border-radius:8px;cursor:pointer;font-size:13px;color:var(--color-foreground)">'
                           + '<input type="radio" name="docFormatRadio" class="doc-format-radio" value="' + f.value + '" ' + checked + ' style="width:15px;height:15px;accent-color:var(--teal-500);flex-shrink:0">'
                           + '<div><div style="font-weight:600">' + f.label + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + f.desc + '</div></div>'
                           + '</label>';
                });
                $('#docFormatList').html(fHtml);
                $('#docFormatSection').show();
            }).fail(function() {
                var fHtml = '';
                formatOptions.forEach(function(f, i) {
                    fHtml += '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--color-muted);border-radius:8px;cursor:pointer;font-size:13px;color:var(--color-foreground)">'
                           + '<input type="radio" name="docFormatRadio" class="doc-format-radio" value="' + f.value + '"' + (i === 0 ? ' checked' : '') + ' style="width:15px;height:15px;accent-color:var(--teal-500);flex-shrink:0">'
                           + '<div><div style="font-weight:600">' + f.label + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + f.desc + '</div></div>'
                           + '</label>';
                });
                $('#docFormatList').html(fHtml);
                $('#docFormatSection').show();
            });
        } else {
            $('#docFormatSection').hide();
        }

        // Load saved Print Locations then render checkboxes
        $.get('/api/hospital-info/settings/doc_apply_' + type, function(res) {
            var saved = [];
            try { saved = JSON.parse(res.settings && res.settings['doc_apply_' + type] || '[]'); } catch(e) {}

            var html = '';
            def.options.forEach(function(opt) {
                var checked = saved.indexOf(opt.value) !== -1 ? 'checked' : '';
                html += '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--color-muted);border-radius:8px;cursor:pointer;font-size:13px;color:var(--color-foreground)">'
                      + '<input type="checkbox" class="doc-apply-check" value="' + opt.value + '" ' + checked + ' style="width:15px;height:15px;accent-color:var(--teal-500);flex-shrink:0">'
                      + '<span>' + opt.label + '</span>'
                      + '</label>';
            });
            $('#docTypeApplyList').html(html);
        }).fail(function() {
            var html = '';
            def.options.forEach(function(opt) {
                html += '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--color-muted);border-radius:8px;cursor:pointer;font-size:13px;color:var(--color-foreground)">'
                      + '<input type="checkbox" class="doc-apply-check" value="' + opt.value + '" style="width:15px;height:15px;accent-color:var(--teal-500);flex-shrink:0">'
                      + '<span>' + opt.label + '</span>'
                      + '</label>';
            });
            $('#docTypeApplyList').html(html);
        });

        if (docTypeSheet) docTypeSheet.show();
        lucide.createIcons();
    });

    $(document).on('click', '#btnSaveDocType', function() {
        var type = $('#docTypeKey').val();
        var selected = [];
        $('#docTypeApplyList .doc-apply-check:checked').each(function() {
            selected.push($(this).val());
        });

        var $btn = $(this);
        $btn.prop('disabled', true);

        // Save format if this doc type has a format picker
        var formatSave = $.Deferred().resolve();
        var selectedFormat = $('#docFormatList .doc-format-radio:checked').val();
        if (DOC_FORMAT_OPTIONS[type] && selectedFormat) {
            formatSave = $.ajax({
                url: '/api/hospital-info/settings/doc_format_' + type,
                method: 'POST',
                data: { ['doc_format_' + type]: selectedFormat },
            });
        }

        $.when(formatSave).then(function() {
            $.ajax({
                url: '/api/hospital-info/settings/doc_apply_' + type,
                method: 'POST',
                data: { ['doc_apply_' + type]: JSON.stringify(selected) },
                success: function() {
                    showToast('Template settings saved', 'success');
                    $btn.prop('disabled', false);
                    if (docTypeSheet) docTypeSheet.hide();
                },
                error: function() {
                    showToast('Failed to save settings', 'error');
                    $btn.prop('disabled', false);
                }
            });
        });
    });

    function sectionHead(color, title) {
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
             + '<div style="width:3px;height:16px;background:' + color + ';border-radius:2px;flex-shrink:0"></div>'
             + '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#1e293b">' + title + '</span>'
             + '</div>';
    }

    function tableHead(color, cols) {
        var cells = cols.map(function(c, i) {
            return '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:rgba(255,255,255,0.9);' + (i > 0 ? 'text-align:right' : '') + '">' + c + '</div>';
        }).join('');
        return '<div style="display:grid;grid-template-columns:' + (cols.length === 4 ? '2.5fr 1fr 1fr 1fr' : cols.length === 5 ? '2fr 1fr 1fr 1fr 1fr' : '2fr 1fr 1fr') + ';gap:8px;background:' + color + ';padding:9px 14px;border-radius:6px 6px 0 0">' + cells + '</div>';
    }

    function tableRow(cols, widths, isAlt) {
        var bg = isAlt ? '#f8fafc' : '#fff';
        var cells = cols.map(function(w, i) {
            return '<div style="height:9px;background:#e2e8f0;border-radius:2px;width:' + w + '%;' + (i > 0 ? 'margin-left:auto' : '') + '"></div>';
        }).join('');
        return '<div style="display:grid;grid-template-columns:' + (cols.length === 4 ? '2.5fr 1fr 1fr 1fr' : cols.length === 5 ? '2fr 1fr 1fr 1fr 1fr' : '2fr 1fr 1fr') + ';gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">' + cells + '</div>';
    }

    function sigRow(labels) {
        return '<div style="display:grid;grid-template-columns:' + labels.map(function(){ return '1fr'; }).join(' ') + ';gap:24px;margin-top:28px">'
             + labels.map(function(l){
                 return '<div style="text-align:center"><div style="height:40px;border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                      + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">' + l + '</div></div>';
               }).join('')
             + '</div>';
    }

    function badge(text, color, bg) {
        return '<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;letter-spacing:0.4px;background:' + bg + ';color:' + color + '">' + text + '</span>';
    }

    function infoGrid(items) {
        return '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;padding:14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">'
             + items.map(function(item){
                 return '<div><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;margin-bottom:4px">' + item.label + '</div>'
                      + '<div style="height:9px;background:#e2e8f0;border-radius:2px;width:' + item.w + '%"></div></div>';
               }).join('')
             + '</div>';
    }

    function renderDocContent(type, color, format, profile) {
        var html = '';
        var pr = profile || {};

        // ── Thermal preview for OPD Registration Slip ──
        if (type === 'opd_registration' && format === 'thermal') {
            var hospName    = pr.basic_name      || 'Hospital Name';
            var hospPhone   = pr.contact_phone   || '';
            var hospWebsite = pr.contact_website || '';
            var addrParts   = [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean);
            var addrStr     = addrParts.join(', ');
            var now         = new Date();
            var dateStr     = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
            var timeStr     = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
            var thCol       = 'style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;white-space:nowrap"';
            var tdL         = 'style="padding:2px 3px;font-size:10px"';
            var tdR         = 'style="padding:2px 3px;font-size:10px;text-align:right;white-space:nowrap"';
            var tdC         = 'style="padding:2px 3px;font-size:10px;text-align:center"';
            $('#previewPatientMeta').hide();
            html += '<div style="max-width:300px;margin:0 auto;font-family:monospace;font-size:11px;border:1px dashed #cbd5e1;border-radius:8px;padding:16px;background:#fff">';
            // ── Header ──
            html += '<div style="text-align:center;border-bottom:1px dashed #94a3b8;padding-bottom:8px;margin-bottom:8px">';
            html += '<div style="font-size:13px;font-weight:700">' + hospName + '</div>';
            if (hospPhone)   html += '<div style="font-size:9px;color:#64748b">Tel: ' + hospPhone + '</div>';
            if (hospWebsite) html += '<div style="font-size:9px;color:#64748b">' + hospWebsite + '</div>';
            html += '<div style="font-size:10px;font-weight:700;margin-top:6px;letter-spacing:1px">OPD REGISTRATION SLIP</div>';
            html += '<div style="font-size:9px;color:#64748b">' + dateStr + ' &nbsp;|&nbsp; ' + timeStr + '</div>';
            html += '</div>';
            // ── Patient rows ──
            var thermalRows = [
                ['Patient', 'Ali'],
                ['MRN', 'MRN-2026-0002'],
                ['Visit #', '1'],
                ['Bill ID', 'BILL-1'],
                ['Doctor', 'Dr. Sameer Iqbal'],
                ['Dept', 'General Medicine'],
                ['Type', 'New Patient Visit'],
                ['Ref By', 'Self'],
                ['Phone', '0321-1234567'],
                ['CNIC', '35201-XXXXXXX-1'],
            ];
            thermalRows.forEach(function(r) {
                html += '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted #e2e8f0">'
                     + '<span style="color:#64748b">' + r[0] + '</span>'
                     + '<span style="font-weight:600;text-align:right;max-width:55%">' + r[1] + '</span>'
                     + '</div>';
            });
            // ── Charges table ──
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:8px;padding-top:6px">';
            html += '<table style="width:100%;border-collapse:collapse">';
            html += '<tr>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:left">Description</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:center">Qty</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Disc</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Net</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Total</th>'
                 + '</tr>';
            html += '<tr><td ' + tdL + '>Doctor Fee</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 2,000</td><td ' + tdR + '>PKR 2,000</td></tr>';
            html += '<tr><td ' + tdL + '>Reg. Charges</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 200</td><td ' + tdR + '>PKR 200</td></tr>';
            html += '</table></div>';
            // ── Total ──
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:700;font-size:12px">'
                 + '<span>TOTAL</span><span>PKR 2,200</span></div>';
            // ── Footer ──
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:10px;padding-top:8px;text-align:center">';
            if (addrStr) html += '<div style="font-size:8px;color:#64748b;margin-bottom:4px">' + addrStr + '</div>';
            html += '<div style="height:24px;border-bottom:1px solid #334155;margin:8px auto 4px;width:120px"></div>';
            html += '<div style="font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Receptionist / Cashier</div>';
            html += '<div style="font-size:8px;color:#94a3b8;margin-top:3px">Created by: Admin User</div>';
            html += '</div></div>';
            $('#previewDocContent').html(html);
            return;
        }

        if (type === 'invoice') {
            html += sectionHead(color, 'Charges & Services');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += tableHead(color, ['Description', 'Qty', 'Unit Rate', 'Amount']);
            var items = [
                { name: 'Consultation Fee — General Medicine', qty: '1', rate: '1,500', amt: '1,500' },
                { name: 'OPD Registration Charges', qty: '1', rate: '200', amt: '200' },
                { name: 'CBC (Complete Blood Count)', qty: '2', rate: '850', amt: '1,700' },
                { name: 'Chest X-Ray (PA View)', qty: '1', rate: '1,200', amt: '1,200' },
                { name: 'Urine R/E & Microscopy', qty: '1', rate: '400', amt: '400' },
                { name: 'ECG (12-Lead)', qty: '1', rate: '600', amt: '600' },
            ];
            items.forEach(function(item, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2.5fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                     + '<div style="font-size:10px;color:#334155;font-weight:500">' + item.name + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + item.qty + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">PKR ' + item.rate + '</div>'
                     + '<div style="font-size:10px;color:#1e293b;font-weight:600;text-align:right">PKR ' + item.amt + '</div>'
                     + '</div>';
            });
            // Totals
            html += '<div style="padding:12px 14px;background:#f8fafc;border-top:1px solid #e2e8f0">';
            [['Subtotal','PKR 5,600'],['Discount (10%)','— PKR 560'],['Tax (0%)','PKR 0']].forEach(function(r){
                html += '<div style="display:flex;justify-content:flex-end;gap:32px;margin-bottom:4px">'
                     + '<div style="font-size:10px;color:#64748b">' + r[0] + '</div>'
                     + '<div style="font-size:10px;color:#334155;font-weight:600;min-width:80px;text-align:right">' + r[1] + '</div></div>';
            });
            html += '<div style="display:flex;justify-content:flex-end;gap:32px;margin-top:8px;padding-top:8px;border-top:2px solid ' + color + '">'
                 + '<div style="font-size:11px;font-weight:700;color:#1e293b">NET PAYABLE</div>'
                 + '<div style="font-size:11px;font-weight:700;color:' + color + ';min-width:80px;text-align:right">PKR 5,040</div></div>';
            html += '</div></div>';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding:10px 14px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">'
                 + '<div style="font-size:10px;color:#166534"><b>Payment Status:</b> Received — Cash</div>'
                 + badge('PAID', '#166534', '#dcfce7') + '</div>';
            html += sigRow(['Cashier / Billing Staff', 'Accounts Officer', 'Patient / Guardian']);

        } else if (type === 'prescription') {
            html += infoGrid([
                { label: 'Diagnosis', w: 85 }, { label: 'Visit Type', w: 60 }, { label: 'Date', w: 70 }
            ]);
            html += sectionHead(color, 'Prescribed Medications');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += tableHead(color, ['Drug Name & Strength', 'Dosage', 'Frequency', 'Duration', 'Route']);
            var meds = [
                { name: 'Amoxicillin 500mg Capsule', dose: '1 Cap', freq: 'Three times daily', dur: '7 Days', route: 'Oral' },
                { name: 'Paracetamol 500mg Tablet', dose: '1–2 Tabs', freq: 'As needed (SOS)', dur: '5 Days', route: 'Oral' },
                { name: 'Omeprazole 20mg Capsule', dose: '1 Cap', freq: 'Once daily (AC)', dur: '14 Days', route: 'Oral' },
                { name: 'Normal Saline 0.9% IV Drip', dose: '500ml', freq: 'Twice daily', dur: '3 Days', route: 'IV' },
            ];
            meds.forEach(function(m, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                     + '<div style="font-size:10px;color:#334155;font-weight:500">' + m.name + '</div>'
                     + '<div style="font-size:10px;color:#64748b">' + m.dose + '</div>'
                     + '<div style="font-size:10px;color:#64748b">' + m.freq + '</div>'
                     + '<div style="font-size:10px;color:#64748b">' + m.dur + '</div>'
                     + '<div style="font-size:10px;color:#64748b">' + m.route + '</div>'
                     + '</div>';
            });
            html += '</div>';
            html += sectionHead(color, 'Advice & Instructions');
            html += '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;margin-bottom:20px">';
            ['Take medicines with food to avoid stomach upset.','Avoid cold beverages and direct air conditioning.','Rest adequately and increase fluid intake.','Follow-up after 7 days or earlier if symptoms worsen.'].forEach(function(a){
                html += '<div style="font-size:10px;color:#92400e;margin-bottom:4px;display:flex;gap:6px"><span>•</span><span>' + a + '</span></div>';
            });
            html += '</div>';
            html += sigRow(['Prescribing Doctor', 'Reg. No. / Stamp', '']);

        } else if (type === 'lab_report') {
            html += infoGrid([
                { label: 'Sample Type', w: 65 }, { label: 'Collected On', w: 75 }, { label: 'Reported On', w: 75 }
            ]);
            html += sectionHead(color, 'Test Results');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += tableHead(color, ['Test Name', 'Result', 'Ref. Range', 'Unit', 'Status']);
            var tests = [
                { name: 'Hemoglobin (Hb)', result: '13.2', ref: '13.0 – 17.0', unit: 'g/dL', status: 'Normal', sc: '#166534', bg: '#dcfce7' },
                { name: 'WBC Count', result: '11,500', ref: '4,000 – 11,000', unit: '/µL', status: 'High', sc: '#92400e', bg: '#fef3c7' },
                { name: 'Platelet Count', result: '210,000', ref: '150,000 – 400,000', unit: '/µL', status: 'Normal', sc: '#166534', bg: '#dcfce7' },
                { name: 'Random Blood Glucose', result: '185', ref: '70 – 140', unit: 'mg/dL', status: 'High', sc: '#991b1b', bg: '#fee2e2' },
                { name: 'Serum Creatinine', result: '0.9', ref: '0.7 – 1.2', unit: 'mg/dL', status: 'Normal', sc: '#166534', bg: '#dcfce7' },
                { name: 'ALT (SGPT)', result: '42', ref: '7 – 40', unit: 'U/L', status: 'High', sc: '#92400e', bg: '#fef3c7' },
            ];
            tests.forEach(function(t, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                     + '<div style="font-size:10px;color:#334155;font-weight:500">' + t.name + '</div>'
                     + '<div style="font-size:10px;font-weight:700;color:' + t.sc + '">' + t.result + '</div>'
                     + '<div style="font-size:10px;color:#64748b">' + t.ref + '</div>'
                     + '<div style="font-size:10px;color:#64748b">' + t.unit + '</div>'
                     + '<div><span style="padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;background:' + t.bg + ';color:' + t.sc + '">' + t.status + '</span></div>'
                     + '</div>';
            });
            html += '</div>';
            html += '<div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:20px;font-size:10px;color:#64748b"><b>Method:</b> Automated Hematology Analyzer (Sysmex XN-1000)</div>';
            html += sigRow(['Lab Technician', 'Pathologist (MBBS, M.Phil)', 'Verified & Stamped']);

        } else if (type === 'discharge') {
            html += infoGrid([
                { label: 'Admission Date', w: 70 }, { label: 'Discharge Date', w: 70 }, { label: 'Ward / Bed', w: 60 },
                { label: 'Admitting Diagnosis', w: 90 }, { label: 'Final Diagnosis', w: 85 }, { label: 'Length of Stay', w: 50 }
            ]);
            html += sectionHead(color, 'Procedures & Treatments');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">';
            html += tableHead(color, ['Procedure / Intervention', 'Date', 'Outcome']);
            [['Intravenous Antibiotic Therapy (Ceftriaxone 1g BD)','Day 1–5','Responded well'],['Nebulization (Salbutamol + Ipratropium)','Day 1–3','Symptoms improved'],['Chest Physiotherapy Sessions','Day 2–6','Secretions cleared'],['Echocardiography','Day 3','No significant finding']].forEach(function(r, i){
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2.5fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9">'
                     + r.map(function(c){ return '<div style="font-size:10px;color:#334155">' + c + '</div>'; }).join('') + '</div>';
            });
            html += '</div>';
            html += sectionHead(color, 'Discharge Medications');
            ['Tab. Azithromycin 500mg — Once daily × 3 days','Tab. Prednisolone 10mg — Taper over 1 week','Syp. Ambroxol 10ml — TDS × 5 days','Inhaler: Salbutamol MDI — 2 puffs PRN'].forEach(function(m){
                html += '<div style="font-size:10px;color:#334155;margin-bottom:5px;padding:7px 12px;background:#f8fafc;border-radius:6px;border-left:3px solid ' + color + '">' + m + '</div>';
            });
            html += '<div style="margin-top:16px;padding:10px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;font-size:10px;color:#1e40af"><b>Follow-up:</b> Review in OPD after 2 weeks. Repeat chest X-ray on next visit.</div>';
            html += sigRow(['Attending Consultant', 'Ward Incharge (Nurse)', 'Patient / Guardian']);

        } else if (type === 'medical_cert') {
            html += '<div style="text-align:center;padding:12px 0 20px">'
                 + '<div style="font-size:13px;font-weight:700;color:#1e293b;letter-spacing:0.3px">MEDICAL FITNESS CERTIFICATE</div>'
                 + '<div style="font-size:10px;color:#64748b;margin-top:4px">This certificate is issued under medical authority of this institution</div>'
                 + '</div>';
            html += infoGrid([
                { label: 'Patient Name', w: 80 }, { label: 'Age / Gender', w: 55 }, { label: 'CNIC / ID No.', w: 70 },
                { label: 'Occupation', w: 65 }, { label: 'Examined On', w: 70 }, { label: 'Valid Until', w: 70 }
            ]);
            html += sectionHead(color, 'Clinical Examination Findings');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">';
            html += tableHead(color, ['System / Parameter', 'Finding', 'Remarks']);
            [['Blood Pressure','120/80 mmHg','Within normal limits'],['Pulse Rate','76 bpm','Regular rhythm'],['Respiratory System','Clear on auscultation','No wheeze/crepitus'],['Vision (Unaided)','6/6 both eyes','No correction needed'],['Hearing','Normal','Bilateral'],['Musculoskeletal','Full range of motion','No deformity']].forEach(function(r, i){
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2.5fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9">'
                     + r.map(function(c){ return '<div style="font-size:10px;color:#334155">' + c + '</div>'; }).join('') + '</div>';
            });
            html += '</div>';
            html += '<div style="padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:16px">'
                 + '<div style="font-size:10px;color:#166534;font-weight:600;margin-bottom:4px">DECLARATION</div>'
                 + '<div style="font-size:10px;color:#166534;line-height:1.6">This is to certify that the above-named individual has been examined and is found <b>medically fit</b> for employment / duty / travel as applicable. No infectious disease or physical disability was detected at the time of examination.</div>'
                 + '</div>';
            html += sigRow(['Examining Medical Officer', 'Registration No. / Stamp', 'Hospital Seal']);

        } else if (type === 'referral') {
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
            ['Referring Consultant','Referred To (Specialist / Hospital)','Department / Specialty','Urgency Level'].forEach(function(l, i){
                html += '<div style="padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">'
                     + '<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;margin-bottom:5px">' + l + '</div>'
                     + '<div style="height:10px;background:#e2e8f0;border-radius:2px;width:' + [80, 90, 65, 45][i] + '%"></div></div>';
            });
            html += '</div>';
            html += sectionHead(color, 'Reason for Referral');
            html += '<div style="padding:12px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:16px">';
            ['Chief Complaint: Persistent chest pain with exertional dyspnoea for 3 weeks.','Clinical Findings: Reduced air entry on left side. SpO₂ 94% on room air.','Investigations Done: CBC, CXR, ECG — attached herewith.','Impression: Suspected pleural effusion. Requires specialist evaluation and possible thoracentesis.'].forEach(function(r){
                html += '<div style="font-size:10px;color:#334155;margin-bottom:6px;line-height:1.5">' + r + '</div>';
            });
            html += '</div>';
            html += sectionHead(color, 'Current Medications (Summary)');
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
            ['Tab. Furosemide 40mg OD','Tab. Spironolactone 25mg OD','Inj. Ceftriaxone 1g BD (IV)','Neb. Salbutamol 2.5mg TDS'].forEach(function(m){
                html += '<div style="font-size:10px;color:#334155;padding:6px 10px;background:#f1f5f9;border-radius:6px;border-left:3px solid ' + color + '">' + m + '</div>';
            });
            html += '</div>';
            html += '<div style="padding:10px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;font-size:10px;color:#c2410c;margin-bottom:16px"><b>Urgency:</b> Semi-urgent — Please review within 48 hours.</div>';
            html += sigRow(['Referring Doctor', 'Reg. No. / Stamp', 'Hospital Seal']);

        } else if (type === 'opd_registration') {
            // ── Patient Info Grid (4-column, 3 rows) ──
            function infoCell(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg || '#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + value + '</div>'
                     + '</div>';
            }
            var patientRows = [
                [['PATIENT NAME','Ali',true],        ['MRN','MRN-2026-0002',true],     ['VISIT ID','OPD-1',true],           ['BILL ID','BILL-1',false]],
                [['DOCTOR','Dr. Sameer Iqbal',true], ['DEPARTMENT','General Medicine',true], ['VISIT TYPE','New Patient Visit',true], ['REFERRED BY','Self',false]],
                [['PHONE NO.','0321-1234567',true],  ['CNIC','35201-1234567-1',true],   ['AGE','32 Years',true],             ['GENDER','Male',false]],
            ];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            // Coloured top accent strip
            html += '<div style="height:3px;background:' + color + '"></div>';
            patientRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < patientRows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { html += infoCell(cell[0], cell[1], cell[2], rowBg); });
                html += '</div>';
            });
            html += '</div>';

            // ── Charges Table ──
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + color + ';padding:9px 14px">';
            ['S.NO', 'DESCRIPTION', 'QTY', 'RATE', 'DISC.', 'NET'].forEach(function(h, i) {
                html += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;' + (i > 1 ? 'text-align:right' : '') + '">' + h + '</div>';
            });
            html += '</div>';
            [
                { no:'1', desc:'Doctor Fee — Dr. Sameer Iqbal', qty:'1', rate:'PKR 2,000', disc:'—', net:'PKR 2,000' },
                { no:'2', desc:'Registration Charges',          qty:'1', rate:'PKR 200',   disc:'—', net:'PKR 200' },
                { no:'3', desc:'Diagnostic Charges',            qty:'1', rate:'PKR 400',   disc:'—', net:'PKR 400' },
                { no:'4', desc:'Procedure',                     qty:'1', rate:'PKR 200',   disc:'—', net:'PKR 200' },
            ].forEach(function(c, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                     + '<div style="font-size:10px;color:#64748b">' + c.no + '</div>'
                     + '<div style="font-size:10px;color:#334155;font-weight:500">' + c.desc + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.qty + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.rate + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.disc + '</div>'
                     + '<div style="font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + c.net + '</div>'
                     + '</div>';
            });
            html += '</div>';

            // ── Total Amount bar ──
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                 + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</div>'
                 + '<div style="font-size:16px;font-weight:800;color:#fff">PKR 2,800</div>'
                 + '</div>';

            // ── Signature row (right-aligned) ──
            html += '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                 + '<div style="width:200px;text-align:center">'
                 + '<div style="height:40px;border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                 + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                 + '</div></div>';

        } else if (type === 'doctor_prescription') {
            // ── Patient Info Grid (4-col × 3 rows) ──
            function rxInfoCell(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + value + '</div>'
                     + '</div>';
            }
            var rxRows = [
                [['PATIENT NAME','Ali',true],            ['MRN','MRN-2026-0002',true],    ['VISIT ID','OPD-1',true],           ['DATE','28 Mar 2026',false]],
                [['DOCTOR','Dr. Sameer Iqbal',true],     ['DEPARTMENT','General Medicine',true], ['VISIT TYPE','New Patient Visit',true], ['REFERRED BY','Self',false]],
                [['PHONE NO.','0321-1234567',true],      ['CNIC','35201-1234567-1',true],  ['AGE','32 Years',true],             ['GENDER','Male',false]],
            ];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            rxRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < rxRows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { html += rxInfoCell(cell[0], cell[1], cell[2], rowBg); });
                html += '</div>';
            });
            html += '</div>';

            // ── Vitals (same grid card as patient info) ──
            html += sectionHead(color, 'Vitals');
            var vCells = [['TEMP','98.6 °F',true],['BP','120/80 mmHg',true],['PULSE','76 bpm',true],['SPO2','98%',true],['WEIGHT','70 kg',true],['HEIGHT','170 cm',false]];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            html += '<div style="display:grid;grid-template-columns:repeat(6,1fr)">';
            vCells.forEach(function(vi) { html += rxInfoCell(vi[0], vi[1], vi[2], '#fff'); });
            html += '</div></div>';

            // ── Final Diagnosis ──
            html += sectionHead(color, 'Final Diagnosis');
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            html += rxInfoCell('FINAL DIAGNOSIS', 'Community-acquired Pneumonia (CAP)', false, '#fff');
            html += '</div>';

            // ── Prescription Table ──
            html += sectionHead(color, 'Prescription');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">';
            html += '<div style="display:grid;grid-template-columns:36px 2fr 80px 80px 1fr 80px;background:' + color + ';padding:8px 10px">';
            ['#','MEDICINE','DOSE','ROUTE','FREQUENCY','DURATION'].forEach(function(h) {
                html += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff">' + h + '</div>';
            });
            html += '</div>';
            [['1','Amoxicillin 500mg Cap','1 Cap','Oral','Three times daily','7 Days'],
             ['2','Paracetamol 500mg Tab','1–2 Tabs','Oral','SOS (As needed)','5 Days'],
             ['3','Omeprazole 20mg Cap','1 Cap','Oral','Once daily (AC)','14 Days']].forEach(function(r, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:36px 2fr 80px 80px 1fr 80px;background:' + bg + ';padding:8px 10px;border-top:1px solid #f1f5f9">'
                     + '<div style="font-size:10px;color:#64748b">' + r[0] + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a">' + r[1] + '</div>'
                     + r.slice(2).map(function(c) { return '<div style="font-size:10px;color:#334155">' + c + '</div>'; }).join('')
                     + '</div>';
            });
            html += '</div>';

            // ── Investigation Orders (same grid card as patient info) ──
            html += sectionHead(color, 'Investigation Orders');
            var invList = ['CBC', 'Chest X-Ray', 'Sputum Culture', 'CRP / ESR', 'Blood Culture'];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            html += '<div style="display:grid;grid-template-columns:repeat(' + invList.length + ',1fr)">';
            invList.forEach(function(inv, i) { html += rxInfoCell('ORDER ' + (i+1), inv, i < invList.length - 1, i % 2 === 0 ? '#fff' : '#f8fafc'); });
            html += '</div></div>';

            // ── Doctor Signature (right-aligned) ──
            html += '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                 + '<div style="width:220px;text-align:center">'
                 + '<div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:6px">Dr. Sameer Iqbal</div>'
                 + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                 + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">General Medicine</div>'
                 + '</div></div>';

        } else if (type === 'ipd_registration' && format === 'thermal') {
            var hospName    = pr.basic_name      || 'Hospital Name';
            var hospPhone   = pr.contact_phone   || '';
            var hospWebsite = pr.contact_website || '';
            var addrParts   = [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean);
            var addrStr     = addrParts.join(', ');
            var now         = new Date();
            var dateStr     = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
            var timeStr     = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
            var thCol       = 'style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;white-space:nowrap"';
            var tdL         = 'style="padding:2px 3px;font-size:10px"';
            var tdR         = 'style="padding:2px 3px;font-size:10px;text-align:right;white-space:nowrap"';
            var tdC         = 'style="padding:2px 3px;font-size:10px;text-align:center"';
            $('#previewPatientMeta').hide();
            html += '<div style="max-width:300px;margin:0 auto;font-family:monospace;font-size:11px;border:1px dashed #cbd5e1;border-radius:8px;padding:16px;background:#fff">';
            // ── Header ──
            html += '<div style="text-align:center;border-bottom:1px dashed #94a3b8;padding-bottom:8px;margin-bottom:8px">';
            html += '<div style="font-size:13px;font-weight:700">' + hospName + '</div>';
            if (hospPhone)   html += '<div style="font-size:9px;color:#64748b">Tel: ' + hospPhone + '</div>';
            if (hospWebsite) html += '<div style="font-size:9px;color:#64748b">' + hospWebsite + '</div>';
            html += '<div style="font-size:10px;font-weight:700;margin-top:6px;letter-spacing:1px">IPD ADMISSION SLIP</div>';
            html += '<div style="font-size:9px;color:#64748b">' + dateStr + ' &nbsp;|&nbsp; ' + timeStr + '</div>';
            html += '</div>';
            // ── Patient rows ──
            var ipdThermalRows = [
                ['Patient', 'Ali Khan'],
                ['MRN', 'MRN-2026-0002'],
                ['Adm. ID', 'ADM-001'],
                ['Bill ID', 'BILL-1'],
                ['Doctor', 'Dr. Sara Khan'],
                ['Dept', 'General Medicine'],
                ['Ward/Bed', 'General — Bed 12A'],
                ['Adm. Type', 'Elective'],
                ['Phone', '0321-1234567'],
                ['CNIC', '35201-XXXXXXX-1'],
                ['Age/Gender', '45 / Male'],
                ['Adm. Date', '28 Mar 2026'],
                ['Source', 'OPD Referral'],
                ['Diagnosis', 'Community-acq. Pneumonia'],
            ];
            ipdThermalRows.forEach(function(r) {
                html += '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted #e2e8f0">'
                     + '<span style="color:#64748b">' + r[0] + '</span>'
                     + '<span style="font-weight:600;text-align:right;max-width:55%">' + r[1] + '</span>'
                     + '</div>';
            });
            // ── Charges table ──
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:8px;padding-top:6px">';
            html += '<table style="width:100%;border-collapse:collapse">';
            html += '<tr>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:left">Description</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:center">Qty</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Disc</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Net</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Total</th>'
                 + '</tr>';
            html += '<tr><td ' + tdL + '>Doctor Fee</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 3,000</td><td ' + tdR + '>PKR 3,000</td></tr>';
            html += '<tr><td ' + tdL + '>Room/Bed (5d)</td><td ' + tdC + '>5</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 1,500</td><td ' + tdR + '>PKR 7,500</td></tr>';
            html += '<tr><td ' + tdL + '>Nursing Charges</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 500</td><td ' + tdR + '>PKR 500</td></tr>';
            html += '</table></div>';
            // ── Total ──
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:700;font-size:12px">'
                 + '<span>TOTAL</span><span>PKR 11,000</span></div>';
            // ── Footer ──
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:10px;padding-top:8px;text-align:center">';
            if (addrStr) html += '<div style="font-size:8px;color:#64748b;margin-bottom:4px">' + addrStr + '</div>';
            html += '<div style="height:24px;border-bottom:1px solid #334155;margin:8px auto 4px;width:120px"></div>';
            html += '<div style="font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Receptionist / Cashier</div>';
            html += '<div style="font-size:8px;color:#94a3b8;margin-top:3px">Created by: Admin User</div>';
            html += '</div></div>';
            $('#previewDocContent').html(html);
            return;

        } else if (type === 'ipd_registration') {
            // ── Patient Info Grid (4-col × 3 rows) — IPD fields ──
            function ipdInfoCell(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg || '#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + value + '</div>'
                     + '</div>';
            }
            var ipdRows = [
                [['PATIENT NAME','Ali Khan',true],         ['MRN','MRN-2026-0002',true],          ['ADMISSION ID','ADM-001',true],              ['BILL ID','BILL-1',false]],
                [['DOCTOR','Dr. Sara Khan (FCPS)',true],   ['DEPARTMENT','General Medicine',true], ['WARD / BED','General Ward — Bed 12A',true], ['ADMISSION TYPE','Elective',false]],
                [['PHONE NO.','0321-1234567',true],        ['CNIC','35201-1234567-1',true],        ['AGE','45 Years',true],                      ['GENDER','Male',false]],
                [['ADMISSION DATE','28 Mar 2026',true],    ['ADMISSION SOURCE','OPD Referral',true], ['INITIAL DIAGNOSIS','Community-acquired Pneumonia',true], ['ESTIMATED STAY','5–7 Days',false]],
            ];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            ipdRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < ipdRows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { html += ipdInfoCell(cell[0], cell[1], cell[2], rowBg); });
                html += '</div>';
            });
            html += '</div>';

            // ── Charges Table ──
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + color + ';padding:9px 14px">';
            ['S.NO', 'DESCRIPTION', 'QTY', 'RATE', 'DISC.', 'NET'].forEach(function(h, i) {
                html += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;' + (i > 1 ? 'text-align:right' : '') + '">' + h + '</div>';
            });
            html += '</div>';
            [
                { no:'1', desc:'Doctor Fee — Dr. Sara Khan',  qty:'1', rate:'PKR 3,000', disc:'—', net:'PKR 3,000' },
                { no:'2', desc:'Room / Bed Charges (per day)', qty:'5', rate:'PKR 1,500', disc:'—', net:'PKR 7,500' },
                { no:'3', desc:'Nursing Charges',              qty:'1', rate:'PKR 500',   disc:'—', net:'PKR 500'   },
                { no:'4', desc:'Admission Processing Fee',     qty:'1', rate:'PKR 200',   disc:'—', net:'PKR 200'   },
            ].forEach(function(c, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                     + '<div style="font-size:10px;color:#64748b">' + c.no + '</div>'
                     + '<div style="font-size:10px;color:#334155;font-weight:500">' + c.desc + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.qty + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.rate + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.disc + '</div>'
                     + '<div style="font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + c.net + '</div>'
                     + '</div>';
            });
            html += '</div>';

            // ── Total Amount bar ──
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                 + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</div>'
                 + '<div style="font-size:16px;font-weight:800;color:#fff">PKR 11,200</div>'
                 + '</div>';

            // ── Signature (right-aligned, same style as OPD slip) ──
            html += '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                 + '<div style="width:220px;text-align:center">'
                 + '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">Registered By</div>'
                 + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                 + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                 + '</div></div>';

        } else if (type === 'patient_mar') {
            html += infoGrid([{ label: 'Patient Name', w: 85 }, { label: 'MR No.', w: 60 }, { label: 'Ward / Bed', w: 65 },
                              { label: 'Admitting Doctor', w: 80 }, { label: 'Date From', w: 55 }, { label: 'Date To', w: 55 }]);
            html += sectionHead(color, 'Medication Administration Record');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += tableHead(color, ['Medicine', 'Dose', 'Route', 'Schedule']);
            [['Ceftriaxone 1g IV', '1g', 'IV', 'BD (8AM / 8PM)'],
             ['Paracetamol 500mg', '1 Tab', 'Oral', 'TDS (8–2–8)'],
             ['Metronidazole 500mg', '1 Tab', 'Oral', 'TDS (8–2–8)'],
             ['Furosemide 40mg', '1 Tab', 'Oral', 'OD (8AM)']].forEach(function(r, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2.5fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9">'
                     + r.map(function(c, ci) { return '<div style="font-size:10px;color:#334155;' + (ci === 0 ? 'font-weight:500' : 'text-align:center') + '">' + c + '</div>'; }).join('') + '</div>';
            });
            html += '</div>';
            html += sigRow(['Nurse (Morning)', 'Nurse (Evening)', 'Nurse (Night)']);

        } else if (type === 'complete_mar') {
            html += infoGrid([{ label: 'Ward', w: 60 }, { label: 'Date', w: 65 }, { label: 'Shift', w: 50 },
                              { label: 'Total Patients', w: 55 }, { label: 'Prepared By', w: 75 }, { label: 'Verified By', w: 70 }]);
            html += sectionHead(color, 'Complete Medication Administration Record');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += tableHead(color, ['Patient', 'Medicine', 'Dose / Route', 'Given']);
            [['Pt. A — Bed 1', 'Amoxicillin 500mg', '1 Cap / Oral', '✓ 8AM'],
             ['Pt. B — Bed 2', 'Ceftriaxone 1g', '1g / IV', '✓ 8AM'],
             ['Pt. C — Bed 3', 'Metronidazole', '1 Tab / Oral', '✓ 8AM'],
             ['Pt. D — Bed 4', 'Furosemide 40mg', '1 Tab / Oral', '✓ 8AM']].forEach(function(r, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2fr 2fr 1.5fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9">'
                     + r.map(function(c, ci) { return '<div style="font-size:10px;color:#334155;' + (ci === 0 ? 'font-weight:600' : '') + '">' + c + '</div>'; }).join('') + '</div>';
            });
            html += '</div>';
            html += sigRow(['Nurse in Charge', 'Supervisor', 'Hospital Stamp']);

        } else if (type === 'ipd_discharge_slip') {
            html += infoGrid([{ label: 'MR No.', w: 65 }, { label: 'Admission No.', w: 60 }, { label: 'Discharge Date', w: 75 },
                              { label: 'Patient Name', w: 85 }, { label: 'Ward / Bed', w: 60 }, { label: 'Total Stay', w: 50 }]);
            html += sectionHead(color, 'Discharge Summary');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += tableHead(color, ['Field', 'Details', 'Status']);
            [['Diagnosis', 'Community-acquired Pneumonia', 'Resolved'], ['Procedure', 'IV Antibiotics Course', 'Completed'],
             ['Discharge Condition', 'Stable / Improved', 'Fit for Discharge'], ['Follow-up', 'After 1 week OPD', 'Scheduled']].forEach(function(r, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2fr 2fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9">'
                     + ['font-weight:600','','font-weight:600;text-align:right;color:' + color].map(function(s, ci) { return '<div style="font-size:10px;color:#334155;' + s + '">' + r[ci] + '</div>'; }).join('') + '</div>';
            });
            html += '</div>';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding:10px 14px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">'
                 + '<div style="font-size:10px;color:#166534"><b>Discharge Status:</b> Discharged on Advice — All dues cleared</div>' + badge('DISCHARGED', '#166534', '#dcfce7') + '</div>';
            html += sigRow(['Discharging Doctor', 'Nurse in Charge', 'Patient / Guardian']);

        } else if (type === 'er_registration' && format === 'thermal') {
            var hospName    = pr.basic_name      || 'Hospital Name';
            var hospPhone   = pr.contact_phone   || '';
            var hospWebsite = pr.contact_website || '';
            var addrParts   = [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean);
            var addrStr     = addrParts.join(', ');
            var now         = new Date();
            var dateStr     = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
            var timeStr     = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
            var thCol       = 'style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;white-space:nowrap"';
            var tdL         = 'style="padding:2px 3px;font-size:10px"';
            var tdR         = 'style="padding:2px 3px;font-size:10px;text-align:right;white-space:nowrap"';
            var tdC         = 'style="padding:2px 3px;font-size:10px;text-align:center"';
            $('#previewPatientMeta').hide();
            html += '<div style="max-width:300px;margin:0 auto;font-family:monospace;font-size:11px;border:1px dashed #cbd5e1;border-radius:8px;padding:16px;background:#fff">';
            html += '<div style="text-align:center;border-bottom:1px dashed #94a3b8;padding-bottom:8px;margin-bottom:8px">';
            html += '<div style="font-size:13px;font-weight:700">' + hospName + '</div>';
            if (hospPhone)   html += '<div style="font-size:9px;color:#64748b">Tel: ' + hospPhone + '</div>';
            if (hospWebsite) html += '<div style="font-size:9px;color:#64748b">' + hospWebsite + '</div>';
            html += '<div style="font-size:10px;font-weight:700;margin-top:6px;letter-spacing:1px">EMERGENCY REGISTRATION SLIP</div>';
            html += '<div style="font-size:9px;color:#64748b">' + dateStr + ' &nbsp;|&nbsp; ' + timeStr + '</div>';
            html += '</div>';
            var erThermalRows = [
                ['Patient',    'Ali Khan'],
                ['MRN',        'MRN-2026-0002'],
                ['Visit ID',   'ER-001'],
                ['Bill ID',    'ER-BILL-1'],
                ['Doctor',     'Dr. Khalid Mehmood'],
                ['Dept',       'Emergency'],
                ['ESI Level',  'ESI-1 (Critical)'],
                ['Triage',     'Red — Immediate'],
                ['Arrival',    'Walk-in'],
                ['Phone',      '0321-1234567'],
                ['CNIC',       '35201-XXXXXXX-1'],
                ['Age/Gender', '45 / Male'],
                ['Arrived',    '28 Mar 2026, 21:10'],
                ['Complaint',  'Severe chest pain'],
                ['MLC',        'No'],
            ];
            erThermalRows.forEach(function(r) {
                html += '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted #e2e8f0">'
                     + '<span style="color:#64748b">' + r[0] + '</span>'
                     + '<span style="font-weight:600;text-align:right;max-width:55%">' + r[1] + '</span>'
                     + '</div>';
            });
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:8px;padding-top:6px">';
            html += '<table style="width:100%;border-collapse:collapse">';
            html += '<tr>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:left">Description</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:center">Qty</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Disc</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Net</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Total</th>'
                 + '</tr>';
            html += '<tr><td ' + tdL + '>Doctor Fee</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 2,000</td><td ' + tdR + '>PKR 2,000</td></tr>';
            html += '<tr><td ' + tdL + '>ER Charges</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 800</td><td ' + tdR + '>PKR 800</td></tr>';
            html += '</table></div>';
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:700;font-size:12px">'
                 + '<span>TOTAL</span><span>PKR 2,800</span></div>';
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:10px;padding-top:8px;text-align:center">';
            if (addrStr) html += '<div style="font-size:8px;color:#64748b;margin-bottom:4px">' + addrStr + '</div>';
            html += '<div style="height:24px;border-bottom:1px solid #334155;margin:8px auto 4px;width:120px"></div>';
            html += '<div style="font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Receptionist / Cashier</div>';
            html += '<div style="font-size:8px;color:#94a3b8;margin-top:3px">Created by: Admin User</div>';
            html += '</div></div>';
            $('#previewDocContent').html(html);
            return;

        } else if (type === 'er_registration') {
            // ── Patient Info Grid (4-col × 4 rows) — ER fields ──
            function erInfoCell(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg || '#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + value + '</div>'
                     + '</div>';
            }
            var erRows = [
                [['PATIENT NAME','Ali Khan',true],              ['MRN','MRN-2026-0002',true],         ['VISIT ID','MRN-2026-0002-ER-1',true],   ['BILL ID','ER-BILL-1',false]],
                [['ER DOCTOR','Dr. Khalid Mehmood',true],       ['DEPARTMENT','Emergency',true],       ['TRIAGE CATEGORY','Red — Immediate',true], ['ESI LEVEL','ESI-1 (Critical)',false]],
                [['PHONE NO.','0321-1234567',true],              ['CNIC','35201-1234567-1',true],       ['AGE','45 Years',true],                  ['GENDER','Male',false]],
                [['ARRIVAL DATE/TIME','28 Mar 2026, 21:10',true],['MODE OF ARRIVAL','Ambulance',true], ['CHIEF COMPLAINT','Severe chest pain',true], ['CLINICAL STATUS','Under Treatment',false]],
            ];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            erRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < erRows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { html += erInfoCell(cell[0], cell[1], cell[2], rowBg); });
                html += '</div>';
            });
            html += '</div>';

            // ── Charges Table ──
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + color + ';padding:9px 14px">';
            ['S.NO', 'DESCRIPTION', 'QTY', 'RATE', 'DISC.', 'NET'].forEach(function(h, i) {
                html += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;' + (i > 1 ? 'text-align:right' : '') + '">' + h + '</div>';
            });
            html += '</div>';
            [
                { no:'1', desc:'Doctor Fee — Dr. Khalid Mehmood', qty:'1', rate:'PKR 2,000', disc:'—', net:'PKR 2,000' },
                { no:'2', desc:'Emergency Consultation Charges',   qty:'1', rate:'PKR 500',   disc:'—', net:'PKR 500'   },
                { no:'3', desc:'Triage & Assessment Fee',          qty:'1', rate:'PKR 300',   disc:'—', net:'PKR 300'   },
            ].forEach(function(c, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                     + '<div style="font-size:10px;color:#64748b">' + c.no + '</div>'
                     + '<div style="font-size:10px;color:#334155;font-weight:500">' + c.desc + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.qty + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.rate + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.disc + '</div>'
                     + '<div style="font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + c.net + '</div>'
                     + '</div>';
            });
            html += '</div>';

            // ── Total Amount bar ──
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                 + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</div>'
                 + '<div style="font-size:16px;font-weight:800;color:#fff">PKR 2,800</div>'
                 + '</div>';

            // ── Signature (right-aligned) ──
            html += '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                 + '<div style="width:220px;text-align:center">'
                 + '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">Registered By</div>'
                 + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                 + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                 + '</div></div>';

        } else if (type === 'er_discharge_slip') {
            html += infoGrid([{ label: 'ER No.', w: 55 }, { label: 'Arrival Time', w: 60 }, { label: 'Discharge Time', w: 65 },
                              { label: 'Patient Name', w: 85 }, { label: 'Age / Gender', w: 55 }, { label: 'Disposition', w: 70 }]);
            html += sectionHead(color, 'Emergency Discharge Details');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += tableHead(color, ['Field', 'Details', 'Status']);
            [['Diagnosis', 'Acute Myocardial Infarction', 'Stabilised'], ['Treatment Given', 'Thrombolysis + O2 Therapy', 'Completed'],
             ['Disposition', 'Admitted to CCU', 'Transfer'], ['Follow-up', 'Cardiology OPD — 3 days', 'Scheduled']].forEach(function(r, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2fr 2fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9">'
                     + ['font-weight:600','','font-weight:600;text-align:right'].map(function(s, ci) { return '<div style="font-size:10px;color:#334155;' + s + '">' + r[ci] + '</div>'; }).join('') + '</div>';
            });
            html += '</div>';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding:10px 14px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">'
                 + '<div style="font-size:10px;color:#166534"><b>ER Discharge:</b> Patient Discharged / Transferred</div>' + badge('DISCHARGED', '#166534', '#dcfce7') + '</div>';
            html += sigRow(['ER Doctor', 'Charge Nurse', 'Patient / Guardian']);

        } else if (type === 'scheduling_reg' && format === 'thermal') {
            var hospName    = pr.basic_name      || 'Hospital Name';
            var hospPhone   = pr.contact_phone   || '';
            var hospWebsite = pr.contact_website || '';
            var addrParts   = [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean);
            var addrStr     = addrParts.join(', ');
            var now         = new Date();
            var dateStr     = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
            var timeStr     = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
            var thCol       = 'style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;white-space:nowrap"';
            var tdL         = 'style="padding:2px 3px;font-size:10px"';
            var tdR         = 'style="padding:2px 3px;font-size:10px;text-align:right;white-space:nowrap"';
            var tdC         = 'style="padding:2px 3px;font-size:10px;text-align:center"';
            $('#previewPatientMeta').hide();
            html += '<div style="max-width:300px;margin:0 auto;font-family:monospace;font-size:11px;border:1px dashed #cbd5e1;border-radius:8px;padding:16px;background:#fff">';
            html += '<div style="text-align:center;border-bottom:1px dashed #94a3b8;padding-bottom:8px;margin-bottom:8px">';
            html += '<div style="font-size:13px;font-weight:700">' + hospName + '</div>';
            if (hospPhone)   html += '<div style="font-size:9px;color:#64748b">Tel: ' + hospPhone + '</div>';
            if (hospWebsite) html += '<div style="font-size:9px;color:#64748b">' + hospWebsite + '</div>';
            html += '<div style="font-size:10px;font-weight:700;margin-top:6px;letter-spacing:1px">OT REGISTRATION SLIP</div>';
            html += '<div style="font-size:9px;color:#64748b">' + dateStr + ' &nbsp;|&nbsp; ' + timeStr + '</div>';
            html += '</div>';
            var otThermalRows = [
                ['Patient',    'Ali Khan'],
                ['MRN',        'MRN-2026-0002'],
                ['Op. ID',     'MRN-2026-0002-OT-1'],
                ['Surgeon',    'Dr. Sara Khan (FCPS)'],
                ['Anaesthet.', 'Dr. Bilal Ahmed'],
                ['Theater',    'OT-1 — Main Block'],
                ['Surg. Type', 'Elective'],
                ['Anesthesia', 'General Anesthesia (GA)'],
                ['Phone',      '0321-1234567'],
                ['CNIC',       '35201-XXXXXXX-1'],
                ['Age/Gender', '45 / Male'],
                ['Surg. Date', '29 Mar 2026, 08:00 AM'],
                ['Est. Dur.',  '2 hrs'],
                ['Priority',   'Elective'],
            ];
            otThermalRows.forEach(function(r) {
                html += '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted #e2e8f0">'
                     + '<span style="color:#64748b">' + r[0] + '</span>'
                     + '<span style="font-weight:600;text-align:right;max-width:55%">' + r[1] + '</span>'
                     + '</div>';
            });
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:8px;padding-top:6px">';
            html += '<table style="width:100%;border-collapse:collapse">';
            html += '<tr>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:left">Description</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:center">Qty</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Disc</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Net</th>'
                 + '<th ' + thCol + ' style="font-weight:700;font-size:9px;padding:2px 3px;border-bottom:1px dashed #94a3b8;text-align:right">Total</th>'
                 + '</tr>';
            html += '<tr><td ' + tdL + '>Surgeon Fee</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 15,000</td><td ' + tdR + '>PKR 15,000</td></tr>';
            html += '<tr><td ' + tdL + '>Anaesthet. Fee</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 8,000</td><td ' + tdR + '>PKR 8,000</td></tr>';
            html += '<tr><td ' + tdL + '>Theater Charges</td><td ' + tdC + '>1</td><td ' + tdR + '>0</td><td ' + tdR + '>PKR 5,000</td><td ' + tdR + '>PKR 5,000</td></tr>';
            html += '</table></div>';
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:700;font-size:12px">'
                 + '<span>TOTAL</span><span>PKR 28,000</span></div>';
            html += '<div style="border-top:1px dashed #94a3b8;margin-top:10px;padding-top:8px;text-align:center">';
            if (addrStr) html += '<div style="font-size:8px;color:#64748b;margin-bottom:4px">' + addrStr + '</div>';
            html += '<div style="height:24px;border-bottom:1px solid #334155;margin:8px auto 4px;width:120px"></div>';
            html += '<div style="font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Receptionist / Cashier</div>';
            html += '<div style="font-size:8px;color:#94a3b8;margin-top:3px">Created by: Admin User</div>';
            html += '</div></div>';
            $('#previewDocContent').html(html);
            return;

        } else if (type === 'scheduling_reg') {
            // ── Patient / OT Info Grid (4-col × 4 rows) ──
            function otInfoCell(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg || '#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + value + '</div>'
                     + '</div>';
            }
            var otRows = [
                [['PATIENT NAME','Ali Khan',true],              ['MRN','MRN-2026-0002',true],         ['OPERATION ID','MRN-2026-0002-OT-1',true], ['BILL ID','OT-BILL-1',false]],
                [['SURGEON','Dr. Sara Khan (FCPS)',true],        ['ANAESTHETIST','Dr. Bilal Ahmed',true], ['THEATER','OT-1 — Main Block',true],    ['SURGERY TYPE','Elective',false]],
                [['PHONE NO.','0321-1234567',true],              ['CNIC','35201-1234567-1',true],       ['AGE','45 Years',true],                   ['GENDER','Male',false]],
                [['SURGERY DATE','29 Mar 2026',true],            ['START TIME','08:00 AM',true],        ['EST. DURATION','2 Hours',true],          ['PRIORITY','Elective',false]],
            ];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            otRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < otRows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { html += otInfoCell(cell[0], cell[1], cell[2], rowBg); });
                html += '</div>';
            });
            html += '</div>';

            // ── Charges Table ──
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + color + ';padding:9px 14px">';
            ['S.NO', 'DESCRIPTION', 'QTY', 'RATE', 'DISC.', 'NET'].forEach(function(h, i) {
                html += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#fff;' + (i > 1 ? 'text-align:right' : '') + '">' + h + '</div>';
            });
            html += '</div>';
            [
                { no:'1', desc:'Surgeon Fee — Dr. Sara Khan',     qty:'1', rate:'PKR 15,000', disc:'—', net:'PKR 15,000' },
                { no:'2', desc:'Anaesthetist Fee — Dr. Bilal Ahmed', qty:'1', rate:'PKR 8,000', disc:'—', net:'PKR 8,000' },
                { no:'3', desc:'Theater / OT Charges',             qty:'1', rate:'PKR 5,000', disc:'—', net:'PKR 5,000'  },
            ].forEach(function(c, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:40px 2.5fr 1fr 1fr 1fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9;align-items:center">'
                     + '<div style="font-size:10px;color:#64748b">' + c.no + '</div>'
                     + '<div style="font-size:10px;color:#334155;font-weight:500">' + c.desc + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.qty + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.rate + '</div>'
                     + '<div style="font-size:10px;color:#64748b;text-align:right">' + c.disc + '</div>'
                     + '<div style="font-size:10px;color:#1e293b;font-weight:600;text-align:right">' + c.net + '</div>'
                     + '</div>';
            });
            html += '</div>';

            // ── Total Amount bar ──
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#1e293b;border-radius:8px;margin-bottom:24px">'
                 + '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff">TOTAL AMOUNT</div>'
                 + '<div style="font-size:16px;font-weight:800;color:#fff">PKR 28,000</div>'
                 + '</div>';

            // ── Signature (right-aligned) ──
            html += '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                 + '<div style="width:220px;text-align:center">'
                 + '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">Registered By</div>'
                 + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                 + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Receptionist / Cashier</div>'
                 + '</div></div>';

        } else if (type === 'pre_ops') {
            // ── Patient Info Grid (same as Scheduling Registration) ──
            function preOpsCell(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + value + '</div>'
                     + '</div>';
            }
            function chkRow(items, checked) {
                // renders 2-col checklist row
                var out = '';
                items.forEach(function(item) {
                    var done = checked.indexOf(item) !== -1;
                    out += '<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:' + (done ? '#f0fdf4' : '#fff') + ';border-radius:6px;border:1px solid ' + (done ? '#bbf7d0' : '#e2e8f0') + '">'
                         + '<div style="width:14px;height:14px;border-radius:3px;border:1.5px solid ' + (done ? '#16a34a' : '#94a3b8') + ';background:' + (done ? '#16a34a' : '#fff') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
                         + (done ? '<span style="color:#fff;font-size:9px;line-height:1">✓</span>' : '')
                         + '</div>'
                         + '<span style="font-size:9.5px;color:#334155;font-weight:500">' + item + '</span>'
                         + '</div>';
                });
                return out;
            }
            var preOpsRows = [
                [['PATIENT NAME','Ali Khan',true],           ['MRN','MRN-2026-0002',true],       ['OPERATION ID','MRN-2026-0002-OT-1',true], ['BILL ID','OT-BILL-1',false]],
                [['SURGEON','Dr. Sara Khan (FCPS)',true],     ['ANAESTHETIST','Dr. Bilal Ahmed',true], ['THEATER','OT-1 — Main Block',true], ['SURGERY TYPE','Elective',false]],
                [['PHONE NO.','0321-1234567',true],           ['CNIC','35201-1234567-1',true],     ['AGE','45 Years',true],                ['GENDER','Male',false]],
                [['SURGERY DATE','29 Mar 2026',true],         ['START TIME','08:00 AM',true],      ['PROCEDURE','Appendectomy',true],      ['PRIORITY','Elective',false]],
            ];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            preOpsRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < preOpsRows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { html += preOpsCell(cell[0], cell[1], cell[2], rowBg); });
                html += '</div>';
            });
            html += '</div>';

            // ── Checklist Sections ──
            var checked = ['Patient identity confirmed', 'Procedure & site verified', 'Surgical site marked', 'Surgery consent signed', 'Anaesthesia consent signed', 'PAC completed', 'NPO confirmed (6h+)', 'CBC done', 'Blood grouping done', 'ECG done', 'Chest X-Ray done', 'IV line secured', 'OT prepared', 'Equipment sterilised', 'Reviewed by surgeon'];
            var sections = [
                { title: 'Patient Verification', items: ['Patient identity confirmed', 'Name verified with ID', 'Wristband checked', 'Procedure & site verified', 'Surgical site marked'] },
                { title: 'Consent Documentation', items: ['Surgery consent signed', 'Anaesthesia consent signed', 'Blood transfusion consent', 'High risk consent'] },
                { title: 'Pre-Anaesthetic Evaluation', items: ['PAC completed', 'Medical clearance obtained', 'Airway assessed (Mallampati)'] },
                { title: 'NPO & Medications', items: ['NPO confirmed (6h+)', 'Pre-op antibiotics given', 'Pre-medication given'] },
                { title: 'Investigations', items: ['CBC done', 'Blood grouping done', 'Coag profile done', 'Renal function done', 'ECG done', 'Chest X-Ray done'] },
                { title: 'Physical Preparation', items: ['Patient bathed', 'Surgical site shaved', 'Jewellery removed', 'Bladder emptied', 'IV line secured', 'Pre-op gown worn'] },
                { title: 'Equipment & Final Verification', items: ['OT prepared', 'Equipment sterilised', 'Instruments counted', 'Reviewed by surgeon', 'All team briefed'] },
            ];
            sections.forEach(function(sec) {
                html += sectionHead(color, sec.title);
                html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px">';
                html += chkRow(sec.items, checked);
                html += '</div>';
            });

            // ── Vital Signs (grid card) ──
            html += sectionHead(color, 'Vital Signs');
            var preVitals = [['BP','120/80 mmHg',true],['HR','76 bpm',true],['TEMP','98.4 °F',true],['RR','16 /min',true],['SPO2','99%',true],['WEIGHT','70 kg',false]];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            html += '<div style="display:grid;grid-template-columns:repeat(6,1fr)">';
            preVitals.forEach(function(vi) { html += preOpsCell(vi[0], vi[1], vi[2], '#fff'); });
            html += '</div></div>';

            // ── Signature (right-aligned — who saved checklist) ──
            html += '<div style="display:flex;justify-content:flex-end;margin-top:28px">'
                 + '<div style="width:220px;text-align:center">'
                 + '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">Saved By</div>'
                 + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                 + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Anaesthetist / Nurse</div>'
                 + '</div></div>';

        } else if (type === 'intra_ops') {
            // ── helpers ──────────────────────────────────────────────────────
            var ioCell = function(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + value + '</div>'
                     + '</div>';
            };
            var ioChk = function(label, checked) {
                return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:9.5px;color:#334155">'
                     + '<div style="width:13px;height:13px;border-radius:3px;flex-shrink:0;border:1.5px solid ' + (checked ? '#16a34a' : '#94a3b8') + ';background:' + (checked ? '#16a34a' : '#fff') + ';display:flex;align-items:center;justify-content:center">'
                     + (checked ? '<span style="color:#fff;font-size:8px;line-height:1">✓</span>' : '')
                     + '</div><span>' + label + '</span></div>';
            };
            var ioSecBox = function(title, content) {
                return '<div style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:10px">'
                     + '<div style="background:' + color + ';color:#fff;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;padding:5px 10px">' + title + '</div>'
                     + '<div style="padding:8px 10px;background:#fff">' + content + '</div>'
                     + '</div>';
            };
            var ioBadge = function(txt, bg, col) {
                return '<span style="display:inline-block;padding:2px 7px;border-radius:10px;font-size:8px;font-weight:600;background:' + bg + ';color:' + col + ';margin:2px 2px 2px 0">' + txt + '</span>';
            };

            // ── Patient grid (4 rows — same as scheduling_reg) ───────────────
            var ioRows = [
                [['PATIENT NAME','Ali Khan',true],               ['MRN','MRN-2026-0002',true],          ['OPERATION ID','MRN-2026-0002-OT-1',true], ['SURGERY TYPE','Elective',false]],
                [['SURGEON','Dr. Sara Khan (FCPS)',true],         ['ANAESTHETIST','Dr. Bilal Ahmed',true],['THEATER','OT-1 — Main Block',true],       ['CURRENT PHASE','Closure',false]],
                [['PHONE NO.','0321-1234567',true],               ['CNIC','35201-1234567-1',true],        ['AGE','45 Years',true],                    ['GENDER','Male',false]],
                [['SURGERY DATE','29 Mar 2026',true],             ['START TIME','08:00 AM',true],         ['PROCEDURE','Appendectomy',true],          ['STATUS','In Progress',false]],
            ];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            ioRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < ioRows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { html += ioCell(cell[0], cell[1], cell[2], rowBg); });
                html += '</div>';
            });
            html += '</div>';

            // ── 2-column section layout ──────────────────────────────────────
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';

            // Left column
            html += '<div>';

            // WHO Sign In
            html += ioSecBox('WHO Safety — Sign In',
                ioChk('Patient identity confirmed', true) +
                ioChk('Surgical site marked / confirmed', true) +
                ioChk('Consent confirmed', true) +
                ioChk('Anaesthesia safety check complete', true)
            );

            // WHO Time Out
            html += ioSecBox('WHO Safety — Time Out',
                '<div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:4px;padding:6px;margin-bottom:6px">'
                + '<div style="font-size:8px;font-weight:700;color:#dc2626;margin-bottom:4px">CRITICAL — Entire Team Required</div>'
                + ioChk('All team members introduced', true)
                + ioChk('Identity, site & procedure confirmed by team', true)
                + ioChk('Critical events reviewed', false)
                + ioChk('Antibiotic prophylaxis given', true)
                + ioChk('Essential imaging displayed', true)
                + '</div>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:9px"><div style="color:#64748b">Time Out at: <strong>08:05</strong></div><div style="color:#64748b">Confirmed by: <strong>Dr. Sara</strong></div></div>'
            );

            // Anaesthesia — Induction
            html += ioSecBox('Section 1A: Anaesthesia — Induction',
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px">'
                + '<div style="font-size:9px;color:#64748b">Induction: <strong style="color:#0f172a">08:00</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Technique: <strong style="color:#0f172a">Standard</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Airway: <strong style="color:#0f172a">ETT 7.5</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Cuff Pressure: <strong style="color:#0f172a">22 cmH₂O</strong></div>'
                + '</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:4px">Complications</div>'
                + ioChk('None', true)
                + '<div style="margin-top:6px;font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:4px">Induction Medications</div>'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 8px;font-size:9px;color:#334155">'
                + 'Propofol 200mg IV &bull; Fentanyl 100mcg IV &bull; Rocuronium 50mg IV</div>'
            );

            // Anaesthesia — Maintenance
            html += ioSecBox('Section 1B: Anaesthesia — Maintenance',
                '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:4px">Anaesthetic Agents</div>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px">'
                + ioBadge('Sevoflurane 2%', '#eff6ff', '#1d4ed8')
                + ioBadge('O₂/Air 50%', '#f0fdf4', '#15803d')
                + '</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:4px">Muscle Relaxants</div>'
                + '<div style="font-size:9px;color:#334155;margin-bottom:6px">Rocuronium 10mg &bull; Neostigmine 2.5mg</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:4px">Analgesics</div>'
                + '<div style="font-size:9px;color:#334155">Paracetamol 1g IV &bull; Ketorolac 30mg IV</div>'
            );

            // Surgery Timeline
            html += ioSecBox('Section 2A: Surgery Timeline',
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">'
                + '<div style="font-size:9px;color:#64748b">Anaesthesia Start: <strong style="color:#0f172a">08:00</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Incision Time: <strong style="color:#0f172a">08:20</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Procedure Start: <strong style="color:#0f172a">08:22</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Procedure End: <strong style="color:#0f172a">09:45</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Closure Start: <strong style="color:#0f172a">09:48</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Final Suture: <strong style="color:#0f172a">10:05</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Anaesthesia End: <strong style="color:#0f172a">10:15</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Patient Out: <strong style="color:#0f172a">10:20</strong></div>'
                + '</div>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px">'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 8px"><div style="font-size:8px;color:#94a3b8">Total Anaesthesia</div><div style="font-size:12px;font-weight:700;color:#0f172a">135 min</div></div>'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 8px"><div style="font-size:8px;color:#94a3b8">Total Surgery</div><div style="font-size:12px;font-weight:700;color:#0f172a">105 min</div></div>'
                + '</div>'
            );

            html += '</div>'; // end left column

            // Right column
            html += '<div>';

            // Vitals Log
            html += ioSecBox('Section 1C: Vitals Log',
                '<table style="width:100%;border-collapse:collapse;font-size:8.5px">'
                + '<thead><tr style="background:' + color + '1a">'
                + ['Time','HR','BP','SpO₂','ETCO₂','Temp'].map(function(h){ return '<th style="padding:4px 6px;text-align:left;font-weight:700;color:#334155">' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>'
                + [['08:15','76','120/78','99','34','36.8'],['08:45','80','118/76','98','35','36.9'],['09:15','82','115/74','99','35','37.0'],['09:45','78','122/80','98','34','37.0']].map(function(r, i) {
                    return '<tr style="background:' + (i%2===1?'#f8fafc':'#fff') + ';border-top:1px solid #f1f5f9">'
                         + r.map(function(c){ return '<td style="padding:4px 6px;color:#334155">' + c + '</td>'; }).join('') + '</tr>';
                }).join('')
                + '</tbody></table>'
            );

            // Fluids & Blood
            html += ioSecBox('Section 1D: Fluids & Blood Products',
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:6px">'
                + '<div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:3px">Crystalloids</div><div style="font-size:9px;color:#334155">NS 500ml &bull; RL 500ml</div></div>'
                + '<div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:3px">Colloids</div><div style="font-size:9px;color:#334155">None</div></div>'
                + '<div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:3px">Blood Products</div><div style="font-size:9px;color:#334155">None</div></div>'
                + '</div>'
                + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px"><div style="font-size:8px;color:#94a3b8">Urine Output</div><div style="font-size:11px;font-weight:700;color:#0f172a">250 ml</div></div>'
                + '<div style="background:#fff7ed;border-radius:4px;padding:5px"><div style="font-size:8px;color:#94a3b8">Blood Loss</div><div style="font-size:11px;font-weight:700;color:#ea580c">150 ml</div></div>'
                + '<div style="background:#f0fdf4;border-radius:4px;padding:5px"><div style="font-size:8px;color:#94a3b8">Fluid Balance</div><div style="font-size:11px;font-weight:700;color:#16a34a">+600 ml</div></div>'
                + '</div>'
            );

            // Position & Findings
            html += ioSecBox('Section 2B: Position & Surgical Findings',
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px">'
                + '<div style="font-size:9px;color:#64748b">Position: <strong style="color:#0f172a">Supine</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Pressure pts padded: ' + ioBadge('Yes','#f0fdf4','#16a34a') + '</div>'
                + '</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Intra-operative Findings</div>'
                + '<div style="font-size:9px;color:#334155;margin-bottom:6px">Inflamed appendix with mesoappendix involvement. No peritoneal contamination noted.</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Post-op Diagnosis</div>'
                + '<div style="font-size:9px;color:#334155">Confirmed acute appendicitis</div>'
            );

            // Drains & Catheters
            html += ioSecBox('Section 2D: Drains & Catheters',
                '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:4px">Drains Placed</div>'
                + ioChk('Redivac drain — RIF (20 Fr)', true)
                + ioChk('T-tube', false)
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin:6px 0 4px">Catheters</div>'
                + ioChk('Urinary catheter', true)
                + ioChk('Central line', false)
                + ioChk('NG tube', false)
            );

            // Complications
            html += ioSecBox('Section 2F: Complications',
                ioChk('None', true) +
                ioChk('Excessive bleeding', false) +
                ioChk('Organ injury', false) +
                ioChk('Unexpected findings', false)
            );

            html += '</div>'; // end right column
            html += '</div>'; // end 2-column

            // Surgical Counts (full width)
            html += ioSecBox('Section 2E: Surgical Counts',
                '<table style="width:100%;border-collapse:collapse;font-size:9px">'
                + '<thead><tr style="background:' + color + '1a">'
                + ['Item','Before Surgery','After Surgery','Match'].map(function(h){ return '<th style="padding:5px 8px;text-align:left;font-weight:700;color:#334155">' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>'
                + [['Instruments','42','42','✓ Match'],['Sponges','12','12','✓ Match'],['Needles','8','8','✓ Match']].map(function(r, i) {
                    return '<tr style="background:' + (i%2===1?'#f8fafc':'#fff') + ';border-top:1px solid #f1f5f9">'
                         + r.map(function(c, ci){ return '<td style="padding:5px 8px;color:' + (ci===3?'#16a34a':'#334155') + ';font-weight:' + (ci===3?'700':'400') + '">' + c + '</td>'; }).join('') + '</tr>';
                }).join('')
                + '</tbody></table>'
                + '<div style="display:flex;align-items:center;gap:8px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:5px;padding:6px 10px;margin-top:8px">'
                + '<span style="font-size:13px">✓</span><span style="font-size:10px;font-weight:700;color:#16a34a">All counts correct — verified</span></div>'
            );

            // Surgical Team (full width)
            html += ioSecBox('Section 3: Surgical Team',
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">'
                + [['Primary Surgeon','Dr. Sara Khan'],['Anaesthesiologist','Dr. Bilal Ahmed'],['Scrub Nurse','Nurse Amna'],['Circulating Nurse','Nurse Rania']].map(function(t){
                    return '<div style="background:#f8fafc;border-radius:4px;padding:6px 8px"><div style="font-size:7.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:2px">' + t[0] + '</div><div style="font-size:9.5px;font-weight:600;color:#0f172a">' + t[1] + '</div></div>';
                }).join('')
                + '</div>'
            );

            // Post-Op Instructions + WHO Sign Out (2 cols)
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';

            html += ioSecBox('Section 4: Post-Operative Instructions',
                '<div style="font-size:9px;color:#64748b;margin-bottom:4px">Destination: <strong style="color:#0f172a">Recovery Room / PACU</strong></div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:4px">Monitoring</div>'
                + ioChk('Vitals every 15 mins', true)
                + ioChk('Drain output monitoring', true)
                + ioChk('Urine output monitoring', true)
                + '<div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:4px">'
                + '<div style="font-size:9px;color:#64748b">Activity: <strong style="color:#0f172a">Bed rest</strong></div>'
                + '<div style="font-size:9px;color:#64748b">Diet: <strong style="color:#0f172a">NPO</strong></div>'
                + '</div>'
            );

            html += ioSecBox('WHO Safety — Sign Out',
                '<div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:4px;padding:6px;margin-bottom:6px">'
                + ioChk('Procedure recorded correctly', true)
                + ioChk('Instrument, sponge & needle counts correct', true)
                + ioChk('Specimens labeled correctly', true)
                + ioChk('Equipment issues addressed', true)
                + ioChk('Key concerns for recovery reviewed', false)
                + '</div>'
                + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:9px"><div style="color:#64748b">Sign Out at: <strong>10:18</strong></div><div style="color:#64748b">Confirmed by: <strong>Dr. Sara</strong></div></div>'
            );

            html += '</div>'; // end 2-col

            // ── Signature ────────────────────────────────────────────────────
            html += '<div style="display:flex;justify-content:flex-end;margin-top:8px">'
                 + '<div style="width:220px;text-align:center">'
                 + '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">Saved By</div>'
                 + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                 + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Anaesthetist / Surgeon</div>'
                 + '</div></div>';

        } else if (type === 'post_ops') {
            // ── helpers ──────────────────────────────────────────────────────
            var poCell = function(label, value, borderRight, rowBg) {
                return '<div style="padding:7px 12px;background:' + (rowBg||'#fff') + ';' + (borderRight ? 'border-right:1px solid #e8edf2;' : '') + '">'
                     + '<div style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:3px">' + label + '</div>'
                     + '<div style="font-size:10px;font-weight:600;color:#0f172a;line-height:1.2">' + value + '</div>'
                     + '</div>';
            };
            var poChkItem = function(label, checked) {
                return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:9.5px;color:#334155">'
                     + '<div style="width:13px;height:13px;border-radius:3px;flex-shrink:0;border:1.5px solid ' + (checked ? '#16a34a' : '#94a3b8') + ';background:' + (checked ? '#16a34a' : '#fff') + ';display:flex;align-items:center;justify-content:center">'
                     + (checked ? '<span style="color:#fff;font-size:8px;line-height:1">✓</span>' : '')
                     + '</div><span>' + label + '</span></div>';
            };
            var poSecBox = function(title, content) {
                return '<div style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:10px">'
                     + '<div style="background:' + color + ';color:#fff;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;padding:5px 10px">' + title + '</div>'
                     + '<div style="padding:8px 10px;background:#fff">' + content + '</div>'
                     + '</div>';
            };
            var poBadge = function(txt, bg, col) {
                return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:8px;font-weight:600;background:' + bg + ';color:' + col + ';margin:1px 2px">' + txt + '</span>';
            };

            // ── Patient grid (4 rows) ────────────────────────────────────────
            var poRows = [
                [['PATIENT NAME','Ali Khan',true],           ['MRN','MRN-2026-0002',true],       ['OPERATION ID','MRN-2026-0002-OT-1',true],   ['SURGERY TYPE','Elective',false]],
                [['SURGEON','Dr. Sara Khan (FCPS)',true],     ['ANAESTHETIST','Dr. Bilal Ahmed',true], ['THEATER','OT-1 — Main Block',true],    ['PROCEDURE','Appendectomy',false]],
                [['PHONE NO.','0321-1234567',true],           ['CNIC','35201-1234567-1',true],     ['AGE','45 Years',true],                     ['GENDER','Male',false]],
                [['SURGERY DATE','29 Mar 2026',true],         ['POST-OP LOCATION','Recovery Room / PACU',true], ['EXP. DISCHARGE','31 Mar 2026',true], ['STATUS','Completed',false]],
            ];
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 6px rgba(0,0,0,0.06)">';
            html += '<div style="height:3px;background:' + color + '"></div>';
            poRows.forEach(function(row, ri) {
                var rowBg = ri % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);' + (ri < poRows.length - 1 ? 'border-bottom:1px solid #e8edf2;' : '') + '">';
                row.forEach(function(cell) { html += poCell(cell[0], cell[1], cell[2], rowBg); });
                html += '</div>';
            });
            html += '</div>';

            // ── 2-column layout ──────────────────────────────────────────────
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';

            // ── Left column ──────────────────────────────────────────────────
            html += '<div>';

            // Section 1: Aldrete Score
            var aldreteRows = [
                ['Activity',        2, 'Able to move 4 extremities voluntarily'],
                ['Respiration',     2, 'Breathes deeply, coughs freely'],
                ['Circulation',     2, 'BP ±20% of pre-anesthetic level'],
                ['Consciousness',   2, 'Fully awake'],
                ['Oxygen Saturation', 2, 'SPO₂ >92% on room air'],
            ];
            html += poSecBox('Section 1: PACU Assessment — Aldrete Score',
                '<table style="width:100%;border-collapse:collapse;font-size:9px;margin-bottom:8px">'
                + '<thead><tr style="background:' + color + '1a">'
                + ['Parameter','Score','Criteria'].map(function(h){ return '<th style="padding:4px 7px;text-align:left;font-weight:700;color:#334155">' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>'
                + aldreteRows.map(function(r, i) {
                    return '<tr style="background:' + (i%2===1?'#f8fafc':'#fff') + ';border-top:1px solid #f1f5f9">'
                         + '<td style="padding:4px 7px;font-weight:600;color:#334155">' + r[0] + '</td>'
                         + '<td style="padding:4px 7px;text-align:center"><span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:#16a34a;color:#fff;font-size:9px;font-weight:700;line-height:20px;text-align:center">' + r[1] + '</span></td>'
                         + '<td style="padding:4px 7px;color:#64748b">' + r[2] + '</td>'
                         + '</tr>';
                }).join('')
                + '</tbody></table>'
                + '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25)">'
                + '<div style="text-align:center"><div style="font-size:8px;color:#94a3b8">Aldrete Score</div><div style="font-size:22px;font-weight:800;color:#16a34a;line-height:1">10<span style="font-size:11px;font-weight:400">/10</span></div></div>'
                + '<div><div style="font-size:10px;font-weight:700;color:#16a34a">✓ Ready for PACU Discharge</div><div style="font-size:8.5px;color:#64748b">Score ≥9 required for discharge from recovery room</div></div>'
                + '</div>'
            );

            // Recovery Vitals
            html += poSecBox('Recovery Vitals (Every 15 Minutes)',
                '<table style="width:100%;border-collapse:collapse;font-size:8.5px">'
                + '<thead><tr style="background:' + color + '1a">'
                + ['Time','BP','HR','RR','Temp','SPO₂','Pain'].map(function(h){ return '<th style="padding:4px 6px;text-align:left;font-weight:700;color:#334155">' + h + '</th>'; }).join('')
                + '</tr></thead><tbody>'
                + [['10:25','118/76','80','16','36.8','99','2/10'],['10:40','120/78','78','15','36.9','99','2/10'],['10:55','122/80','76','14','37.0','98','3/10']].map(function(r, i) {
                    return '<tr style="background:' + (i%2===1?'#f8fafc':'#fff') + ';border-top:1px solid #f1f5f9">'
                         + r.map(function(c, ci){ return '<td style="padding:4px 6px;color:' + (ci===6?'#16a34a':'#334155') + ';font-weight:' + (ci===6?'700':'400') + '">' + c + '</td>'; }).join('') + '</tr>';
                }).join('')
                + '</tbody></table>'
            );

            // Pain & Nausea
            html += poSecBox('Pain Assessment &amp; Nausea',
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
                + '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;text-align:center">'
                + '<div style="font-size:8px;color:#94a3b8">Pain Score</div>'
                + '<div style="font-size:22px;font-weight:800;color:#16a34a;line-height:1">3<span style="font-size:11px;font-weight:400">/10</span></div>'
                + '<div style="font-size:8px;color:#16a34a;font-weight:600">Mild</div>'
                + '</div>'
                + '<div style="flex:1">'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Pain Location</div>'
                + '<div style="font-size:9.5px;color:#334155;margin-bottom:6px">Surgical site — lower right abdomen</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:3px">Analgesics Given</div>'
                + '<div style="font-size:9px;color:#334155">Paracetamol 1g IV &bull; Ketorolac 30mg IV</div>'
                + '</div>'
                + '</div>'
                + poChkItem('Nausea / Vomiting present', false)
            );

            html += '</div>'; // end left col

            // ── Right column ─────────────────────────────────────────────────
            html += '<div>';

            // Section 2: POD Progress Notes
            html += poSecBox('Section 2: Post-Op Day Progress Notes',
                [['POD-0','29 Mar 2026','Stable','Adequate',['Clean and dry'],'Patient alert, IV fluids running. Drain output 30ml. Mobilised to sit.'],
                 ['POD-1','30 Mar 2026','Improving','Adequate',['Clean and dry','Serous discharge'],'Diet advanced to clear liquids. Walking with assistance. Plan: remove drain tomorrow if output <30ml.']].map(function(n, i) {
                    var statusBg = n[2]==='Improving' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)';
                    var statusCol = n[2]==='Improving' ? '#16a34a' : '#3b82f6';
                    return '<div style="border:1px solid #e2e8f0;border-radius:6px;padding:8px;margin-bottom:6px;background:#fff">'
                         + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">'
                         + '<span style="font-size:10px;font-weight:700;background:' + color + '1a;color:' + color + ';padding:2px 7px;border-radius:10px">' + n[0] + '</span>'
                         + '<span style="font-size:9px;color:#64748b">' + n[1] + '</span>'
                         + '</div>'
                         + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:5px">'
                         + '<div><div style="font-size:7.5px;color:#94a3b8">Status</div>' + poBadge(n[2], statusBg, statusCol) + '</div>'
                         + '<div><div style="font-size:7.5px;color:#94a3b8">Pain</div>' + poBadge(n[3], 'rgba(16,185,129,0.1)', '#16a34a') + '</div>'
                         + '<div><div style="font-size:7.5px;color:#94a3b8">Wound</div>' + n[4].map(function(w){ return poBadge(w,'#f0fdf4','#16a34a'); }).join('') + '</div>'
                         + '</div>'
                         + '<div style="font-size:9px;color:#334155;background:#f8fafc;border-radius:4px;padding:4px 6px">' + n[5] + '</div>'
                         + '</div>';
                }).join('')
            );

            // Section 3: Complications
            html += poSecBox('Section 3: Post-Op Complications',
                poChkItem('None', true) +
                poChkItem('Bleeding', false) +
                poChkItem('Infection', false) +
                poChkItem('Wound dehiscence', false) +
                poChkItem('DVT / PE', false) +
                poChkItem('Pneumonia', false) +
                poChkItem('Urinary retention', false) +
                poChkItem('Ileus', false)
            );

            // Section 4: Discharge Planning
            var criteriaList = [
                ['Pain controlled on oral medications', true],
                ['Tolerating diet', true],
                ['Ambulating adequately', true],
                ['Wound healing well', true],
                ['Drains removed (if applicable)', false],
                ['Afebrile >24 hours', true],
                ['Patient / family education done', false],
            ];
            var critMet = criteriaList.filter(function(c){ return c[1]; }).length;
            html += poSecBox('Section 4: Discharge Planning',
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 7px"><div style="font-size:7.5px;color:#94a3b8">Exp. Discharge</div><div style="font-size:9.5px;font-weight:600;color:#0f172a">31 Mar 2026</div></div>'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 7px"><div style="font-size:7.5px;color:#94a3b8">Follow-up Date</div><div style="font-size:9.5px;font-weight:600;color:#0f172a">07 Apr 2026</div></div>'
                + '<div style="background:#f8fafc;border-radius:4px;padding:5px 7px"><div style="font-size:7.5px;color:#94a3b8">Stitch Removal</div><div style="font-size:9.5px;font-weight:600;color:#0f172a">05 Apr 2026</div></div>'
                + '</div>'
                + '<div style="font-size:8.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;margin-bottom:4px">Discharge Criteria (' + critMet + '/' + criteriaList.length + ' met)</div>'
                + '<div style="background:#e2e8f0;border-radius:4px;height:5px;margin-bottom:6px"><div style="background:' + (critMet >= 6 ? '#16a34a' : '#f97316') + ';height:5px;border-radius:4px;width:' + Math.round(critMet/criteriaList.length*100) + '%"></div></div>'
                + criteriaList.map(function(c){ return poChkItem(c[0], c[1]); }).join('')
            );

            html += '</div>'; // end right col
            html += '</div>'; // end 2-col

            // ── Signature ────────────────────────────────────────────────────
            html += '<div style="display:flex;justify-content:flex-end;margin-top:8px">'
                 + '<div style="width:220px;text-align:center">'
                 + '<div style="font-size:10px;font-weight:600;color:#1e293b;margin-bottom:6px">Saved By</div>'
                 + '<div style="border-bottom:1px solid #cbd5e1;margin-bottom:6px"></div>'
                 + '<div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Surgeon / Recovery Nurse</div>'
                 + '</div></div>';

        } else if (type === 'bed_doc') {
            html += infoGrid([{ label: 'Patient Name', w: 85 }, { label: 'MR No.', w: 60 }, { label: 'Admission Date', w: 70 },
                              { label: 'Ward', w: 65 }, { label: 'Bed No.', w: 45 }, { label: 'Allocated By', w: 70 }]);
            html += sectionHead(color, 'Bed Allocation Details');
            html += '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">';
            html += tableHead(color, ['Field', 'Details', 'Value']);
            [['Ward Name', 'General Ward — Male', 'Floor 2'], ['Bed Number', 'Bed 12-A', 'Window Side'],
             ['Bed Type', 'Standard — 1 Cot', 'Available'], ['Allocated On', new Date().toLocaleDateString(), 'Confirmed'],
             ['Diet Order', 'Soft Diet — Low Salt', 'Kitchen Notified']].forEach(function(r, i) {
                var bg = i % 2 === 1 ? '#f8fafc' : '#fff';
                html += '<div style="display:grid;grid-template-columns:2fr 2fr 1fr;gap:8px;background:' + bg + ';padding:9px 14px;border-top:1px solid #f1f5f9">'
                     + ['font-weight:600','','font-weight:600;text-align:right'].map(function(s, ci) { return '<div style="font-size:10px;color:#334155;' + s + '">' + r[ci] + '</div>'; }).join('') + '</div>';
            });
            html += '</div>';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding:10px 14px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">'
                 + '<div style="font-size:10px;color:#166534"><b>Bed Status:</b> Occupied — Patient Assigned</div>' + badge('OCCUPIED', '#166534', '#dcfce7') + '</div>';
            html += sigRow(['Ward In-charge', 'Admitting Officer', 'Hospital Stamp']);
        }

        $('#previewDocContent').html(html);
    }

    $(document).on('click', '.doc-type-preview', function() {
        var type  = $(this).data('doc-type');
        var label = $(this).data('doc-label');

        $('#docPreviewTitle').text('Preview — ' + label);
        $('#previewDocTitle span:first').text(label.toUpperCase());

        // Load format setting (if applicable) alongside letterhead/footer/basic
        var formatReq = DOC_FORMAT_OPTIONS[type]
            ? $.get('/api/hospital-info/settings/doc_format_' + type)
            : $.Deferred().resolve([{ settings: {} }]);

        // Load letterhead, footer & profile to build preview
        $.when(
            $.get('/api/hospital-info/settings/letterhead'),
            $.get('/api/hospital-info/settings/footer'),
            $.get('/api/hospital-info/settings/basic'),
            formatReq
        ).done(function(lhRes, ftRes, prRes, fmtRes) {
            var lh  = lhRes[0].settings || {};
            var ft  = ftRes[0].settings || {};
            var pr  = prRes[0].settings || {};
            var fmt = (fmtRes && fmtRes[0] && fmtRes[0].settings && fmtRes[0].settings['doc_format_' + type]) || 'a4';

            // ── Thermal format: hide A4 wrapper, show compact receipt only ──
            if (fmt === 'thermal') {
                $('#previewLetterhead, #previewDocTitle, #previewFooter').hide();
                $('#previewPatientMeta').hide();
                $('#previewDocContent').css('padding', '24px');
                renderDocContent(type, '', fmt, pr);
                if (docPreviewModal) docPreviewModal.show();
                return;
            }

            // ── A4 format: restore wrapper elements (in case user switched from thermal) ──
            $('#previewLetterhead, #previewDocTitle, #previewFooter').show();
            $('#previewDocContent').css('padding', '28px 40px 32px');

            // Letterhead styling — apply primary color to all accent elements
            var color = lh.lh_primary_color || '#003366';
            var font  = lh.lh_header_font   || 'Roobert';
            $('#previewAccentBar').css('background', color);
            $('#previewAccentFooterBar').css('background', 'linear-gradient(to right,' + color + ',rgba(0,0,0,0.05))');
            $('#previewDivider').css('background', 'linear-gradient(to right,' + color + ',rgba(0,0,0,0.05))');
            $('#previewDocTitle').css({ background: color, 'font-family': font + ',sans-serif' });
            renderDocContent(type, color, fmt, pr);

            // Hospital name (respects lh_show_name)
            if (lh.lh_show_name !== '0') {
                $('#previewHospitalName').text(pr.basic_name || 'Hospital Name').css({ color: '#1e293b', 'font-family': font + ',sans-serif' }).show();
            } else {
                $('#previewHospitalName').hide();
            }

            // Tagline
            if (lh.lh_show_tagline === '1' && pr.basic_tagline) {
                $('#previewHospitalTagline').text(pr.basic_tagline).show();
            } else {
                $('#previewHospitalTagline').hide();
            }

            // Address
            if (lh.lh_show_address === '1') {
                var addrParts = [pr.address_street, pr.address_city, pr.address_state, pr.address_country].filter(Boolean);
                if (!$('#previewHospitalAddress').length) {
                    $('#previewHospitalContact').before('<div id="previewHospitalAddress" style="font-size:11px;color:#64748b;margin-top:3px"></div>');
                }
                $('#previewHospitalAddress').text(addrParts.join(', ')).toggle(addrParts.length > 0);
            } else {
                $('#previewHospitalAddress').hide();
            }

            // Contact row (phone / email / website)
            var contactParts = [];
            if (lh.lh_show_phone   === '1' && pr.contact_phone)   contactParts.push('📞 ' + pr.contact_phone);
            if (lh.lh_show_email   === '1' && pr.contact_email)   contactParts.push('✉ '  + pr.contact_email);
            if (lh.lh_show_website === '1' && pr.contact_website) contactParts.push('🌐 ' + pr.contact_website);
            $('#previewHospitalContact').html(contactParts.map(function(p){ return '<span>' + p + '</span>'; }).join(''));

            // Logo
            var logoSizes = { small: '44px', medium: '64px', large: '88px' };
            var sz = logoSizes[lh.lh_logo_size] || '64px';
            var $logoBox = $('#previewLogoBox').css({ width: sz, height: sz });

            if (lh.lh_show_logo === '0') {
                $logoBox.hide();
            } else {
                var logoPath = pr.logo || pr.basic_logo || '';
                $logoBox.show();
                if (logoPath) {
                    $logoBox.html('<img src="' + logoPath + '" style="max-width:100%;max-height:100%;object-fit:contain">');
                } else {
                    $logoBox.html('<span style="font-size:9px;color:#94a3b8">Logo</span>');
                }
            }

            // Logo position
            var pos = lh.lh_logo_position || 'left';
            if (pos === 'center') {
                $('#previewLogoRow').css({ 'flex-direction': 'column', 'align-items': 'center', 'text-align': 'center' });
                $('#previewHospitalContact').css('justify-content', 'center');
            } else if (pos === 'right') {
                $('#previewLogoRow').css({ 'flex-direction': 'row-reverse', 'align-items': 'flex-start', 'text-align': 'left' });
                $('#previewHospitalContact').css('justify-content', 'flex-start');
            } else {
                $('#previewLogoRow').css({ 'flex-direction': 'row', 'align-items': 'flex-start', 'text-align': 'left' });
                $('#previewHospitalContact').css('justify-content', 'flex-start');
            }

            // Footer lines
            var footerLines = [ft.footer_line1, ft.footer_line2, ft.footer_line3].filter(Boolean);
            $('#previewFooterLines').html(footerLines.map(function(l){ return '<div>' + l + '</div>'; }).join(''));

            var metaParts = [];
            if (ft.footer_show_page_number === '1') metaParts.push('Page 1 of 1');
            if (ft.footer_show_date        === '1') metaParts.push('Printed: ' + new Date().toLocaleDateString());
            if (ft.footer_show_disclaimer  === '1') metaParts.push('Confidential — For medical use only');
            $('#previewFooterMeta').html(metaParts.map(function(p){ return '<div>' + p + '</div>'; }).join(''));
            if (docPreviewModal) docPreviewModal.show();
        });

        $('#previewSectionAccent, #previewTableHead, #previewTotalRow').css('background', '');
        // Hide built-in patient meta bar for types that supply their own full patient grid
        var typesWithOwnPatientGrid = ['opd_registration', 'ipd_registration', 'er_registration', 'scheduling_reg', 'doctor_prescription', 'pre_ops', 'intra_ops', 'post_ops'];
        if (typesWithOwnPatientGrid.indexOf(type) !== -1) {
            $('#previewPatientMeta').hide();
        } else {
            $('#previewPatientMeta').show();
        }
    });

    $(document).on('click', '#btnSaveHours', function() {
        saveSettings('hours');
    });

    $(document).on('click', '#btnSaveSystem', function() {
        saveSettings('system');
    });

    function showLogoPreview(path) {
        if (path) {
            $('#logoPreview').attr('src', path).show();
            $('#logoPlaceholder').hide();
            $('#btnRemoveLogo').show();
        } else {
            $('#logoPreview').hide();
            $('#logoPlaceholder').show();
            $('#btnRemoveLogo').hide();
        }
    }

    $(document).on('change', '#logoFile', function() {
        var file = this.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast('Image must be less than 2MB', 'error');
            return;
        }

        var formData = new FormData();
        formData.append('logo', file);

        $.ajax({
            url: '/api/hospital-info/logo',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                showToast('Logo uploaded successfully', 'success');
                showLogoPreview(response.path || response.logo_path);
            },
            error: function(xhr) {
                showToast(xhr.responseJSON?.message || 'Failed to upload logo', 'error');
            }
        });
    });

    $(document).on('click', '#btnUploadLogo', function() {
        $('#logoFile').click();
    });

    $(document).on('click', '#btnRemoveLogo', function() {
        $.ajax({
            url: '/api/hospital-info/logo',
            method: 'DELETE',
            success: function() {
                showToast('Logo removed', 'success');
                showLogoPreview(null);
                $('#logoFile').val('');
            },
            error: function(xhr) {
                showToast(xhr.responseJSON?.message || 'Failed to remove logo', 'error');
            }
        });
    });

    function loadDepartments() {
        $.get('/api/hospital-info/departments', function(response) {
            departments = response.departments || response.data || [];
            if (!Array.isArray(departments)) departments = [];
            renderDepartments();
        }).fail(function() {
            $('#deptTableBody').html('<tr><td colspan="8"><div class="hi-empty"><i data-lucide="alert-circle"></i><p>Failed to load departments</p></div></td></tr>');
            lucide.createIcons();
        });
    }

    function renderDepartments() {
        var search = ($('#deptSearch').val() || '').toLowerCase();
        var filtered = departments.filter(function(d) {
            return !search || d.name.toLowerCase().indexOf(search) !== -1 ||
                (d.code && d.code.toLowerCase().indexOf(search) !== -1) ||
                (d.hod_name && d.hod_name.toLowerCase().indexOf(search) !== -1);
        });

        var $tbody = $('#deptTableBody');
        if (filtered.length === 0) {
            $tbody.html('<tr><td colspan="8"><div class="hi-empty"><i data-lucide="building-2"></i><p>No departments found</p></div></td></tr>');
            lucide.createIcons();
            return;
        }

        var html = '';
        filtered.forEach(function(d) {
            html += '<tr>';
            html += '<td><strong>' + esc(d.name) + '</strong>';
            if (d.name_urdu) html += '<br><small style="color:#6C757D">' + esc(d.name_urdu) + '</small>';
            html += '</td>';
            html += '<td>' + esc(d.code || '—') + '</td>';
            html += '<td>' + esc(d.hod_name || '—') + '</td>';
            html += '<td>' + esc(d.location || '—') + '</td>';
            html += '<td>' + esc(d.extension || '—') + '</td>';
            var opdHours = '';
            if (d.is_emergency_24x7) opdHours = '<span class="hi-badge hi-badge-active">24/7</span>';
            else if (d.opd_start && d.opd_end) opdHours = esc(d.opd_start) + ' - ' + esc(d.opd_end);
            else opdHours = '—';
            html += '<td>' + opdHours + '</td>';
            html += '<td>' + (d.is_active ? '<span class="hi-badge hi-badge-active">Active</span>' : '<span class="hi-badge hi-badge-inactive">Inactive</span>') + '</td>';
            html += '<td>';
            html += '<div style="display:flex;gap:4px">';
            html += '<button class="hi-icon-btn btn-edit-dept" data-id="' + d.id + '" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
            html += '<button class="hi-icon-btn hi-icon-btn-danger btn-delete-dept" data-id="' + d.id + '" data-name="' + esc(d.name) + '" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
            html += '</div>';
            html += '</td>';
            html += '</tr>';
        });

        $tbody.html(html);
        lucide.createIcons();
    }

    $(document).on('input', '#deptSearch', function() { renderDepartments(); });

    $(document).on('click', '#btnAddDepartment', function() {
        clearDeptForm();
        $('#deptSheetTitle').text('Add Department');
        $('#btnSaveDeptLabel').text('Add Department');
        if (deptSheet) deptSheet.show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-dept', function() {
        var id = $(this).data('id');
        var dept = departments.find(function(d) { return d.id === id; });
        if (!dept) return;

        clearDeptForm();
        editingDeptId = id;
        $('#deptSheetTitle').text('Edit Department');
        $('#btnSaveDeptLabel').text('Save Changes');
        $('#deptName').val(dept.name);
        $('#deptNameUrdu').val(dept.name_urdu || '');
        $('#deptCode').val(dept.code || '');
        $('#deptHod').val(dept.hod_name || '');
        $('#deptLocation').val(dept.location || '');
        $('#deptExtension').val(dept.extension || '');
        $('#deptDirectLine').val(dept.direct_line || '');
        $('#deptEmail').val(dept.email || '');
        $('#deptServices').val(dept.services || '');
        $('#deptOpdStart').val(dept.opd_start || '');
        $('#deptOpdEnd').val(dept.opd_end || '');
        $('#deptEmergency24').prop('checked', dept.is_emergency_24x7);
        $('#deptActive').prop('checked', dept.is_active !== false);
        if (deptSheet) deptSheet.show();
        lucide.createIcons();
    });

    function clearDeptForm() {
        editingDeptId = null;
        if (document.getElementById('deptForm')) document.getElementById('deptForm').reset();
        $('#deptActive').prop('checked', true);
    }

    $(document).on('click', '#btnSaveDept', function() {
        var $btn = $(this);
        $btn.prop('disabled', true);

        var data = {
            name: $('#deptName').val(),
            name_urdu: $('#deptNameUrdu').val(),
            code: $('#deptCode').val(),
            hod_name: $('#deptHod').val(),
            location: $('#deptLocation').val(),
            extension: $('#deptExtension').val(),
            direct_line: $('#deptDirectLine').val(),
            email: $('#deptEmail').val(),
            services: $('#deptServices').val(),
            opd_start: $('#deptOpdStart').val(),
            opd_end: $('#deptOpdEnd').val(),
            is_emergency_24x7: $('#deptEmergency24').is(':checked') ? 1 : 0,
            is_active: $('#deptActive').is(':checked') ? 1 : 0
        };

        var url, method;
        if (editingDeptId) {
            url = '/api/hospital-info/departments/' + editingDeptId;
            method = 'PUT';
        } else {
            url = '/api/hospital-info/departments';
            method = 'POST';
        }

        $.ajax({
            url: url,
            method: method,
            data: data,
            success: function() {
                if (deptSheet) deptSheet.hide();
                showToast(editingDeptId ? 'Department updated' : 'Department added', 'success');
                loadDepartments();
                $btn.prop('disabled', false);
            },
            error: function(xhr) {
                $btn.prop('disabled', false);
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    showFormErrors(xhr.responseJSON.errors, 'dept');
                } else {
                    showToast(xhr.responseJSON?.message || 'Failed to save department', 'error');
                }
            }
        });
    });

    $(document).on('click', '.btn-delete-dept', function() {
        deletingType = 'department';
        deletingId = $(this).data('id');
        $('#hiDeleteTitle').text('Delete Department');
        $('#hiDeleteMsg').text('Are you sure you want to delete "' + $(this).data('name') + '"? This action cannot be undone.');
        if (deleteModal) deleteModal.show();
        lucide.createIcons();
    });

    function loadSignatories() {
        $.get('/api/hospital-info/signatories', function(response) {
            signatories = response.signatories || response.data || [];
            if (!Array.isArray(signatories)) signatories = [];
            renderSignatories();
        }).fail(function() {
            $('#signatoriesList').html('<div class="hi-empty"><i data-lucide="alert-circle"></i><p>Failed to load signatories</p></div>');
            lucide.createIcons();
        });
    }

    function renderSignatories() {
        var $container = $('#signatoriesList');
        if (signatories.length === 0) {
            $container.html('<div class="hi-empty"><i data-lucide="user-check"></i><p>No signatories added yet</p></div>');
            lucide.createIcons();
            return;
        }

        var html = '';
        signatories.forEach(function(s) {
            html += '<div class="hi-card hi-signatory-card" data-id="' + s.id + '">';
            html += '<div class="hi-card-header">';
            html += '<div style="display:flex;align-items:center;gap:12px">';
            if (s.photo_path) {
                html += '<img src="' + esc(s.photo_path) + '" class="hi-signatory-photo" alt="">';
            } else {
                html += '<div class="hi-signatory-photo-placeholder"><i data-lucide="user" style="width:24px;height:24px"></i></div>';
            }
            html += '<div>';
            html += '<div class="hi-card-title">' + esc(s.title) + ' ' + esc(s.name) + '</div>';
            html += '<div class="hi-card-subtitle">' + esc(s.designation) + '</div>';
            if (s.qualifications) html += '<div class="hi-card-meta">' + esc(s.qualifications) + '</div>';
            html += '</div>';
            html += '</div>';
            html += '<div style="display:flex;gap:4px;align-items:center">';
            html += (s.is_active ? '<span class="hi-badge hi-badge-active">Active</span>' : '<span class="hi-badge hi-badge-inactive">Inactive</span>');
            html += '<button class="hi-icon-btn btn-edit-signatory" data-id="' + s.id + '" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
            html += '<button class="hi-icon-btn hi-icon-btn-danger btn-delete-signatory" data-id="' + s.id + '" data-name="' + esc(s.name) + '" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
            html += '</div>';
            html += '</div>';
            html += '<div class="hi-card-body">';
            if (s.registration_number) html += '<div class="hi-detail-row"><span>Reg #:</span> ' + esc(s.registration_number) + '</div>';
            if (s.use_on && s.use_on.length > 0) {
                html += '<div class="hi-detail-row"><span>Used on:</span> ';
                s.use_on.forEach(function(u) { html += '<span class="hi-tag">' + esc(u) + '</span> '; });
                html += '</div>';
            }
            html += '<div style="display:flex;gap:12px;margin-top:8px">';
            if (s.signature_path) html += '<div class="hi-sig-preview"><label>Signature</label><img src="' + esc(s.signature_path) + '" alt="Signature"></div>';
            if (s.stamp_path) html += '<div class="hi-sig-preview"><label>Stamp</label><img src="' + esc(s.stamp_path) + '" alt="Stamp"></div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        });

        $container.html(html);
        lucide.createIcons();
    }

    $(document).on('click', '#btnAddSignatory', function() {
        clearSignatoryForm();
        $('#signatorySheetTitle').text('Add Signatory');
        $('#btnSaveSignatoryLabel').text('Add Signatory');
        if (signatorySheet) signatorySheet.show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-signatory', function() {
        var id = $(this).data('id');
        var sig = signatories.find(function(s) { return s.id === id; });
        if (!sig) return;

        clearSignatoryForm();
        editingSignatoryId = id;
        $('#signatorySheetTitle').text('Edit Signatory');
        $('#btnSaveSignatoryLabel').text('Save Changes');
        $('#sigTitle').val(sig.title || '');
        $('#sigName').val(sig.name || '');
        $('#sigQualifications').val(sig.qualifications || '');
        $('#sigDesignation').val(sig.designation || '');
        $('#sigRegNumber').val(sig.registration_number || '');
        $('#sigActive').prop('checked', sig.is_active !== false);

        if (sig.use_on && Array.isArray(sig.use_on)) {
            sig.use_on.forEach(function(u) {
                $('input[name="sig_use_on[]"][value="' + u + '"]').prop('checked', true);
            });
        }

        if (sig.photo_path) { $('#sigPhotoPreview').attr('src', sig.photo_path).show(); $('#sigPhotoPlaceholder').hide(); }
        if (sig.signature_path) { $('#sigSignaturePreview').attr('src', sig.signature_path).show(); $('#sigSignaturePlaceholder').hide(); }
        if (sig.stamp_path) { $('#sigStampPreview').attr('src', sig.stamp_path).show(); $('#sigStampPlaceholder').hide(); }

        if (signatorySheet) signatorySheet.show();
        lucide.createIcons();
    });

    function clearSignatoryForm() {
        editingSignatoryId = null;
        if (document.getElementById('signatoryForm')) document.getElementById('signatoryForm').reset();
        $('#sigActive').prop('checked', true);
    }

    $(document).on('change', '#sigPhoto', function() { previewFile(this, '#sigPhotoPreview'); });
    $(document).on('change', '#sigSignature', function() { previewFile(this, '#sigSignaturePreview'); });
    $(document).on('change', '#sigStamp', function() { previewFile(this, '#sigStampPreview'); });

    function previewFile(input, previewSel, placeholderSel) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $(previewSel).attr('src', e.target.result).show();
                $(placeholderSel).hide();
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    $(document).on('click', '#btnSaveSignatory', function() {
        var $btn = $(this);
        $btn.prop('disabled', true);

        var formData = new FormData();
        formData.append('title', $('#sigTitle').val());
        formData.append('name', $('#sigName').val());
        formData.append('qualifications', $('#sigQualifications').val());
        formData.append('designation', $('#sigDesignation').val());
        formData.append('registration_number', $('#sigRegNumber').val());
        formData.append('is_active', $('#sigActive').is(':checked') ? '1' : '0');

        var useOn = [];
        $('input[name="sig_use_on[]"]:checked').each(function() { useOn.push($(this).val()); });
        formData.append('use_on', JSON.stringify(useOn));

        var photoFile = document.getElementById('sigPhoto');
        if (photoFile && photoFile.files[0]) formData.append('photo', photoFile.files[0]);
        var sigFile = document.getElementById('sigSignature');
        if (sigFile && sigFile.files[0]) formData.append('signature', sigFile.files[0]);
        var stampFile = document.getElementById('sigStamp');
        if (stampFile && stampFile.files[0]) formData.append('stamp', stampFile.files[0]);

        var url, method;
        if (editingSignatoryId) {
            url = '/api/hospital-info/signatories/' + editingSignatoryId;
            formData.append('_method', 'PUT');
            method = 'POST';
        } else {
            url = '/api/hospital-info/signatories';
            method = 'POST';
        }

        $.ajax({
            url: url,
            method: method,
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                if (signatorySheet) signatorySheet.hide();
                showToast(editingSignatoryId ? 'Signatory updated' : 'Signatory added', 'success');
                loadSignatories();
                $btn.prop('disabled', false);
            },
            error: function(xhr) {
                $btn.prop('disabled', false);
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    showFormErrors(xhr.responseJSON.errors, 'sig');
                } else {
                    showToast(xhr.responseJSON?.message || 'Failed to save signatory', 'error');
                }
            }
        });
    });

    $(document).on('click', '.btn-delete-signatory', function() {
        deletingType = 'signatory';
        deletingId = $(this).data('id');
        $('#hiDeleteTitle').text('Delete Signatory');
        $('#hiDeleteMsg').text('Are you sure you want to delete "' + $(this).data('name') + '"? This action cannot be undone.');
        if (deleteModal) deleteModal.show();
        lucide.createIcons();
    });

    function loadBankAccounts() {
        $.get('/api/hospital-info/bank-accounts', function(response) {
            bankAccounts = response.bank_accounts || response.data || [];
            if (!Array.isArray(bankAccounts)) bankAccounts = [];
            renderBankAccounts();
        }).fail(function() {
            $('#bankAccountsList').html('<div class="hi-empty"><i data-lucide="alert-circle"></i><p>Failed to load bank accounts</p></div>');
            lucide.createIcons();
        });
    }

    function renderBankAccounts() {
        var $container = $('#bankAccountsList');
        if (bankAccounts.length === 0) {
            $container.html('<div class="hi-empty"><i data-lucide="landmark"></i><p>No bank accounts added yet</p></div>');
            lucide.createIcons();
            return;
        }

        var html = '';
        bankAccounts.forEach(function(b) {
            html += '<div class="hi-card hi-bank-card" data-id="' + b.id + '">';
            html += '<div class="hi-card-header">';
            html += '<div>';
            html += '<div class="hi-card-title">' + esc(b.label) + '</div>';
            html += '<div class="hi-card-subtitle">' + esc(b.bank_name) + (b.branch ? ' — ' + esc(b.branch) : '') + '</div>';
            html += '</div>';
            html += '<div style="display:flex;gap:4px;align-items:center">';
            html += (b.is_active ? '<span class="hi-badge hi-badge-active">Active</span>' : '<span class="hi-badge hi-badge-inactive">Inactive</span>');
            html += '<button class="hi-icon-btn btn-edit-bank" data-id="' + b.id + '" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
            html += '<button class="hi-icon-btn hi-icon-btn-danger btn-delete-bank" data-id="' + b.id + '" data-name="' + esc(b.label) + '" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
            html += '</div>';
            html += '</div>';
            html += '<div class="hi-card-body">';
            html += '<div class="hi-detail-grid">';
            html += '<div class="hi-detail-row"><span>Account Title:</span> ' + esc(b.account_title) + '</div>';
            html += '<div class="hi-detail-row"><span>Account #:</span> ' + esc(b.account_number) + '</div>';
            if (b.iban) html += '<div class="hi-detail-row"><span>IBAN:</span> ' + esc(b.iban) + '</div>';
            html += '<div class="hi-detail-row"><span>Type:</span> ' + esc(b.account_type || 'Current') + '</div>';
            if (b.branch_code) html += '<div class="hi-detail-row"><span>Branch Code:</span> ' + esc(b.branch_code) + '</div>';
            if (b.swift_code) html += '<div class="hi-detail-row"><span>SWIFT:</span> ' + esc(b.swift_code) + '</div>';
            html += '</div>';
            if (b.use_for && b.use_for.length > 0) {
                html += '<div class="hi-detail-row" style="margin-top:8px"><span>Used for:</span> ';
                b.use_for.forEach(function(u) { html += '<span class="hi-tag">' + esc(u) + '</span> '; });
                html += '</div>';
            }
            html += '</div>';
            html += '</div>';
        });

        $container.html(html);
        lucide.createIcons();
    }

    $(document).on('click', '#btnAddBank', function() {
        clearBankForm();
        $('#bankModalTitle').text('Add Bank Account');
        $('#btnSaveBankLabel').text('Add Account');
        if (bankModal) bankModal.show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-bank', function() {
        var id = $(this).data('id');
        var bank = bankAccounts.find(function(b) { return b.id === id; });
        if (!bank) return;

        clearBankForm();
        editingBankId = id;
        $('#bankModalTitle').text('Edit Bank Account');
        $('#btnSaveBankLabel').text('Save Changes');
        $('#bankLabel').val(bank.label || '');
        $('#bankName').val(bank.bank_name || '');
        $('#bankBranch').val(bank.branch || '');
        $('#bankBranchCode').val(bank.branch_code || '');
        $('#bankAccTitle').val(bank.account_title || '');
        $('#bankAccNumber').val(bank.account_number || '');
        $('#bankIban').val(bank.iban || '');
        $('#bankAccType').val(bank.account_type || 'current');
        $('#bankSwift').val(bank.swift_code || '');
        $('#bankActive').prop('checked', bank.is_active !== false);

        if (bank.use_for && Array.isArray(bank.use_for)) {
            bank.use_for.forEach(function(u) {
                $('input[name="bank_use_for[]"][value="' + u + '"]').prop('checked', true);
            });
        }

        if (bankModal) bankModal.show();
        lucide.createIcons();
    });

    function clearBankForm() {
        editingBankId = null;
        if (document.getElementById('bankForm')) document.getElementById('bankForm').reset();
        $('#bankActive').prop('checked', true);
    }

    $(document).on('click', '#btnSaveBank', function() {
        var $btn = $(this);
        $btn.prop('disabled', true);

        var useFor = [];
        $('input[name="bank_use_for[]"]:checked').each(function() { useFor.push($(this).val()); });

        var data = {
            label: $('#bankLabel').val(),
            bank_name: $('#bankName').val(),
            branch: $('#bankBranch').val(),
            branch_code: $('#bankBranchCode').val(),
            account_title: $('#bankAccTitle').val(),
            account_number: $('#bankAccNumber').val(),
            iban: $('#bankIban').val(),
            account_type: $('#bankAccType').val(),
            swift_code: $('#bankSwift').val(),
            use_for: useFor,
            is_active: $('#bankActive').is(':checked') ? 1 : 0
        };

        var url, method;
        if (editingBankId) {
            url = '/api/hospital-info/bank-accounts/' + editingBankId;
            method = 'PUT';
        } else {
            url = '/api/hospital-info/bank-accounts';
            method = 'POST';
        }

        $.ajax({
            url: url,
            method: method,
            data: data,
            success: function() {
                if (bankModal) bankModal.hide();
                showToast(editingBankId ? 'Bank account updated' : 'Bank account added', 'success');
                loadBankAccounts();
                $btn.prop('disabled', false);
            },
            error: function(xhr) {
                $btn.prop('disabled', false);
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    showFormErrors(xhr.responseJSON.errors, 'bank');
                } else {
                    showToast(xhr.responseJSON?.message || 'Failed to save bank account', 'error');
                }
            }
        });
    });

    $(document).on('click', '.btn-delete-bank', function() {
        deletingType = 'bank-account';
        deletingId = $(this).data('id');
        $('#hiDeleteTitle').text('Delete Bank Account');
        $('#hiDeleteMsg').text('Are you sure you want to delete "' + $(this).data('name') + '"? This action cannot be undone.');
        if (deleteModal) deleteModal.show();
        lucide.createIcons();
    });

    function loadInsurancePanels() {
        $.get('/api/hospital-info/insurance-panels', function(response) {
            insurancePanels = response.insurance_panels || response.data || [];
            if (!Array.isArray(insurancePanels)) insurancePanels = [];
            renderInsurancePanels();
        }).fail(function() {
            $('#insurancePanelsList').html('<div class="hi-empty"><i data-lucide="alert-circle"></i><p>Failed to load insurance panels</p></div>');
            lucide.createIcons();
        });
    }

    function renderInsurancePanels() {
        var $container = $('#insurancePanelsList');
        if (insurancePanels.length === 0) {
            $container.html('<div class="hi-empty"><i data-lucide="shield-check"></i><p>No insurance panels added yet</p></div>');
            lucide.createIcons();
            return;
        }

        var html = '';
        insurancePanels.forEach(function(p) {
            var statusClass = p.status === 'active' ? 'hi-badge-active' : (p.status === 'suspended' ? 'hi-badge-warning' : 'hi-badge-inactive');
            html += '<div class="hi-card hi-panel-card" data-id="' + p.id + '">';
            html += '<div class="hi-card-header">';
            html += '<div>';
            html += '<div class="hi-card-title">' + esc(p.name) + '</div>';
            if (p.panel_code) html += '<div class="hi-card-subtitle">Code: ' + esc(p.panel_code) + '</div>';
            if (p.company_type) html += '<div class="hi-card-meta">' + esc(p.company_type) + '</div>';
            html += '</div>';
            html += '<div style="display:flex;gap:4px;align-items:center">';
            html += '<span class="hi-badge ' + statusClass + '">' + esc(p.status || 'active') + '</span>';
            html += '<button class="hi-icon-btn btn-edit-panel" data-id="' + p.id + '" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
            html += '<button class="hi-icon-btn hi-icon-btn-danger btn-delete-panel" data-id="' + p.id + '" data-name="' + esc(p.name) + '" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
            html += '</div>';
            html += '</div>';
            html += '<div class="hi-card-body">';
            html += '<div class="hi-detail-grid">';
            if (p.contact_person) html += '<div class="hi-detail-row"><span>Contact:</span> ' + esc(p.contact_person) + '</div>';
            if (p.phone) html += '<div class="hi-detail-row"><span>Phone:</span> ' + esc(p.phone) + '</div>';
            if (p.email) html += '<div class="hi-detail-row"><span>Email:</span> ' + esc(p.email) + '</div>';
            if (p.credit_limit) html += '<div class="hi-detail-row"><span>Credit Limit:</span> PKR ' + Number(p.credit_limit).toLocaleString() + '</div>';
            if (p.payment_terms) html += '<div class="hi-detail-row"><span>Payment Terms:</span> ' + esc(p.payment_terms) + '</div>';
            html += '</div>';
            if (p.agreement_start || p.agreement_end) {
                html += '<div class="hi-detail-row" style="margin-top:8px"><span>Agreement:</span> ' + fmtDate(p.agreement_start) + ' — ' + fmtDate(p.agreement_end);
                if (p.auto_renewable) html += ' <span class="hi-tag">Auto-Renewable</span>';
                html += '</div>';
            }
            if (p.coverage && p.coverage.length > 0) {
                html += '<div class="hi-detail-row" style="margin-top:8px"><span>Coverage:</span> ';
                p.coverage.forEach(function(c) { html += '<span class="hi-tag">' + esc(c) + '</span> '; });
                html += '</div>';
            }
            html += '</div>';
            html += '</div>';
        });

        $container.html(html);
        lucide.createIcons();
    }

    $(document).on('click', '#btnAddInsurance', function() {
        clearPanelForm();
        $('#insuranceModalTitle').text('Add Insurance Panel');
        $('#btnSavePanelLabel').text('Add Panel');
        if (panelModal) panelModal.show();
        lucide.createIcons();
    });

    $(document).on('click', '.btn-edit-panel', function() {
        var id = $(this).data('id');
        var panel = insurancePanels.find(function(p) { return p.id === id; });
        if (!panel) return;

        clearPanelForm();
        editingPanelId = id;
        $('#insuranceModalTitle').text('Edit Insurance Panel');
        $('#btnSavePanelLabel').text('Save Changes');
        $('#insName').val(panel.name || '');
        $('#insCode').val(panel.panel_code || '');
        $('#insCompanyType').val(panel.company_type || '');
        $('#insContact').val(panel.contact_person || '');
        $('#insPhone').val(panel.phone || '');
        $('#insEmail').val(panel.email || '');
        $('#insCreditLimit').val(panel.credit_limit || '');
        $('#insPaymentTerms').val(panel.payment_terms || '');
        $('#insAgreementStart').val(panel.agreement_start || '');
        $('#insAgreementEnd').val(panel.agreement_end || '');
        $('#insAutoRenew').prop('checked', panel.auto_renewable);
        $('#insStatus').val(panel.status || 'active');
        if (panel.coverage && Array.isArray(panel.coverage)) {
            panel.coverage.forEach(function(c) {
                $('input[name="panel_coverage[]"][value="' + c + '"]').prop('checked', true);
            });
        }

        if (panel.discount_rates && typeof panel.discount_rates === 'object') {
            Object.keys(panel.discount_rates).forEach(function(key) {
                $('input[name="discount_' + key + '"]').val(panel.discount_rates[key]);
            });
        }

        if (panelModal) panelModal.show();
        lucide.createIcons();
    });

    function clearPanelForm() {
        editingPanelId = null;
        if (document.getElementById('insuranceForm')) document.getElementById('insuranceForm').reset();
        $('#insStatus').val('active');
        $('.hi-form-error').hide().text('');
        $('.hi-form-input, .hi-form-select, .hi-form-textarea').removeClass('is-invalid');
    }

    $(document).on('click', '#btnSaveInsurance', function() {
        var $btn = $(this);
        $btn.prop('disabled', true);

        var coverage = [];
        $('input[name="panel_coverage[]"]:checked').each(function() { coverage.push($(this).val()); });

        var discountRates = {};
        $('input[name^="discount_"]').each(function() {
            var key = $(this).attr('name').replace('discount_', '');
            var val = $(this).val();
            if (val) discountRates[key] = val;
        });

        var formData = new FormData();
        formData.append('name', $('#insName').val());
        formData.append('panel_code', $('#insCode').val());
        formData.append('company_type', $('#insCompanyType').val());
        formData.append('contact_person', $('#insContact').val());
        formData.append('phone', $('#insPhone').val());
        formData.append('email', $('#insEmail').val());
        formData.append('credit_limit', $('#insCreditLimit').val());
        formData.append('payment_terms', $('#insPaymentTerms').val());
        formData.append('agreement_start', $('#insAgreementStart').val());
        formData.append('agreement_end', $('#insAgreementEnd').val());
        formData.append('auto_renewable', $('#insAutoRenew').is(':checked') ? '1' : '0');
        formData.append('status', $('#insStatus').val());
        formData.append('coverage', JSON.stringify(coverage));
        formData.append('discount_rates', JSON.stringify(discountRates));

        var url;
        if (editingPanelId) {
            url = '/api/hospital-info/insurance-panels/' + editingPanelId;
            formData.append('_method', 'PUT');
        } else {
            url = '/api/hospital-info/insurance-panels';
        }

        $.ajax({
            url: url,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                if (panelModal) panelModal.hide();
                showToast(editingPanelId ? 'Insurance panel updated' : 'Insurance panel added', 'success');
                loadInsurancePanels();
                $btn.prop('disabled', false);
            },
            error: function(xhr) {
                $btn.prop('disabled', false);
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    showFormErrors(xhr.responseJSON.errors, 'panel');
                } else {
                    showToast(xhr.responseJSON?.message || 'Failed to save insurance panel', 'error');
                }
            }
        });
    });

    $(document).on('click', '.btn-delete-panel', function() {
        deletingType = 'insurance-panel';
        deletingId = $(this).data('id');
        $('#hiDeleteTitle').text('Delete Insurance Panel');
        $('#hiDeleteMsg').text('Are you sure you want to delete "' + $(this).data('name') + '"? This action cannot be undone.');
        if (deleteModal) deleteModal.show();
        lucide.createIcons();
    });

    $(document).on('click', '#btnConfirmDelete', function() {
        if (!deletingType || !deletingId) return;
        var $btn = $(this);
        $btn.prop('disabled', true);

        var urlMap = {
            'department': '/api/hospital-info/departments/',
            'signatory': '/api/hospital-info/signatories/',
            'bank-account': '/api/hospital-info/bank-accounts/',
            'insurance-panel': '/api/hospital-info/insurance-panels/'
        };

        var url = urlMap[deletingType] + deletingId;

        $.ajax({
            url: url,
            method: 'DELETE',
            success: function() {
                if (deleteModal) deleteModal.hide();
                showToast(deletingType.replace('-', ' ') + ' deleted successfully', 'success');
                if (deletingType === 'department') loadDepartments();
                if (deletingType === 'signatory') loadSignatories();
                if (deletingType === 'bank-account') loadBankAccounts();
                if (deletingType === 'insurance-panel') loadInsurancePanels();
                $btn.prop('disabled', false);
                deletingType = null;
                deletingId = null;
            },
            error: function(xhr) {
                $btn.prop('disabled', false);
                showToast(xhr.responseJSON?.message || 'Failed to delete', 'error');
            }
        });
    });

    function showFormErrors(errors, prefix) {
        $('.hi-form-input, .hi-form-select, .hi-form-textarea').removeClass('is-invalid');
        $('.hi-form-error').hide().text('');
        if (errors) {
            Object.keys(errors).forEach(function(field) {
                var msg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                var $field = $('#' + prefix + field.charAt(0).toUpperCase() + field.slice(1).replace(/_([a-z])/g, function(m, l) { return l.toUpperCase(); }));
                if ($field.length) {
                    $field.addClass('is-invalid');
                    $field.siblings('.hi-form-error').text(msg).show();
                    $field.closest('.hi-form-group').find('.hi-form-error').text(msg).show();
                }
            });
        }
    }

    $(document).on('change', '.hi-file-upload-input', function() {
        var file = this.files[0];
        var $wrapper = $(this).closest('.hi-file-upload');
        var $name = $wrapper.find('.hi-file-name');
        if (file) {
            $name.text(file.name);
        } else {
            $name.text('No file selected');
        }
    });

    $(document).on('change', '#legalDocUpload', function() {
        var file = this.files[0];
        if (!file) return;
        var formData = new FormData();
        formData.append('document', file);
        formData.append('type', 'legal');
        $.ajax({
            url: '/api/hospital-info/upload-document',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                showToast('Document uploaded', 'success');
            },
            error: function(xhr) {
                showToast(xhr.responseJSON?.message || 'Upload failed', 'error');
            }
        });
    });

    loadSettings('basic');
});
