/* Nova HMS — Dual Dashboard JS
   Clinical + Financial dashboards with switcher, Chart.js charts, 30s auto-refresh */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
let currentDash  = localStorage.getItem('dash_pref') || 'clinical';
let charts       = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const el  = id => document.getElementById(id);
const txt = (id, v) => { const e = el(id); if (e) e.textContent = v; };

function pkr(amount) {
    if (amount === null || amount === undefined) return '—';
    const n = Number(amount);
    if (n >= 1_000_000) return 'PKR ' + (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)    return 'PKR ' + (n / 1_000).toFixed(0)   + 'K';
    return 'PKR ' + n.toFixed(0);
}

function changeChip(elId, val) {
    const e = el(elId);
    if (!e) return;
    const n = parseInt(val) || 0;
    e.className = 'dash-stat-change ' + (n > 0 ? 'change-up' : n < 0 ? 'change-down' : 'change-flat');
    e.innerHTML = n > 0
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><polyline points="18 15 12 9 6 15"/></svg>+${n} today`
        : n < 0
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><polyline points="6 9 12 15 18 9"/></svg>${n} today`
        : `+${n} today`;
}

function destroyChart(key) {
    if (charts[key]) { try { charts[key].destroy(); } catch(e) {} charts[key] = null; }
}

function setBar(id, pct) {
    const e = el(id);
    if (e) e.style.width = Math.min(100, Math.max(0, pct)) + '%';
}

function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function csrfToken() {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.content : '';
}

// ─── Switcher ─────────────────────────────────────────────────────────────────
window.switchDashboard = function(dash) {
    currentDash = dash;
    localStorage.setItem('dash_pref', dash);

    el('clinicalDash').style.display  = dash === 'clinical'  ? 'block' : 'none';
    el('financialDash').style.display = dash === 'financial' ? 'block' : 'none';

    document.querySelectorAll('.switcher-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.dash === dash);
    });

    txt('switcherLabel', dash === 'clinical' ? 'Clinical Dashboard' : 'Financial Dashboard');
    el('switcherDropdown').classList.remove('open');

    if (dash === 'clinical')  loadClinical();
    if (dash === 'financial') loadFinancial();

    fetch('/api/dashboard/save-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
        body: JSON.stringify({ dashboard: dash }),
    }).catch(() => {});
};

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved preference
    el('clinicalDash').style.display  = currentDash === 'clinical'  ? 'block' : 'none';
    el('financialDash').style.display = currentDash === 'financial' ? 'block' : 'none';
    txt('switcherLabel', currentDash === 'clinical' ? 'Clinical Dashboard' : 'Financial Dashboard');
    document.querySelectorAll('.switcher-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.dash === currentDash);
    });

    // Dropdown toggle
    el('switcherBtn').addEventListener('click', e => {
        e.stopPropagation();
        el('switcherDropdown').classList.toggle('open');
    });
    document.addEventListener('click', () => el('switcherDropdown').classList.remove('open'));

    // Load data
    loadAll();
    setInterval(loadAll, 30_000);
});

function loadAll() {
    if (currentDash === 'clinical')  loadClinical();
    if (currentDash === 'financial') loadFinancial();
    txt('lastRefresh', 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
}

// ─── CLINICAL ─────────────────────────────────────────────────────────────────
async function loadClinical() {
    try {
        const res  = await fetch('/api/dashboard/clinical');
        const data = await res.json();
        applyClinical(data);
    } catch (err) {
        console.error('Clinical dashboard error:', err);
    }
}

function applyClinical(d) {
    const u  = d.user || {};
    const g  = u.greeting || 'Afternoon';
    const qs = d.quickStats || {};
    const pa = d.pendingActions || {};
    const beds = d.beds || {};
    const ops  = d.operations || {};

    // Greeting
    txt('dashGreeting',    `Good ${g}, ${u.name || 'Admin'}! 👋`);
    txt('dashSubGreeting', 'Hospital Operations Center — ' + new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    txt('clin-welcome-msg', `Good ${g}, ${u.name || 'Admin'}! 👋`);
    txt('clin-welcome-sub', `${u.role || 'Administrator'} — Clinical Operations`);

    // Banner counters
    txt('clin-wstat-opd', qs.opd?.value ?? '0');
    txt('clin-wstat-ipd', qs.ipd?.value ?? '0');
    txt('clin-wstat-er',  qs.er?.value  ?? '0');

    // Quick stat cards
    txt('cs-opd',   qs.opd?.value      ?? '0');
    txt('cs-ipd',   qs.ipd?.value      ?? '0');
    txt('cs-er',    qs.er?.value       ?? '0');
    txt('cs-lab',   qs.lab?.value      ?? '0');
    txt('cs-pharm', qs.pharmacy?.value ?? '0');
    changeChip('cs-opd-ch',   qs.opd?.change      ?? 0);
    changeChip('cs-ipd-ch',   qs.ipd?.change      ?? 0);
    changeChip('cs-er-ch',    qs.er?.change       ?? 0);
    changeChip('cs-lab-ch',   qs.lab?.change      ?? 0);
    changeChip('cs-pharm-ch', qs.pharmacy?.change ?? 0);

    // Alerts
    txt('alert-discharges',     (pa.discharges ?? 0) + ' patients awaiting discharge clearance');
    txt('alert-lab-inprogress', (pa.labReviews ?? 0) + ' lab orders in progress / ready to review');
    txt('alert-ops',            (ops.scheduled  ?? 0) + ' operations scheduled, ' + (ops.inProgress ?? 0) + ' in progress');
    txt('alert-beds',           `${beds.occupied ?? 0}/${beds.total ?? 0} beds occupied (${beds.pct ?? 0}%)`);

    // Pending actions panel
    txt('pa-discharges', pa.discharges ?? '0');
    txt('pa-lab',        pa.labReviews ?? '0');
    txt('pa-er',         qs.er?.value  ?? '0');
    txt('pa-ops',        ops.scheduled ?? '0');

    // Beds
    txt('beds-total', beds.total    ?? '0');
    txt('beds-occ',   beds.occupied ?? '0');
    txt('beds-avail', beds.available ?? '0');
    txt('beds-pct',   (beds.pct ?? 0) + '%');
    setBar('beds-bar', beds.pct ?? 0);

    // Dept overview mini-cards
    txt('dov-ipd', qs.ipd?.value  ?? '0');
    txt('dov-opd', qs.opd?.value  ?? '0');
    txt('dov-er',  qs.er?.value   ?? '0');
    txt('dov-ot',  ops.scheduled  ?? '0');

    // Orders summary
    const ord = d.orders || {};
    txt('ord-pharm-p',  ord.pharmacy?.pending    ?? '0');
    txt('ord-pharm-d',  ord.pharmacy?.dispensing ?? '0');
    txt('ord-pharm-c',  ord.pharmacy?.completed  ?? '0');
    txt('ord-lab-p',    ord.lab?.pending         ?? '0');
    txt('ord-lab-ip',   ord.lab?.inProgress      ?? '0');
    txt('ord-lab-c',    ord.lab?.completed       ?? '0');
    txt('ord-img-p',    ord.imaging?.pending     ?? '0');
    txt('ord-img-ip',   ord.imaging?.inProgress  ?? '0');
    txt('ord-img-c',    ord.imaging?.completed   ?? '0');

    // Charts
    renderPatientFlow(d.patientFlow);
    renderClinicalPerf(d.performance);

    if (window.lucide) window.lucide.createIcons();
}

function renderPatientFlow(flow) {
    destroyChart('patientFlow');
    const ctx = el('patientFlowChart');
    if (!ctx || !flow) return;
    charts.patientFlow = new Chart(ctx, {
        type: 'line',
        data: {
            labels: flow.labels || [],
            datasets: [
                { label: 'OPD', data: flow.opd || [], borderColor: '#7FFFD4', backgroundColor: 'rgba(127,255,212,.15)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#7FFFD4' },
                { label: 'IPD', data: flow.ipd || [], borderColor: '#060740', backgroundColor: 'rgba(6,7,64,.08)',       fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#060740' },
                { label: 'ER',  data: flow.er  || [], borderColor: '#DC3545', backgroundColor: 'rgba(220,53,69,.08)',   fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#DC3545' },
            ],
        },
        options: chartOpts(),
    });
}

function renderClinicalPerf(perf) {
    destroyChart('clinicalPerf');
    const ctx = el('clinicalPerfChart');
    if (!ctx || !perf) return;
    charts.clinicalPerf = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: perf.labels || [],
            datasets: [{ label: 'Patient Activity', data: perf.admissions || [], backgroundColor: 'rgba(127,255,212,.5)', borderColor: '#7FFFD4', borderWidth: 1, borderRadius: 5 }],
        },
        options: chartOpts(),
    });
}

// ─── FINANCIAL ────────────────────────────────────────────────────────────────
async function loadFinancial() {
    try {
        const res  = await fetch('/api/dashboard/financial');
        const data = await res.json();
        applyFinancial(data);
    } catch (err) {
        console.error('Financial dashboard error:', err);
    }
}

function applyFinancial(d) {
    const u   = d.user || {};
    const g   = u.greeting || 'Afternoon';
    const rc  = d.revenueCards || {};
    const col = d.collection   || {};
    const outs = d.outstanding || {};
    const ts  = d.todayStats   || {};
    const pc  = d.panelClaims  || {};
    const disc = d.discharges  || {};

    // Greeting
    txt('dashGreeting',    `Good ${g}, ${u.name || 'Admin'}! 👋`);
    txt('dashSubGreeting', 'Financial & Revenue Operations — ' + new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    txt('fin-welcome-msg', `Good ${g}, ${u.name || 'Admin'}! 👋`);
    txt('fin-welcome-sub', `${u.role || 'Finance'} — Revenue & Billing Operations`);

    const pendingCount = (outs.opdCount ?? 0) + (outs.ipdCount ?? 0);
    txt('fin-today-rev',     pkr(d.todayRevenue ?? 0));
    txt('fin-pending-count', pendingCount + ' pending');

    // Revenue cards
    txt('frc-total', pkr(rc.total    ?? 0));
    txt('frc-opd',   pkr(rc.opd     ?? 0));
    txt('frc-ipd',   pkr(rc.ipd     ?? 0));
    txt('frc-pharm', pkr(rc.pharmacy ?? 0));
    txt('frc-lab',   pkr(rc.lab     ?? 0));

    // Collection
    txt('col-pct-collected', (col.collectedPct ?? 0) + '%');
    txt('col-pct-pending',   (col.pendingPct   ?? 0) + '%');
    txt('col-pct-overdue',   (col.overduePct   ?? 0) + '%');
    txt('col-total-billed',  pkr(col.totalBilled ?? 0));
    setBar('col-bar-collected', col.collectedPct ?? 0);
    setBar('col-bar-pending',   col.pendingPct   ?? 0);
    setBar('col-bar-overdue',   col.overduePct   ?? 0);

    // Outstanding
    txt('out-opd-count', (outs.opdCount ?? 0) + ' bills');
    txt('out-opd-amt',   pkr(outs.opdAmount ?? 0));
    txt('out-ipd-count', (outs.ipdCount ?? 0) + ' patients');
    txt('out-ipd-amt',   pkr(outs.ipdAmount ?? 0));
    txt('out-pharm-amt', pkr(outs.pharmAmt  ?? 0));
    txt('out-total',     pkr((outs.opdAmount ?? 0) + (outs.ipdAmount ?? 0) + (outs.pharmAmt ?? 0)));

    // Today stats
    txt('today-txn-count', ts.transactions ?? '0');
    txt('today-txn-amt',   pkr(ts.collected ?? 0));

    // Panel claims
    txt('panel-pending-count',  (pc.pendingCount  ?? 0) + ' claims');
    txt('panel-pending-amt',    pkr(pc.pendingAmount  ?? 0));
    txt('panel-approved-count', (pc.approvedCount ?? 0) + ' claims');
    txt('panel-approved-amt',   pkr(pc.approvedAmount ?? 0));

    const compList = el('panel-company-list');
    if (compList) {
        const companies = Array.isArray(pc.byCompany) ? pc.byCompany : [];
        compList.innerHTML = companies.length
            ? companies.map(c => `<div class="claim-row">
                <div class="claim-company">${esc(c.company)}</div>
                <div class="claim-count">${c.count} claims</div>
                <div class="claim-amount">${pkr(c.amount)}</div>
                <span class="claim-badge badge-pending">Pending</span>
              </div>`).join('')
            : '<div style="color:var(--color-muted);font-size:13px;padding:8px 0">No pending claims</div>';
    }

    // Discharges
    txt('disc-pending', disc.pendingClearance ?? '0');
    txt('disc-done',    disc.discharged       ?? '0');

    // Charts
    renderRevenueTrend(d.revenueTrend);
    renderPaymentMethods(d.paymentMethods);
    renderDeptRevenue(d.deptRevenue, rc.total ?? 0);

    if (window.lucide) window.lucide.createIcons();
}

function renderRevenueTrend(trend) {
    destroyChart('revenueTrend');
    const ctx = el('revenueTrendChart');
    if (!ctx || !trend) return;
    charts.revenueTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trend.labels || [],
            datasets: [
                { label: 'OPD',      data: trend.opd      || [], borderColor: '#7FFFD4', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#7FFFD4' },
                { label: 'IPD',      data: trend.ipd      || [], borderColor: '#060740', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#060740' },
                { label: 'Pharmacy', data: trend.pharmacy || [], borderColor: '#6f42c1', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#6f42c1' },
                { label: 'Lab',      data: trend.lab      || [], borderColor: '#FFC107', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#FFC107' },
            ],
        },
        options: chartOpts({ yFmt: v => pkr(v) }),
    });
}

function renderPaymentMethods(pm) {
    destroyChart('paymentMethods');
    const ctx = el('paymentMethodsChart');
    if (!ctx || !pm) return;
    const labels = ['Cash', 'Card', 'Mobile', 'Panel/Insurance'];
    const values = [pm.cash ?? 0, pm.card ?? 0, pm.mobile ?? 0, pm.panel ?? 0];
    const colors = ['#7FFFD4', '#060740', '#6f42c1', '#FFC107'];
    const total  = values.reduce((a, b) => a + b, 0);

    charts.paymentMethods = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: c => ` ${c.label}: ${pkr(c.raw)} (${total > 0 ? Math.round(c.raw / total * 100) : 0}%)` } },
            },
        },
    });

    const legend = el('payMethodLegend');
    if (legend) {
        legend.innerHTML = labels.map((lbl, i) => {
            const pct = total > 0 ? Math.round(values[i] / total * 100) : 0;
            return `<div style="display:flex;align-items:center;gap:8px">
                <span style="width:10px;height:10px;border-radius:50%;background:${colors[i]};flex-shrink:0"></span>
                <div>
                    <div style="font-size:12px;font-weight:600;color:var(--color-foreground)">${lbl}</div>
                    <div style="font-size:11px;color:var(--color-muted)">${pkr(values[i])} (${pct}%)</div>
                </div>
            </div>`;
        }).join('');
    }
}

function renderDeptRevenue(deptRevenue, grandTotal) {
    const container = el('deptRevenueList');
    if (!container || !deptRevenue) return;
    const colors  = { IPD: '#060740', OPD: '#7FFFD4', Pharmacy: '#6f42c1', Laboratory: '#FFC107', Emergency: '#DC3545', OT: '#28A745' };
    const entries = Object.entries(deptRevenue).sort((a, b) => b[1] - a[1]);
    const max     = entries.length > 0 ? entries[0][1] : 1;

    container.innerHTML = entries.map(([dept, amt]) => {
        const pct    = grandTotal > 0 ? Math.round(amt / grandTotal * 100) : 0;
        const barPct = max > 0 ? Math.round(amt / max * 100) : 0;
        const color  = colors[dept] || '#7FFFD4';
        return `<div class="dept-rev-item">
            <div class="dept-rev-label-row">
                <span class="dept">${esc(dept)}</span>
                <span class="pct">${pct}%</span>
                <span class="amt">${pkr(amt)}</span>
            </div>
            <div class="prog-bar-track">
                <div class="prog-bar-fill" style="width:${barPct}%;background:${color}"></div>
            </div>
        </div>`;
    }).join('') || '<div style="color:var(--color-muted);font-size:13px;padding:8px 0">No revenue recorded this month yet.</div>';
}

// ─── Chart base options ───────────────────────────────────────────────────────
function chartOpts({ yFmt = null } = {}) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                ...(yFmt ? { callbacks: { label: c => ` ${c.dataset.label}: ${yFmt(c.raw)}` } } : {}),
            },
        },
        scales: {
            x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 11 }, color: '#888' } },
            y: {
                grid: { color: 'rgba(0,0,0,.04)' },
                ticks: { font: { size: 11 }, color: '#888', ...(yFmt ? { callback: yFmt } : {}) },
                beginAtZero: true,
            },
        },
        interaction: { mode: 'index', intersect: false },
    };
}
