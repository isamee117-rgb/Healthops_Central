$(function () {
    let currentView = 'list';
    let currentStatus = '';
    let currentDept = 'Hematology';
    let allSamples = [];
    let searchTimer = null;

    loadStats();
    loadSamples();
    setInterval(loadStats, 30000);

    function loadStats() {
        $.get('/api/lab/results/stats', function (d) {
            $('#statPendingEntry').text(d.pendingEntry || 0);
            $('#statEnteredToday').text(d.enteredToday || 0);
            $('#statPendingVerification').text(d.pendingVerification || 0);
            $('#statVerifiedToday').text(d.verifiedToday || 0);
            $('#statCritical').text(d.criticalResults || 0);
            lucide.createIcons();
        });
    }

    function loadSamples() {
        var params = {};
        if (currentStatus) params.resultStatus = currentStatus;
        var search = $('#searchInput').val();
        if (search) params.search = search;
        var pri = $('#filterPriority').val();
        if (pri) params.priority = pri;
        var dept = $('#filterDepartment').val();
        if (dept) params.department = dept;
        var cat = $('#filterCategory').val();
        if (cat) params.category = cat;

        $.get('/api/lab/results/samples', params, function (data) {
            allSamples = data;
            renderCurrentView();
        });
    }

    function renderCurrentView() {
        if (currentView === 'list') renderListView();
        else if (currentView === 'department') renderDepartmentView();
        else if (currentView === 'analyzer') renderAnalyzerView();
    }

    function renderListView() {
        var tb = $('#samplesTableBody');
        if (!allSamples.length) {
            tb.html('<tr><td colspan="10" style="padding:40px;text-align:center;color:var(--color-muted-foreground)"><i data-lucide="inbox" style="width:40px;height:40px;margin-bottom:8px;opacity:0.3"></i><br>No samples found for result entry</td></tr>');
            lucide.createIcons();
            return;
        }

        var html = '';
        allSamples.forEach(function (s) {
            var priColor = s.priority === 'STAT' ? '#ef4444' : s.priority === 'Urgent' ? '#f97316' : '#22c55e';
            var priBg = s.priority === 'STAT' ? 'rgba(239,68,68,0.1)' : s.priority === 'Urgent' ? 'rgba(249,115,22,0.1)' : 'rgba(34,197,94,0.1)';
            var srcColor = s.sourceDepartment === 'Emergency' ? '#ef4444' : s.sourceDepartment === 'IPD' ? '#3b82f6' : s.sourceDepartment === 'OT' ? '#8b5cf6' : '#22c55e';
            var srcBg = s.sourceDepartment === 'Emergency' ? 'rgba(239,68,68,0.1)' : s.sourceDepartment === 'IPD' ? 'rgba(59,130,246,0.1)' : s.sourceDepartment === 'OT' ? 'rgba(139,92,246,0.1)' : 'rgba(34,197,94,0.1)';

            var tatLabel = '';
            if (s.tatExceeded) {
                tatLabel = '<span style="color:#ef4444;font-weight:700;font-size:11px">TAT Exceeded</span>';
            } else {
                var h = Math.floor(s.tatRemaining / 60);
                var m = s.tatRemaining % 60;
                tatLabel = '<span style="color:' + (s.tatRemaining < 30 ? '#ef4444' : s.tatRemaining < 120 ? '#eab308' : '#22c55e') + ';font-size:11px;font-weight:600">' + (h > 0 ? h + 'h ' : '') + m + 'm</span>';
            }

            var rsColor = s.resultStatus === 'Verified' ? '#3b82f6' : s.resultStatus === 'Entered' ? '#22c55e' : '#eab308';
            var rsBg = s.resultStatus === 'Verified' ? 'rgba(59,130,246,0.1)' : s.resultStatus === 'Entered' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)';
            var rsLabel = s.resultStatus;
            if (s.resultStatus === 'Entered') rsLabel = 'Entered (' + s.testsWithResults + '/' + s.testsCount + ')';
            if (s.resultStatus === 'Verified') rsLabel = 'Verified (' + s.testsVerified + '/' + s.testsCount + ')';

            var testLabel = s.testNames.length <= 2 ? s.testNames.join(', ') : s.testNames.slice(0, 2).join(', ') + ' +' + (s.testNames.length - 2);
            var sampleLabel = s.sampleTypes.join(', ');

            var criticalBadge = s.criticalFlag ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;margin-left:4px;animation:pulse 1.5s infinite"></span>' : '';

            html += '<tr style="border-bottom:1px solid var(--color-border);cursor:pointer" class="sample-row" data-order-id="' + s.orderId + '">';
            html += '<td style="padding:10px 16px;font-weight:600;color:var(--midnight-blue);font-size:12px">' + s.orderId + criticalBadge + '</td>';
            html += '<td style="padding:10px 8px"><div style="font-weight:600;font-size:13px">' + s.patientName + '</div></td>';
            html += '<td style="padding:10px 8px;font-size:12px;color:var(--color-muted-foreground)">' + s.mrn + '</td>';
            html += '<td style="padding:10px 8px;font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + s.testNames.join(', ') + '">' + testLabel + '</td>';
            html += '<td style="padding:10px 8px;font-size:12px;color:var(--color-muted-foreground)">' + sampleLabel + '</td>';
            html += '<td style="padding:10px 8px;font-size:12px">' + (s.collectionTime || '-') + '</td>';
            html += '<td style="padding:10px 8px">' + tatLabel + '</td>';
            html += '<td style="padding:10px 8px"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:' + priColor + ';background:' + priBg + '">' + s.priority + '</span></td>';
            html += '<td style="padding:10px 8px"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:' + rsColor + ';background:' + rsBg + '">' + rsLabel + '</span></td>';
            html += '<td style="padding:10px 8px">';
            if (s.resultStatus === 'Pending' || s.resultStatus === 'Entered') {
                html += '<button class="btn-enter-results" data-order-id="' + s.orderId + '" style="padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;background:var(--midnight-blue);color:#fff;border:none;cursor:pointer;margin-right:4px">Enter Results</button>';
            }
            if (s.resultStatus === 'Entered') {
                html += '<button class="btn-verify-order" data-order-id="' + s.orderId + '" style="padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;background:#3b82f6;color:#fff;border:none;cursor:pointer">Verify</button>';
            }
            if (s.resultStatus === 'Verified') {
                html += '<button class="btn-view-results" data-order-id="' + s.orderId + '" style="padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.3);cursor:pointer">View</button>';
            }
            html += '</td></tr>';
        });

        tb.html(html);
        lucide.createIcons();
    }

    function renderDepartmentView() {
        var dept = currentDept;
        var filtered = allSamples.filter(function (s) {
            return s.categories && s.categories.indexOf(dept) !== -1;
        });

        if (!filtered.length) {
            $('#deptContent').html('<div style="text-align:center;padding:30px;color:var(--color-muted-foreground)">No samples in ' + dept + '</div>');
            return;
        }

        var html = '<div style="display:grid;gap:12px">';
        filtered.forEach(function (s) {
            var priColor = s.priority === 'STAT' ? '#ef4444' : s.priority === 'Urgent' ? '#f97316' : '#22c55e';
            var rsColor = s.resultStatus === 'Verified' ? '#3b82f6' : s.resultStatus === 'Entered' ? '#22c55e' : '#eab308';
            html += '<div class="sample-row" data-order-id="' + s.orderId + '" style="padding:14px 16px;border:1px solid var(--color-border);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:background 0.15s" onmouseover="this.style.background=\'rgba(127,255,212,0.05)\'" onmouseout="this.style.background=\'transparent\'">';
            html += '<div style="display:flex;align-items:center;gap:14px">';
            html += '<div style="width:36px;height:36px;border-radius:8px;background:rgba(0,51,102,0.06);display:flex;align-items:center;justify-content:center"><i data-lucide="flask-conical" style="width:16px;height:16px;color:var(--midnight-blue)"></i></div>';
            html += '<div><div style="font-weight:600;font-size:14px">' + s.patientName + ' <span style="color:var(--color-muted-foreground);font-size:12px">(' + s.mrn + ')</span></div>';
            html += '<div style="font-size:12px;color:var(--color-muted-foreground)">' + s.testNames.join(', ') + '</div></div></div>';
            html += '<div style="display:flex;align-items:center;gap:8px">';
            html += '<span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:' + priColor + '">' + s.priority + '</span>';
            html += '<span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:' + rsColor + ';background:rgba(0,0,0,0.05)">' + s.resultStatus + '</span>';
            html += '<span style="font-size:11px;color:var(--color-muted-foreground)">' + s.orderId + '</span>';
            html += '</div></div>';
        });
        html += '</div>';
        $('#deptContent').html(html);
        lucide.createIcons();
    }

    function renderAnalyzerView() {
        var analyzers = [
            { name: 'Sysmex XN-1000', type: 'Hematology Analyzer', status: 'Online', testsToday: 0, icon: 'cpu' },
            { name: 'Roche Cobas 6000', type: 'Chemistry Analyzer', status: 'Online', testsToday: 0, icon: 'server' },
            { name: 'BioMerieux VITEK 2', type: 'Microbiology Analyzer', status: 'Standby', testsToday: 0, icon: 'microscope' },
        ];

        allSamples.forEach(function (s) {
            s.categories.forEach(function (cat) {
                if (cat === 'Hematology') analyzers[0].testsToday += s.testsCount;
                else if (cat === 'Clinical Chemistry') analyzers[1].testsToday += s.testsCount;
                else if (cat === 'Microbiology') analyzers[2].testsToday += s.testsCount;
            });
        });

        var html = '';
        analyzers.forEach(function (a) {
            var statusColor = a.status === 'Online' ? '#22c55e' : '#eab308';
            html += '<div style="border:1px solid var(--color-border);border-radius:12px;padding:20px;background:var(--color-card)">';
            html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">';
            html += '<div style="width:42px;height:42px;border-radius:10px;background:rgba(0,51,102,0.06);display:flex;align-items:center;justify-content:center"><i data-lucide="' + a.icon + '" style="width:20px;height:20px;color:var(--midnight-blue)"></i></div>';
            html += '<div><div style="font-weight:700;font-size:15px">' + a.name + '</div>';
            html += '<div style="font-size:12px;color:var(--color-muted-foreground)">' + a.type + '</div></div></div>';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--color-border)">';
            html += '<div><div style="font-size:11px;color:var(--color-muted-foreground)">Status</div>';
            html += '<div style="display:flex;align-items:center;gap:5px;font-weight:600;font-size:13px;color:' + statusColor + '"><span style="width:8px;height:8px;border-radius:50%;background:' + statusColor + ';display:inline-block"></span>' + a.status + '</div></div>';
            html += '<div style="text-align:right"><div style="font-size:11px;color:var(--color-muted-foreground)">Tests Pending</div>';
            html += '<div style="font-weight:700;font-size:18px;color:var(--midnight-blue)">' + a.testsToday + '</div></div></div>';
            html += '</div>';
        });
        $('#analyzerContent').html(html);
        lucide.createIcons();
    }

    $('#viewToggle').on('click', '.view-btn', function () {
        var view = $(this).data('view');
        currentView = view;
        $('#viewToggle .view-btn').removeClass('active').css({ background: 'var(--color-card)', color: 'var(--color-muted-foreground)' });
        $(this).addClass('active').css({ background: 'var(--midnight-blue)', color: '#fff' });
        $('#listView, #departmentView, #analyzerView').hide();
        if (view === 'list') $('#listView').show();
        else if (view === 'department') $('#departmentView').show();
        else if (view === 'analyzer') $('#analyzerView').show();
        renderCurrentView();
    });

    $('#deptTabs').on('click', '.dept-tab', function () {
        currentDept = $(this).data('dept');
        $('#deptTabs .dept-tab').removeClass('active').css({ background: 'var(--color-background)', color: 'var(--color-muted-foreground)' });
        $(this).addClass('active').css({ background: 'var(--midnight-blue)', color: '#fff' });
        renderDepartmentView();
    });

    $('#statusFilters').on('click', '.status-chip', function () {
        currentStatus = $(this).data('status');
        $('#statusFilters .status-chip').removeClass('active').css({ background: 'var(--color-card)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' });
        $(this).addClass('active').css({ background: 'var(--midnight-blue)', color: '#fff', borderColor: 'var(--midnight-blue)' });
        loadSamples();
    });

    $('#searchInput').on('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadSamples, 400);
    });

    $('#filterPriority, #filterDepartment, #filterCategory').on('change', loadSamples);

    $(document).on('click', '.sample-row, .btn-enter-results, .btn-verify-order, .btn-view-results', function (e) {
        e.stopPropagation();
        var orderId = $(this).data('order-id') || $(this).closest('.sample-row').data('order-id');
        openResultPanel(orderId);
    });

    function openResultPanel(orderId) {
        $.get('/api/lab/orders/' + orderId, function (order) {
            $('#panelOrderId').text(order.orderId);
            $('#panelPatientName').text(order.patientName);
            $('#panelPatientAge').text(order.patientAge + '/' + order.patientGender);
            $('#panelMrn').text(order.mrn);
            $('#panelCollectionTime').text(order.collectedAt ? new Date(order.collectedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A');

            var testNames = order.tests.map(function (t) { return t.testName; }).join(', ');
            $('#panelTestName').text(testNames.length > 60 ? testNames.substring(0, 57) + '...' : testNames);

            var priColor = order.priority === 'STAT' ? '#ef4444' : order.priority === 'Urgent' ? '#f97316' : '#22c55e';
            var priBg = order.priority === 'STAT' ? 'rgba(239,68,68,0.2)' : order.priority === 'Urgent' ? 'rgba(249,115,22,0.2)' : 'rgba(34,197,94,0.2)';
            $('#panelPriorityBadge').text(order.priority).css({ color: priColor, background: priBg });

            renderTestPanels(order);

            var bsOffcanvas = new bootstrap.Offcanvas(document.getElementById('resultEntryPanel'));
            bsOffcanvas.show();
            lucide.createIcons();
        });
    }

    function renderTestPanels(order) {
        var html = '';
        var enteredCount = 0;
        var totalTests = order.tests.length;

        order.tests.forEach(function (test, idx) {
            var hasResults = test.resultEnteredAt !== null;
            var isVerified = test.verifiedAt !== null;
            if (hasResults) enteredCount++;

            var statusColor = isVerified ? '#3b82f6' : hasResults ? '#22c55e' : '#eab308';
            var statusBg = isVerified ? 'rgba(59,130,246,0.08)' : hasResults ? 'rgba(34,197,94,0.08)' : 'rgba(234,179,8,0.08)';
            var statusLabel = isVerified ? 'Verified' : hasResults ? 'Results Entered' : 'Pending Entry';
            var statusIcon = isVerified ? 'badge-check' : hasResults ? 'check-circle' : 'edit-3';

            var hasCritical = hasResults && test.resultData && test.resultData.hasCritical;

            html += '<div class="test-panel-card" data-test-id="' + test.testId + '" data-test-code="' + test.testCode + '" data-order-id="' + order.orderId + '" style="border:1px solid ' + (hasCritical ? '#ef4444' : 'var(--color-border)') + ';border-radius:12px;margin-bottom:16px;background:var(--color-card);overflow:hidden' + (hasCritical ? ';box-shadow:0 0 0 1px rgba(239,68,68,0.3)' : '') + '">';

            html += '<div style="padding:14px 16px;background:' + statusBg + ';display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--color-border);cursor:pointer" class="test-panel-header">';
            html += '<div style="display:flex;align-items:center;gap:10px">';
            html += '<i data-lucide="' + statusIcon + '" style="width:18px;height:18px;color:' + statusColor + '"></i>';
            html += '<div><div style="font-weight:700;font-size:14px;color:var(--color-foreground)">' + test.testName + '</div>';
            html += '<div style="font-size:11px;color:var(--color-muted-foreground)">' + test.category + ' &bull; ' + test.specimenType + '</div></div></div>';
            html += '<div style="display:flex;align-items:center;gap:8px">';
            if (hasCritical) {
                html += '<span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:#ef4444;background:rgba(239,68,68,0.15);animation:pulse 1.5s infinite">CRITICAL</span>';
            }
            html += '<span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;color:' + statusColor + ';background:' + statusBg + '">' + statusLabel + '</span>';
            html += '<i data-lucide="chevron-down" style="width:16px;height:16px;color:var(--color-muted-foreground);transition:transform 0.2s" class="panel-chevron"></i>';
            html += '</div></div>';

            html += '<div class="test-panel-body" style="padding:16px;display:' + (idx === 0 || !hasResults ? 'block' : 'none') + '">';

            if (hasResults && test.resultData && test.resultData.parameters) {
                html += renderResultsTable(test, isVerified);
            } else {
                html += '<div class="result-entry-form" data-test-id="' + test.testId + '" data-test-code="' + test.testCode + '">';
                html += '<div style="text-align:center;padding:20px;color:var(--color-muted-foreground)"><i data-lucide="loader" style="width:24px;height:24px;animation:spin 1s linear infinite"></i><br>Loading parameters...</div>';
                html += '</div>';
                loadTestParameters(test.testCode || test.testName, test.testId, order.orderId, order.patientGender);
            }

            html += '</div></div>';
        });

        $('#panelTestsList').html(html);
        updatePanelProgress(enteredCount, totalTests);

        var allEntered = enteredCount === totalTests && totalTests > 0;
        var anyUnverified = order.tests.some(function (t) { return t.resultEnteredAt && !t.verifiedAt; });
        $('#btnVerifyAll').prop('disabled', !anyUnverified);

        lucide.createIcons();
    }

    function loadTestParameters(testCode, testId, orderId, patientGender) {
        $.get('/api/lab/tests/parameters/' + encodeURIComponent(testCode), function (params) {
            renderEntryForm(params, testId, testCode, orderId, patientGender);
        }).fail(function () {
            var form = $('.result-entry-form[data-test-id="' + testId + '"]');
            form.html('<div style="padding:12px;background:rgba(234,179,8,0.08);border-radius:8px;color:#eab308;font-size:13px"><i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline;vertical-align:middle"></i> No parameter template found for ' + testCode + '. Enter results manually below.</div>' +
                '<div style="margin-top:12px"><textarea class="manual-result-input" placeholder="Enter test results here..." style="width:100%;min-height:80px;padding:10px;border:1px solid var(--color-border);border-radius:8px;font-size:13px;background:var(--color-card);color:var(--color-foreground);resize:vertical"></textarea></div>' +
                '<div style="margin-top:8px"><textarea class="result-comment" placeholder="Comments (optional)..." style="width:100%;min-height:40px;padding:8px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;background:var(--color-card);color:var(--color-foreground);resize:vertical"></textarea></div>' +
                '<div style="margin-top:12px;text-align:right"><button class="btn-save-manual-result" data-test-id="' + testId + '" data-order-id="' + orderId + '" style="padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;background:var(--midnight-blue);color:#fff;border:none;cursor:pointer">Save Results</button></div>');
            lucide.createIcons();
        });
    }

    function getGenderRange(p, gender) {
        if (!p.hasGenderRanges) {
            return { range: p.refRange || '', low: p.low, high: p.high };
        }
        var g = (gender || '').toLowerCase();
        if (g === 'male') return { range: p.rangeMale || p.refRange || '', low: p.lowMale, high: p.highMale };
        if (g === 'female') return { range: p.rangeFemale || p.refRange || '', low: p.lowFemale, high: p.highFemale };
        return { range: p.refRange || '', low: p.low, high: p.high };
    }

    function buildRefRangeHtml(p) {
        if (!p.hasGenderRanges) {
            return '<span>' + (p.refRange || '-') + '</span>';
        }
        var html = '';
        if (p.rangeMale) html += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3b82f6;flex-shrink:0"></span><span style="color:#3b82f6;font-weight:600;min-width:10px">M</span><span>' + p.rangeMale + '</span></div>';
        if (p.rangeFemale) html += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ec4899;flex-shrink:0"></span><span style="color:#ec4899;font-weight:600;min-width:10px">F</span><span>' + p.rangeFemale + '</span></div>';
        if (p.rangeChild) html += '<div style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0"></span><span style="color:#f59e0b;font-weight:600;min-width:10px">C</span><span>' + p.rangeChild + '</span></div>';
        return html || '-';
    }

    function renderEntryForm(params, testId, testCode, orderId, patientGender) {
        var form = $('.result-entry-form[data-test-id="' + testId + '"]');
        var isQualitative = params.length > 0 && params[0].qualitative;

        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px">';
        html += '<thead><tr style="border-bottom:2px solid var(--color-border)">';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:28%">Parameter</th>';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:18%">Result</th>';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:10%">Unit</th>';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:28%">Ref Range</th>';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:16%">Flag</th>';
        html += '</tr></thead><tbody>';

        params.forEach(function (p, i) {
            var gr = getGenderRange(p, patientGender);
            html += '<tr style="border-bottom:1px solid var(--color-border)" class="param-row" data-param-index="' + i + '">';
            html += '<td style="padding:8px 10px;font-weight:600;color:var(--color-foreground)">' + p.parameter + '</td>';
            if (p.qualitative) {
                html += '<td style="padding:8px 10px"><input type="text" class="result-input" data-param="' + p.parameter + '" data-unit="' + (p.unit || '') + '" data-ref="' + gr.range + '" data-qualitative="true" placeholder="Enter result" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card);color:var(--color-foreground)"></td>';
            } else {
                html += '<td style="padding:8px 10px"><input type="number" step="any" class="result-input" data-param="' + p.parameter + '" data-unit="' + (p.unit || '') + '" data-ref="' + gr.range + '" data-low="' + (gr.low !== undefined && gr.low !== null ? gr.low : '') + '" data-high="' + (gr.high !== undefined && gr.high !== null ? gr.high : '') + '" data-critical-low="' + (p.criticalLow !== undefined && p.criticalLow !== null ? p.criticalLow : '') + '" data-critical-high="' + (p.criticalHigh !== undefined && p.criticalHigh !== null ? p.criticalHigh : '') + '" placeholder="0" style="width:100%;padding:6px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card);color:var(--color-foreground)"></td>';
            }
            html += '<td style="padding:8px 10px;color:var(--color-muted-foreground);font-size:12px">' + (p.unit || '') + '</td>';
            html += '<td style="padding:8px 10px;font-size:12px;color:var(--color-muted-foreground)">' + buildRefRangeHtml(p) + '</td>';
            html += '<td style="padding:8px 10px"><span class="flag-indicator" style="font-size:12px;font-weight:600;color:#a3a3a3">-</span></td>';
            html += '</tr>';
        });

        html += '</tbody></table>';

        html += '<div style="margin-top:12px"><textarea class="result-comment" placeholder="Comments / Notes (optional)..." style="width:100%;min-height:40px;padding:8px;border:1px solid var(--color-border);border-radius:8px;font-size:12px;background:var(--color-card);color:var(--color-foreground);resize:vertical"></textarea></div>';

        html += '<div style="margin-top:14px;display:flex;justify-content:flex-end;gap:8px">';
        html += '<button class="btn-save-results" data-test-id="' + testId + '" data-test-code="' + testCode + '" data-order-id="' + orderId + '" style="padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;background:var(--midnight-blue);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;gap:6px"><i data-lucide="save" style="width:14px;height:14px"></i> Save Results</button>';
        html += '</div>';

        form.html(html);
        lucide.createIcons();
    }

    function renderResultsTable(test, isVerified) {
        var params = test.resultData.parameters || [];
        var analyzer = test.resultData.analyzer;
        var hasCritical = test.resultData.hasCritical;

        var html = '';

        if (analyzer) {
            html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:8px 12px;background:rgba(59,130,246,0.06);border-radius:8px;font-size:12px;color:#3b82f6">';
            html += '<i data-lucide="cpu" style="width:14px;height:14px"></i> Imported from Analyzer: <strong>' + analyzer.name + '</strong>';
            if (analyzer.runId) html += ' | Run ID: ' + analyzer.runId;
            html += '</div>';
        }

        if (hasCritical) {
            html += '<div style="padding:8px 12px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;margin-bottom:12px;font-size:12px;font-weight:600;color:#ef4444;display:flex;align-items:center;gap:6px">';
            html += '<i data-lucide="alert-triangle" style="width:14px;height:14px"></i> CRITICAL VALUES DETECTED - Immediate physician notification required';
            html += '</div>';
        }

        html += '<table style="width:100%;border-collapse:collapse;font-size:13px">';
        html += '<thead><tr style="border-bottom:2px solid var(--color-border)">';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:30%">Parameter</th>';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:18%">Result</th>';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:12%">Unit</th>';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:20%">Ref Range</th>';
        html += '<th style="padding:8px 10px;text-align:left;font-weight:700;color:var(--midnight-blue);font-size:12px;width:20%">Flag</th>';
        html += '</tr></thead><tbody>';

        params.forEach(function (p) {
            var flagHtml = getFlagHtml(p.flag);
            var rowBg = '';
            if (p.flag === 'Critical High' || p.flag === 'Critical Low') rowBg = 'background:rgba(239,68,68,0.04);';
            else if (p.flag === 'High') rowBg = 'background:rgba(239,68,68,0.02);';
            else if (p.flag === 'Low') rowBg = 'background:rgba(59,130,246,0.02);';

            html += '<tr style="border-bottom:1px solid var(--color-border);' + rowBg + '">';
            html += '<td style="padding:8px 10px;font-weight:600">' + p.parameter + '</td>';
            html += '<td style="padding:8px 10px;font-weight:700">' + p.value + '</td>';
            html += '<td style="padding:8px 10px;color:var(--color-muted-foreground);font-size:12px">' + (p.unit || '') + '</td>';
            html += '<td style="padding:8px 10px;font-size:12px;color:var(--color-muted-foreground)">' + (p.refRange || '') + '</td>';
            html += '<td style="padding:8px 10px">' + flagHtml + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';

        if (test.resultData.comment) {
            html += '<div style="margin-top:10px;padding:8px 12px;background:rgba(0,51,102,0.04);border-radius:8px;font-size:12px;color:var(--color-muted-foreground)"><strong>Comment:</strong> ' + test.resultData.comment + '</div>';
        }

        var enteredAt = test.resultData.enteredAt ? new Date(test.resultData.enteredAt).toLocaleString() : '';
        html += '<div style="margin-top:10px;display:flex;justify-content:space-between;font-size:11px;color:var(--color-muted-foreground)">';
        html += '<span>Entered by: ' + (test.resultData.enteredBy || '-') + ' at ' + enteredAt + '</span>';
        if (isVerified) {
            var verifiedAt = test.resultData.verifiedAt ? new Date(test.resultData.verifiedAt).toLocaleString() : '';
            html += '<span>Verified by: ' + (test.resultData.verifiedBy || '-') + ' at ' + verifiedAt + '</span>';
        }
        html += '</div>';

        if (!isVerified && test.resultEnteredAt) {
            html += '<div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px">';
            html += '<button class="btn-rerun-test" data-test-id="' + test.testId + '" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;background:rgba(234,179,8,0.1);color:#eab308;border:1px solid rgba(234,179,8,0.3);cursor:pointer">Re-run Test</button>';
            html += '<button class="btn-verify-single" data-test-id="' + test.testId + '" data-order-id="' + test.labOrderId + '" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;background:#3b82f6;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;gap:5px"><i data-lucide="shield-check" style="width:13px;height:13px"></i> Verify Results</button>';
            html += '</div>';
        }

        return html;
    }

    function getFlagHtml(flag) {
        if (!flag || flag === 'Normal') return '<span style="display:flex;align-items:center;gap:4px;color:#22c55e;font-size:12px;font-weight:600"><i data-lucide="check" style="width:13px;height:13px"></i> Normal</span>';
        if (flag === 'High') return '<span style="display:flex;align-items:center;gap:4px;color:#ef4444;font-size:12px;font-weight:600"><i data-lucide="arrow-up" style="width:13px;height:13px"></i> High</span>';
        if (flag === 'Low') return '<span style="display:flex;align-items:center;gap:4px;color:#3b82f6;font-size:12px;font-weight:600"><i data-lucide="arrow-down" style="width:13px;height:13px"></i> Low</span>';
        if (flag === 'Critical High') return '<span style="display:flex;align-items:center;gap:4px;color:#ef4444;font-size:12px;font-weight:800;animation:pulse 1.5s infinite"><i data-lucide="alert-triangle" style="width:13px;height:13px"></i> Critical High</span>';
        if (flag === 'Critical Low') return '<span style="display:flex;align-items:center;gap:4px;color:#ef4444;font-size:12px;font-weight:800;animation:pulse 1.5s infinite"><i data-lucide="alert-triangle" style="width:13px;height:13px"></i> Critical Low</span>';
        return '<span style="color:#a3a3a3;font-size:12px">-</span>';
    }

    $(document).on('input', '.result-input', function () {
        var input = $(this);
        var row = input.closest('.param-row');
        var flagSpan = row.find('.flag-indicator');

        if (input.data('qualitative') === true || input.data('qualitative') === 'true') {
            var val = input.val().trim().toLowerCase();
            var ref = (input.data('ref') || '').toLowerCase();
            if (!val) {
                flagSpan.html('-').css('color', '#a3a3a3');
            } else if (val === ref || val === 'negative' || val === 'non-reactive' || val === 'normal' || val === 'absent' || val === 'not seen' || val === 'no growth' || val === 'clear' || val === 'pale yellow' || val === 'brown' || val === 'formed' || val === 'few') {
                flagSpan.html('<span style="display:flex;align-items:center;gap:4px;color:#22c55e;font-weight:600"><i data-lucide="check" style="width:13px;height:13px"></i> Normal</span>');
            } else {
                flagSpan.html('<span style="display:flex;align-items:center;gap:4px;color:#ef4444;font-weight:600"><i data-lucide="alert-triangle" style="width:13px;height:13px"></i> Abnormal</span>');
            }
            input.css('borderColor', 'var(--color-border)');
            lucide.createIcons();
            return;
        }

        var value = parseFloat(input.val());
        if (isNaN(value)) {
            flagSpan.html('-').css('color', '#a3a3a3');
            input.css('borderColor', 'var(--color-border)');
            return;
        }

        var low = parseFloat(input.data('low'));
        var high = parseFloat(input.data('high'));
        var cLow = parseFloat(input.data('critical-low'));
        var cHigh = parseFloat(input.data('critical-high'));

        var flag = 'Normal';
        if (!isNaN(cLow) && value <= cLow) flag = 'Critical Low';
        else if (!isNaN(cHigh) && value >= cHigh) flag = 'Critical High';
        else if (!isNaN(low) && value < low) flag = 'Low';
        else if (!isNaN(high) && value > high) flag = 'High';

        flagSpan.html(getFlagHtml(flag));

        var borderColor = flag === 'Normal' ? '#22c55e' : (flag === 'High' || flag === 'Critical High') ? '#ef4444' : (flag === 'Low' || flag === 'Critical Low') ? '#3b82f6' : 'var(--color-border)';
        input.css('borderColor', borderColor);
        lucide.createIcons();
    });

    $(document).on('click', '.test-panel-header', function () {
        var body = $(this).next('.test-panel-body');
        var chevron = $(this).find('.panel-chevron');
        if (body.is(':visible')) {
            body.slideUp(200);
            chevron.css('transform', 'rotate(0deg)');
        } else {
            body.slideDown(200);
            chevron.css('transform', 'rotate(180deg)');
        }
    });

    $(document).on('click', '.btn-save-results', function () {
        var btn = $(this);
        var testId = btn.data('test-id');
        var testCode = btn.data('test-code');
        var orderId = btn.data('order-id');
        var form = btn.closest('.result-entry-form');
        var comment = form.find('.result-comment').val();

        var results = [];
        var hasEmpty = false;
        form.find('.result-input').each(function () {
            var val = $(this).val();
            if (!val && !$(this).data('qualitative')) { hasEmpty = true; }
            results.push({
                parameter: $(this).data('param'),
                value: val,
                unit: $(this).data('unit') || '',
                refRange: $(this).data('ref') || '',
            });
        });

        if (hasEmpty) {
            if (!confirm('Some parameters are empty. Save anyway?')) return;
        }

        btn.prop('disabled', true).html('<i data-lucide="loader" style="width:14px;height:14px;animation:spin 1s linear infinite"></i> Saving...');

        $.ajax({
            url: '/api/lab/results/enter',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                orderId: orderId,
                testId: testId,
                results: results,
                enteredBy: 'Lab Tech. Sarah',
                comment: comment
            }),
            success: function (res) {
                showToast('Results saved for ' + testId, 'success');
                var panelOrderId = $('#panelOrderId').text();
                openResultPanel(panelOrderId);
                loadStats();
                loadSamples();
            },
            error: function (xhr) {
                showToast('Error saving results: ' + (xhr.responseJSON ? xhr.responseJSON.error : 'Unknown error'), 'error');
                btn.prop('disabled', false).html('<i data-lucide="save" style="width:14px;height:14px"></i> Save Results');
                lucide.createIcons();
            }
        });
    });

    $(document).on('click', '.btn-save-manual-result', function () {
        var btn = $(this);
        var testId = btn.data('test-id');
        var orderId = btn.data('order-id');
        var form = btn.closest('.result-entry-form');
        var manualText = form.find('.manual-result-input').val();
        var comment = form.find('.result-comment').val();

        if (!manualText) {
            showToast('Please enter test results', 'error');
            return;
        }

        btn.prop('disabled', true).text('Saving...');

        $.ajax({
            url: '/api/lab/results/enter',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                orderId: orderId,
                testId: testId,
                results: [{ parameter: 'Result', value: manualText, unit: '', refRange: '' }],
                enteredBy: 'Lab Tech. Sarah',
                comment: comment
            }),
            success: function (res) {
                showToast('Results saved', 'success');
                openResultPanel(orderId);
                loadStats();
                loadSamples();
            },
            error: function () {
                showToast('Error saving results', 'error');
                btn.prop('disabled', false).text('Save Results');
            }
        });
    });

    $(document).on('click', '.btn-verify-single', function () {
        var testId = $(this).data('test-id');
        var orderId = $(this).data('order-id') || $('#panelOrderId').text();
        var btn = $(this);
        btn.prop('disabled', true).text('Verifying...');

        $.ajax({
            url: '/api/lab/results/verify',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                orderId: orderId,
                testId: testId,
                verifiedBy: 'Dr. Rashid (Pathologist)',
            }),
            success: function (res) {
                showToast('Test verified: ' + testId, 'success');
                openResultPanel(orderId);
                loadStats();
                loadSamples();
            },
            error: function (xhr) {
                showToast('Verification failed: ' + (xhr.responseJSON ? xhr.responseJSON.error : 'Unknown error'), 'error');
                btn.prop('disabled', false).html('<i data-lucide="shield-check" style="width:13px;height:13px"></i> Verify Results');
                lucide.createIcons();
            }
        });
    });

    $('#btnVerifyAll').on('click', function () {
        var orderId = $('#panelOrderId').text();
        if (!orderId) return;

        if (!confirm('Verify all entered results for ' + orderId + '?')) return;

        var btn = $(this);
        btn.prop('disabled', true).text('Verifying All...');

        $.ajax({
            url: '/api/lab/results/verify-all',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                orderId: orderId,
                verifiedBy: 'Dr. Rashid (Pathologist)',
            }),
            success: function (res) {
                showToast(res.verifiedCount + ' tests verified for ' + orderId, 'success');
                openResultPanel(orderId);
                loadStats();
                loadSamples();
            },
            error: function () {
                showToast('Verification failed', 'error');
                btn.prop('disabled', false).html('<i data-lucide="shield-check" style="width:14px;height:14px"></i> Verify All Results');
                lucide.createIcons();
            }
        });
    });

    function updatePanelProgress(entered, total) {
        $('#panelProgress').text(entered + '/' + total);
        var pct = total > 0 ? Math.round((entered / total) * 100) : 0;
        $('#panelProgressBar').css('width', pct + '%');
    }

    function showToast(message, type) {
        var color = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
        var icon = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info';
        var toast = $('<div style="position:fixed;top:20px;right:20px;z-index:99999;padding:12px 20px;background:var(--color-card);border:1px solid ' + color + ';border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--color-foreground);max-width:400px;animation:slideIn 0.3s ease-out"><i data-lucide="' + icon + '" style="width:16px;height:16px;color:' + color + ';flex-shrink:0"></i>' + message + '</div>');
        $('body').append(toast);
        lucide.createIcons();
        setTimeout(function () { toast.fadeOut(300, function () { toast.remove(); }); }, 3000);
    }
});
