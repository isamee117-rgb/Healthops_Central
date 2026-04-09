$(document).ready(function () {
    var currentView = 'tests';
    var currentSort = 'test_code';
    var currentDir = 'asc';
    var pkgSelectedTests = [];

    function esc(s) { return $('<span>').text(s || '').html(); }
    function fmt(n) { return 'PKR ' + Number(n || 0).toLocaleString(); }

    var deptColors = {
        'Hematology': { bg: '#EDE9FE', color: '#7c3aed' },
        'Clinical Chemistry': { bg: '#FEF3C7', color: '#d97706' },
        'Microbiology': { bg: '#DCFCE7', color: '#16a34a' },
        'Serology/Immunology': { bg: '#DBEAFE', color: '#2563eb' },
        'Histopathology': { bg: '#FEE2E2', color: '#dc2626' },
        'Cytology': { bg: '#FCE7F3', color: '#db2777' },
        'Molecular Biology': { bg: '#E0E7FF', color: '#4f46e5' }
    };
    var catColors = {
        'Routine': { bg: '#DCFCE7', color: '#16a34a' },
        'Specialized': { bg: '#DBEAFE', color: '#2563eb' },
        'STAT': { bg: '#FEE2E2', color: '#dc2626' },
        'Screening': { bg: '#FEF3C7', color: '#d97706' },
        'Diagnostic': { bg: '#E0E7FF', color: '#4f46e5' }
    };

    loadStats();
    loadTests();

    function loadStats() {
        $.get('/api/test-master/stats', function (d) {
            $('#statTotal').text(d.totalTests);
            $('#statActive').text(d.activeTests);
            $('#statPackages').text(d.packages);
            $('#statDepts').text(d.departments);
            $('#statAvgPrice').text(fmt(d.avgPrice));
        });
    }

    function loadTests() {
        var params = {
            search: $('#searchInput').val(),
            department: $('#filterDept').val(),
            category: $('#filterCategory').val(),
            status: $('#filterStatus').val(),
            sort: currentSort,
            dir: currentDir
        };
        $.get('/api/test-master/tests', params, function (d) {
            var $tb = $('#tbodyTests').empty();
            if (!d.tests || d.tests.length === 0) {
                $tb.append('<tr><td colspan="11" style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:14px">No tests found</td></tr>');
                return;
            }
            d.tests.forEach(function (t) {
                var dc = deptColors[t.department] || { bg: '#f1f5f9', color: '#666' };
                var cc = catColors[t.category] || { bg: '#f1f5f9', color: '#666' };
                var stBg = t.status === 'Active' ? '#DCFCE7' : '#FEE2E2';
                var stColor = t.status === 'Active' ? '#16a34a' : '#dc2626';
                var fastBadge = t.fastingRequired === 'Yes'
                    ? '<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#FEF3C7;color:#d97706">Yes</span>'
                    : '<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#f1f5f9;color:#999">No</span>';

                var deptBorder = dc.color;

                $tb.append(
                    '<tr class="test-row" data-code="' + esc(t.testCode) + '" style="border-bottom:1px solid var(--color-border);cursor:pointer;border-left:3px solid ' + deptBorder + ';transition:background 0.15s" onmouseover="this.style.background=\'rgba(127,255,212,0.06)\'" onmouseout="this.style.background=\'#fff\'">' +
                        '<td style="padding:10px 14px;font-size:12px;font-weight:600;font-family:monospace;color:var(--aqua-mint)">' + esc(t.testCode) + '</td>' +
                        '<td style="padding:10px 14px"><div style="font-size:13px;font-weight:500">' + esc(t.testName) + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + esc(t.shortName) + '</div></td>' +
                        '<td style="padding:10px 14px"><span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:' + dc.bg + ';color:' + dc.color + '">' + esc(t.department) + '</span></td>' +
                        '<td style="padding:10px 14px"><span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:' + cc.bg + ';color:' + cc.color + '">' + esc(t.category) + '</span></td>' +
                        '<td style="padding:10px 14px;font-size:12px;color:var(--color-muted-foreground)">' + esc(t.sampleType) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center">' + fastBadge + '</td>' +
                        '<td style="padding:10px 14px;font-size:12px">' + esc(t.standardTat) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center"><span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:var(--color-background);color:var(--color-foreground)">' + t.components + ' params</span></td>' +
                        '<td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:600;font-family:monospace">' + fmt(t.standardPrice) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center"><span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:' + stBg + ';color:' + stColor + '">' + esc(t.status) + '</span></td>' +
                        '<td style="padding:10px 14px;text-align:center">' +
                            '<div class="dropdown" style="display:inline-block">' +
                                '<button class="btn-actions" data-bs-toggle="dropdown" style="padding:4px 8px;background:transparent;border:1px solid var(--color-border);border-radius:6px;font-size:12px;cursor:pointer">&#8942;</button>' +
                                '<ul class="dropdown-menu dropdown-menu-end" style="font-size:12px;min-width:140px">' +
                                    '<li><a class="dropdown-item act-view" href="#" data-code="' + esc(t.testCode) + '">View Details</a></li>' +
                                    '<li><a class="dropdown-item act-edit" href="#" data-code="' + esc(t.testCode) + '">Edit</a></li>' +
                                    '<li><a class="dropdown-item act-duplicate" href="#" data-code="' + esc(t.testCode) + '">Duplicate</a></li>' +
                                    '<li><hr class="dropdown-divider"></li>' +
                                    '<li><a class="dropdown-item act-toggle" href="#" data-code="' + esc(t.testCode) + '">' + (t.status === 'Active' ? 'Deactivate' : 'Activate') + '</a></li>' +
                                '</ul>' +
                            '</div>' +
                        '</td>' +
                    '</tr>'
                );
            });
        });
    }

    function loadPackages() {
        var params = { search: $('#searchInput').val() };
        $.get('/api/test-master/packages', params, function (d) {
            var $tb = $('#tbodyPackages').empty();
            if (!d.packages || d.packages.length === 0) {
                $tb.append('<tr><td colspan="10" style="padding:40px;text-align:center;color:var(--color-muted-foreground);font-size:14px">No packages found</td></tr>');
                return;
            }
            d.packages.forEach(function (p) {
                var deptBadges = (p.departments || []).map(function (dep) {
                    var dc = deptColors[dep] || { bg: '#f1f5f9', color: '#666' };
                    return '<span style="padding:1px 6px;border-radius:3px;font-size:9px;font-weight:600;background:' + dc.bg + ';color:' + dc.color + '">' + esc(dep) + '</span>';
                }).join(' ');

                var stBg = p.status === 'Active' ? '#DCFCE7' : '#FEE2E2';
                var stColor = p.status === 'Active' ? '#16a34a' : '#dc2626';

                $tb.append(
                    '<tr class="pkg-row" data-code="' + esc(p.packageCode) + '" style="border-bottom:1px solid var(--color-border);cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'rgba(127,255,212,0.06)\'" onmouseout="this.style.background=\'#fff\'">' +
                        '<td style="padding:10px 14px;font-size:12px;font-weight:600;font-family:monospace;color:#8b5cf6">' + esc(p.packageCode) + '</td>' +
                        '<td style="padding:10px 14px;font-size:13px;font-weight:500">' + esc(p.packageName) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:600">' + p.testsCount + ' tests</td>' +
                        '<td style="padding:10px 14px">' + deptBadges + '</td>' +
                        '<td style="padding:10px 14px;text-align:right;font-size:12px;color:var(--color-muted-foreground);text-decoration:line-through;font-family:monospace">' + fmt(p.individualTotal) + '</td>' +
                        '<td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:700;font-family:monospace;color:var(--aqua-mint)">' + fmt(p.packagePrice) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center"><span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:#DCFCE7;color:#16a34a">' + p.discountPercent + '% OFF</span></td>' +
                        '<td style="padding:10px 14px;font-size:12px">' + esc(p.maxTat) + '</td>' +
                        '<td style="padding:10px 14px;text-align:center"><span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:' + stBg + ';color:' + stColor + '">' + esc(p.status) + '</span></td>' +
                        '<td style="padding:10px 14px;text-align:center"><button class="btn-view-pkg" data-code="' + esc(p.packageCode) + '" style="padding:4px 10px;background:var(--color-background);border:1px solid var(--color-border);border-radius:6px;font-size:11px;cursor:pointer">View</button></td>' +
                    '</tr>'
                );
            });
        });
    }

    $('.view-tab').on('click', function () {
        $('.view-tab').removeClass('active').css({ background: 'transparent', color: '' });
        $(this).addClass('active').css({ background: 'var(--aquamint)', color: 'var(--midnight-blue)' });
        currentView = $(this).data('view');
        $('#viewTests, #viewPackages').hide();
        if (currentView === 'tests' || currentView === 'popular') {
            $('#viewTests').show();
            if (currentView === 'popular') {
                currentSort = 'order_count';
                currentDir = 'desc';
            } else {
                currentSort = 'test_code';
                currentDir = 'asc';
            }
            loadTests();
        } else {
            $('#viewPackages').show();
            loadPackages();
        }
    });
    $('.view-tab.active').css({ background: 'var(--aquamint)', color: 'var(--midnight-blue)' });

    var searchTimer;
    $('#searchInput').on('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            if (currentView === 'packages') loadPackages();
            else loadTests();
        }, 300);
    });
    $('#filterDept, #filterCategory, #filterStatus').on('change', loadTests);

    $(document).on('click', '.sortable', function () {
        var s = $(this).data('sort');
        if (currentSort === s) currentDir = currentDir === 'asc' ? 'desc' : 'asc';
        else { currentSort = s; currentDir = 'asc'; }
        loadTests();
    });

    $(document).on('click', '.test-row', function (e) {
        if ($(e.target).closest('.dropdown').length) return;
        openTestDetail($(this).data('code'));
    });

    $(document).on('click', '.act-view', function (e) {
        e.preventDefault();
        openTestDetail($(this).data('code'));
    });

    $(document).on('click', '.act-edit', function (e) {
        e.preventDefault();
        openEditTest($(this).data('code'));
    });

    $(document).on('click', '.act-duplicate', function (e) {
        e.preventDefault();
        if (!confirm('Duplicate this test?')) return;
        $.post('/api/test-master/tests/' + $(this).data('code') + '/duplicate', function (d) {
            HMS.toast('Test duplicated: ' + d.testCode, 'success');
            loadTests();
            loadStats();
        });
    });

    $(document).on('click', '.act-toggle', function (e) {
        e.preventDefault();
        $.post('/api/test-master/tests/' + $(this).data('code') + '/toggle-status', function () {
            loadTests();
            loadStats();
        });
    });

    function openTestDetail(code) {
        $.get('/api/test-master/tests/' + code, function (t) {
            $('#detailTitle').text(t.test_name + ' (' + t.short_name + ')');
            $('#detailSubtitle').text(t.test_code + ' | ' + t.department + ' | ' + t.status);

            var dc = deptColors[t.department] || { bg: '#f1f5f9', color: '#666' };
            $('#detailActions').html(
                '<button class="act-edit-detail" data-code="' + esc(t.test_code) + '" style="padding:6px 14px;background:var(--aquamint);border:none;border-radius:6px;font-size:12px;font-weight:600;color:var(--midnight-blue);cursor:pointer"><i data-lucide="edit-2" style="width:12px;height:12px;vertical-align:-2px;margin-right:4px"></i>Edit</button>' +
                '<button class="act-duplicate" data-code="' + esc(t.test_code) + '" style="padding:6px 14px;background:var(--color-background);border:1px solid var(--color-border);border-radius:6px;font-size:12px;cursor:pointer"><i data-lucide="copy" style="width:12px;height:12px;vertical-align:-2px;margin-right:4px"></i>Duplicate</button>' +
                '<button class="act-toggle" data-code="' + esc(t.test_code) + '" style="padding:6px 14px;background:var(--color-background);border:1px solid var(--color-border);border-radius:6px;font-size:12px;cursor:pointer">' + (t.status === 'Active' ? 'Deactivate' : 'Activate') + '</button>'
            );

            var html = '';

            html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">Basic Information</div>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">';
            html += '<div><span style="color:var(--color-muted-foreground)">Test Code:</span> <strong>' + esc(t.test_code) + '</strong></div>';
            html += '<div><span style="color:var(--color-muted-foreground)">Short Name:</span> <strong>' + esc(t.short_name) + '</strong></div>';
            html += '<div><span style="color:var(--color-muted-foreground)">Department:</span> <span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:' + dc.bg + ';color:' + dc.color + '">' + esc(t.department) + '</span></div>';
            html += '<div><span style="color:var(--color-muted-foreground)">Category:</span> <strong>' + esc(t.category) + '</strong></div>';
            if (t.test_name_urdu) html += '<div><span style="color:var(--color-muted-foreground)">Urdu Name:</span> <strong style="direction:rtl">' + esc(t.test_name_urdu) + '</strong></div>';
            if (t.methodology) html += '<div><span style="color:var(--color-muted-foreground)">Methodology:</span> <strong>' + esc(t.methodology) + '</strong></div>';
            html += '</div>';
            if (t.description) html += '<div style="margin-top:8px;font-size:13px;color:var(--color-muted-foreground)">' + esc(t.description) + '</div>';
            html += '</div>';

            html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">Sample Requirements</div>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">';
            html += '<div><span style="color:var(--color-muted-foreground)">Sample Type:</span> <strong>' + esc(t.sample_type) + '</strong></div>';
            html += '<div><span style="color:var(--color-muted-foreground)">Volume:</span> <strong>' + esc(t.sample_volume) + '</strong></div>';
            html += '<div><span style="color:var(--color-muted-foreground)">Container:</span> <strong>' + esc(t.collection_container) + '</strong></div>';
            html += '<div><span style="color:var(--color-muted-foreground)">Fasting:</span> <strong>' + esc(t.fasting_required) + (t.fasting_hours ? ' (' + t.fasting_hours + ' hrs)' : '') + '</strong></div>';
            html += '</div>';
            if (t.special_instructions) html += '<div style="margin-top:8px;font-size:12px;color:var(--color-muted-foreground);font-style:italic">' + esc(t.special_instructions) + '</div>';
            html += '</div>';

            if (t.has_components && t.components && t.components.length > 0) {
                html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">Test Components (' + t.components.length + ' parameters)</div>';
                html += '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:var(--color-background)">';
                html += '<th style="padding:6px 10px;text-align:left;font-weight:600;text-transform:uppercase;font-size:10px;color:var(--color-muted-foreground)">Parameter</th>';
                html += '<th style="padding:6px 10px;text-align:left;font-weight:600;text-transform:uppercase;font-size:10px;color:var(--color-muted-foreground)">Unit</th>';
                html += '<th style="padding:6px 10px;text-align:center;font-weight:600;text-transform:uppercase;font-size:10px;color:var(--color-muted-foreground)">Male Range</th>';
                html += '<th style="padding:6px 10px;text-align:center;font-weight:600;text-transform:uppercase;font-size:10px;color:var(--color-muted-foreground)">Female Range</th>';
                html += '<th style="padding:6px 10px;text-align:center;font-weight:600;text-transform:uppercase;font-size:10px;color:var(--color-muted-foreground)">Critical</th>';
                html += '</tr></thead><tbody>';
                t.components.forEach(function (c) {
                    var critStr = '';
                    if (c.criticalLow) critStr += '<span style="color:#dc2626">' + esc(c.criticalLow) + '</span>';
                    if (c.criticalLow && c.criticalHigh) critStr += ' / ';
                    if (c.criticalHigh) critStr += '<span style="color:#dc2626">' + esc(c.criticalHigh) + '</span>';
                    html += '<tr style="border-bottom:1px solid var(--color-border)">';
                    html += '<td style="padding:6px 10px"><strong>' + esc(c.name) + '</strong> <span style="color:var(--color-muted-foreground)">(' + esc(c.short) + ')</span></td>';
                    html += '<td style="padding:6px 10px">' + esc(c.unit) + '</td>';
                    html += '<td style="padding:6px 10px;text-align:center">' + esc(c.rangeMale) + '</td>';
                    html += '<td style="padding:6px 10px;text-align:center">' + esc(c.rangeFemale) + '</td>';
                    html += '<td style="padding:6px 10px;text-align:center">' + (critStr || '-') + '</td>';
                    html += '</tr>';
                });
                html += '</tbody></table></div>';
            }

            html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">TAT & Pricing</div>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">';
            html += '<div style="padding:12px;background:var(--color-background);border-radius:8px;text-align:center"><div style="font-size:10px;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:4px">Standard TAT</div><div style="font-size:16px;font-weight:700">' + esc(t.standard_tat) + '</div></div>';
            html += '<div style="padding:12px;background:var(--color-background);border-radius:8px;text-align:center"><div style="font-size:10px;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:4px">Standard Price</div><div style="font-size:16px;font-weight:700;color:var(--aqua-mint)">' + fmt(t.standard_price) + '</div></div>';
            html += '<div style="padding:12px;background:var(--color-background);border-radius:8px;text-align:center"><div style="font-size:10px;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:4px">STAT Price</div><div style="font-size:16px;font-weight:700;color:#f97316">' + fmt(t.stat_price) + '</div></div>';
            html += '</div></div>';

            if (t.patient_preparation) {
                html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">Patient Preparation</div>';
                html += '<p style="font-size:13px;color:var(--color-muted-foreground)">' + esc(t.patient_preparation) + '</p></div>';
            }

            $('#detailBody').html(html);
            var off = new bootstrap.Offcanvas(document.getElementById('testDetailSheet'));
            off.show();
            lucide.createIcons();
        });
    }

    $(document).on('click', '.act-edit-detail', function (e) {
        e.preventDefault();
        bootstrap.Offcanvas.getInstance(document.getElementById('testDetailSheet')).hide();
        setTimeout(function () { openEditTest($(e.target).closest('[data-code]').data('code')); }, 300);
    });

    $('#btnAddTest').on('click', function () {
        resetTestForm();
        $('#addTestTitle').text('Add New Test');
        var off = new bootstrap.Offcanvas(document.getElementById('addTestSheet'));
        off.show();
        lucide.createIcons();
    });

    function resetTestForm() {
        $('#testForm')[0].reset();
        $('#editTestCode').val('');
        $('#componentsList').empty();
        $('#componentsSection').hide();
        $('#fHasComponents').prop('checked', false);
        $('#fastingHoursWrap').hide();
    }

    function openEditTest(code) {
        $.get('/api/test-master/tests/' + code, function (t) {
            $('#editTestCode').val(t.test_code);
            $('#addTestTitle').text('Edit Test: ' + t.test_name);
            $('#fTestName').val(t.test_name);
            $('#fShortName').val(t.short_name);
            $('#fTestNameUrdu').val(t.test_name_urdu || '');
            $('#fAltNames').val(t.alt_names || '');
            $('#fDepartment').val(t.department);
            $('#fCategory').val(t.category);
            $('#fDescription').val(t.description || '');
            $('#fSampleType').val(t.sample_type);
            $('#fSampleVolume').val(t.sample_volume || '');
            $('#fContainer').val(t.collection_container || '');
            $('#fFasting').val(t.fasting_required || 'No');
            if (t.fasting_required === 'Yes') { $('#fastingHoursWrap').show(); $('#fFastingHours').val(t.fasting_hours); }
            $('#fSpecialInstructions').val(t.special_instructions || '');
            $('#fStandardTat').val(t.standard_tat || '');
            $('#fStatTat').val(t.stat_tat || '');
            $('#fStandardPrice').val(t.standard_price);
            $('#fStatPrice').val(t.stat_price || '');
            $('#fHomeCollectionFee').val(t.home_collection_fee || '');
            $('#fReagentCost').val(t.reagent_cost || '');
            $('#fMethodology').val(t.methodology || '');
            $('#fStatus').val(t.status);
            $('#fPatientPrep').val(t.patient_preparation || '');

            $('#componentsList').empty();
            if (t.has_components && t.components && t.components.length > 0) {
                $('#fHasComponents').prop('checked', true);
                $('#componentsSection').show();
                t.components.forEach(function (c) { addComponentRow(c); });
            }

            var off = new bootstrap.Offcanvas(document.getElementById('addTestSheet'));
            off.show();
            lucide.createIcons();
        });
    }

    $('#fFasting').on('change', function () {
        $('#fastingHoursWrap').toggle($(this).val() === 'Yes');
    });

    $('#fHasComponents').on('change', function () {
        $('#componentsSection').toggle(this.checked);
    });

    $('#btnAddComponent').on('click', function () {
        addComponentRow();
        lucide.createIcons();
    });

    function addComponentRow(data) {
        data = data || {};
        var idx = $('#componentsList .comp-row').length + 1;
        var html = '<div class="comp-row" style="padding:12px;border:1px solid var(--color-border);border-radius:8px;margin-bottom:8px;background:var(--color-background)">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong style="font-size:12px">Component ' + idx + '</strong><button type="button" class="btn-remove-comp" style="padding:2px 8px;background:#FEE2E2;border:none;border-radius:4px;font-size:11px;color:#dc2626;cursor:pointer">Remove</button></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
                '<input type="text" class="comp-name" placeholder="Parameter Name" value="' + esc(data.name || '') + '" style="padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px">' +
                '<input type="text" class="comp-short" placeholder="Short Name" value="' + esc(data.short || '') + '" style="padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px">' +
                '<input type="text" class="comp-unit" placeholder="Unit (g/dL, mg/dL)" value="' + esc(data.unit || '') + '" style="padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px">' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:6px">' +
                '<input type="text" class="comp-range-male" placeholder="Male Range" value="' + esc(data.rangeMale || '') + '" style="padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px">' +
                '<input type="text" class="comp-range-female" placeholder="Female Range" value="' + esc(data.rangeFemale || '') + '" style="padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px">' +
                '<input type="text" class="comp-range-child" placeholder="Child Range" value="' + esc(data.rangeChild || '') + '" style="padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px">' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">' +
                '<input type="text" class="comp-crit-low" placeholder="Critical Low" value="' + esc(data.criticalLow || '') + '" style="padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px">' +
                '<input type="text" class="comp-crit-high" placeholder="Critical High" value="' + esc(data.criticalHigh || '') + '" style="padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px">' +
            '</div>' +
        '</div>';
        $('#componentsList').append(html);
    }

    $(document).on('click', '.btn-remove-comp', function () {
        $(this).closest('.comp-row').remove();
    });

    $(document).on('click', '.tat-quick', function () {
        $('#fStandardTat').val($(this).data('val'));
    });

    $('#testForm').on('submit', function (e) {
        e.preventDefault();
        var components = [];
        if ($('#fHasComponents').is(':checked')) {
            $('.comp-row').each(function () {
                var name = $(this).find('.comp-name').val();
                if (!name) return;
                components.push({
                    name: name,
                    short: $(this).find('.comp-short').val(),
                    unit: $(this).find('.comp-unit').val(),
                    rangeMale: $(this).find('.comp-range-male').val(),
                    rangeFemale: $(this).find('.comp-range-female').val(),
                    rangeChild: $(this).find('.comp-range-child').val(),
                    criticalLow: $(this).find('.comp-crit-low').val(),
                    criticalHigh: $(this).find('.comp-crit-high').val()
                });
            });
        }

        var data = {
            test_name: $('#fTestName').val(),
            short_name: $('#fShortName').val(),
            test_name_urdu: $('#fTestNameUrdu').val() || null,
            alt_names: $('#fAltNames').val() || null,
            department: $('#fDepartment').val(),
            category: $('#fCategory').val(),
            description: $('#fDescription').val() || null,
            sample_type: $('#fSampleType').val(),
            sample_volume: $('#fSampleVolume').val() || null,
            collection_container: $('#fContainer').val() || null,
            fasting_required: $('#fFasting').val(),
            fasting_hours: $('#fFasting').val() === 'Yes' ? parseInt($('#fFastingHours').val()) || null : null,
            special_instructions: $('#fSpecialInstructions').val() || null,
            standard_tat: $('#fStandardTat').val() || null,
            stat_tat: $('#fStatTat').val() || null,
            standard_price: parseFloat($('#fStandardPrice').val()) || 0,
            stat_price: parseFloat($('#fStatPrice').val()) || 0,
            home_collection_fee: parseFloat($('#fHomeCollectionFee').val()) || null,
            reagent_cost: parseFloat($('#fReagentCost').val()) || null,
            methodology: $('#fMethodology').val() || null,
            status: $('#fStatus').val(),
            patient_preparation: $('#fPatientPrep').val() || null,
            components: components
        };

        var editCode = $('#editTestCode').val();
        var url = editCode ? '/api/test-master/tests/' + editCode : '/api/test-master/tests';
        var method = editCode ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (d) {
                bootstrap.Offcanvas.getInstance(document.getElementById('addTestSheet')).hide();
                loadTests();
                loadStats();
                HMS.toast(editCode ? 'Test updated successfully!' : 'Test created: ' + d.testCode, 'success');
            },
            error: function (xhr) {
                HMS.ajaxError(xhr, 'Failed to save test');
            }
        });
    });

    $('#btnAddPackage').on('click', function () {
        $('#packageForm')[0].reset();
        pkgSelectedTests = [];
        renderPkgTests();
        var off = new bootstrap.Offcanvas(document.getElementById('addPackageSheet'));
        off.show();
        lucide.createIcons();
    });

    var pkgSearchTimer;
    $('#pkgTestSearch').on('input', function () {
        var q = $(this).val();
        clearTimeout(pkgSearchTimer);
        if (q.length < 2) { $('#pkgTestResults').hide(); return; }
        pkgSearchTimer = setTimeout(function () {
            $.get('/api/test-master/search', { q: q }, function (tests) {
                var $r = $('#pkgTestResults').empty().show();
                if (tests.length === 0) {
                    $r.append('<div style="padding:12px;font-size:12px;color:var(--color-muted-foreground)">No tests found</div>');
                    return;
                }
                tests.forEach(function (t) {
                    var already = pkgSelectedTests.some(function (s) { return s.testCode === t.test_code; });
                    $r.append(
                        '<div class="pkg-test-option" data-code="' + esc(t.test_code) + '" data-name="' + esc(t.test_name) + '" data-price="' + t.standard_price + '" data-tat="' + esc(t.standard_tat) + '" data-sample="' + esc(t.sample_type) + '" style="padding:8px 12px;border-bottom:1px solid var(--color-border);cursor:pointer;display:flex;justify-content:space-between;align-items:center;' + (already ? 'opacity:0.4;pointer-events:none' : '') + '">' +
                            '<div><strong style="font-size:12px">' + esc(t.test_name) + '</strong> <span style="font-size:11px;color:var(--color-muted-foreground)">(' + esc(t.test_code) + ')</span></div>' +
                            '<span style="font-size:12px;font-weight:600;font-family:monospace">' + fmt(t.standard_price) + '</span>' +
                        '</div>'
                    );
                });
            });
        }, 250);
    });

    $(document).on('click', '.pkg-test-option', function () {
        pkgSelectedTests.push({
            testCode: $(this).data('code'),
            testName: $(this).data('name'),
            price: parseFloat($(this).data('price'))
        });
        $('#pkgTestSearch').val('');
        $('#pkgTestResults').hide();
        renderPkgTests();
    });

    function renderPkgTests() {
        var $c = $('#pkgSelectedTests').empty();
        var total = 0;
        if (pkgSelectedTests.length === 0) {
            $c.html('<p style="font-size:12px;color:var(--color-muted-foreground);text-align:center;padding:20px">No tests selected. Search above to add tests.</p>');
        } else {
            pkgSelectedTests.forEach(function (t, i) {
                total += t.price;
                $c.append(
                    '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;margin-bottom:6px">' +
                        '<div><strong style="font-size:12px">' + (i + 1) + '. ' + esc(t.testName) + '</strong> <span style="font-size:11px;color:var(--color-muted-foreground)">(' + esc(t.testCode) + ')</span></div>' +
                        '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;font-family:monospace;font-weight:600">' + fmt(t.price) + '</span><button type="button" class="btn-remove-pkg-test" data-idx="' + i + '" style="padding:2px 6px;background:#FEE2E2;border:none;border-radius:4px;font-size:10px;color:#dc2626;cursor:pointer">X</button></div>' +
                    '</div>'
                );
            });
        }
        $('#pkgIndividualTotal').text(fmt(total));
        updatePkgDiscount();
    }

    $(document).on('click', '.btn-remove-pkg-test', function () {
        pkgSelectedTests.splice(parseInt($(this).data('idx')), 1);
        renderPkgTests();
    });

    $('#pPrice').on('input', updatePkgDiscount);
    function updatePkgDiscount() {
        var total = pkgSelectedTests.reduce(function (s, t) { return s + t.price; }, 0);
        var price = parseFloat($('#pPrice').val()) || 0;
        var disc = total > 0 ? Math.round(((total - price) / total) * 100) : 0;
        if (disc < 0) disc = 0;
        $('#pkgDiscount').text(disc + '% OFF');
    }

    $('#packageForm').on('submit', function (e) {
        e.preventDefault();
        if (pkgSelectedTests.length === 0) { HMS.toast('Please add at least one test', 'warning'); return; }

        var data = {
            package_name: $('#pName').val(),
            package_name_urdu: $('#pNameUrdu').val() || null,
            description: $('#pDescription').val() || null,
            tests: pkgSelectedTests,
            package_price: parseFloat($('#pPrice').val()) || 0
        };

        $.ajax({
            url: '/api/test-master/packages',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (d) {
                bootstrap.Offcanvas.getInstance(document.getElementById('addPackageSheet')).hide();
                loadStats();
                if (currentView === 'packages') loadPackages();
                HMS.toast('Package created: ' + d.packageCode, 'success');
            },
            error: function (xhr) {
                HMS.ajaxError(xhr, 'Failed');
            }
        });
    });

    $(document).on('click', '.pkg-row', function (e) {
        if ($(e.target).closest('button').length) return;
        openPackageDetail($(this).data('code'));
    });
    $(document).on('click', '.btn-view-pkg', function (e) {
        e.stopPropagation();
        openPackageDetail($(this).data('code'));
    });

    function openPackageDetail(code) {
        $.get('/api/test-master/packages/' + code, function (p) {
            $('#detailTitle').text(p.package_name);
            $('#detailSubtitle').text(p.package_code + ' | ' + p.status);
            $('#detailActions').html('');

            var tests = p.tests || [];
            var html = '';

            html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">Package Information</div>';
            html += '<p style="font-size:13px;color:var(--color-muted-foreground)">' + esc(p.description) + '</p></div>';

            html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">Tests Included (' + tests.length + ')</div>';
            tests.forEach(function (t, i) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border:1px solid var(--color-border);border-radius:8px;margin-bottom:6px">' +
                    '<div><strong style="font-size:12px">' + (i + 1) + '. ' + esc(t.testName || t.testCode) + '</strong> <span style="font-size:11px;color:var(--color-muted-foreground)">(' + esc(t.testCode) + ')</span></div>' +
                    '<span style="font-size:12px;font-family:monospace;font-weight:600">' + fmt(t.price) + '</span></div>';
            });
            html += '</div>';

            html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">Pricing</div>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">';
            html += '<div style="padding:12px;background:var(--color-background);border-radius:8px;text-align:center"><div style="font-size:10px;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:4px">Individual Total</div><div style="font-size:16px;font-weight:700;color:var(--color-muted-foreground);text-decoration:line-through">' + fmt(p.individual_total) + '</div></div>';
            html += '<div style="padding:12px;background:rgba(127,255,212,0.1);border-radius:8px;text-align:center"><div style="font-size:10px;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:4px">Package Price</div><div style="font-size:16px;font-weight:700;color:var(--aqua-mint)">' + fmt(p.package_price) + '</div></div>';
            html += '<div style="padding:12px;background:rgba(34,197,94,0.08);border-radius:8px;text-align:center"><div style="font-size:10px;text-transform:uppercase;color:var(--color-muted-foreground);margin-bottom:4px">Discount</div><div style="font-size:16px;font-weight:700;color:#22c55e">' + Math.round(p.discount_percent) + '% OFF</div></div>';
            html += '</div></div>';

            var samples = p.sample_summary || [];
            if (samples.length > 0) {
                html += '<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--midnight-blue);letter-spacing:0.05em;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--aquamint)">Sample Requirements</div>';
                html += '<div style="font-size:13px">';
                samples.forEach(function (s) { html += '<div style="padding:2px 0">' + esc(s.type) + ': ' + esc(s.volume) + '</div>'; });
                html += '</div>';
                if (p.fasting_required) html += '<div style="margin-top:6px;font-size:12px;font-weight:600;color:#d97706">Fasting Required</div>';
                if (p.max_tat) html += '<div style="margin-top:4px;font-size:12px;color:var(--color-muted-foreground)">Expected TAT: ' + esc(p.max_tat) + '</div>';
                html += '</div>';
            }

            $('#detailBody').html(html);
            var off = new bootstrap.Offcanvas(document.getElementById('testDetailSheet'));
            off.show();
            lucide.createIcons();
        });
    }
});
