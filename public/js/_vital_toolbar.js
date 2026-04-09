
/* ═══════════════════════════════════════════════════════════════════════════
   VITAL RECORDING TOOLBAR FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

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
    var active = 0;
    if (status !== 'all') active++;
    if (dept   !== 'all') active++;
    if (mrn)      active++;
    if (patName)  active++;
    if (doctor)   active++;
    var badge = document.getElementById('vitalFilterBadge');
    if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
    document.querySelectorAll('#vitalCardsGrid .vpc').forEach(function(card) {
        var headerEl   = card.querySelector('.vpc-name');
        var subEl      = card.querySelector('.vpc-sub');
        var vpcRows    = card.querySelectorAll('.vpc-row');
        var cardName   = headerEl   ? headerEl.textContent.trim().toLowerCase() : '';
        var cardSub    = subEl      ? subEl.textContent.trim().toLowerCase() : '';
        var cardDept   = vpcRows[0] ? vpcRows[0].textContent.trim().toLowerCase() : '';
        var cardDoctor = vpcRows[1] ? vpcRows[1].textContent.trim().toLowerCase() : '';
        var cardTags   = card.querySelector('.vpc-tags') ? card.querySelector('.vpc-tags').textContent.trim().toLowerCase() : '';
        var pass = true;
        if (mrn     && cardSub.indexOf(mrn) === -1)       pass = false;
        if (patName && cardName.indexOf(patName) === -1)  pass = false;
        if (doctor  && cardDoctor.indexOf(doctor) === -1) pass = false;
        if (dept !== 'all' && cardDept.indexOf(dept.toLowerCase()) === -1) pass = false;
        if (status !== 'all') {
            if (status === 'alert'    && cardTags.indexOf('alert') === -1)   pass = false;
            if (status === 'recorded' && cardTags.indexOf('pending') !== -1) pass = false;
            if (status === 'pending'  && cardTags.indexOf('pending') === -1) pass = false;
        }
        card.style.display = pass ? '' : 'none';
    });
}

function resetVitalFilters() {
    ['vitalStatusFilter','vitalDeptFilter'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = 'all'; });
    ['csVitalMrn','csVitalPatName','csVitalDoctor'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
    ['vitalMrnFilter','vitalPatNameFilter','vitalDoctorFilter'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
    ['dpVitalDateFrom','dpVitalDateTo'].forEach(function(id) { var w = document.getElementById(id); if (w && w._reset) w._reset(); });
    document.querySelectorAll('#vitalCardsGrid .vpc').forEach(function(c) { c.style.display = ''; });
    var badge = document.getElementById('vitalFilterBadge');
    if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
}

function toggleVitalExportMenu(e) {
    e && e.stopPropagation();
    var menu = document.getElementById('vitalExportMenu');
    if (!menu) return;
    menu.classList.toggle('open');
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('vitalExportMenu');
    var btn  = document.getElementById('btnVitalExport');
    if (menu && menu.classList.contains('open')) {
        if (btn && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) menu.classList.remove('open');
    }
});

function exportVital(type) {
    var menu = document.getElementById('vitalExportMenu');
    if (menu) menu.classList.remove('open');
    var rows = [];
    document.querySelectorAll('#vitalCardsGrid .vpc').forEach(function(card) {
        if (card.style.display === 'none') return;
        var nameEl = card.querySelector('.vpc-name');
        var subEl  = card.querySelector('.vpc-sub');
        var vRows  = card.querySelectorAll('.vpc-row');
        rows.push([
            nameEl  ? nameEl.textContent.trim()  : '',
            subEl   ? subEl.textContent.trim()   : '',
            vRows[0]? vRows[0].textContent.trim(): '',
            vRows[1]? vRows[1].textContent.trim(): '',
            vRows[2]? vRows[2].textContent.trim(): '',
        ]);
    });
    var hdrs = ['Patient Name','MRN / Visit ID','Department','Doctor / Visit Type','Date/Time'];
    if (type === 'csv') {
        var lines = [hdrs.map(function(h){return '"'+h+'"';}).join(',')];
        rows.forEach(function(r){lines.push(r.map(function(c){return '"'+c.replace(/"/g,'""')+'"';}).join(','));});
        var blob = new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href=url; a.download='opd-vitals.csv'; a.click();
        URL.revokeObjectURL(url);
        return;
    }
    if (type === 'pdf' || type === 'print') {
        var now = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
        var wv = window.open('','_blank'); if (!wv) return;
        var hv = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OPD Vitals</title>'
            +'<style>body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:20px}'
            +'h2{font-size:16px;margin:0 0 4px}p.sub{font-size:11px;color:#666;margin:0 0 14px}'
            +'table{border-collapse:collapse;width:100%}'
            +'th{background:#060740;color:#fff;padding:7px 8px;text-align:left;font-size:11px}'
            +'td{padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px}'
            +'tr:nth-child(even) td{background:#f9fafb}'
            +'@media print{@page{margin:15mm}body{margin:0}}</style></head><body>'
            +'<h2>OPD Vital Recording</h2>'
            +'<p class="sub">Generated on '+now+' | '+rows.length+' patient(s)</p>'
            +'<table><thead><tr>'+hdrs.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>'
            +rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('')
            +'</tbody></table><script>window.onload=function(){window.print();}<\/script></body></html>';
        wv.document.open(); wv.document.write(hv); wv.document.close();
    }
}
