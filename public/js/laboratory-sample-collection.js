$(document).ready(function () {
    var currentOrder = null;
    var pendingData = [];
    var todayData = [];

    loadStats();
    loadPending();

    function loadStats() {
        $.get('/api/lab/collections/stats', function (d) {
            $('#statPending').text(d.pending);
            $('#statCollected').text(d.collectedToday);
            $('#statUrgent').text(d.statUrgent);
            $('#statAvgWait').text(d.avgWaitMinutes);
            $('#statRejected').text(d.rejected);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function loadPending() {
        $.get('/api/lab/collections/pending', function (data) {
            pendingData = data;
            renderPending();
            $('#pendingCount').text(data.length);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function loadToday() {
        $.get('/api/lab/collections/today', function (data) {
            todayData = data;
            renderToday();
            $('#todayCount').text(data.length);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function renderPending() {
        var searchQ = ($('#pendingSearch').val() || '').toLowerCase().trim();
        var filterPri = $('#filterPriority').val();
        var filterSrc = $('#filterSource').val();

        var filtered = pendingData.filter(function (o) {
            if (searchQ && !(o.orderId.toLowerCase().includes(searchQ) || o.patientName.toLowerCase().includes(searchQ) || (o.mrn || '').toLowerCase().includes(searchQ))) return false;
            if (filterPri && o.priority !== filterPri) return false;
            if (filterSrc && o.sourceDepartment !== filterSrc) return false;
            return true;
        });

        if (filtered.length === 0) {
            $('#pendingTable').hide();
            $('#pendingEmpty').show();
            return;
        }
        $('#pendingTable').show();
        $('#pendingEmpty').hide();

        var html = '';
        filtered.forEach(function (o) {
            var priBg = o.priority === 'STAT' ? '#ef4444' : (o.priority === 'Urgent' ? '#f97316' : '#22c55e');
            var srcColors = { 'Walk-in': '#8b5cf6', 'OPD': '#3b82f6', 'IPD': '#0ea5e9', 'Emergency': '#ef4444', 'OT': '#f97316' };
            var srcBg = srcColors[o.sourceDepartment] || '#6b7280';
            var genderLabel = o.patientGender === 'M' ? 'Male' : (o.patientGender === 'F' ? 'Female' : o.patientGender);

            html += '<tr class="pending-row" data-order="' + o.orderId + '" style="border-bottom:1px solid var(--color-border);cursor:pointer;transition:background 0.15s">';
            html += '<td style="padding:10px 16px;font-size:13px;font-weight:600;color:var(--midnight-blue)">' + o.orderId + '</td>';
            html += '<td style="padding:10px 12px"><div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:32px;border-radius:50%;background:rgba(0,51,102,0.08);display:flex;align-items:center;justify-content:center"><i data-lucide="user" style="width:16px;height:16px;color:var(--midnight-blue)"></i></div><span style="font-size:13px;font-weight:600">' + o.patientName + '</span></div></td>';
            html += '<td style="padding:10px 12px;font-size:13px;color:var(--color-muted-foreground)">' + (o.mrn || '-') + '</td>';
            html += '<td style="padding:10px 12px;text-align:center;font-size:12px">' + (o.patientAge || '-') + '/' + (o.patientGender || '-') + '</td>';
            html += '<td style="padding:10px 12px;text-align:center"><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;color:#fff;background:' + srcBg + '">' + o.sourceDepartment + '</span></td>';
            html += '<td style="padding:10px 12px;text-align:center;font-size:13px;font-weight:600">' + o.testsCount + '</td>';
            html += '<td style="padding:10px 12px;font-size:12px;color:var(--color-muted-foreground)">' + o.sampleTypes.join(', ') + '</td>';
            html += '<td style="padding:10px 12px;text-align:center"><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:' + priBg + '">' + o.priority + '</span></td>';
            html += '<td style="padding:10px 12px;text-align:center;font-size:12px;color:var(--color-muted-foreground)">' + o.orderTime + '</td>';
            html += '<td style="padding:10px 12px;text-align:center"><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:700;color:' + o.waitColor + ';background:' + o.waitColor + '1a">' + o.waitLabel + '</span></td>';
            html += '<td style="padding:10px 12px;font-size:12px;color:var(--color-muted-foreground)">' + o.location + '</td>';
            html += '<td style="padding:10px 12px;text-align:center"><div style="display:flex;gap:4px;justify-content:center">';
            html += '<button class="collectBtn" data-order="' + o.orderId + '" style="padding:5px 10px;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;background:var(--aqua-mint);color:var(--midnight-blue);display:flex;align-items:center;gap:3px"><i data-lucide="syringe" style="width:12px;height:12px"></i> Collect</button>';
            html += '<button class="printLblBtn" data-order="' + o.orderId + '" style="padding:5px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:11px;cursor:pointer;background:var(--color-card)" title="Print Labels"><i data-lucide="printer" style="width:12px;height:12px"></i></button>';
            html += '</div></td>';
            html += '</tr>';
        });
        $('#pendingTableBody').html(html);
    }

    function renderToday() {
        if (todayData.length === 0) {
            $('#todayEmpty').show();
            return;
        }
        $('#todayEmpty').hide();

        var html = '';
        todayData.forEach(function (o) {
            var priBg = o.priority === 'STAT' ? '#ef4444' : (o.priority === 'Urgent' ? '#f97316' : '#22c55e');
            var srcColors = { 'Walk-in': '#8b5cf6', 'OPD': '#3b82f6', 'IPD': '#0ea5e9', 'Emergency': '#ef4444', 'OT': '#f97316' };
            var srcBg = srcColors[o.sourceDepartment] || '#6b7280';
            var statusBg = o.status === 'In Progress' ? '#3b82f6' : (o.status === 'Rejected' ? '#ef4444' : '#22c55e');

            html += '<tr style="border-bottom:1px solid var(--color-border)">';
            html += '<td style="padding:10px 16px;font-size:13px;font-weight:600;color:var(--midnight-blue)">' + o.orderId + '</td>';
            html += '<td style="padding:10px 12px;font-size:13px;font-weight:600">' + o.patientName + '</td>';
            html += '<td style="padding:10px 12px;font-size:13px;color:var(--color-muted-foreground)">' + (o.mrn || '-') + '</td>';
            html += '<td style="padding:10px 12px;text-align:center"><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;color:#fff;background:' + srcBg + '">' + o.sourceDepartment + '</span></td>';
            html += '<td style="padding:10px 12px;text-align:center;font-size:13px;font-weight:600">' + o.testsCount + '</td>';
            html += '<td style="padding:10px 12px;text-align:center"><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:' + priBg + '">' + o.priority + '</span></td>';
            html += '<td style="padding:10px 12px;text-align:center;font-size:12px;color:var(--color-muted-foreground)">' + (o.collectedAt || '-') + '</td>';
            html += '<td style="padding:10px 12px;font-size:13px">' + (o.collectedBy || '-') + '</td>';
            html += '<td style="padding:10px 12px;text-align:center"><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;color:#fff;background:' + statusBg + '">' + o.status + '</span></td>';
            html += '</tr>';
        });
        $('#todayTableBody').html(html);
    }

    $(document).on('click', '.sc-tab', function () {
        var tab = $(this).data('tab');
        $('.sc-tab').removeClass('active').css({ color: 'var(--color-muted-foreground)', borderBottom: '3px solid transparent', fontWeight: 600 });
        $(this).addClass('active').css({ color: 'var(--midnight-blue)', borderBottom: '3px solid var(--aqua-mint)', fontWeight: 700 });
        if (tab === 'pending') {
            $('#tabPending').show();
            $('#tabToday').hide();
        } else {
            $('#tabPending').hide();
            $('#tabToday').show();
            loadToday();
        }
    });

    $('#pendingSearch, #filterPriority, #filterSource').on('input change', function () {
        renderPending();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    $(document).on('click', '.collectBtn, .pending-row', function (e) {
        if ($(e.target).closest('.printLblBtn').length) return;
        var orderId = $(this).data('order') || $(this).closest('tr').data('order');
        openCollectionPanel(orderId);
    });

    function openCollectionPanel(orderId) {
        $.get('/api/lab/orders/' + orderId, function (order) {
            currentOrder = order;
            populatePanel(order);
            var offcanvas = new bootstrap.Offcanvas(document.getElementById('collectionPanel'));
            offcanvas.show();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function populatePanel(order) {
        var genderLabel = order.patientGender === 'M' ? 'Male' : (order.patientGender === 'F' ? 'Female' : order.patientGender || '');
        $('#cpPatientName').text(order.patientName);
        $('#cpPatientInfo').text((order.patientAge || '?') + ' yrs / ' + genderLabel);
        $('#cpMrn').text(order.mrn || 'Walk-in');

        var srcColors = { 'Walk-in': '#8b5cf6', 'OPD': '#3b82f6', 'IPD': '#0ea5e9', 'Emergency': '#ef4444', 'OT': '#f97316' };
        var srcBg = srcColors[order.sourceDepartment] || '#6b7280';
        $('#cpSourceBadge').text(order.sourceDepartment).css({ background: srcBg, color: '#fff' });

        var priBg = order.priority === 'STAT' ? '#ef4444' : (order.priority === 'Urgent' ? '#f97316' : '#22c55e');
        $('#cpPriorityBadge').text(order.priority).css({ background: priBg, color: '#fff' });

        if (order.sourceDepartment === 'IPD') {
            $('#wristbandCheck').css('display', 'flex');
        } else {
            $('#wristbandCheck').hide();
        }

        if (order.fastingRequired) {
            var fastingTests = order.tests.filter(function (t) { return t.fastingRequired; }).map(function (t) { return t.testName; });
            $('#fastingTestsList').html('<strong>Fasting Required for:</strong> ' + fastingTests.join(', '));
            $('#fastingSection').show();
            $('#cpFastingBadge').show().text('Fasting Required').css({ background: 'rgba(234,179,8,0.2)', color: '#d97706' });
        } else {
            $('#fastingSection').hide();
            $('#cpFastingBadge').hide();
        }

        var samplesHtml = '';
        var totalBlood = 0;
        var totalUrine = 0;
        var tubeGroups = {};
        order.tests.forEach(function (t) {
            var key = (t.containerType || 'Unknown');
            if (!tubeGroups[key]) tubeGroups[key] = { tests: [], volume: 0, specimen: t.specimenType };
            tubeGroups[key].tests.push(t);
            var vol = parseFloat(t.volume) || 3;
            tubeGroups[key].volume += vol;
            if (t.specimenType && t.specimenType.toLowerCase().includes('urine')) totalUrine += vol;
            else totalBlood += vol;
        });

        var tubeColors = {
            'Purple Top (EDTA)': '#9333ea',
            'Red Top (Plain)': '#ef4444',
            'Blue Top (Citrate)': '#3b82f6',
            'Gray Top (Fluoride)': '#6b7280',
            'Green Top (Heparin)': '#22c55e',
            'Gold Top (SST)': '#eab308',
            'Urine Container': '#f97316',
            'Sterile Container': '#0ea5e9',
            'Blood Culture Bottle': '#dc2626',
            'Stool Container': '#854d0e'
        };

        var idx = 0;
        Object.keys(tubeGroups).forEach(function (container) {
            idx++;
            var grp = tubeGroups[container];
            var tubeColor = tubeColors[container] || '#6b7280';
            samplesHtml += '<tr style="border-bottom:1px solid var(--color-border)">';
            samplesHtml += '<td style="padding:10px 12px;text-align:center"><span style="width:28px;height:28px;border-radius:50%;background:' + tubeColor + '20;color:' + tubeColor + ';display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">' + idx + '</span></td>';
            samplesHtml += '<td style="padding:10px 12px"><div style="font-weight:600;font-size:13px">' + grp.tests.map(function (t) { return t.testName; }).join(', ') + '</div></td>';
            samplesHtml += '<td style="padding:10px 12px;text-align:center"><span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600"><span style="width:12px;height:12px;border-radius:50%;background:' + tubeColor + ';display:inline-block"></span> ' + container + '</span></td>';
            samplesHtml += '<td style="padding:10px 12px;text-align:center;font-size:13px;font-weight:600">' + Math.ceil(grp.volume) + ' mL</td>';
            samplesHtml += '<td style="padding:10px 12px;text-align:center"><label style="display:flex;align-items:center;justify-content:center;gap:4px;cursor:pointer"><input type="checkbox" class="sample-collected" data-container="' + container + '" style="accent-color:var(--aqua-mint);width:18px;height:18px"> <span style="font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Collect</span></label></td>';
            samplesHtml += '</tr>';
        });
        $('#samplesTableBody').html(samplesHtml);

        var tfootHtml = '<tr><td colspan="3" style="padding:10px 12px;font-size:13px;font-weight:700;color:var(--midnight-blue);text-align:right">Total:</td>';
        tfootHtml += '<td style="padding:10px 12px;text-align:center;font-size:13px;font-weight:700;color:var(--midnight-blue)">Blood: ' + Math.ceil(totalBlood) + ' mL' + (totalUrine > 0 ? ' | Urine: ' + Math.ceil(totalUrine) + ' mL' : '') + '</td>';
        tfootHtml += '<td></td></tr>';
        $('#samplesTfoot').html(tfootHtml);

        var now = new Date();
        var timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        $('#docCollectionTime').text(timeStr);

        var labelsHtml = '';
        idx = 0;
        Object.keys(tubeGroups).forEach(function (container) {
            idx++;
            var grp = tubeGroups[container];
            var tubeColor = tubeColors[container] || '#6b7280';
            var testList = grp.tests.map(function (t) { return t.testCode || t.testName; }).join(' + ');
            labelsHtml += '<div style="border:2px dashed var(--color-border);border-radius:8px;padding:14px;background:var(--color-card)">';
            labelsHtml += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
            labelsHtml += '<span style="font-size:13px;font-weight:700;color:var(--midnight-blue)">' + order.patientName + ' | ' + (order.patientAge || '') + (order.patientGender ? '/' + order.patientGender : '') + '</span>';
            labelsHtml += '<span style="width:12px;height:12px;border-radius:50%;background:' + tubeColor + '"></span></div>';
            labelsHtml += '<div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:6px">' + (order.mrn || 'Walk-in') + '</div>';
            labelsHtml += '<div style="font-size:13px;font-weight:600;margin-bottom:6px">' + testList + ' | ' + grp.specimen + '</div>';
            labelsHtml += '<div style="padding:8px 0;text-align:center;background:rgba(0,0,0,0.04);border-radius:4px;margin-bottom:6px;font-family:monospace;font-size:14px;letter-spacing:2px">' + order.orderId + '-' + idx + '</div>';
            labelsHtml += '<div style="font-size:11px;color:var(--color-muted-foreground)">' + timeStr + ' | Collected: Ahmed Khan</div>';
            labelsHtml += '</div>';
        });
        $('#labelsPreview').html(labelsHtml);

        $('.id-check, .process-check, .sample-collected').prop('checked', false);
        $('#identityStatus').hide();
        $('input[name="veniSite"][value="Right AC"]').prop('checked', true);
        $('input[name="attempts"][value="1"]').prop('checked', true);
        $('input[name="sampleQuality"][value="Clear"]').prop('checked', true);
        $('input[name="patCondition"][value="Stable"]').prop('checked', true);
        $('#docNotes').val('');
        $('#adverseReaction').hide();
        $('#lastMealTime').val('');
        $('#fastingDuration').text('-- hours');
        $('#fastingStatus').text('').css({ background: 'transparent' });
    }

    $(document).on('change', '.id-check', function () {
        var total = $('.id-check:visible').length;
        var checked = $('.id-check:visible:checked').length;
        if (checked === total) {
            $('#identityStatus').show().text('Patient identity confirmed').css({ background: 'rgba(34,197,94,0.1)', color: '#22c55e' });
        } else {
            $('#identityStatus').show().text(checked + '/' + total + ' checks completed').css({ background: 'rgba(234,179,8,0.1)', color: '#d97706' });
        }
    });

    $('#lastMealTime').on('change', function () {
        var timeVal = $(this).val();
        if (!timeVal) return;
        var parts = timeVal.split(':');
        var mealDate = new Date();
        mealDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0);
        if (mealDate > new Date()) mealDate.setDate(mealDate.getDate() - 1);
        var diffMs = new Date() - mealDate;
        var diffHrs = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
        $('#fastingDuration').text(diffHrs + ' hours');

        if (diffHrs >= 12) {
            $('#fastingStatus').html('<i data-lucide="check-circle" style="width:14px;height:14px;display:inline;vertical-align:-2px"></i> Adequate (' + diffHrs + ' hours)').css({ background: 'rgba(34,197,94,0.1)', color: '#22c55e' });
            $('#fastingActions').hide();
        } else if (diffHrs >= 10) {
            $('#fastingStatus').html('<i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline;vertical-align:-2px"></i> Marginal (' + diffHrs + ' hours) - Proceed with note').css({ background: 'rgba(234,179,8,0.1)', color: '#d97706' });
            $('#fastingActions').hide();
        } else {
            $('#fastingStatus').html('<i data-lucide="x-circle" style="width:14px;height:14px;display:inline;vertical-align:-2px"></i> Inadequate (' + diffHrs + ' hours) - Consider rescheduling').css({ background: 'rgba(239,68,68,0.1)', color: '#ef4444' });
            $('#fastingActions').show();
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    $(document).on('change', 'input[name="patCondition"]', function () {
        if ($(this).val() === 'Fainted') {
            $('#adverseReaction').show();
        } else {
            $('#adverseReaction').hide();
        }
    });

    $(document).on('change', '.sample-collected', function () {
        if ($(this).is(':checked')) {
            $(this).closest('td').find('span').text('Collected').css({ color: '#22c55e' });
        } else {
            $(this).closest('td').find('span').text('Collect').css({ color: 'var(--color-muted-foreground)' });
        }
    });

    $('#completeCollectionBtn').on('click', function () {
        if (!currentOrder) return;
        var idChecks = $('.id-check:visible').length;
        var idChecked = $('.id-check:visible:checked').length;
        if (idChecked < idChecks) {
            HMS.toast('Please complete all patient identification checks before proceeding.', 'warning');
            return;
        }

        var samplesTotal = $('.sample-collected').length;
        var samplesChecked = $('.sample-collected:checked').length;
        if (samplesChecked < samplesTotal) {
            if (!confirm('Not all samples are marked as collected. Continue anyway?')) return;
        }

        var btn = $(this);
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Processing...');

        $.ajax({
            url: '/api/lab/collections/collect',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                orderId: currentOrder.orderId,
                collectedBy: 'Ahmed Khan',
                venipunctureSite: $('input[name="veniSite"]:checked').val(),
                attempts: parseInt($('input[name="attempts"]:checked').val()),
                sampleQuality: $('input[name="sampleQuality"]:checked').val(),
                patientCondition: $('input[name="patCondition"]:checked').val(),
                notes: $('#docNotes').val() || null,
                fastingVerified: currentOrder.fastingRequired ? ($('#fastingDuration').text() !== '-- hours') : null,
                fastingHours: currentOrder.fastingRequired ? parseFloat($('#fastingDuration').text()) : null,
                identityVerified: true
            }),
            success: function (res) {
                btn.prop('disabled', false).html('<i data-lucide="check-circle" style="width:16px;height:16px"></i> Complete Sample Collection');
                var offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('collectionPanel'));
                if (offcanvas) offcanvas.hide();

                showToast('Sample collected for ' + res.patientName + ' (' + res.orderId + ')', 'success');
                loadStats();
                loadPending();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            },
            error: function (xhr) {
                btn.prop('disabled', false).html('<i data-lucide="check-circle" style="width:16px;height:16px"></i> Complete Sample Collection');
                HMS.ajaxError(xhr, 'Failed');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    });

    $('#rejectSampleBtn').on('click', function () {
        $('#rejectReason').val('');
        $('#rejectNotes').val('');
        var modal = new bootstrap.Modal(document.getElementById('rejectModal'));
        modal.show();
    });

    $('#confirmRejectBtn').on('click', function () {
        if (!currentOrder) return;
        var reason = $('#rejectReason').val();
        if (!reason) { HMS.toast('Please select a reason.', 'warning'); return; }
        var notes = $('#rejectNotes').val();
        if (notes) reason += ' - ' + notes;

        var btn = $(this);
        btn.prop('disabled', true).text('Rejecting...');

        $.ajax({
            url: '/api/lab/collections/reject',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: JSON.stringify({
                orderId: currentOrder.orderId,
                reason: reason,
                rejectedBy: 'Ahmed Khan'
            }),
            success: function () {
                btn.prop('disabled', false).text('Confirm Rejection');
                var rejectModal = bootstrap.Modal.getInstance(document.getElementById('rejectModal'));
                if (rejectModal) rejectModal.hide();
                var offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('collectionPanel'));
                if (offcanvas) offcanvas.hide();

                showToast('Sample rejected for ' + currentOrder.orderId, 'warning');
                loadStats();
                loadPending();
            },
            error: function () {
                btn.prop('disabled', false).text('Confirm Rejection');
                HMS.toast('Failed to reject sample.', 'error');
            }
        });
    });

    $('#printLabelsBtn, #printLabelsAgain').on('click', function () {
        window.print();
    });

    $('#saveProgressBtn').on('click', function () {
        showToast('Progress saved', 'info');
    });

    function showToast(message, type) {
        var bgColor = type === 'success' ? '#22c55e' : (type === 'warning' ? '#f97316' : '#3b82f6');
        var toast = $('<div style="position:fixed;top:20px;right:20px;z-index:10000;padding:14px 24px;border-radius:10px;background:' + bgColor + ';color:#fff;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;animation:slideIn 0.3s ease">' + message + '</div>');
        $('body').append(toast);
        setTimeout(function () { toast.fadeOut(300, function () { toast.remove(); }); }, 3000);
    }

    setInterval(function () {
        loadStats();
        loadPending();
    }, 30000);
});
