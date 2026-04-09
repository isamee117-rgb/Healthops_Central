$(document).ready(function() {
    var currentReportId = null;
    var trendChartInstance = null;
    var allOrders = [];

    loadStats();
    loadReports();

    $('.sec-tab').on('click', function() {
        var sec = $(this).data('sec');
        $('.sec-tab').each(function() {
            $(this).css({
                'font-weight': '500',
                'border-color': 'var(--color-border)',
                'background': '#fff',
                'color': 'var(--color-foreground)'
            }).removeClass('active');
        });
        $(this).css({
            'font-weight': '600',
            'border-color': 'var(--aquamint)',
            'background': 'rgba(127,255,212,0.15)',
            'color': 'var(--midnight-blue)'
        }).addClass('active');
        $('.section-panel').hide();
        $('#sec' + sec.charAt(0).toUpperCase() + sec.slice(1)).show();

        if (sec === 'delivery') loadDeliveryQueue();
        if (sec === 'archive') loadArchive();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    function loadStats() {
        $.get('/api/lab-reports/stats', function(d) {
            $('#statTotalReports').text(d.totalReports || 0);
            $('#statGenToday').text(d.generatedToday || 0);
            $('#statPendingDel').text(d.pendingDelivery || 0);
            $('#statDelToday').text(d.deliveredToday || 0);
            $('#statCritical').text(d.criticalReports || 0);
            $('#statArchived').text(d.archivedReports || 0);
        });
    }

    function loadReports() {
        var params = {};
        var search = $('#searchReports').val();
        var status = $('#filterStatus').val();
        var dept = $('#filterDept').val();
        if (search) params.search = search;
        if (status) params.status = status;
        if (dept) params.department = dept;

        $.get('/api/lab-reports', params, function(data) {
            var tbody = $('#reportsBody');
            tbody.empty();

            if (!data.length) {
                $('#noReports').show();
                $('#reportsTable').hide();
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            $('#noReports').hide();
            $('#reportsTable').show();

            data.forEach(function(r) {
                var statusColor = r.status === 'Delivered' ? '#22c55e' : r.status === 'Generated' ? '#3b82f6' : '#f97316';
                var statusBg = r.status === 'Delivered' ? 'rgba(34,197,94,0.1)' : r.status === 'Generated' ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)';
                var ds = r.deliveryStatus || {};
                var delivered = Object.values(ds).filter(function(v) { return v; }).length;
                var total = Object.keys(ds).length || 6;
                var pct = Math.round((delivered / total) * 100);
                var pctColor = pct >= 80 ? '#22c55e' : pct >= 40 ? '#f97316' : '#ef4444';

                var tests = (r.testNames || []).slice(0, 2).join(', ');
                if ((r.testNames || []).length > 2) tests += ' +' + ((r.testNames || []).length - 2);

                var critBadge = r.criticalFlag ? '<span style="background:rgba(239,68,68,0.1);color:#ef4444;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;margin-left:4px">CRITICAL</span>' : '';

                tbody.append(
                    '<tr style="border-bottom:1px solid var(--color-border);cursor:pointer" class="report-row" data-id="' + r.reportId + '">' +
                    '<td style="padding:10px 12px"><span style="font-weight:600;color:var(--midnight-blue)">' + r.reportId + '</span>' + critBadge + '</td>' +
                    '<td style="padding:10px 12px">' + r.patientName + '<div style="font-size:11px;color:var(--color-muted-foreground)">' + (r.patientAge || '') + ' / ' + (r.patientGender || '') + '</div></td>' +
                    '<td style="padding:10px 12px;font-family:monospace;font-size:12px">' + r.mrn + '</td>' +
                    '<td style="padding:10px 12px;font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + (r.testNames || []).join(', ') + '">' + (tests || '-') + '</td>' +
                    '<td style="padding:10px 12px;font-size:12px">' + (r.reportDate || '-') + '</td>' +
                    '<td style="padding:10px 12px"><span style="background:' + statusBg + ';color:' + statusColor + ';padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">' + r.status + '</span></td>' +
                    '<td style="padding:10px 12px">' +
                        '<div style="display:flex;align-items:center;gap:6px">' +
                            '<div style="flex:1;height:6px;background:var(--color-border);border-radius:3px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + pctColor + ';border-radius:3px"></div></div>' +
                            '<span style="font-size:11px;color:var(--color-muted-foreground);white-space:nowrap">' + delivered + '/' + total + '</span>' +
                        '</div>' +
                    '</td>' +
                    '<td style="padding:10px 12px;text-align:center">' +
                        '<div style="display:flex;gap:4px;justify-content:center">' +
                            '<button class="btn-view-report" data-id="' + r.reportId + '" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--color-border);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center" title="View"><i data-lucide="eye" style="width:13px;height:13px;color:var(--color-foreground)"></i></button>' +
                            '<button class="btn-deliver-report" data-id="' + r.reportId + '" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--color-border);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Deliver"><i data-lucide="send" style="width:13px;height:13px;color:var(--color-foreground)"></i></button>' +
                            '<button class="btn-archive-report" data-id="' + r.reportId + '" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--color-border);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Archive"><i data-lucide="archive" style="width:13px;height:13px;color:var(--color-foreground)"></i></button>' +
                        '</div>' +
                    '</td>' +
                    '</tr>'
                );
            });

            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    var searchTimer;
    $('#searchReports').on('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadReports, 300);
    });
    $('#filterStatus, #filterDept').on('change', loadReports);

    $(document).on('click', '.btn-view-report, .report-row', function(e) {
        if ($(e.target).closest('.btn-deliver-report, .btn-archive-report').length) return;
        var id = $(this).data('id') || $(this).closest('.report-row').data('id');
        openReportPreview(id);
    });

    function openReportPreview(reportId) {
        currentReportId = reportId;
        $.get('/api/lab-reports/' + reportId, function(r) {
            var html = buildReportDocument(r);
            $('#reportPreviewContent').html(html);
            buildDeliveryStatusPanel(r);
            var panel = new bootstrap.Offcanvas(document.getElementById('reportPreviewPanel'));
            panel.show();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function buildReportDocument(r) {
        var headerHtml = '<div style="background:linear-gradient(135deg,#003366,#004488);color:#fff;padding:24px 30px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between">' +
                '<div>' +
                    '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.7;margin-bottom:4px">Department of Pathology</div>' +
                    '<div style="font-size:20px;font-weight:700;font-family:\'Roobert\',sans-serif">City Hospital, Lahore</div>' +
                    '<div style="font-size:12px;opacity:0.7;margin-top:4px">Phone: 042-XXXXXXX &nbsp;|&nbsp; Email: lab@hospital.com</div>' +
                '</div>' +
                '<div style="text-align:right">' +
                    '<div style="width:60px;height:60px;border-radius:12px;background:rgba(127,255,212,0.2);display:flex;align-items:center;justify-content:center;margin-left:auto">' +
                        '<i data-lucide="activity" style="width:30px;height:30px;color:var(--aquamint)"></i>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        var titleHtml = '<div style="background:rgba(127,255,212,0.08);padding:14px 30px;border-bottom:2px solid var(--aquamint);text-align:center">' +
            '<span style="font-size:16px;font-weight:700;color:var(--midnight-blue);letter-spacing:1px;text-transform:uppercase;font-family:\'Roobert\',sans-serif">Laboratory Report</span>' +
        '</div>';

        var patientHtml = '<div style="padding:20px 30px;border-bottom:1px solid #eee">' +
            '<div style="font-size:12px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Patient Information</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
                '<div style="font-size:13px"><span style="color:var(--color-muted-foreground)">Name:</span> <strong>' + r.patientName + '</strong></div>' +
                '<div style="font-size:13px"><span style="color:var(--color-muted-foreground)">Lab Number:</span> <strong>' + r.labOrderId + '</strong></div>' +
                '<div style="font-size:13px"><span style="color:var(--color-muted-foreground)">Age/Gender:</span> <strong>' + (r.patientAge || 'N/A') + ' / ' + (r.patientGender || 'N/A') + '</strong></div>' +
                '<div style="font-size:13px"><span style="color:var(--color-muted-foreground)">Collection Date:</span> <strong>' + (r.collectionDate || 'N/A') + '</strong></div>' +
                '<div style="font-size:13px"><span style="color:var(--color-muted-foreground)">MR Number:</span> <strong style="font-family:monospace">' + r.mrn + '</strong></div>' +
                '<div style="font-size:13px"><span style="color:var(--color-muted-foreground)">Collection Time:</span> <strong>' + (r.collectionTime || 'N/A') + '</strong></div>' +
                '<div style="font-size:13px"><span style="color:var(--color-muted-foreground)">Referred by:</span> <strong>' + (r.referredBy || 'N/A') + '</strong></div>' +
                '<div style="font-size:13px"><span style="color:var(--color-muted-foreground)">Report Date:</span> <strong>' + (r.reportDate || 'N/A') + ' ' + (r.reportTime || '') + '</strong></div>' +
            '</div>' +
        '</div>';

        var resultsHtml = '';
        (r.testResults || []).forEach(function(test) {
            resultsHtml += '<div style="padding:16px 30px;border-bottom:1px solid #eee">' +
                '<div style="font-size:13px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(127,255,212,0.3)">' + test.testName + '</div>';

            var resultData = test.resultData;
            var params = null;
            if (resultData && typeof resultData === 'object' && !Array.isArray(resultData) && resultData.parameters) {
                params = resultData.parameters;
            } else if (resultData && Array.isArray(resultData) && resultData.length > 0) {
                params = resultData;
            }
            if (params && params.length > 0) {
                resultsHtml += '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
                    '<thead><tr style="background:rgba(0,51,102,0.03)">' +
                        '<th style="text-align:left;padding:6px 10px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;border-bottom:1px solid #eee">Parameter</th>' +
                        '<th style="text-align:center;padding:6px 10px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;border-bottom:1px solid #eee">Result</th>' +
                        '<th style="text-align:center;padding:6px 10px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;border-bottom:1px solid #eee">Unit</th>' +
                        '<th style="text-align:center;padding:6px 10px;color:var(--color-muted-foreground);font-weight:600;font-size:11px;border-bottom:1px solid #eee">Reference Range</th>' +
                    '</tr></thead><tbody>';

                params.forEach(function(p) {
                    var paramName = p.parameter || p.name || 'Value';
                    var value = (p.value !== undefined && p.value !== null && p.value !== '') ? p.value : (p.result !== undefined && p.result !== null && p.result !== '' ? p.result : '-');
                    var unit = p.unit || '';
                    var range = p.refRange || p.referenceRange || p.range || '-';
                    var flag = p.flag || 'Normal';
                    var flagStyle = '';
                    var arrow = '';
                    if (flag === 'High' || flag === 'Critical High') {
                        flagStyle = 'color:#ef4444;font-weight:700';
                        arrow = ' <span style="color:#ef4444">&#8593;</span>';
                    } else if (flag === 'Low' || flag === 'Critical Low') {
                        flagStyle = 'color:#3b82f6;font-weight:700';
                        arrow = ' <span style="color:#3b82f6">&#8595;</span>';
                    }
                    var criticalBg = (flag === 'Critical High' || flag === 'Critical Low') ? 'background:rgba(239,68,68,0.05);' : '';

                    resultsHtml += '<tr style="border-bottom:1px solid #f5f5f5;' + criticalBg + '">' +
                        '<td style="padding:5px 10px">' + paramName + '</td>' +
                        '<td style="padding:5px 10px;text-align:center;' + flagStyle + '">' + value + arrow + '</td>' +
                        '<td style="padding:5px 10px;text-align:center;color:var(--color-muted-foreground)">' + unit + '</td>' +
                        '<td style="padding:5px 10px;text-align:center;color:var(--color-muted-foreground)">' + range + '</td>' +
                    '</tr>';
                });

                resultsHtml += '</tbody></table>';
            } else {
                var sts = test.status || 'Pending';
                var stColor = sts === 'Verified' ? '#22c55e' : sts === 'Entered' ? '#3b82f6' : '#f97316';
                resultsHtml += '<div style="padding:10px;text-align:center;color:var(--color-muted-foreground);font-size:12px">' +
                    '<span style="color:' + stColor + ';font-weight:600">' + sts + '</span> - Results ' + (sts === 'Pending' ? 'not yet entered' : sts === 'Entered' ? 'entered, pending verification' : 'verified') +
                '</div>';
            }

            resultsHtml += '</div>';
        });

        var legendHtml = '<div style="padding:8px 30px;background:rgba(0,51,102,0.02);border-bottom:1px solid #eee;font-size:11px;color:var(--color-muted-foreground)">' +
            '<span style="color:#ef4444">&#8593;</span> Above normal range &nbsp;&nbsp; ' +
            '<span style="color:#3b82f6">&#8595;</span> Below normal range &nbsp;&nbsp; ' +
            '<span style="background:rgba(239,68,68,0.05);padding:1px 4px;border-radius:2px">Highlighted</span> Critical value' +
        '</div>';

        var commentsHtml = '';
        if (r.pathologistComments) {
            commentsHtml = '<div style="padding:16px 30px;border-bottom:1px solid #eee">' +
                '<div style="font-size:12px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Pathologist\'s Comments</div>' +
                '<div style="font-size:13px;color:var(--color-foreground);line-height:1.6;padding:10px;background:rgba(127,255,212,0.04);border-radius:6px;border-left:3px solid var(--aquamint)">' + r.pathologistComments + '</div>' +
            '</div>';
        }

        var signatureHtml = '<div style="padding:20px 30px;border-bottom:1px solid #eee">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
                '<div>' +
                    '<div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:4px">Performed by:</div>' +
                    '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + (r.performedBy || 'N/A') + '</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground)">Lab Technician</div>' +
                '</div>' +
                '<div style="text-align:right">' +
                    '<div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:4px">Verified by:</div>' +
                    '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + (r.verifiedBy || 'N/A') + '</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground)">' + (r.verifierTitle || '') + '</div>' +
                    '<div style="font-size:11px;color:var(--color-muted-foreground)">' + (r.verifierQualifications || '') + '</div>' +
                    '<div style="margin-top:8px;border-top:1px solid #ccc;width:180px;display:inline-block;padding-top:4px;font-size:11px;color:var(--color-muted-foreground)">Signature</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        var notesHtml = '<div style="padding:16px 30px;background:rgba(0,51,102,0.02);border-bottom:1px solid #eee">' +
            '<div style="font-size:11px;font-weight:700;color:var(--midnight-blue);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Important Notes</div>' +
            '<ul style="font-size:11px;color:var(--color-muted-foreground);margin:0;padding-left:16px;line-height:1.8">' +
                '<li>Results interpreted with clinical correlation</li>' +
                '<li>Reference ranges may vary with methodology</li>' +
                '<li>Report valid for 30 days from date of issue</li>' +
                '<li>Not valid for medico-legal use unless specifically requested</li>' +
            '</ul>' +
        '</div>';

        var qrHtml = '<div style="padding:16px 30px;text-align:center">' +
            '<div style="display:inline-block;padding:12px;border:2px solid #eee;border-radius:8px">' +
                '<div style="width:80px;height:80px;background:linear-gradient(45deg,#003366 25%,transparent 25%,transparent 75%,#003366 75%),linear-gradient(45deg,#003366 25%,transparent 25%,transparent 75%,#003366 75%);background-size:20px 20px;background-position:0 0,10px 10px;border-radius:4px;margin:0 auto 6px"></div>' +
                '<div style="font-size:10px;color:var(--color-muted-foreground)">QR: ' + (r.qrCode || 'N/A') + '</div>' +
                '<div style="font-size:10px;color:var(--color-muted-foreground)">Scan to verify authenticity</div>' +
            '</div>' +
            '<div style="margin-top:12px;font-size:11px;color:var(--color-muted-foreground);font-weight:600;letter-spacing:1px">--- END OF REPORT ---</div>' +
        '</div>';

        return headerHtml + titleHtml + patientHtml + resultsHtml + legendHtml + commentsHtml + signatureHtml + notesHtml + qrHtml;
    }

    function buildDeliveryStatusPanel(r) {
        var ds = r.deliveryStatus || {};
        var channels = [
            { key: 'collected', label: 'Collect in Person', icon: 'user-check', desc: 'At counter, show receipt', time: r.collectedAt },
            { key: 'email', label: 'Email', icon: 'mail', desc: 'PDF attachment', time: r.emailSentAt },
            { key: 'sms', label: 'SMS', icon: 'smartphone', desc: 'Link to download', time: r.smsSentAt },
            { key: 'whatsapp', label: 'WhatsApp', icon: 'message-circle', desc: 'PDF + notification', time: r.whatsappSentAt },
            { key: 'courier', label: 'Courier', icon: 'truck', desc: '+charges apply', time: null },
            { key: 'portal', label: 'Patient Portal', icon: 'globe', desc: 'Login required', time: null }
        ];

        var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
        channels.forEach(function(ch) {
            var done = ds[ch.key] || false;
            var bg = done ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.01)';
            var borderColor = done ? 'rgba(34,197,94,0.3)' : 'var(--color-border)';
            var checkIcon = done ? '<i data-lucide="check-circle" style="width:14px;height:14px;color:#22c55e"></i>' : '<i data-lucide="circle" style="width:14px;height:14px;color:var(--color-muted-foreground);opacity:0.3"></i>';
            var timeStr = ch.time ? '<div style="font-size:10px;color:#22c55e;margin-top:2px">Sent: ' + ch.time + '</div>' : '';

            html += '<div style="padding:10px;border:1px solid ' + borderColor + ';border-radius:8px;background:' + bg + ';display:flex;align-items:start;gap:8px;cursor:pointer" class="delivery-channel-item" data-channel="' + ch.key + '" data-report="' + r.reportId + '">' +
                checkIcon +
                '<div>' +
                    '<div style="font-size:12px;font-weight:600;color:var(--color-foreground)">' + ch.label + '</div>' +
                    '<div style="font-size:10px;color:var(--color-muted-foreground)">' + ch.desc + '</div>' +
                    timeStr +
                '</div>' +
            '</div>';
        });
        html += '</div>';

        $('#deliveryStatusPanel').html(html);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    $(document).on('click', '.delivery-channel-item', function() {
        var channel = $(this).data('channel');
        var reportId = $(this).data('report');
        if (!confirm('Mark ' + channel + ' as delivered for ' + reportId + '?')) return;
        $.ajax({
            url: '/api/lab-reports/' + reportId + '/delivery',
            method: 'POST',
            data: { channel: channel, _token: $('meta[name="csrf-token"]').attr('content') },
            success: function() {
                openReportPreview(reportId);
                loadStats();
                loadReports();
            }
        });
    });

    $('#btnPrintReport').on('click', function() {
        if (!currentReportId) return;
        var content = $('#reportPreviewContent').html();
        var win = window.open('', '_blank');
        win.document.write('<html><head><title>Lab Report - ' + currentReportId + '</title>');
        win.document.write('<style>body{font-family:Arial,sans-serif;margin:0;padding:20px}@media print{body{padding:0}}</style>');
        win.document.write('</head><body>' + content + '</body></html>');
        win.document.close();
        win.print();

        $.ajax({
            url: '/api/lab-reports/' + currentReportId + '/print',
            method: 'POST',
            data: { _token: $('meta[name="csrf-token"]').attr('content') }
        });
    });

    $('#btnDownloadPdf').on('click', function() {
        if (!currentReportId) return;
        var content = $('#reportPreviewContent').html();
        var win = window.open('', '_blank');
        win.document.write('<html><head><title>Lab Report - ' + currentReportId + '</title>');
        win.document.write('<style>body{font-family:Arial,sans-serif;margin:0;padding:20px}@media print{body{padding:0}}</style>');
        win.document.write('</head><body>' + content + '<script>window.print();<\/script></body></html>');
        win.document.close();
    });

    $('#btnEmailReport').on('click', function() {
        if (!currentReportId) return;
        $.ajax({
            url: '/api/lab-reports/' + currentReportId + '/delivery',
            method: 'POST',
            data: { channel: 'email', _token: $('meta[name="csrf-token"]').attr('content') },
            success: function() {
                HMS.toast('Report marked as sent via email', 'success');
                openReportPreview(currentReportId);
                loadStats();
                loadReports();
            }
        });
    });

    $(document).on('click', '.btn-deliver-report', function(e) {
        e.stopPropagation();
        var reportId = $(this).data('id');
        openDeliveryModal(reportId);
    });

    function openDeliveryModal(reportId) {
        $('#deliveryReportId').val(reportId);
        $.get('/api/lab-reports/' + reportId, function(r) {
            var ds = r.deliveryStatus || {};
            var channels = [
                { key: 'collected', label: 'Collect in Person', icon: 'user-check', desc: 'At counter, show receipt' },
                { key: 'email', label: 'Email (PDF attachment)', icon: 'mail', desc: 'Send to patient email' },
                { key: 'sms', label: 'SMS (Download link)', icon: 'smartphone', desc: 'Send link to phone' },
                { key: 'whatsapp', label: 'WhatsApp (PDF + notification)', icon: 'message-circle', desc: 'Send via WhatsApp' },
                { key: 'courier', label: 'Courier (+charges)', icon: 'truck', desc: 'Physical delivery' },
                { key: 'portal', label: 'Patient Portal (login required)', icon: 'globe', desc: 'Available for download' }
            ];

            var html = '';
            channels.forEach(function(ch) {
                var done = ds[ch.key] || false;
                var bg = done ? 'rgba(34,197,94,0.06)' : '#fff';
                var border = done ? 'rgba(34,197,94,0.3)' : 'var(--color-border)';
                html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid ' + border + ';border-radius:8px;background:' + bg + ';margin-bottom:8px">' +
                    '<div style="display:flex;align-items:center;gap:10px">' +
                        '<i data-lucide="' + ch.icon + '" style="width:18px;height:18px;color:' + (done ? '#22c55e' : 'var(--color-muted-foreground)') + '"></i>' +
                        '<div><div style="font-size:13px;font-weight:600">' + ch.label + '</div><div style="font-size:11px;color:var(--color-muted-foreground)">' + ch.desc + '</div></div>' +
                    '</div>' +
                    (done ?
                        '<span style="background:rgba(34,197,94,0.1);color:#22c55e;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600"><i data-lucide="check" style="width:12px;height:12px;vertical-align:-2px;margin-right:2px"></i>Sent</span>' :
                        '<button class="btn-send-channel" data-channel="' + ch.key + '" data-report="' + reportId + '" style="padding:5px 14px;border-radius:6px;background:var(--aquamint);color:var(--midnight-blue);font-weight:600;font-size:11px;border:none;cursor:pointer">Send</button>'
                    ) +
                '</div>';
            });

            $('#deliveryChannels').html(html);
            var modal = new bootstrap.Modal(document.getElementById('deliveryModal'));
            modal.show();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    $(document).on('click', '.btn-send-channel', function() {
        var channel = $(this).data('channel');
        var reportId = $(this).data('report');
        var btn = $(this);
        btn.prop('disabled', true).text('Sending...');
        $.ajax({
            url: '/api/lab-reports/' + reportId + '/delivery',
            method: 'POST',
            data: { channel: channel, _token: $('meta[name="csrf-token"]').attr('content') },
            success: function() {
                bootstrap.Modal.getInstance(document.getElementById('deliveryModal')).hide();
                loadStats();
                loadReports();
            }
        });
    });

    $(document).on('click', '.btn-archive-report', function(e) {
        e.stopPropagation();
        var id = $(this).data('id');
        if (!confirm('Archive report ' + id + '?')) return;
        $.ajax({
            url: '/api/lab-reports/' + id + '/archive',
            method: 'POST',
            data: { _token: $('meta[name="csrf-token"]').attr('content') },
            success: function() {
                loadStats();
                loadReports();
            }
        });
    });

    $('#btnGenerateReport').on('click', function() {
        loadOrdersForGeneration();
        var modal = new bootstrap.Modal(document.getElementById('generateModal'));
        modal.show();
    });

    function loadOrdersForGeneration() {
        $.get('/api/lab/orders', function(data) {
            allOrders = data;
            var sel = $('#genOrderId');
            sel.find('option:not(:first)').remove();
            data.forEach(function(o) {
                sel.append('<option value="' + o.orderId + '">' + o.orderId + ' - ' + o.patientName + ' (' + o.mrn + ') - ' + (o.testNames || []).join(', ') + '</option>');
            });
        });
    }

    $('#genOrderId').on('change', function() {
        var orderId = $(this).val();
        if (!orderId) {
            $('#genOrderPreview').hide();
            return;
        }
        var order = allOrders.find(function(o) { return o.orderId === orderId; });
        if (order) {
            $('#genOrderPreview').show().html(
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">' +
                    '<div><span style="color:var(--color-muted-foreground)">Patient:</span> <strong>' + order.patientName + '</strong></div>' +
                    '<div><span style="color:var(--color-muted-foreground)">MRN:</span> <strong>' + order.mrn + '</strong></div>' +
                    '<div><span style="color:var(--color-muted-foreground)">Dept:</span> <strong>' + (order.sourceDepartment || '-') + '</strong></div>' +
                    '<div><span style="color:var(--color-muted-foreground)">Priority:</span> <strong>' + (order.priority || '-') + '</strong></div>' +
                    '<div style="grid-column:span 2"><span style="color:var(--color-muted-foreground)">Tests:</span> <strong>' + (order.testNames || []).join(', ') + '</strong></div>' +
                '</div>'
            );
        }
    });

    $('#btnSubmitGenerate').on('click', function() {
        var orderId = $('#genOrderId').val();
        if (!orderId) {
            HMS.toast('Please select a lab order', 'warning');
            return;
        }
        var btn = $(this);
        btn.prop('disabled', true);
        $.ajax({
            url: '/api/lab-reports/generate',
            method: 'POST',
            data: {
                lab_order_id: orderId,
                performed_by: $('#genPerformedBy').val(),
                verified_by: $('#genVerifiedBy').val(),
                verifier_title: $('#genVerifierTitle').val(),
                verifier_qualifications: $('#genVerifierQual').val(),
                pathologist_comments: $('#genComments').val(),
                _token: $('meta[name="csrf-token"]').attr('content')
            },
            success: function(res) {
                bootstrap.Modal.getInstance(document.getElementById('generateModal')).hide();
                loadStats();
                loadReports();
                openReportPreview(res.reportId);
            },
            error: function(xhr) {
                HMS.ajaxError(xhr, 'Error generating report');
                btn.prop('disabled', false);
            }
        });
    });

    $('#btnLoadCumulative').on('click', function() {
        var mrn = $('#cumulativeMrn').val().trim();
        if (!mrn) {
            HMS.toast('Please enter a MRN', 'warning');
            return;
        }
        loadCumulativeReport(mrn);
    });

    function loadCumulativeReport(mrn) {
        $.get('/api/lab-reports/cumulative/' + mrn, function(data) {
            if (!data.totalReports) {
                $('#cumulativeContent').hide();
                $('#noCumulative').show().html(
                    '<i data-lucide="file-x" style="width:48px;height:48px;margin-bottom:12px;opacity:0.3"></i>' +
                    '<p style="font-size:14px;margin:0">No reports found for MRN: ' + mrn + '</p>'
                );
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            $('#noCumulative').hide();
            $('#cumulativeContent').show();

            $('#cumulativePatientInfo').html(
                '<div style="display:flex;align-items:center;justify-content:space-between">' +
                    '<div>' +
                        '<div style="font-size:16px;font-weight:700;color:var(--color-foreground);font-family:\'Roobert\',sans-serif">' + data.patientName + '</div>' +
                        '<div style="font-size:12px;color:var(--color-muted-foreground);margin-top:2px">MRN: ' + data.mrn + '</div>' +
                    '</div>' +
                    '<div style="text-align:right">' +
                        '<div style="font-size:22px;font-weight:700;color:var(--aquamint);font-family:\'Roobert\',sans-serif">' + data.totalReports + '</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground)">Total Reports</div>' +
                        '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">' + (data.dateRange.from || '') + ' - ' + (data.dateRange.to || '') + '</div>' +
                    '</div>' +
                '</div>'
            );

            var listHtml = '<div style="font-size:13px;font-weight:700;color:var(--color-foreground);margin-bottom:10px;font-family:\'Roobert\',sans-serif">Report History</div>';
            (data.reports || []).forEach(function(rpt) {
                var stColor = rpt.status === 'Delivered' ? '#22c55e' : '#3b82f6';
                listHtml += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;margin-bottom:6px;cursor:pointer" class="cumulative-report-item" data-id="' + rpt.reportId + '">' +
                    '<div style="display:flex;align-items:center;gap:10px">' +
                        '<i data-lucide="file-text" style="width:16px;height:16px;color:var(--aquamint)"></i>' +
                        '<div>' +
                            '<div style="font-size:13px;font-weight:600">' + rpt.reportId + '</div>' +
                            '<div style="font-size:11px;color:var(--color-muted-foreground)">' + (rpt.testNames || []).join(', ') + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="text-align:right">' +
                        '<div style="font-size:12px;color:var(--color-muted-foreground)">' + (rpt.reportDate || '') + '</div>' +
                        '<span style="color:' + stColor + ';font-size:11px;font-weight:600">' + rpt.status + '</span>' +
                    '</div>' +
                '</div>';
            });
            $('#cumulativeReportsList').html(listHtml);

            buildTrendChart(data.testTrends || {});
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    $(document).on('click', '.cumulative-report-item', function() {
        openReportPreview($(this).data('id'));
    });

    function buildTrendChart(trends) {
        if (trendChartInstance) trendChartInstance.destroy();
        var ctx = document.getElementById('trendChart');
        if (!ctx) return;

        var datasets = [];
        var labels = [];
        var colors = ['#003366', '#7FFFD4', '#ef4444', '#3b82f6', '#f97316', '#a855f7', '#22c55e', '#eab308'];
        var colorIdx = 0;

        Object.keys(trends).forEach(function(testName) {
            var entries = trends[testName];
            if (!entries.length) return;

            var paramGroups = {};
            entries.forEach(function(e) {
                if (!paramGroups[e.parameter]) paramGroups[e.parameter] = [];
                paramGroups[e.parameter].push(e);
            });

            Object.keys(paramGroups).forEach(function(param) {
                var pts = paramGroups[param];
                pts.forEach(function(pt) {
                    if (labels.indexOf(pt.date) === -1) labels.push(pt.date);
                });
                datasets.push({
                    label: testName + ' - ' + param,
                    data: pts.map(function(pt) { return { x: pt.date, y: pt.value }; }),
                    borderColor: colors[colorIdx % colors.length],
                    backgroundColor: colors[colorIdx % colors.length] + '20',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 4,
                });
                colorIdx++;
            });
        });

        if (!datasets.length) {
            $('#trendSection').hide();
            return;
        }
        $('#trendSection').show();

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11 }, usePointStyle: true } }
                },
                scales: {
                    y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function loadDeliveryQueue() {
        $.get('/api/lab-reports/delivery-queue', function(data) {
            if (!data.length) {
                $('#deliveryQueue').hide();
                $('#noDelivery').show();
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            $('#noDelivery').hide();
            var html = '';
            data.forEach(function(r) {
                var ds = r.deliveryStatus || {};
                var pending = r.pendingChannels || [];
                var critBadge = r.criticalFlag ? '<span style="background:rgba(239,68,68,0.1);color:#ef4444;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;margin-left:6px">CRITICAL</span>' : '';
                var priColor = r.priority === 'STAT' ? '#ef4444' : r.priority === 'Urgent' ? '#f97316' : '#22c55e';

                var channelIcons = '';
                var allChannels = ['email', 'sms', 'whatsapp', 'collected', 'courier', 'portal'];
                allChannels.forEach(function(ch) {
                    var done = ds[ch] || false;
                    var icon = ch === 'email' ? 'mail' : ch === 'sms' ? 'smartphone' : ch === 'whatsapp' ? 'message-circle' : ch === 'collected' ? 'user-check' : ch === 'courier' ? 'truck' : 'globe';
                    channelIcons += '<div style="width:28px;height:28px;border-radius:6px;border:1px solid ' + (done ? 'rgba(34,197,94,0.3)' : 'var(--color-border)') + ';background:' + (done ? 'rgba(34,197,94,0.06)' : '#fff') + ';display:flex;align-items:center;justify-content:center" title="' + ch + ' - ' + (done ? 'Sent' : 'Pending') + '">' +
                        '<i data-lucide="' + icon + '" style="width:13px;height:13px;color:' + (done ? '#22c55e' : 'var(--color-muted-foreground)') + '"></i>' +
                    '</div>';
                });

                html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid var(--color-border);border-radius:10px;margin-bottom:8px;background:#fff">' +
                    '<div style="display:flex;align-items:center;gap:12px;flex:1">' +
                        '<div style="width:4px;height:40px;border-radius:2px;background:' + priColor + '"></div>' +
                        '<div>' +
                            '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + r.reportId + critBadge + '</div>' +
                            '<div style="font-size:12px;color:var(--color-muted-foreground)">' + r.patientName + ' (' + r.mrn + ')</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:6px;margin-right:16px">' + channelIcons + '</div>' +
                    '<div style="display:flex;gap:6px">' +
                        '<button class="btn-view-report" data-id="' + r.reportId + '" style="padding:5px 12px;border-radius:6px;border:1px solid var(--color-border);background:#fff;cursor:pointer;font-size:11px;font-weight:500">View</button>' +
                        '<button class="btn-deliver-report" data-id="' + r.reportId + '" style="padding:5px 12px;border-radius:6px;background:var(--aquamint);color:var(--midnight-blue);font-weight:600;font-size:11px;border:none;cursor:pointer">Deliver</button>' +
                    '</div>' +
                '</div>';
            });

            $('#deliveryQueue').html(html).show();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function loadArchive() {
        $.get('/api/lab-reports', { archived: true }, function(data) {
            var tbody = $('#archiveBody');
            tbody.empty();

            if (!data.length) {
                $.get('/api/lab-reports', function(allData) {
                    tbody.empty();
                    if (!allData.length) {
                        $('#noArchive').show();
                        $('#archiveTable').hide();
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                        return;
                    }

                    $('#noArchive').hide();
                    $('#archiveTable').show();
                    allData.forEach(function(r) { appendArchiveRow(tbody, r); });
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                });
                return;
            }

            $('#noArchive').hide();
            $('#archiveTable').show();
            data.forEach(function(r) { appendArchiveRow(tbody, r); });
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function appendArchiveRow(tbody, r) {
        var tests = (r.testNames || []).slice(0, 2).join(', ');
        if ((r.testNames || []).length > 2) tests += ' +' + ((r.testNames || []).length - 2);

        tbody.append(
            '<tr style="border-bottom:1px solid var(--color-border)">' +
            '<td style="padding:10px 12px;font-weight:600;color:var(--midnight-blue)">' + r.reportId + (r.isArchived ? ' <span style="background:rgba(168,85,247,0.1);color:#a855f7;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">Archived</span>' : '') + '</td>' +
            '<td style="padding:10px 12px">' + r.patientName + '</td>' +
            '<td style="padding:10px 12px;font-family:monospace;font-size:12px">' + r.mrn + '</td>' +
            '<td style="padding:10px 12px;font-size:12px">' + (tests || '-') + '</td>' +
            '<td style="padding:10px 12px;font-size:12px">' + (r.reportDate || '-') + '</td>' +
            '<td style="padding:10px 12px"><span style="font-size:11px;color:var(--color-muted-foreground)">5 years</span></td>' +
            '<td style="padding:10px 12px;text-align:center">' +
                '<div style="display:flex;gap:4px;justify-content:center">' +
                    '<button class="btn-view-report" data-id="' + r.reportId + '" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--color-border);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center" title="View/Re-print"><i data-lucide="eye" style="width:13px;height:13px;color:var(--color-foreground)"></i></button>' +
                    '<button class="btn-view-report" data-id="' + r.reportId + '" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--color-border);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Export PDF"><i data-lucide="download" style="width:13px;height:13px;color:var(--color-foreground)"></i></button>' +
                '</div>' +
            '</td>' +
            '</tr>'
        );
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
});
