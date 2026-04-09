$(document).ready(function () {
    let testCatalog = [];
    let testPackages = [];
    let cart = [];
    let selectedPatient = null;
    let selectedModule = null;
    let selectedVisit = null;
    let currentCategory = 'all';

    loadTestCatalog();
    loadTestPackages();

    function loadTestCatalog() {
        $.get('/api/lab/tests/catalog', function (data) {
            testCatalog = data;
            renderTests();
            renderCategoryButtons();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function loadTestPackages() {
        $.get('/api/lab/tests/packages', function (data) {
            testPackages = data;
            renderPackages();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function renderCategoryButtons() {
        var depts = {};
        testCatalog.forEach(function (t) {
            if (t.department) depts[t.department] = (depts[t.department] || 0) + 1;
        });
        var html = '<button class="cat-btn active" data-cat="all" style="padding:8px 14px;border-radius:20px;border:1px solid var(--aqua-mint);background:rgba(127,255,212,0.15);color:var(--aqua-mint);font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px"><i data-lucide="layout-grid" style="width:13px;height:13px"></i> All Tests</button>';
        Object.keys(depts).sort().forEach(function (dept) {
            html += '<button class="cat-btn" data-cat="' + dept + '" style="padding:8px 14px;border-radius:20px;border:1px solid var(--color-border);background:transparent;font-size:12px;font-weight:600;cursor:pointer">' + dept + '</button>';
        });
        $('#categoryButtons').html(html);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    $('input[name="patientType"]').on('change', function () {
        var val = $(this).val();
        if (val === 'existing') {
            $('#existingPatientPanel').show();
            $('#newPatientPanel').hide();
            $('#radioExisting').css({ border: '2px solid var(--aqua-mint)', background: 'rgba(127,255,212,0.08)' });
            $('#radioNewWalkin').css({ border: '2px solid var(--color-border)', background: 'transparent' });
        } else {
            $('#existingPatientPanel').hide();
            $('#newPatientPanel').show();
            $('#radioNewWalkin').css({ border: '2px solid var(--aqua-mint)', background: 'rgba(127,255,212,0.08)' });
            $('#radioExisting').css({ border: '2px solid var(--color-border)', background: 'transparent' });
            resetExistingPatientFlow();
        }
    });

    function resetExistingPatientFlow() {
        selectedPatient = null;
        selectedModule = null;
        selectedVisit = null;
        $('.module-btn').css({ border: '2px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)' });
        $('#patientSearchArea').hide();
        $('#patientSearch').val('');
        $('#patientSearchResults').hide().empty();
        $('#selectedPatientCard').hide().empty();
        $('#visitSelectionArea').hide().empty();
        $('#investigationResults').hide().empty();
        $('#rxDoctorName').val('');
        updateRegistrationButton();
    }

    $(document).on('click', '.module-btn', function () {
        var mod = $(this).data('module');
        selectedModule = mod;
        selectedPatient = null;
        selectedVisit = null;

        $('.module-btn').css({ border: '2px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)' });
        $(this).css({ border: '2px solid var(--aqua-mint)', background: 'rgba(127,255,212,0.08)', color: 'var(--midnight-blue)' });

        $('#patientSearchArea').show();
        $('#patientSearch').val('').focus();
        $('#patientSearchResults').hide().empty();
        $('#selectedPatientCard').hide().empty();
        $('#visitSelectionArea').hide().empty();
        $('#investigationResults').hide().empty();
        $('#rxDoctorName').val('');
        updateRegistrationButton();
    });

    var searchTimer;
    $('#patientSearch').on('input', function () {
        clearTimeout(searchTimer);
        var q = $(this).val().trim();
        if (q.length < 2) { $('#patientSearchResults').hide(); return; }
        searchTimer = setTimeout(function () {
            $.get('/api/patients?search=' + encodeURIComponent(q), function (data) {
                var patients = data.data || data;
                if (!patients || patients.length === 0) {
                    $('#patientSearchResults').html('<div style="padding:12px;color:var(--color-muted-foreground);font-size:13px;text-align:center">No patients found</div>').show();
                    return;
                }
                var html = '';
                patients.slice(0, 6).forEach(function (p) {
                    html += '<div class="patient-result" data-mrn="' + p.mrn + '" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center;transition:background 0.15s">';
                    html += '<div><span style="font-weight:600;font-size:14px">' + esc(p.name) + '</span>';
                    html += '<span style="margin-left:8px;font-size:12px;color:var(--color-muted-foreground)">' + p.mrn + '</span>';
                    html += '<div style="font-size:12px;color:var(--color-muted-foreground)">' + (p.age || '') + (p.gender ? ' / ' + p.gender : '') + (p.phone ? ' | ' + p.phone : '') + '</div></div>';
                    html += '<i data-lucide="chevron-right" style="width:16px;height:16px;color:var(--color-muted-foreground)"></i></div>';
                });
                $('#patientSearchResults').html(html).show();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        }, 300);
    });

    $(document).on('click', '.patient-result', function () {
        var mrn = $(this).data('mrn');
        $.get('/api/patients/' + mrn, function (p) {
            selectedPatient = p;
            selectedVisit = null;

            var genderLabel = p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : p.gender || '';
            $('#selectedPatientCard').html(
                '<div style="margin-top:12px;padding:12px 16px;background:rgba(127,255,212,0.08);border:1px solid var(--aqua-mint);border-radius:8px;display:flex;justify-content:space-between;align-items:center">' +
                '<div><div style="font-weight:700;font-size:15px;color:var(--midnight-blue)">' + esc(p.name) + ' <span style="font-size:12px;color:var(--aqua-mint);font-weight:600">' + p.mrn + '</span></div>' +
                '<div style="font-size:13px;color:var(--color-muted-foreground)">' + (p.age || '') + ' yrs | ' + genderLabel + (p.phone ? ' | ' + p.phone : '') + '</div></div>' +
                '<button class="clearPatient" style="padding:4px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--color-card)">Change</button></div>'
            ).show();
            $('#patientSearchResults').hide();
            $('#patientSearch').val('');

            loadVisitsForPatient();
            updateRegistrationButton();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });

    $(document).on('click', '.clearPatient', function () {
        selectedPatient = null;
        selectedVisit = null;
        $('#selectedPatientCard').hide().empty();
        $('#patientSearch').val('').focus();
        $('#visitSelectionArea').hide().empty();
        $('#investigationResults').hide().empty();
        $('#rxDoctorName').val('');
        updateRegistrationButton();
    });

    function loadVisitsForPatient() {
        if (!selectedPatient || !selectedModule) return;

        var apiUrl = selectedModule === 'OPD' ? '/api/opd/visits' : '/api/emergency/visits';

        $('#visitSelectionArea').html(
            '<div style="margin-top:12px;padding:12px;text-align:center;color:var(--color-muted-foreground);font-size:13px">' +
            '<i data-lucide="loader" style="width:16px;height:16px;display:inline;vertical-align:-2px;animation:spin 1s linear infinite"></i> Loading visits...</div>'
        ).show();
        if (typeof lucide !== 'undefined') lucide.createIcons();

        $.get(apiUrl, function (data) {
            var allVisits = data.data || data;
            var visits = allVisits.filter(function (v) {
                return v.mrn === selectedPatient.mrn;
            });

            var html = '<div style="margin-top:12px">';
            html += '<label style="font-size:12px;font-weight:700;color:var(--midnight-blue);margin-bottom:6px;display:block">';
            html += '<i data-lucide="file-text" style="width:13px;height:13px;display:inline;vertical-align:-2px;margin-right:4px"></i> ' + selectedModule + ' Visits (' + visits.length + ')</label>';

            if (visits.length === 0) {
                html += '<div style="padding:14px;text-align:center;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">';
                html += '<i data-lucide="inbox" style="width:20px;height:20px;display:block;margin:0 auto 6px;opacity:0.4"></i>';
                html += 'No ' + selectedModule + ' visits found for this patient</div>';
            } else {
                html += '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--color-border);border-radius:8px">';
                visits.forEach(function (v) {
                    var visitId = v.visitId || v.visit_id;
                    var dt = v.consultationDate || v.visitDate || v.createdAt || '';
                    if (dt) dt = new Date(dt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    var doctor = v.doctorName || v.doctor_name || '';
                    var dept = v.department || '';
                    var status = v.status || '';
                    var statusColor = status === 'Active' ? '#22c55e' : 'var(--color-muted-foreground)';

                    html += '<div class="visit-option" data-visit-id="' + visitId + '" data-doctor="' + esc(doctor) + '" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--color-border);transition:background 0.15s;display:flex;justify-content:space-between;align-items:center">';
                    html += '<div style="flex:1;min-width:0">';
                    html += '<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:600;font-size:13px;color:var(--color-foreground)">' + visitId + '</span>';
                    html += '<span style="font-size:10px;font-weight:600;color:' + statusColor + ';padding:2px 6px;border:1px solid ' + statusColor + ';border-radius:4px">' + status + '</span></div>';
                    html += '<div style="font-size:11px;color:var(--color-muted-foreground);margin-top:2px">' + dt;
                    if (doctor) html += ' &middot; Dr. ' + esc(doctor);
                    if (dept) html += ' &middot; ' + esc(dept);
                    html += '</div></div>';
                    html += '<i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--color-muted-foreground)"></i>';
                    html += '</div>';
                });
                html += '</div>';
            }
            html += '</div>';

            $('#visitSelectionArea').html(html).show();
            $('#investigationResults').hide().empty();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    $(document).on('click', '.visit-option', function () {
        var visitId = $(this).data('visit-id');
        var doctor = $(this).data('doctor');
        selectedVisit = visitId;

        $('.visit-option').css({ background: 'transparent' });
        $(this).css({ background: 'rgba(127,255,212,0.1)' });

        if (doctor) {
            $('#rxDoctorName').val('Dr. ' + doctor);
        }

        fetchInvestigations(visitId);
    });

    function fetchInvestigations(visitId) {
        $('#investigationResults').html(
            '<div style="margin-top:10px;padding:12px;text-align:center;color:var(--color-muted-foreground);font-size:13px">' +
            '<i data-lucide="loader" style="width:16px;height:16px;display:inline;vertical-align:-2px;animation:spin 1s linear infinite"></i> Fetching lab orders...</div>'
        ).show();
        if (typeof lucide !== 'undefined') lucide.createIcons();

        $.get('/api/lab/visit-investigations', { visitId: visitId, module: selectedModule }, function (data) {
            var investigations = data.investigations || [];
            var doctor = data.doctor || '';

            if (investigations.length === 0) {
                $('#investigationResults').html(
                    '<div style="margin-top:10px;padding:14px;border:1px dashed var(--color-border);border-radius:8px;text-align:center;color:var(--color-muted-foreground);font-size:13px">' +
                    '<i data-lucide="info" style="width:16px;height:16px;display:inline;vertical-align:-2px;margin-right:4px;opacity:0.5"></i> No laboratory investigation orders found for this visit</div>'
                ).show();
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            if (doctor) {
                $('#rxDoctorName').val('Dr. ' + doctor);
            }

            var html = '<div style="margin-top:10px">';
            html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
            html += '<label style="font-size:12px;font-weight:700;color:var(--aqua-mint)"><i data-lucide="flask-conical" style="width:13px;height:13px;display:inline;vertical-align:-2px;margin-right:4px"></i> Doctor\'s Lab Orders (' + investigations.length + ')</label>';
            html += '<button id="addAllInvestigations" style="padding:5px 12px;border:none;border-radius:6px;font-size:11px;font-weight:600;background:var(--midnight-blue);color:#fff;cursor:pointer;display:flex;align-items:center;gap:4px"><i data-lucide="plus-circle" style="width:12px;height:12px"></i> Add All to Cart</button>';
            html += '</div>';
            html += '<div style="border:1px solid var(--color-border);border-radius:8px;overflow:hidden">';

            investigations.forEach(function (inv, idx) {
                var testName = inv.test || '';
                var priority = inv.priority || 'Routine';
                var testCode = inv.testCode || '';
                var invPrice = inv.price || 0;
                var matched = findTestInCatalog(testName, testCode);
                var prioColor = priority === 'STAT' ? '#ef4444' : (priority === 'Urgent' ? '#f59e0b' : 'var(--color-muted-foreground)');

                html += '<div class="inv-item" data-idx="' + idx + '" data-test-name="' + esc(testName) + '" data-test-code="' + esc(testCode) + '" data-matched-id="' + (matched ? matched.id : '') + '" style="padding:10px 14px;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center">';
                html += '<div style="flex:1;min-width:0">';
                html += '<div style="font-size:13px;font-weight:600;color:var(--color-foreground)">' + esc(testName) + '</div>';
                html += '<div style="font-size:11px;color:var(--color-muted-foreground);display:flex;gap:8px;margin-top:2px">';
                html += '<span style="color:' + prioColor + ';font-weight:600;text-transform:uppercase">' + esc(priority) + '</span>';
                if (matched) {
                    html += '<span>PKR ' + matched.price.toLocaleString() + '</span>';
                    html += '<span>' + esc(matched.department) + '</span>';
                } else if (invPrice) {
                    html += '<span>PKR ' + Number(invPrice).toLocaleString() + '</span>';
                }
                html += '</div></div>';
                if (matched) {
                    var inCart = cart.find(function (c) { return c.testId === matched.id; });
                    if (inCart) {
                        html += '<span style="font-size:11px;font-weight:600;color:var(--aqua-mint);padding:4px 10px;border:1px solid var(--aqua-mint);border-radius:6px">In Cart</span>';
                    } else {
                        html += '<button class="add-inv-to-cart" data-test-id="' + matched.id + '" style="padding:4px 10px;border:none;border-radius:6px;font-size:11px;font-weight:600;background:rgba(127,255,212,0.15);color:var(--aqua-mint);cursor:pointer">+ Add</button>';
                    }
                } else {
                    html += '<span style="font-size:11px;color:#f59e0b;padding:4px 10px;border:1px solid #f59e0b;border-radius:6px">Not in catalog</span>';
                }
                html += '</div>';
            });

            html += '</div></div>';
            $('#investigationResults').html(html).show();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function findTestInCatalog(testName, testCode) {
        if (testCode) {
            var byCode = testCatalog.find(function (t) { return t.id === testCode || t.code === testCode; });
            if (byCode) return byCode;
        }
        if (!testName) return null;
        var nameLower = testName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return testCatalog.find(function (t) {
            var catNameLower = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            var catCodeLower = (t.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return catNameLower === nameLower || catCodeLower === nameLower ||
                   catNameLower.indexOf(nameLower) > -1 || nameLower.indexOf(catNameLower) > -1;
        });
    }

    function esc(s) { return $('<span>').text(s || '').html(); }

    $(document).on('click', '.add-inv-to-cart', function () {
        var testId = $(this).data('test-id');
        addToCart(testId);
        if (selectedVisit) fetchInvestigations(selectedVisit);
    });

    $(document).on('click', '#addAllInvestigations', function () {
        $('.inv-item').each(function () {
            var matchedId = $(this).data('matched-id');
            if (matchedId && !cart.find(function (c) { return c.testId === matchedId; })) {
                addToCartSilent(matchedId);
            }
        });
        updateCart();
        if (selectedVisit) fetchInvestigations(selectedVisit);
    });

    function renderPackages() {
        var html = '';
        var filteredPkgs = testPackages;
        if (currentCategory !== 'all') {
            filteredPkgs = testPackages.filter(function (p) { return p.category === currentCategory; });
        }
        var searchQ = $('#testSearch').val() ? $('#testSearch').val().toLowerCase().trim() : '';
        if (searchQ) {
            filteredPkgs = filteredPkgs.filter(function (p) {
                return p.name.toLowerCase().includes(searchQ) || (p.description || '').toLowerCase().includes(searchQ);
            });
        }

        if (filteredPkgs.length === 0) {
            html = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-muted-foreground)"><p>No packages found for this category</p></div>';
        }

        filteredPkgs.forEach(function (pkg) {
            var testNames = pkg.tests.map(function (tid) {
                var t = testCatalog.find(function (tc) { return tc.id === tid; });
                return t ? t.name : tid;
            });
            var inCart = pkg.tests.every(function (tid) { return cart.find(function (c) { return c.testId === tid; }); });
            var savings = pkg.originalPrice - pkg.price;
            html += '<div class="pkg-card" style="border:1px solid var(--color-border);border-radius:10px;padding:16px;background:var(--color-card);transition:border-color 0.2s;cursor:pointer">';
            html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
            html += '<h6 style="margin:0;font-size:14px;font-weight:700;color:var(--midnight-blue)">' + esc(pkg.name) + '</h6>';
            html += '<div style="text-align:right"><div style="font-size:16px;font-weight:700;color:var(--midnight-blue)">PKR ' + pkg.price.toLocaleString() + '</div>';
            if (savings > 0) html += '<div style="font-size:11px;color:#ef4444;text-decoration:line-through">PKR ' + pkg.originalPrice.toLocaleString() + '</div>';
            html += '</div></div>';
            html += '<div style="margin-bottom:10px">';
            testNames.forEach(function (tn) {
                html += '<div style="font-size:12px;color:var(--color-muted-foreground);padding:2px 0"><span style="color:var(--aqua-mint);margin-right:4px">+</span> ' + esc(tn) + '</div>';
            });
            html += '</div>';
            html += '<div style="display:flex;gap:12px;font-size:11px;color:var(--color-muted-foreground);margin-bottom:12px">';
            html += '<span><i data-lucide="droplet" style="width:11px;height:11px;display:inline;vertical-align:-1px"></i> ' + esc(pkg.sampleTypes) + '</span>';
            html += '<span><i data-lucide="clock" style="width:11px;height:11px;display:inline;vertical-align:-1px"></i> ' + esc(pkg.resultsIn) + '</span>';
            if (pkg.fasting !== 'Not required') html += '<span><i data-lucide="utensils" style="width:11px;height:11px;display:inline;vertical-align:-1px"></i> Fast: ' + esc(pkg.fasting) + '</span>';
            html += '</div>';
            if (inCart) {
                html += '<button disabled style="width:100%;padding:8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;font-weight:600;background:rgba(127,255,212,0.1);color:var(--aqua-mint);cursor:default">Already in Cart</button>';
            } else {
                html += '<button class="addPkgBtn" data-pkg="' + pkg.id + '" style="width:100%;padding:8px;border:none;border-radius:6px;font-size:12px;font-weight:600;background:var(--midnight-blue);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px"><i data-lucide="plus" style="width:13px;height:13px"></i> Add Package</button>';
            }
            if (savings > 0) html += '<div style="text-align:center;margin-top:6px;font-size:11px;color:#22c55e;font-weight:600">Save PKR ' + savings.toLocaleString() + '</div>';
            html += '</div>';
        });
        $('#packagesGrid').html(html);
    }

    function renderTests() {
        var searchQ = $('#testSearch').val() ? $('#testSearch').val().toLowerCase().trim() : '';
        var filtered = testCatalog;
        if (currentCategory !== 'all') {
            filtered = testCatalog.filter(function (t) { return t.department === currentCategory || t.category === currentCategory; });
        }
        if (searchQ) {
            filtered = filtered.filter(function (t) {
                return t.name.toLowerCase().includes(searchQ) || t.code.toLowerCase().includes(searchQ) || t.category.toLowerCase().includes(searchQ);
            });
        }

        var html = '';
        if (filtered.length === 0) {
            html = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-muted-foreground)"><p>No tests found</p></div>';
        }
        filtered.forEach(function (t) {
            var inCart = cart.find(function (c) { return c.testId === t.id; });
            html += '<div class="test-card" data-id="' + t.id + '" style="border:1px solid ' + (inCart ? 'var(--aqua-mint)' : 'var(--color-border)') + ';border-radius:10px;padding:14px;background:var(--color-card);cursor:pointer;transition:all 0.2s;position:relative">';
            if (inCart) html += '<div style="position:absolute;top:8px;right:8px;width:20px;height:20px;border-radius:50%;background:var(--aqua-mint);display:flex;align-items:center;justify-content:center"><i data-lucide="check" style="width:12px;height:12px;color:var(--midnight-blue)"></i></div>';
            html += '<h6 style="margin:0 0 4px;font-size:13px;font-weight:700;color:var(--color-foreground);padding-right:24px">' + esc(t.name) + '</h6>';
            html += '<div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:10px">' + esc(t.department) + '</div>';
            html += '<div style="display:flex;flex-direction:column;gap:4px;font-size:12px;margin-bottom:10px">';
            html += '<div style="color:var(--midnight-blue);font-weight:700;font-size:15px">PKR ' + t.price.toLocaleString() + '</div>';
            html += '<div style="color:var(--color-muted-foreground)"><i data-lucide="clock" style="width:11px;height:11px;display:inline;vertical-align:-1px"></i> Results: ' + esc(t.tat) + '</div>';
            html += '<div style="color:var(--color-muted-foreground)"><i data-lucide="droplet" style="width:11px;height:11px;display:inline;vertical-align:-1px"></i> ' + esc(t.specimen) + '</div>';
            if (t.fasting) html += '<div style="color:#d97706;font-weight:600"><i data-lucide="utensils" style="width:11px;height:11px;display:inline;vertical-align:-1px"></i> Fasting: ' + (t.fastingHours || 8) + ' hrs required</div>';
            else html += '<div style="color:#22c55e"><i data-lucide="check-circle" style="width:11px;height:11px;display:inline;vertical-align:-1px"></i> No fasting</div>';
            html += '</div>';
            if (inCart) {
                html += '<button disabled style="width:100%;padding:6px;border:1px solid var(--aqua-mint);border-radius:6px;font-size:11px;font-weight:600;background:rgba(127,255,212,0.1);color:var(--aqua-mint)">In Cart</button>';
            } else {
                html += '<button class="addTestBtn" data-id="' + t.id + '" style="width:100%;padding:6px;border:none;border-radius:6px;font-size:11px;font-weight:600;background:var(--midnight-blue);color:#fff;cursor:pointer">+ Add to Cart</button>';
            }
            html += '</div>';
        });
        $('#testsGrid').html(html);
    }

    $(document).on('click', '.cat-btn', function () {
        $('.cat-btn').removeClass('active').css({ border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-foreground)' });
        $(this).addClass('active').css({ border: '1px solid var(--aqua-mint)', background: 'rgba(127,255,212,0.15)', color: 'var(--aqua-mint)' });
        currentCategory = $(this).data('cat');
        renderPackages();
        renderTests();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    $('#viewPackages, #viewIndividual').on('click', function () {
        $('.view-toggle').removeClass('active').css({ background: 'transparent', color: 'var(--color-foreground)' });
        $(this).addClass('active').css({ background: 'var(--midnight-blue)', color: '#fff' });
        if ($(this).attr('id') === 'viewPackages') {
            $('#packagesView').show();
            $('#individualView').hide();
        } else {
            $('#packagesView').hide();
            $('#individualView').show();
        }
    });

    $('#testSearch').on('input', function () {
        renderPackages();
        renderTests();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    $(document).on('click', '.addTestBtn', function (e) {
        e.stopPropagation();
        addToCart($(this).data('id'));
    });

    $(document).on('click', '.addPkgBtn', function (e) {
        e.stopPropagation();
        var pkgId = $(this).data('pkg');
        var pkg = testPackages.find(function (p) { return p.id === pkgId; });
        if (!pkg) return;
        var pkgTestsNotInCart = pkg.tests.filter(function (tid) {
            return !cart.find(function (c) { return c.testId === tid; });
        });

        var totalAllIndividual = 0;
        pkg.tests.forEach(function (tid) {
            var t = testCatalog.find(function (tc) { return tc.id === tid; });
            if (t) totalAllIndividual += t.price;
        });

        var discountPerTest = totalAllIndividual > 0 ? (pkg.price / totalAllIndividual) : 1;

        pkgTestsNotInCart.forEach(function (tid) {
            var t = testCatalog.find(function (tc) { return tc.id === tid; });
            if (t) {
                cart.push({
                    testId: t.id, testName: t.name, testCode: t.code, category: t.category,
                    price: t.price, discountedPrice: Math.round(t.price * discountPerTest),
                    specimen: t.specimen, container: t.container, volume: t.volume,
                    fasting: t.fasting, fastingHours: t.fastingHours || 0, tat: t.tat,
                    packageId: pkgId, packageName: pkg.name
                });
            }
        });
        updateCart();
    });

    function addToCart(testId) {
        addToCartSilent(testId);
        updateCart();
    }

    function addToCartSilent(testId) {
        if (cart.find(function (c) { return c.testId === testId; })) return;
        var t = testCatalog.find(function (tc) { return tc.id === testId; });
        if (!t) return;
        cart.push({
            testId: t.id, testName: t.name, testCode: t.code, category: t.category,
            price: t.price, discountedPrice: t.price,
            specimen: t.specimen, container: t.container, volume: t.volume,
            fasting: t.fasting, fastingHours: t.fastingHours || 0, tat: t.tat
        });
    }

    function removeFromCart(testId) {
        cart = cart.filter(function (c) { return c.testId !== testId; });
        updateCart();
    }

    function updateCart() {
        $('#cartCount').text(cart.length);
        if (cart.length === 0) {
            $('#emptyCartMsg').show();
            $('#cartTable').hide();
            $('#clearCart').hide();
            $('#requirementsSummary').hide();
        } else {
            $('#emptyCartMsg').hide();
            $('#cartTable').show();
            $('#clearCart').show();
            var html = '';
            cart.forEach(function (item) {
                html += '<tr style="border-bottom:1px solid var(--color-border)">';
                html += '<td style="padding:8px 0;font-size:13px">';
                html += '<div style="font-weight:600">' + esc(item.testName) + '</div>';
                if (item.packageName) html += '<div style="font-size:10px;color:var(--aqua-mint)">' + esc(item.packageName) + '</div>';
                html += '</td>';
                html += '<td style="padding:8px 0;text-align:right;font-size:13px;font-weight:600">';
                if (item.discountedPrice < item.price) {
                    html += '<span style="text-decoration:line-through;color:var(--color-muted-foreground);font-size:11px;margin-right:4px">' + item.price.toLocaleString() + '</span>';
                }
                html += 'PKR ' + item.discountedPrice.toLocaleString();
                html += '</td>';
                html += '<td style="padding:8px 0;text-align:center"><button class="removeCartItem" data-id="' + item.testId + '" style="border:none;background:none;color:#ef4444;cursor:pointer;padding:2px"><i data-lucide="x" style="width:14px;height:14px"></i></button></td>';
                html += '</tr>';
            });
            $('#cartTableBody').html(html);
            updateRequirements();
        }
        updateBill();
        renderPackages();
        renderTests();
        updateRegistrationButton();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function updateRequirements() {
        var fastingTests = cart.filter(function (c) { return c.fasting; });
        var maxFasting = 0;
        fastingTests.forEach(function (t) { if (t.fastingHours > maxFasting) maxFasting = t.fastingHours; });

        var specimens = {};
        cart.forEach(function (c) {
            var key = c.specimen || 'Blood';
            if (!specimens[key]) specimens[key] = { containers: [], volume: 0 };
            specimens[key].containers.push(c.container);
            var vol = parseFloat(c.volume) || 3;
            specimens[key].volume += vol;
        });

        var maxTat = '';
        cart.forEach(function (c) { if (!maxTat || c.tat > maxTat) maxTat = c.tat; });

        var html = '';
        if (fastingTests.length > 0) {
            html += '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px">';
            html += '<i data-lucide="utensils" style="width:16px;height:16px;color:#d97706;flex-shrink:0;margin-top:2px"></i>';
            html += '<div><div style="font-weight:600;color:#d97706">Fasting Required: ' + maxFasting + ' hours</div>';
            html += '<div style="color:var(--color-muted-foreground);font-size:12px">(' + fastingTests.map(function (t) { return t.testName; }).join(', ') + ')</div></div>';
            html += '</div>';
        }

        Object.keys(specimens).forEach(function (spec) {
            var s = specimens[spec];
            var uniqueContainers = [...new Set(s.containers)];
            html += '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px">';
            html += '<i data-lucide="droplet" style="width:16px;height:16px;color:#3b82f6;flex-shrink:0;margin-top:2px"></i>';
            html += '<div><div style="font-weight:600;color:#3b82f6">' + spec + ': ~' + Math.ceil(s.volume) + ' mL</div>';
            html += '<div style="color:var(--color-muted-foreground);font-size:12px">(' + uniqueContainers.join(' + ') + ')</div></div>';
            html += '</div>';
        });

        html += '<div style="display:flex;gap:8px;align-items:flex-start">';
        html += '<i data-lucide="clock" style="width:16px;height:16px;color:var(--aqua-mint);flex-shrink:0;margin-top:2px"></i>';
        html += '<div><div style="font-weight:600;color:var(--color-foreground)">Expected Results: ' + maxTat + '</div></div>';
        html += '</div>';

        $('#requirementsContent').html(html);
        $('#requirementsSummary').show();
    }

    function updateBill() {
        var subtotal = 0;
        cart.forEach(function (c) { subtotal += c.discountedPrice; });
        $('#billTestCount').text(cart.length);
        $('#billSubtotal').text('PKR ' + subtotal.toLocaleString());

        var discVal = $('#discountType').val();
        var discPct = 0;
        if (discVal === 'custom') {
            discPct = parseInt($('#customDiscount').val()) || 0;
        } else {
            discPct = parseInt(discVal) || 0;
        }

        var discAmt = Math.round(subtotal * discPct / 100);
        $('#discountAmount').text('- PKR ' + discAmt.toLocaleString());
        $('#discountAmountRow').toggle(discAmt > 0);

        var homeCharge = $('#homeCollection').is(':checked') ? 500 : 0;
        var total = subtotal - discAmt + homeCharge;
        $('#billTotal').text('PKR ' + total.toLocaleString());
        $('.payTotal').text('PKR ' + total.toLocaleString());
    }

    $('#discountType').on('change', function () {
        if ($(this).val() === 'custom') {
            $('#customDiscountRow').show();
        } else {
            $('#customDiscountRow').hide();
        }
        updateBill();
    });
    $('#customDiscount').on('input', function () { updateBill(); });
    $('#homeCollection').on('change', function () {
        if ($(this).is(':checked')) {
            $('input[name="sampleCollection"][value="home"]').prop('checked', true).trigger('change');
        }
        updateBill();
    });

    $(document).on('click', '.removeCartItem', function () {
        removeFromCart($(this).data('id'));
    });

    $('#clearCart').on('click', function () {
        cart = [];
        updateCart();
    });

    $(document).on('click', '.pay-tab', function () {
        var method = $(this).data('method');
        $('.pay-tab').removeClass('active').css({ background: 'transparent', color: 'var(--color-foreground)' });
        $(this).addClass('active').css({ background: 'var(--midnight-blue)', color: '#fff' });
        $('.pay-panel').hide();
        $('#panel' + method.charAt(0).toUpperCase() + method.slice(1)).show();
    });

    $(document).on('click', '.quick-cash', function () {
        var amt = $(this).data('amt');
        if (amt === 'exact') {
            var total = getTotal();
            $('#cashReceived').val(total);
        } else {
            $('#cashReceived').val(amt);
        }
        updateChange();
    });

    $('#cashReceived').on('input', function () { updateChange(); });

    function updateChange() {
        var total = getTotal();
        var received = parseInt($('#cashReceived').val()) || 0;
        var change = received - total;
        $('#cashChange').text('PKR ' + Math.max(0, change).toLocaleString());
        if (change < 0) {
            $('#cashChange').css('color', '#ef4444');
        } else {
            $('#cashChange').css('color', '#22c55e');
        }
    }

    function getTotal() {
        var subtotal = 0;
        cart.forEach(function (c) { subtotal += c.discountedPrice; });
        var discVal = $('#discountType').val();
        var discPct = discVal === 'custom' ? (parseInt($('#customDiscount').val()) || 0) : (parseInt(discVal) || 0);
        var discAmt = Math.round(subtotal * discPct / 100);
        var homeCharge = $('#homeCollection').is(':checked') ? 500 : 0;
        return subtotal - discAmt + homeCharge;
    }

    function updateRegistrationButton() {
        var patientType = $('input[name="patientType"]:checked').val();
        var hasPatient = false;
        if (patientType === 'existing') {
            hasPatient = !!selectedPatient;
        } else {
            hasPatient = !!$('#newPatientName').val() && !!$('#newPatientAge').val();
        }
        var hasTests = cart.length > 0;
        var btn = $('#btnCompleteRegistration');
        if (hasPatient && hasTests) {
            btn.prop('disabled', false).css({ opacity: 1 });
        } else {
            btn.prop('disabled', true).css({ opacity: 0.5 });
        }
    }

    $(document).on('input', '#newPatientName, #newPatientAge', function () {
        updateRegistrationButton();
    });

    $('#btnCompleteRegistration').on('click', function () {
        var btn = $(this);
        if (btn.prop('disabled')) return;

        var patientType = $('input[name="patientType"]:checked').val();
        var patientName, patientAge, patientGender, phone, mrn, cnic;

        if (patientType === 'existing' && selectedPatient) {
            patientName = selectedPatient.name;
            patientAge = selectedPatient.age;
            patientGender = selectedPatient.gender;
            phone = selectedPatient.phone || '';
            mrn = selectedPatient.mrn;
        } else {
            patientName = $('#newPatientName').val();
            patientAge = $('#newPatientAge').val();
            patientGender = $('input[name="newGender"]:checked').val();
            phone = $('#newPatientPhone').val();
            cnic = $('#newPatientCnic').val();
        }

        if (!patientName || !patientAge) {
            HMS.toast('Please fill in all required patient fields', 'warning');
            return;
        }

        if (cart.length === 0) {
            HMS.toast('Please add at least one test', 'warning');
            return;
        }

        var payMethod = $('.pay-tab.active').data('method') || 'cash';
        var total = getTotal();

        btn.prop('disabled', true).html('<i data-lucide="loader" style="width:16px;height:16px;animation:spin 1s linear infinite"></i> Processing...');

        $.ajax({
            url: '/api/lab/walk-in/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                patientName: patientName,
                patientAge: parseInt(patientAge),
                patientGender: patientGender || 'M',
                phone: phone || '0000000000',
                mrn: mrn || null,
                cnic: cnic || null,
                generateMrn: patientType === 'new' && $('input[name="saveOption"]:checked').val() === 'generate',
                tests: cart.map(function (c) {
                    return { testId: c.testId, testName: c.testName, testCode: c.testCode, price: c.discountedPrice };
                }),
                paymentMethod: payMethod,
                totalAmount: total,
                sampleCollection: $('input[name="sampleCollection"]:checked').val() || 'now',
                doctorName: $('#rxDoctorName').val() || null,
                visitId: selectedVisit || null,
                sourceModule: selectedModule || 'Walk-in',
            }),
            success: function (res) {
                var html = '<div style="text-align:center;padding:40px 20px">';
                html += '<div style="width:64px;height:64px;border-radius:50%;background:rgba(127,255,212,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><i data-lucide="check-circle" style="width:32px;height:32px;color:var(--aqua-mint)"></i></div>';
                html += '<h3 style="font-size:20px;font-weight:700;color:var(--midnight-blue);margin:0 0 8px">Registration Complete!</h3>';
                html += '<p style="font-size:14px;color:var(--color-muted-foreground);margin:0 0 16px">Order ID: <strong>' + res.orderId + '</strong></p>';
                html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
                html += '<div style="padding:12px;border:1px solid var(--color-border);border-radius:8px;text-align:center"><div style="font-size:12px;color:var(--color-muted-foreground)">Patient</div><div style="font-size:14px;font-weight:600">' + esc(patientName) + '</div></div>';
                html += '<div style="padding:12px;border:1px solid var(--color-border);border-radius:8px;text-align:center"><div style="font-size:12px;color:var(--color-muted-foreground)">Tests</div><div style="font-size:14px;font-weight:600">' + cart.length + ' tests</div></div>';
                html += '<div style="padding:12px;border:1px solid var(--color-border);border-radius:8px;text-align:center"><div style="font-size:12px;color:var(--color-muted-foreground)">Total</div><div style="font-size:14px;font-weight:600">PKR ' + total.toLocaleString() + '</div></div>';
                html += '<div style="padding:12px;border:1px solid var(--color-border);border-radius:8px;text-align:center"><div style="font-size:12px;color:var(--color-muted-foreground)">Status</div><div style="font-size:14px;font-weight:600;color:var(--aqua-mint)">' + (res.status || 'Pending') + '</div></div>';
                html += '</div>';
                html += '<button onclick="location.reload()" style="margin-top:20px;padding:10px 24px;border:none;border-radius:8px;font-size:14px;font-weight:600;background:var(--midnight-blue);color:#fff;cursor:pointer">New Registration</button>';
                html += '</div>';

                $('.page-content').html(html);
                if (typeof lucide !== 'undefined') lucide.createIcons();
            },
            error: function (xhr) {
                HMS.ajaxError(xhr, 'Registration failed. Please try again.');
                btn.prop('disabled', false).html('<i data-lucide="check-circle" style="width:18px;height:18px"></i> COMPLETE REGISTRATION & COLLECT SAMPLE');
                updateRegistrationButton();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    });
});
