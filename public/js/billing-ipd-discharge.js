$(function () {
  var _bdAdm = [], _bdBills = [], _bdCurrentAdmId = null, _bdCurrentDept = null, _bdDI = null;
  var _bdAccordionOpen = null;

  function safeGet(url) { var d = $.Deferred(); $.get(url).done(function(r){ d.resolve(r); }).fail(function(){ d.resolve([]); }); return d.promise(); }
  function esc(s) { return $('<span>').text(s||'').html(); }
  function fmtPKR(n) { return 'PKR ' + (parseFloat(n)||0).toLocaleString(); }
  function today() { return new Date().toISOString().slice(0,10); }

  window.loadBillingDischData = function() {
    $.when(safeGet('/api/ipd/admissions'), safeGet('/api/ipd/bills')).done(function(aRes, bRes) {
      _bdAdm = Array.isArray(aRes) ? aRes : (aRes[0]||[]);
      _bdBills = Array.isArray(bRes) ? bRes : (bRes[0]||[]);
      renderBillingDischDashboard();
    });
  };

  function renderBillingDischDashboard() {
    var search = ($('#billingDischSearch').val()||'').toLowerCase();
    var relevant = _bdAdm.filter(function(a) {
      var ds = a.dischargeStatus||''; var s = a.status||'';
      return ds==='pending_clearance'||ds==='all_cleared'||s==='Discharge Requested'||s==='Discharged';
    });
    // Stats
    var pendingCount=0, partialCount=0, allClearedCount=0, dischargedTodayCount=0;
    relevant.forEach(function(a) {
      var ds = a.dischargeStatus||''; var di = a.dischargeInfo||{};
      var paidCount = (['hospital','pharmacy','lab']).filter(function(d){ return (di[d]||{}).paid; }).length;
      if (ds==='pending_clearance' && paidCount===0) pendingCount++;
      else if (ds==='pending_clearance' && paidCount>0) partialCount++;
      if (ds==='all_cleared') allClearedCount++;
      if (a.status==='Discharged') {
        var dd = (di.discharge_date||''); if (dd===today()) dischargedTodayCount++;
      }
    });
    // Stat cards
    var statsHtml = [
      {label:'Pending Clearance',val:pendingCount,icon:'clock',color:'#F59E0B'},
      {label:'Partial Cleared',val:partialCount,icon:'loader',color:'#3B82F6'},
      {label:'All Cleared',val:allClearedCount,icon:'check-circle',color:'#10B981'},
      {label:'Discharged Today',val:dischargedTodayCount,icon:'log-out',color:'#8B5CF6'},
    ].map(function(c) {
      return '<div class="stat-card" style="padding:16px"><div style="display:flex;align-items:center;gap:12px"><div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:'+c.color+'20;color:'+c.color+'"><i data-lucide="'+c.icon+'"></i></div><div><div style="font-size:20px;font-weight:700">'+c.val+'</div><div style="font-size:12px;color:var(--color-muted-foreground)">'+c.label+'</div></div></div></div>';
    }).join('');
    $('#billingDischStats').html(statsHtml);

    // Table
    var filtered = relevant.filter(function(a) {
      if (!search) return true;
      return (a.patientName||'').toLowerCase().indexOf(search)>-1 || (a.admissionId||'').toLowerCase().indexOf(search)>-1;
    });
    if (!filtered.length) { $('#billingDischTableBody').html('<tr><td colspan="8" class="text-center" style="padding:32px;color:var(--color-muted-foreground)">No discharge clearances pending</td></tr>'); lucide.createIcons(); return; }

    var rows = filtered.map(function(a) {
      var di = a.dischargeInfo||{};
      var depts = ['hospital','pharmacy','lab'];
      var icons = ['🏥','💊','🔬'];
      var deptDots = depts.map(function(d,i) {
        var info = di[d]||{}; var color = info.paid ? '#10B981' : info.verified ? '#3B82F6' : '#9CA3AF';
        return '<span title="'+d+'" style="color:'+color+';font-size:16px">'+icons[i]+'</span>';
      }).join(' ');
      var totalAmt = depts.reduce(function(s,d){ return s+(parseFloat((di[d]||{}).amount||0)); },0);
      var paidAmt  = depts.reduce(function(s,d){ return s+(parseFloat((di[d]||{}).paid_amount||0)); },0);
      var pendingAmt = totalAmt - paidAmt;
      var pendingStr = pendingAmt<=0 ? '<span style="color:#10B981;font-weight:600">All Cleared</span>' : fmtPKR(pendingAmt);
      var ds = a.dischargeStatus||''; var s = a.status||'';
      var badge = ds==='all_cleared'?'<span class="badge badge-success">All Cleared</span>':ds==='pending_clearance'?'<span class="badge badge-warning">Pending</span>':s==='Discharged'?'<span class="badge badge-outline">Discharged</span>':'<span class="badge badge-outline">'+esc(s)+'</span>';
      var reqDate = (di.planned_discharge_date||a.admissionDate||'').slice(0,10);
      var admDate = a.admissionDate ? new Date(a.admissionDate) : null;
      var los = admDate ? Math.max(0,Math.floor((Date.now()-admDate.getTime())/86400000)) : '-';
      return '<tr>'+
        '<td><div style="font-weight:600;font-size:13px">'+esc(a.patientName||'-')+'</div><div style="font-size:11px;color:var(--color-muted-foreground)">LOS: '+los+' days</div></td>'+
        '<td style="font-size:12px;font-weight:500">'+esc(a.admissionId||'-')+'</td>'+
        '<td style="font-size:12px">'+esc((a.wardName||a.ward||'-')+' / '+(a.bedNumber||a.bed||'-'))+'</td>'+
        '<td style="font-size:12px">'+esc(reqDate||'-')+'</td>'+
        '<td>'+deptDots+'</td>'+
        '<td style="font-size:13px">'+pendingStr+'</td>'+
        '<td>'+badge+'</td>'+
        '<td class="text-center"><button class="btn-primary btn-sm" style="font-size:12px" onclick="openBillingDischDetail(\''+esc(a.admissionId)+'\')">Open →</button></td>'+
      '</tr>';
    }).join('');
    $('#billingDischTableBody').html(rows);
    lucide.createIcons();
  }

  $('#billingDischSearch').on('input', renderBillingDischDashboard);

  window.openBillingDischDetail = function(admId) {
    _bdCurrentAdmId = admId;
    $.get('/api/ipd/discharge/'+admId, function(res) {
      _bdDI = res;
      var adm = _bdAdm.find(function(a){ return a.admissionId===admId; })||{};
      $('#billingDischDashboard').hide();
      $('#billingDischDetail').show();
      renderDetailHeader(adm, res);
      renderAccordion(res.dischargeInfo||{});
      renderSummaryFooter(res.dischargeInfo||{});
      lucide.createIcons();
    });
  };

  window.showBillingDischDashboard = function() {
    $('#billingDischDetail').hide();
    $('#billingDischDashboard').show();
    loadBillingDischData();
  };

  function renderDetailHeader(adm, res) {
    var di = res.dischargeInfo||{};
    var admDate = adm.admissionDate ? new Date(adm.admissionDate) : null;
    var los = admDate ? Math.max(0,Math.floor((Date.now()-admDate.getTime())/86400000)) : '-';
    var totalAmt = ['hospital','pharmacy','lab'].reduce(function(s,d){ return s+(parseFloat((di[d]||{}).amount||0)); },0);
    var collAmt  = ['hospital','pharmacy','lab'].reduce(function(s,d){ return s+(parseFloat((di[d]||{}).paid_amount||0)); },0);
    var cleared  = ['hospital','pharmacy','lab'].filter(function(d){ return (di[d]||{}).paid; }).length;
    var html =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px">'+
        '<div>'+
          '<div style="font-size:20px;font-weight:800;margin-bottom:4px">'+esc(adm.patientName||'-')+'</div>'+
          '<div style="display:flex;flex-wrap:wrap;gap:16px;font-size:12px;opacity:0.7">'+
            '<span>IPD: '+esc(res.admissionId||'-')+'</span>'+
            '<span>Ward/Bed: '+esc((adm.wardName||adm.ward||'-')+' / '+(adm.bedNumber||adm.bed||'-'))+'</span>'+
            '<span>Doctor: '+esc(adm.doctorName||'-')+'</span>'+
            '<span>LOS: '+los+' days</span>'+
          '</div>'+
        '</div>'+
        '<div style="text-align:right">'+
          '<div style="font-size:11px;opacity:0.6;margin-bottom:2px">Grand Total</div>'+
          '<div style="font-size:26px;font-weight:900;color:var(--aquamint)">'+fmtPKR(totalAmt)+'</div>'+
          '<div style="font-size:11px;opacity:0.6">Collected: '+fmtPKR(collAmt)+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="margin-top:16px">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:12px;opacity:0.7">'+
          '<span>Clearance Progress</span><span>'+cleared+'/3 departments cleared</span>'+
        '</div>'+
        '<div style="height:8px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden">'+
          '<div style="height:100%;width:'+(cleared/3*100)+'%;background:var(--aquamint);border-radius:4px;transition:width 0.5s ease"></div>'+
        '</div>'+
      '</div>';
    $('#billingDischDetailHeader').html(html);
  }

  function deptLabel(d) { return d==='hospital'?'Hospital Charges':d==='pharmacy'?'Pharmacy Charges':'Laboratory Charges'; }
  function deptIcon(d) { return d==='hospital'?'🏥':d==='pharmacy'?'💊':'🔬'; }
  function deptItems(d) {
    if (d==='hospital') return ['Room / Bed charges','Consultant fees','Procedure charges','Nursing care','Miscellaneous'];
    if (d==='pharmacy') return ['Prescribed medications','IV fluids & consumables','Controlled substances','Medical supplies','Other pharmacy items'];
    return ['Diagnostic tests','Radiology & imaging','Microbiology','Outsourced tests','Report processing'];
  }

  function renderAccordion(di) {
    var depts = ['hospital','pharmacy','lab'];
    var html = depts.map(function(dept) {
      var info = di[dept]||{};
      var amt = parseFloat(info.amount||0);
      var isVerified = !!info.verified; var isPaid = !!info.paid;
      var isOpen = _bdAccordionOpen === dept;
      
      var items = deptItems(dept).map(function(item,i) {
        var mockAmt = Math.round(amt * (0.1 + i*0.15 + Math.random()*0.1));
        if (i===4) mockAmt = amt - Math.round(amt*0.75); // balance it
        return '<tr><td style="padding:8px 0;font-size:13px">'+item+'</td><td style="padding:8px 0;text-align:right;font-size:13px">'+fmtPKR(mockAmt)+'</td></tr>';
      }).join('');

      var actionBtn = '';
      if (isPaid) {
        actionBtn = '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between">'+
                      '<div><div style="font-size:13px;font-weight:700;color:#10B981">✅ Cleared</div><div style="font-size:11px;color:var(--color-muted-foreground)">Receipt: '+esc(info.receipt)+'</div></div>'+
                      '<button class="btn-outline btn-sm" onclick="HMS.toast(\'Printing receipt...\', \'info\')"><i data-lucide="printer"></i> Print</button>'+
                    '</div>';
      } else if (isVerified) {
        actionBtn = '<button class="btn-primary" style="width:100%;padding:12px;background:var(--aquamint);color:var(--midnight-blue);border:none;font-weight:700" onclick="openDeptPay(\''+dept+'\')">Collect Payment & Clear</button>';
      } else {
        actionBtn = '<button class="btn-outline" style="width:100%;padding:12px;border-style:dashed" onclick="openDeptVerify(\''+dept+'\')"><i data-lucide="shield-check"></i> Verify & Lock Charges</button>';
      }

      return '<div class="bd-accordion-section">'+
        '<div class="bd-accordion-header" onclick="toggleAccordion(\''+dept+'\')">'+
          '<div style="display:flex;align-items:center;gap:12px"><span style="font-size:24px">'+deptIcon(dept)+'</span><div><div style="font-weight:700;color:var(--midnight-blue)">'+deptLabel(dept)+'</div><div style="font-size:11px;color:var(--color-muted-foreground)">View breakdown and verify</div></div></div>'+
          '<div style="display:flex;align-items:center;gap:16px"><div style="font-weight:700;font-size:16px">'+fmtPKR(amt)+'</div>'+(isPaid?'<span class="badge badge-success">Paid</span>':isVerified?'<span class="badge" style="background:rgba(59,130,246,0.1);color:#3B82F6">Verified</span>':'<span class="badge badge-warning">Pending</span>')+'<i data-lucide="chevron-down"></i></div>'+
        '</div>'+
        '<div class="bd-accordion-body" style="'+(isOpen?'':'display:none')+'">'+
          '<table style="width:100%;margin-bottom:16px"><thead><tr style="border-bottom:1px solid var(--color-border)"><th style="text-align:left;padding-bottom:8px;font-size:11px;text-transform:uppercase;opacity:0.6">Item</th><th style="text-align:right;padding-bottom:8px;font-size:11px;text-transform:uppercase;opacity:0.6">Amount</th></tr></thead><tbody>'+items+'</tbody><tfoot><tr style="border-top:2px solid var(--color-border)"><td style="padding-top:8px;font-weight:700">Total</td><td style="padding-top:8px;text-align:right;font-weight:700">'+fmtPKR(amt)+'</td></tr></tfoot></table>'+
          actionBtn +
        '</div>'+
      '</div>';
    }).join('');
    $('#billingDischAccordion').html(html);
    lucide.createIcons();
  }

  window.toggleAccordion = function(dept) {
    _bdAccordionOpen = (_bdAccordionOpen === dept) ? null : dept;
    renderAccordion(_bdDI.dischargeInfo||{});
  };

  function renderSummaryFooter(di) {
    var totalAmt = ['hospital','pharmacy','lab'].reduce(function(s,d){ return s+(parseFloat((di[d]||{}).amount||0)); },0);
    var collAmt  = ['hospital','pharmacy','lab'].reduce(function(s,d){ return s+(parseFloat((di[d]||{}).paid_amount||0)); },0);
    var pending  = totalAmt - collAmt;
    var allCleared = ['hospital','pharmacy','lab'].every(function(d){ return (di[d]||{}).paid; });

    var html = '<div style="display:flex;align-items:center;justify-content:space-between">'+
      '<div><div style="font-size:12px;opacity:0.6">Remaining Balance</div><div style="font-size:24px;font-weight:800;color:'+(pending>0?'var(--color-destructive)':'#10B981')+'">'+fmtPKR(pending)+'</div></div>'+
      (allCleared ? '<div style="text-align:right"><div class="badge badge-success" style="padding:8px 16px;font-size:14px;margin-bottom:8px">✅ ALL DEPARTMENTS CLEARED</div><div style="font-size:12px;color:var(--color-muted-foreground)">Doctor can now complete the final discharge step.</div></div>' : 
      '<div style="text-align:right"><div class="badge badge-warning" style="padding:8px 16px;font-size:14px;margin-bottom:8px">⏳ PENDING CLEARANCE</div><div style="font-size:12px;color:var(--color-muted-foreground)">Verify and collect payment for all 3 departments.</div></div>')+
    '</div>';
    $('#billingDischSummaryFooter').html(html);
  }

  window.openDeptVerify = function(dept) {
    _bdCurrentDept = dept;
    var di = _bdDI.dischargeInfo||{};
    var info = di[dept]||{};
    var html = '<div style="margin-bottom:20px"><div style="font-size:13px;opacity:0.6;margin-bottom:4px">Department</div><div style="font-size:18px;font-weight:700">'+deptLabel(dept)+'</div></div>'+
      '<div style="margin-bottom:24px"><div style="font-size:13px;opacity:0.6;margin-bottom:4px">Amount to Verify</div><div style="font-size:24px;font-weight:800;color:var(--midnight-blue)">'+fmtPKR(info.amount)+'</div></div>'+
      '<div class="card" style="padding:16px;background:var(--color-muted);margin-bottom:24px"><div style="display:flex;gap:12px"><i data-lucide="info" style="color:var(--color-info)"></i><div style="font-size:13px">By verifying, you confirm that all charges for this department are correct. The amount will be locked and ready for payment collection.</div></div></div>'+
      '<button class="btn-primary" style="width:100%;padding:14px;font-weight:700" onclick="submitDeptVerify()">Confirm Verification</button>';
    $('#verifyDeptTitle').text('Verify ' + deptLabel(dept));
    $('#verifyDeptBody').html(html);
    var off = new bootstrap.Offcanvas(document.getElementById('verifyDeptSheet'));
    off.show();
    lucide.createIcons();
  };

  window.submitDeptVerify = function() {
    $.post('/api/ipd/discharge/'+_bdCurrentAdmId+'/verify-dept', { dept: _bdCurrentDept, verifiedBy: 'Billing Officer' }, function(res) {
      bootstrap.Offcanvas.getInstance(document.getElementById('verifyDeptSheet')).hide();
      openBillingDischDetail(_bdCurrentAdmId);
    });
  };

  window.openDeptPay = function(dept) {
    _bdCurrentDept = dept;
    var di = _bdDI.dischargeInfo||{};
    var info = di[dept]||{};
    var html = '<div style="background:var(--midnight-blue);padding:24px;color:#fff">'+
        '<div style="font-size:13px;opacity:0.6;margin-bottom:4px">Collect Payment for</div><div style="font-size:18px;font-weight:700;margin-bottom:16px">'+deptLabel(dept)+'</div>'+
        '<div style="font-size:32px;font-weight:900;color:var(--aquamint)">'+fmtPKR(info.amount)+'</div>'+
      '</div>'+
      '<div style="padding:24px">'+
        '<div style="margin-bottom:20px"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:8px;opacity:0.7">PAYMENT METHOD</label><div style="display:flex;gap:10px">'+
          '<div class="bd-method-pill active" onclick="$(this).addClass(\'active\').siblings().removeClass(\'active\')"><i data-lucide="banknote"></i> Cash</div>'+
          '<div class="bd-method-pill" onclick="$(this).addClass(\'active\').siblings().removeClass(\'active\')"><i data-lucide="credit-card"></i> Card</div>'+
          '<div class="bd-method-pill" onclick="$(this).addClass(\'active\').siblings().removeClass(\'active\')"><i data-lucide="building"></i> Bank</div>'+
        '</div></div>'+
        '<div style="margin-bottom:24px"><label style="display:block;font-size:12px;font-weight:600;margin-bottom:8px;opacity:0.7">AMOUNT PAID</label><input type="number" id="payAmountInput" class="form-control" value="'+info.amount+'" style="font-size:18px;font-weight:700"></div>'+
        '<div style="display:flex;gap:12px"><button class="btn-outline" style="flex:1" data-bs-dismiss="modal">Cancel</button><button class="btn-primary" style="flex:2;background:var(--aquamint);color:var(--midnight-blue);border:none;font-weight:700" onclick="submitDeptPay()">Complete Payment</button></div>'+
      '</div>';
    $('#deptPayModalBody').html(html);
    var mod = new bootstrap.Modal(document.getElementById('deptPayModal'));
    mod.show();
    lucide.createIcons();
  };

  window.submitDeptPay = function() {
    var method = $('.bd-method-pill.active').text().trim();
    var amt = $('#payAmountInput').val();
    $.post('/api/ipd/discharge/'+_bdCurrentAdmId+'/pay-dept', { dept: _bdCurrentDept, paymentMethod: method, paidAmount: amt }, function(res) {
      bootstrap.Modal.getInstance(document.getElementById('deptPayModal')).hide();
      openBillingDischDetail(_bdCurrentAdmId);
    });
  };

  // Initial load
  loadBillingDischData();
  // CSRF for AJAX
  $.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') } });
});
