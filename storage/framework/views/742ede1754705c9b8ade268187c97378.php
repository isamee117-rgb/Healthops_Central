<?php $__env->startPush('styles'); ?>
<style>
/* ══════════════════════════════════════════════════════════════════
   NOVA HMS — DASHBOARD  (Reference-UI refresh)
   ══════════════════════════════════════════════════════════════════ */

/* ── Base layout ─────────────────────────────────────────────────── */
.db-page { display:flex;flex-direction:column;gap:0; }

/* ── Top bar ─────────────────────────────────────────────────────── */
.dash-top {
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:22px;flex-wrap:wrap;gap:12px;
}
.dash-greeting-block h1 { font-size:22px;font-weight:700;color:var(--color-foreground);margin:0 0 2px; }
.dash-greeting-block p  { font-size:13px;color:var(--color-muted-foreground);margin:0; }

/* ── Switcher ────────────────────────────────────────────────────── */
.switcher-wrap { position:relative; }
.switcher-btn {
    display:flex;align-items:center;gap:8px;
    background:linear-gradient(135deg,#7FFFD4 0%,#4de8b8 100%);
    color:#060740;font-weight:700;font-size:13px;border:none;
    border-radius:10px;padding:9px 16px;cursor:pointer;transition:all .2s;
    box-shadow:0 2px 8px rgba(127,255,212,.35);
}
.switcher-btn:hover { transform:translateY(-1px);box-shadow:0 4px 14px rgba(127,255,212,.5); }
.switcher-btn svg { width:15px;height:15px;flex-shrink:0; }
.switcher-dropdown {
    position:absolute;right:0;top:calc(100% + 8px);
    background:var(--color-card);border:1px solid var(--color-border);
    border-radius:12px;padding:8px;min-width:240px;
    box-shadow:0 12px 40px rgba(0,0,0,.18);z-index:999;display:none;
}
.switcher-dropdown.open { display:block; }
.switcher-option { display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:background .15s; }
.switcher-option:hover { background:rgba(127,255,212,.08); }
.switcher-option.active { background:rgba(127,255,212,.12); }
.switcher-dot { width:8px;height:8px;border-radius:50%;background:var(--color-border);flex-shrink:0; }
.switcher-option.active .switcher-dot { background:#7FFFD4; }
.switcher-opt-name { font-size:13px;font-weight:600;color:var(--color-foreground); }
.switcher-opt-desc { font-size:11px;color:var(--color-muted-foreground); }
.switcher-check { margin-left:auto;color:#7FFFD4;display:none; }
.switcher-option.active .switcher-check { display:block; }

/* ── Refresh badge ───────────────────────────────────────────────── */
.refresh-badge { font-size:11px;color:var(--color-muted-foreground);display:flex;align-items:center;gap:4px; }
.refresh-badge svg { width:12px;height:12px; }

/* ── Dashboard panel animation ───────────────────────────────────── */
.dash-panel { animation:dbFadeIn .3s ease; }
@keyframes dbFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

/* ══════════════════════════════════════════════════════════════════
   CARDS
   ══════════════════════════════════════════════════════════════════ */
.db-card {
    background:var(--color-card);
    border:1px solid var(--color-border);
    border-radius:16px;
    padding:20px 22px;
    transition:box-shadow .2s;
}
.db-card:hover { box-shadow:0 6px 24px rgba(0,0,0,.07); }

.db-card-head {
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:14px;
}
.db-card-label {
    font-size:11px;font-weight:700;text-transform:uppercase;
    letter-spacing:.06em;color:var(--color-muted-foreground);
    display:flex;align-items:center;gap:5px;
}
.db-card-label i { width:13px;height:13px;color:var(--color-muted-foreground); }
.db-see-details {
    font-size:12px;font-weight:600;color:var(--color-muted-foreground);
    display:flex;align-items:center;gap:4px;cursor:pointer;
    text-decoration:none;transition:color .15s;
}
.db-see-details:hover { color:var(--color-foreground); }
.db-see-details i { width:13px;height:13px; }

/* ══════════════════════════════════════════════════════════════════
   STAT CARDS  (top row)
   ══════════════════════════════════════════════════════════════════ */
.db-stat-grid {
    display:grid;
    grid-template-columns:repeat(4,1fr) 2fr;
    gap:14px;
    margin-bottom:16px;
    align-items:stretch;
}
.db-stat-card {
    background:var(--color-card);
    border:1px solid var(--color-border);
    border-radius:16px;
    padding:18px 20px 16px;
    display:flex;flex-direction:column;gap:0;
    transition:box-shadow .2s;
}
.db-stat-card:hover { box-shadow:0 6px 24px rgba(0,0,0,.07); }

.db-stat-label {
    font-size:10px;font-weight:700;text-transform:uppercase;
    letter-spacing:.07em;color:var(--color-muted-foreground);
    display:flex;align-items:center;gap:5px;margin-bottom:10px;
}
.db-stat-label i { width:12px;height:12px; }

.db-stat-row {
    display:flex;align-items:center;gap:10px;margin-bottom:8px;
}
.db-stat-icon {
    width:38px;height:38px;border-radius:10px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
}
.db-stat-icon i { width:20px;height:20px; }
.db-stat-value {
    font-size:26px;font-weight:800;color:var(--color-foreground);
    line-height:1;flex:1;
}
.db-change-badge {
    display:inline-flex;align-items:center;gap:2px;
    font-size:10px;font-weight:700;padding:3px 7px;border-radius:20px;
    white-space:nowrap;flex-shrink:0;
}
.db-change-badge i { width:10px;height:10px; }
.badge-up   { background:rgba(22,163,74,.12);color:#16A34A; }
.badge-down { background:rgba(220,53,69,.12);color:#DC3545; }
.badge-flat { background:rgba(0,0,0,.06);color:var(--color-muted-foreground); }

.db-stat-foot {
    font-size:11px;color:var(--color-muted-foreground);
    display:flex;align-items:center;gap:4px;margin-top:2px;
}
.db-stat-foot i { width:11px;height:11px; }

/* Wide chart card on the right of stats row */
.db-stat-chart-card {
    background:var(--color-card);
    border:1px solid var(--color-border);
    border-radius:16px;
    padding:18px 20px 16px;
    display:flex;flex-direction:column;
    transition:box-shadow .2s;
}
.db-stat-chart-card:hover { box-shadow:0 6px 24px rgba(0,0,0,.07); }
.db-chart-legend {
    display:flex;align-items:center;gap:14px;margin-bottom:10px;flex-wrap:wrap;
}
.db-legend-item { display:flex;align-items:center;gap:5px;font-size:11px;color:var(--color-muted-foreground); }
.db-legend-dot  { width:10px;height:10px;border-radius:50%;flex-shrink:0; }
.db-chart-wrap  { flex:1;min-height:0;position:relative; }
.db-chart-wrap canvas { width:100%!important; }

/* ══════════════════════════════════════════════════════════════════
   MIDDLE ROW  (3 equal cards)
   ══════════════════════════════════════════════════════════════════ */
.db-mid-grid {
    display:grid;
    grid-template-columns:1fr 1fr 1fr;
    gap:14px;
    margin-bottom:16px;
    align-items:stretch;
}

/* Treatment / progress bars */
.db-treat-hero { display:flex;align-items:center;gap:10px;margin-bottom:12px; }
.db-treat-val  { font-size:28px;font-weight:800;color:var(--color-foreground); }
.db-treat-bars {
    display:flex;gap:2px;height:8px;border-radius:4px;overflow:hidden;
    margin-bottom:14px;
}
.db-treat-bar { border-radius:0;height:100%; }

.db-prog-item { display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--color-border); }
.db-prog-item:last-child { border-bottom:none; }
.db-prog-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
.db-prog-info { flex:1;min-width:0; }
.db-prog-name { font-size:13px;font-weight:600;color:var(--color-foreground); }
.db-prog-sub  { font-size:11px;color:var(--color-muted-foreground); }
.db-prog-pct  { font-size:13px;font-weight:700;color:var(--color-foreground);min-width:32px;text-align:right; }
.db-ext-icon  { color:var(--color-muted-foreground); }
.db-ext-icon i { width:13px;height:13px; }

/* Employee / staff list */
.db-emp-hero { display:flex;align-items:center;gap:10px;margin-bottom:14px; }
.db-emp-val  { font-size:28px;font-weight:800;color:var(--color-foreground); }

.db-staff-item {
    display:flex;align-items:center;gap:10px;
    padding:9px 0;border-bottom:1px solid var(--color-border);
}
.db-staff-item:last-child { border-bottom:none; }
.db-staff-avatar {
    width:36px;height:36px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(135deg,#7FFFD4,#060740);
    display:flex;align-items:center;justify-content:center;
    font-size:13px;font-weight:700;color:#fff;
}
.db-staff-name { font-size:13px;font-weight:600;color:var(--color-foreground);line-height:1.2; }
.db-staff-role { font-size:11px;color:var(--color-muted-foreground);line-height:1.2; }
.db-staff-link { margin-left:auto;color:var(--color-muted-foreground); }
.db-staff-link i { width:14px;height:14px; }

/* Satisfaction / alerts right card */
.db-sat-hero { display:flex;align-items:center;gap:10px;margin-bottom:8px; }
.db-sat-val  { font-size:28px;font-weight:800;color:var(--color-foreground); }
.db-sat-chart-wrap { height:90px;position:relative;margin-bottom:12px; }
.db-sat-message {
    background:var(--color-muted);border-radius:10px;padding:12px 14px;
    font-size:12px;
}
.db-sat-message strong { display:block;font-weight:700;color:var(--color-foreground);margin-bottom:3px; }
.db-sat-message span { color:var(--color-muted-foreground);line-height:1.5; }

/* Alert items */
.db-alert-item {
    display:flex;align-items:flex-start;gap:10px;padding:9px 11px;
    border-radius:8px;margin-bottom:7px;font-size:12px;
}
.db-alert-item:last-child { margin-bottom:0; }
.db-alert-dot { width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:3px; }
.db-alert-text strong { display:block;font-weight:600;color:var(--color-foreground);font-size:12px; }
.db-alert-text span   { color:var(--color-muted-foreground);font-size:11px; }
.alert-i-warn { background:rgba(251,191,36,.08);border-left:3px solid #FBBF24; }
.alert-i-info { background:rgba(127,255,212,.07);border-left:3px solid #7FFFD4; }
.alert-i-crit { background:rgba(220,53,69,.07);border-left:3px solid #DC3545; }
.dot-warn { background:#FBBF24; }
.dot-info { background:#7FFFD4; }
.dot-crit { background:#DC3545; }

/* ══════════════════════════════════════════════════════════════════
   BOTTOM ROW  — Pending actions + bed grid + orders summary
   ══════════════════════════════════════════════════════════════════ */
.db-bot-grid {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:14px;
    margin-bottom:16px;
}

/* Pending action items */
.db-pa-item {
    display:flex;align-items:center;gap:12px;
    padding:10px 0;border-bottom:1px solid var(--color-border);
}
.db-pa-item:last-child { border-bottom:none; }
.db-pa-icon { width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center; }
.db-pa-icon i { width:15px;height:15px; }
.db-pa-label { flex:1;font-size:13px;font-weight:500;color:var(--color-foreground); }
.db-pa-count { font-size:22px;font-weight:800;color:var(--color-foreground); }

/* Bed grid mini-cards */
.db-bed-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px; }
.db-bed-mini {
    background:rgba(127,255,212,.04);border:1px solid var(--color-border);
    border-radius:10px;padding:10px 12px;
}
.db-bed-mini-label { font-size:10px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:var(--color-muted-foreground);margin-bottom:4px; }
.db-bed-mini-val   { font-size:20px;font-weight:800;color:var(--color-foreground); }

/* Orders summary */
.db-orders-3col { display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px; }
.db-ord-col-head { font-size:12px;font-weight:700;color:var(--color-muted-foreground);margin-bottom:10px; }
.db-ord-row { display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px dashed var(--color-border); }
.db-ord-row:last-child { border-bottom:none; }
.db-ord-lbl { font-size:12px;color:var(--color-muted-foreground); }
.db-ord-val { font-size:12px;font-weight:700;color:var(--color-foreground);background:rgba(127,255,212,.1);padding:1px 8px;border-radius:20px; }

/* ══════════════════════════════════════════════════════════════════
   PATIENT LIST TABLE
   ══════════════════════════════════════════════════════════════════ */
.db-patient-card { margin-bottom:16px; }
.db-patient-head {
    display:flex;align-items:center;gap:10px;flex-wrap:wrap;
    margin-bottom:16px;
}
.db-patient-title {
    display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;
    color:var(--color-foreground);flex:1;
}
.db-patient-title i { width:16px;height:16px;color:#7FFFD4; }
.db-patient-search {
    display:flex;align-items:center;gap:6px;padding:7px 12px;
    background:var(--color-muted);border:1px solid var(--color-border);
    border-radius:8px;flex:0 1 200px;
}
.db-patient-search i { width:13px;height:13px;color:var(--color-muted-foreground);flex-shrink:0; }
.db-patient-search input { border:none;background:transparent;outline:none;font-size:12px;color:var(--color-foreground);width:100%; }
.db-patient-search input::placeholder { color:var(--color-muted-foreground); }
.db-table-btn {
    display:inline-flex;align-items:center;gap:5px;padding:7px 13px;
    border:1px solid var(--color-border);border-radius:8px;
    background:var(--color-card);color:var(--color-foreground);
    font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-decoration:none;
}
.db-table-btn:hover { background:rgba(127,255,212,.08);border-color:rgba(127,255,212,.4);color:var(--color-foreground); }
.db-table-btn i { width:13px;height:13px;color:var(--color-muted-foreground); }

.db-table { width:100%;border-collapse:collapse;font-size:13px; }
.db-table thead tr { border-bottom:1px solid var(--color-border); }
.db-table thead th {
    padding:8px 12px;text-align:left;font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:.06em;color:var(--color-muted-foreground);
    white-space:nowrap;
}
.db-table thead th:first-child { width:32px; }
.db-table tbody tr { border-bottom:1px solid var(--color-border);transition:background .1s; }
.db-table tbody tr:last-child { border-bottom:none; }
.db-table tbody tr:hover { background:rgba(127,255,212,.03); }
.db-table td { padding:10px 12px;vertical-align:middle; }
.db-table td:first-child { text-align:center; }
.db-td-no { font-size:11px;color:var(--color-muted-foreground);font-weight:600; }
.db-td-id { font-size:12px;font-weight:600;color:var(--color-muted-foreground); }

.db-pt-cell { display:flex;align-items:center;gap:9px; }
.db-pt-avatar {
    width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7FFFD4,#060740);
    display:flex;align-items:center;justify-content:center;
    font-size:11px;font-weight:700;color:#fff;flex-shrink:0;
}
.db-pt-name { font-size:13px;font-weight:600;color:var(--color-foreground); }

.db-td-status-badge {
    display:inline-flex;align-items:center;gap:4px;
    font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;white-space:nowrap;
}
.db-td-status-badge i { width:11px;height:11px; }
.st-active    { background:rgba(22,163,74,.1);  color:#16A34A; }
.st-completed { background:rgba(22,163,74,.1);  color:#16A34A; }
.st-admitted  { background:rgba(6,7,64,.1);     color:#060740; }
.st-cancelled { background:rgba(220,53,69,.1);  color:#DC3545; }
.st-pending   { background:rgba(251,191,36,.12);color:#B45309; }

/* ══════════════════════════════════════════════════════════════════
   CLINICAL PERFORMANCE + QUICK ACTIONS
   ══════════════════════════════════════════════════════════════════ */
.db-fullrow { margin-bottom:16px; }
.db-qa-row { display:flex;gap:10px;flex-wrap:wrap; }
.db-qa-btn {
    display:flex;align-items:center;gap:6px;padding:9px 16px;
    border-radius:9px;border:1px solid var(--color-border);
    background:var(--color-card);color:var(--color-foreground);
    font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .2s;
}
.db-qa-btn:hover { background:rgba(127,255,212,.1);border-color:rgba(127,255,212,.4);color:var(--color-foreground); }
.db-qa-btn i { width:14px;height:14px;color:#7FFFD4; }

/* ══════════════════════════════════════════════════════════════════
   FINANCIAL DASHBOARD
   ══════════════════════════════════════════════════════════════════ */
.fin-banner {
    background:linear-gradient(135deg,#060740 0%,#0d1366 60%,#0a3060 100%);
    border-radius:16px;padding:22px 26px;margin-bottom:16px;color:#fff;
    display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;
}
.fin-banner h2 { font-size:20px;font-weight:700;margin:0 0 3px; }
.fin-banner p  { font-size:13px;color:rgba(255,255,255,.65);margin:0; }
.fin-wstat { text-align:right; }
.fin-wstat .wv { font-size:22px;font-weight:800;color:#7FFFD4; }
.fin-wstat .wl { font-size:11px;color:rgba(255,255,255,.6); }

.fin-rev-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:16px; }
.fin-rev-card {
    background:var(--color-card);border:1px solid var(--color-border);
    border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:5px;transition:all .2s;
}
.fin-rev-card:hover { transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08); }
.fin-rev-icon  { font-size:20px;margin-bottom:2px; }
.fin-rev-label { font-size:10px;color:var(--color-muted-foreground);font-weight:700;text-transform:uppercase;letter-spacing:.05em; }
.fin-rev-value { font-size:20px;font-weight:800;color:var(--color-foreground); }
.fin-rev-sub   { font-size:11px;color:#7FFFD4;font-weight:600; }

.fin-2col      { display:grid;grid-template-columns:7fr 3fr;gap:14px;margin-bottom:14px; }
.fin-2col-half { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px; }
.fin-3col      { display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px; }

.col-item { display:flex;align-items:center;gap:10px;margin-bottom:12px; }
.col-item:last-child { margin-bottom:0; }
.col-dot { width:10px;height:10px;border-radius:50%;flex-shrink:0; }
.col-label { font-size:13px;font-weight:600;color:var(--color-foreground);flex:1; }
.col-pct   { font-size:13px;font-weight:700;color:var(--color-foreground);min-width:36px;text-align:right; }
.col-bar-track { height:6px;background:var(--color-border);border-radius:20px;overflow:hidden;flex:1; }
.col-bar-fill  { height:100%;border-radius:20px; }

.out-item { display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-border);font-size:13px; }
.out-item:last-child { border-bottom:none; }
.out-item .lbl  { color:var(--color-muted-foreground); }
.out-item .amt  { font-weight:700;color:var(--color-foreground); }

.dept-rev-item { margin-bottom:12px; }
.dept-rev-item:last-child { margin-bottom:0; }
.dept-rev-row { display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px; }
.dept-rev-row .dept { font-weight:600;color:var(--color-foreground); }
.dept-rev-row .amt  { font-weight:700;color:var(--color-foreground); }
.dept-rev-row .pct  { color:var(--color-muted-foreground);font-size:11px; }
.prog-bar-track { height:6px;background:var(--color-border);border-radius:20px;overflow:hidden; }
.prog-bar-fill  { height:100%;border-radius:20px;transition:width .6s ease; }

.claim-row { display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--color-border);font-size:13px;gap:10px; }
.claim-row:last-child { border-bottom:none; }
.claim-company { flex:1;font-weight:600;color:var(--color-foreground); }
.claim-count   { color:var(--color-muted-foreground);font-size:12px;min-width:50px; }
.claim-amount  { font-weight:700;color:var(--color-foreground);min-width:90px;text-align:right; }
.claim-badge   { font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;margin-left:4px; }
.badge-pending  { background:rgba(255,193,7,.15);color:#FFC107; }
.badge-approved { background:rgba(40,167,69,.15);color:#28A745; }
.badge-paid     { background:rgba(127,255,212,.15);color:#7FFFD4; }

/* ── JS-injected class aliases (dashboard.js uses dash-stat-change) ─ */
.dash-stat-change { display:inline-flex;align-items:center;gap:2px;font-size:10px;font-weight:700;padding:3px 7px;border-radius:20px;white-space:nowrap;flex-shrink:0; }
.dash-stat-change svg { width:10px;height:10px; }
.change-up   { background:rgba(22,163,74,.12);color:#16A34A; }
.change-down { background:rgba(220,53,69,.12); color:#DC3545; }
.change-flat { background:rgba(0,0,0,.06);     color:var(--color-muted-foreground); }

/* ── Responsive ──────────────────────────────────────────────────── */
@media(max-width:1280px) {
    .db-stat-grid { grid-template-columns:repeat(2,1fr) 2fr; }
    .db-stat-grid .db-stat-chart-card { grid-column:1/-1; }
}
@media(max-width:1024px) {
    .db-mid-grid { grid-template-columns:1fr 1fr; }
    .fin-rev-grid { grid-template-columns:repeat(3,1fr); }
}
@media(max-width:800px) {
    .db-stat-grid { grid-template-columns:1fr 1fr; }
    .db-stat-chart-card { grid-column:1/-1; }
    .db-mid-grid { grid-template-columns:1fr; }
    .db-bot-grid { grid-template-columns:1fr; }
    .db-orders-3col { grid-template-columns:1fr; }
    .fin-2col,.fin-2col-half,.fin-3col { grid-template-columns:1fr; }
    .fin-rev-grid { grid-template-columns:repeat(2,1fr); }
}
@media(max-width:540px) {
    .db-stat-grid { grid-template-columns:1fr; }
}

/* ════════════════════════════════════════════════════════════════════════
   Financial Dashboard v2
   ════════════════════════════════════════════════════════════════════════ */

/* Stat cards row */
.fin2-stat-grid {
    display:grid;
    grid-template-columns:repeat(5,1fr);
    gap:12px;
    margin-bottom:16px;
}
.fin2-stat-card {
    background:var(--color-card);
    border:1px solid var(--color-border);
    border-radius:14px;
    padding:16px 18px;
    display:flex;
    flex-direction:column;
    gap:8px;
}
.fin2-stat-top {
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
}
.fin2-stat-label {
    font-size:11px;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:.05em;
    color:var(--color-muted-foreground);
}
.fin2-stat-icon {
    width:34px;
    height:34px;
    border-radius:9px;
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
}
.fin2-stat-icon svg { width:16px;height:16px; }
.fin2-stat-value {
    font-size:22px;
    font-weight:800;
    color:var(--color-foreground);
    line-height:1.1;
}
.fin2-stat-foot {
    display:flex;
    align-items:center;
    gap:8px;
    flex-wrap:wrap;
}
.fin2-foot-label {
    font-size:11px;
    color:var(--color-muted-foreground);
}
.fin2-change-badge {
    display:inline-flex;
    align-items:center;
    gap:3px;
    padding:2px 8px;
    border-radius:20px;
    font-size:11px;
    font-weight:700;
}
.fin2-change-badge svg { width:11px;height:11px; }
.fin2-up      { background:rgba(22,163,74,.12);  color:#16A34A; }
.fin2-down    { background:rgba(220,53,69,.1);   color:#DC3545; }
.fin2-neutral { background:rgba(0,0,0,.06);      color:var(--color-muted-foreground); }

/* Tab navigation */
.fin2-tabs {
    display:flex;
    align-items:center;
    gap:4px;
    background:var(--color-card);
    border:1px solid var(--color-border);
    border-radius:10px;
    padding:4px;
    margin-bottom:14px;
    width:fit-content;
}
.fin2-tab {
    padding:7px 16px;
    font-size:13px;
    font-weight:600;
    color:var(--color-muted-foreground);
    background:transparent;
    border:none;
    border-radius:7px;
    cursor:pointer;
    transition:all .15s ease;
}
.fin2-tab:hover { color:var(--color-foreground); background:rgba(0,0,0,.04); }
.fin2-tab.active {
    background:#060740;
    color:#7FFFD4;
}

/* Chart + breakdown layout */
.fin2-chart-layout {
    display:flex;
    gap:16px;
    align-items:flex-start;
}

/* Revenue Breakdown boxes */
.fin2-breakdown-box {
    border:1px solid var(--color-border);
    border-radius:10px;
    padding:12px 14px;
    margin-bottom:10px;
}
.fin2-breakdown-label {
    font-size:11px;
    color:var(--color-muted-foreground);
    font-weight:600;
    margin-bottom:4px;
}
.fin2-breakdown-value {
    font-size:20px;
    font-weight:800;
}

/* Quick action tile */
.fin2-qa-tile {
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:10px;
    padding:24px 16px;
    background:var(--color-muted);
    border:1px solid var(--color-border);
    border-radius:12px;
    color:var(--color-foreground);
    text-decoration:none;
    font-size:13px;
    font-weight:600;
    transition:all .15s ease;
}
.fin2-qa-tile:hover { background:#060740; color:#7FFFD4; transform:translateY(-2px); box-shadow:0 6px 20px rgba(6,7,64,.15); }
.fin2-qa-tile svg { width:22px;height:22px; }

/* Responsive */
@media(max-width:1280px) {
    .fin2-stat-grid { grid-template-columns:repeat(3,1fr); }
    .fin2-chart-layout { flex-direction:column; }
    .fin2-chart-layout > div:last-child { width:100% !important; }
}
@media(max-width:900px) {
    .fin2-stat-grid { grid-template-columns:repeat(2,1fr); }
}
@media(max-width:540px) {
    .fin2-stat-grid { grid-template-columns:1fr; }
    .fin2-tabs { flex-wrap:wrap; }
}
</style>
<?php $__env->stopPush(); ?>

<?php $__env->startSection('content'); ?>


<div class="dash-top">
    <div class="dash-greeting-block">
        <h1 id="dashGreeting">Loading...</h1>
        <p id="dashSubGreeting" class="page-subtitle"></p>
    </div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div class="refresh-badge">
            <i data-lucide="refresh-cw"></i>
            <span id="lastRefresh">Refreshing...</span>
        </div>
        <div class="switcher-wrap">
            <button class="switcher-btn" id="switcherBtn">
                <i data-lucide="layout-dashboard"></i>
                <span id="switcherLabel">Clinical Dashboard</span>
                <i data-lucide="chevron-down"></i>
            </button>
            <div class="switcher-dropdown" id="switcherDropdown">
                <div class="switcher-option active" data-dash="clinical" onclick="switchDashboard('clinical')">
                    <div class="switcher-dot"></div>
                    <div style="flex:1">
                        <div class="switcher-opt-name">Clinical Dashboard</div>
                        <div class="switcher-opt-desc">Patient care &amp; medical operations</div>
                    </div>
                    <svg class="switcher-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="switcher-option" data-dash="financial" onclick="switchDashboard('financial')">
                    <div class="switcher-dot"></div>
                    <div style="flex:1">
                        <div class="switcher-opt-name">Financial Dashboard</div>
                        <div class="switcher-opt-desc">Revenue &amp; billing analytics</div>
                    </div>
                    <svg class="switcher-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            </div>
        </div>
    </div>
</div>




<div id="clinicalDash" class="dash-panel">

    
    <div class="db-stat-grid">

        
        <div class="db-stat-card">
            <div class="db-stat-label"><i data-lucide="info"></i> OPD Patients</div>
            <div class="db-stat-row">
                <div class="db-stat-icon" style="background:rgba(127,255,212,.12)">
                    <i data-lucide="users" style="color:#059669"></i>
                </div>
                <div class="db-stat-value" id="cs-opd">—</div>
                <span class="db-change-badge badge-flat" id="cs-opd-ch">+0 today</span>
            </div>
            <div class="db-stat-foot">
                <i data-lucide="arrow-right"></i>
                <span id="clin-wstat-opd" style="font-weight:600;color:var(--color-foreground)">—</span>
                &nbsp;seen today
            </div>
        </div>

        
        <div class="db-stat-card">
            <div class="db-stat-label"><i data-lucide="info"></i> IPD Admitted</div>
            <div class="db-stat-row">
                <div class="db-stat-icon" style="background:rgba(6,7,64,.1)">
                    <i data-lucide="bed" style="color:#060740"></i>
                </div>
                <div class="db-stat-value" id="cs-ipd">—</div>
                <span class="db-change-badge badge-flat" id="cs-ipd-ch">+0 today</span>
            </div>
            <div class="db-stat-foot">
                <i data-lucide="arrow-right"></i>
                <span id="clin-wstat-ipd" style="font-weight:600;color:var(--color-foreground)">—</span>
                &nbsp;active admissions
            </div>
        </div>

        
        <div class="db-stat-card">
            <div class="db-stat-label"><i data-lucide="info"></i> ER Cases</div>
            <div class="db-stat-row">
                <div class="db-stat-icon" style="background:rgba(220,53,69,.1)">
                    <i data-lucide="activity" style="color:#DC3545"></i>
                </div>
                <div class="db-stat-value" id="cs-er">—</div>
                <span class="db-change-badge badge-flat" id="cs-er-ch">+0 today</span>
            </div>
            <div class="db-stat-foot">
                <i data-lucide="arrow-right"></i>
                <span id="clin-wstat-er" style="font-weight:600;color:var(--color-foreground)">—</span>
                &nbsp;active cases
            </div>
        </div>

        
        <div class="db-stat-card">
            <div class="db-stat-label"><i data-lucide="info"></i> Pharmacy Rx</div>
            <div class="db-stat-row">
                <div class="db-stat-icon" style="background:rgba(111,66,193,.1)">
                    <i data-lucide="pill" style="color:#6f42c1"></i>
                </div>
                <div class="db-stat-value" id="cs-pharm">—</div>
                <span class="db-change-badge badge-flat" id="cs-pharm-ch">+0 today</span>
            </div>
            <div class="db-stat-foot">
                <i data-lucide="arrow-right"></i>
                Lab orders:&nbsp;<span id="cs-lab" style="font-weight:600;color:var(--color-foreground)">—</span>
            </div>
        </div>

        
        <div class="db-stat-chart-card">
            <div class="db-card-head">
                <div class="db-card-label"><i data-lucide="trending-up"></i> Patient Flow &mdash; Last 7 Days</div>
                <div style="display:flex;align-items:center;gap:14px">
                    <div class="db-chart-legend">
                        <div class="db-legend-item"><div class="db-legend-dot" style="background:#059669"></div>OPD</div>
                        <div class="db-legend-item"><div class="db-legend-dot" style="background:#060740"></div>IPD</div>
                        <div class="db-legend-item"><div class="db-legend-dot" style="background:#DC3545"></div>ER</div>
                    </div>
                </div>
            </div>
            <div class="db-chart-wrap" style="height:130px">
                <canvas id="patientFlowChart"></canvas>
            </div>
        </div>

    </div>

    
    <div class="db-mid-grid">

        
        <div class="db-card">
            <div class="db-card-head">
                <div class="db-card-label"><i data-lucide="activity"></i> Orders Summary</div>
                <span class="db-see-details"><i data-lucide="chevron-right"></i> See Details</span>
            </div>

            
            <div class="db-treat-bars" id="ordersBarStrip" style="margin-bottom:14px"></div>

            
            <div class="db-prog-item">
                <div class="db-prog-dot" style="background:#7FFFD4"></div>
                <div class="db-prog-info">
                    <div class="db-prog-name">Pharmacy Orders</div>
                    <div class="db-prog-sub">Pending: <span id="ord-pharm-p">—</span> &nbsp;|&nbsp; Dispensing: <span id="ord-pharm-d">—</span></div>
                </div>
                <div class="db-prog-pct" id="ord-pharm-c">—</div>
                <div class="db-ext-icon"><i data-lucide="external-link"></i></div>
            </div>

            
            <div class="db-prog-item">
                <div class="db-prog-dot" style="background:#FFC107"></div>
                <div class="db-prog-info">
                    <div class="db-prog-name">Lab Orders</div>
                    <div class="db-prog-sub">Pending: <span id="ord-lab-p">—</span> &nbsp;|&nbsp; In Progress: <span id="ord-lab-ip">—</span></div>
                </div>
                <div class="db-prog-pct" id="ord-lab-c">—</div>
                <div class="db-ext-icon"><i data-lucide="external-link"></i></div>
            </div>

            
            <div class="db-prog-item">
                <div class="db-prog-dot" style="background:#6f42c1"></div>
                <div class="db-prog-info">
                    <div class="db-prog-name">Imaging Orders</div>
                    <div class="db-prog-sub">Pending: <span id="ord-img-p">—</span> &nbsp;|&nbsp; In Progress: <span id="ord-img-ip">—</span></div>
                </div>
                <div class="db-prog-pct" id="ord-img-c">—</div>
                <div class="db-ext-icon"><i data-lucide="external-link"></i></div>
            </div>
        </div>

        
        <div class="db-card">
            <div class="db-card-head">
                <div class="db-card-label"><i data-lucide="clipboard-check"></i> Pending Actions</div>
                <a href="<?php echo e(url('/ipd')); ?>" class="db-see-details"><i data-lucide="chevron-right"></i> View All</a>
            </div>

            <div class="db-emp-hero">
                <div class="db-staff-avatar" style="width:42px;height:42px;font-size:14px">
                    <i data-lucide="activity" style="width:18px;height:18px;color:#fff"></i>
                </div>
                <div>
                    <div class="db-emp-val" id="pa-total-count" style="line-height:1">—</div>
                    <div style="font-size:11px;color:var(--color-muted-foreground)">Total pending tasks</div>
                </div>
                <span class="db-change-badge badge-up" style="margin-left:auto">
                    <i data-lucide="trending-up"></i> Active
                </span>
            </div>

            <div class="db-staff-item">
                <div class="db-staff-avatar" style="background:linear-gradient(135deg,#FFC107,#e67e00)">
                    <i data-lucide="log-out" style="width:14px;height:14px;color:#fff"></i>
                </div>
                <div style="flex:1">
                    <div class="db-staff-name">Discharge Summaries</div>
                    <div class="db-staff-role">IPD patients awaiting discharge</div>
                </div>
                <div style="font-size:20px;font-weight:800;color:var(--color-foreground)" id="pa-discharges">—</div>
            </div>
            <div class="db-staff-item">
                <div class="db-staff-avatar" style="background:linear-gradient(135deg,#7FFFD4,#059669)">
                    <i data-lucide="flask-conical" style="width:14px;height:14px;color:#fff"></i>
                </div>
                <div style="flex:1">
                    <div class="db-staff-name">Lab Orders to Review</div>
                    <div class="db-staff-role">Results ready for clinician</div>
                </div>
                <div style="font-size:20px;font-weight:800;color:var(--color-foreground)" id="pa-lab">—</div>
            </div>
            <div class="db-staff-item">
                <div class="db-staff-avatar" style="background:linear-gradient(135deg,#DC3545,#b52535)">
                    <i data-lucide="activity" style="width:14px;height:14px;color:#fff"></i>
                </div>
                <div style="flex:1">
                    <div class="db-staff-name">Active ER Cases</div>
                    <div class="db-staff-role">Emergency requiring attention</div>
                </div>
                <div style="font-size:20px;font-weight:800;color:var(--color-foreground)" id="pa-er">—</div>
            </div>
            <div class="db-staff-item">
                <div class="db-staff-avatar" style="background:linear-gradient(135deg,#060740,#1a237e)">
                    <i data-lucide="scissors" style="width:14px;height:14px;color:#7FFFD4"></i>
                </div>
                <div style="flex:1">
                    <div class="db-staff-name">Surgeries Scheduled</div>
                    <div class="db-staff-role">OT operations today</div>
                </div>
                <div style="font-size:20px;font-weight:800;color:var(--color-foreground)" id="pa-ops">—</div>
            </div>
        </div>

        
        <div class="db-card">
            <div class="db-card-head">
                <div class="db-card-label"><i data-lucide="bell"></i> Clinical Alerts</div>
                <span class="db-see-details"><i data-lucide="chevron-right"></i> See Details</span>
            </div>

            
            <div class="db-sat-hero">
                <div class="db-stat-icon" style="background:rgba(127,255,212,.12);width:42px;height:42px;border-radius:10px">
                    <i data-lucide="layout-grid" style="color:#059669;width:20px;height:20px"></i>
                </div>
                <div>
                    <div class="db-sat-val" id="beds-pct">—%</div>
                    <div style="font-size:11px;color:var(--color-muted-foreground)">Bed Occupancy</div>
                </div>
                <span class="db-change-badge badge-flat" style="margin-left:auto">
                    <span id="beds-avail">—</span>&nbsp;free
                </span>
            </div>

            
            <div style="background:var(--color-border);border-radius:4px;height:6px;margin-bottom:14px">
                <div id="beds-bar" style="background:linear-gradient(90deg,#7FFFD4,#060740);height:6px;border-radius:4px;width:0%;transition:width .6s ease"></div>
            </div>

            <div class="db-alert-item alert-i-warn">
                <div class="db-alert-dot dot-warn"></div>
                <div class="db-alert-text">
                    <strong>Discharge Requests</strong>
                    <span id="alert-discharges">Loading...</span>
                </div>
            </div>
            <div class="db-alert-item alert-i-info">
                <div class="db-alert-dot dot-info"></div>
                <div class="db-alert-text">
                    <strong>Lab Orders In Progress</strong>
                    <span id="alert-lab-inprogress">Loading...</span>
                </div>
            </div>
            <div class="db-alert-item alert-i-info">
                <div class="db-alert-dot dot-info"></div>
                <div class="db-alert-text">
                    <strong>Operations Scheduled</strong>
                    <span id="alert-ops">Loading...</span>
                </div>
            </div>
            <div class="db-alert-item alert-i-crit">
                <div class="db-alert-dot dot-crit"></div>
                <div class="db-alert-text">
                    <strong>Bed Occupancy</strong>
                    <span id="alert-beds">Loading...</span>
                </div>
            </div>

            <div class="db-sat-message" style="margin-top:10px">
                <strong>Bed Status</strong>
                <span>Total:&nbsp;<b id="beds-total">—</b> &nbsp;&bull;&nbsp; Occupied:&nbsp;<b id="beds-occ">—</b> &nbsp;&bull;&nbsp; Available:&nbsp;<b id="beds-avail2">—</b></span>
            </div>
        </div>

    </div>

    
    <div class="db-bot-grid">
        <div class="db-card">
            <div class="db-card-head">
                <div class="db-card-label"><i data-lucide="layout-grid"></i> Department Overview</div>
            </div>
            <div class="db-bed-grid">
                <div class="db-bed-mini">
                    <div class="db-bed-mini-label">Active IPD</div>
                    <div class="db-bed-mini-val" id="dov-ipd">—</div>
                </div>
                <div class="db-bed-mini">
                    <div class="db-bed-mini-label">OPD Today</div>
                    <div class="db-bed-mini-val" id="dov-opd">—</div>
                </div>
                <div class="db-bed-mini">
                    <div class="db-bed-mini-label">ER Active</div>
                    <div class="db-bed-mini-val" id="dov-er">—</div>
                </div>
                <div class="db-bed-mini">
                    <div class="db-bed-mini-label">Scheduled OT</div>
                    <div class="db-bed-mini-val" id="dov-ot">—</div>
                </div>
            </div>
        </div>
        <div class="db-card">
            <div class="db-card-head">
                <div class="db-card-label"><i data-lucide="bar-chart-2"></i> Clinical Activity &mdash; 14 Days</div>
            </div>
            <div style="height:160px;position:relative">
                <canvas id="clinicalPerfChart"></canvas>
            </div>
        </div>
    </div>

    
    <div class="db-card db-patient-card db-fullrow">
        <div class="db-patient-head">
            <div class="db-patient-title">
                <i data-lucide="activity"></i>
                PATIENT LIST
                <i data-lucide="info" style="width:13px;height:13px;color:var(--color-muted-foreground)"></i>
            </div>
            <div class="db-patient-search">
                <i data-lucide="search"></i>
                <input type="text" placeholder="Search patient..." id="dbPatientSearch">
            </div>
            <button class="db-table-btn" onclick="location.href='<?php echo e(url('/patients')); ?>'">
                <i data-lucide="sliders-horizontal"></i> Filter
            </button>
            <button class="db-table-btn" onclick="location.href='<?php echo e(url('/patients')); ?>'">
                <i data-lucide="upload"></i> Export
            </button>
        </div>
        <div style="overflow-x:auto">
            <table class="db-table" id="dbPatientTable">
                <thead>
                    <tr>
                        <th><input type="checkbox" style="accent-color:#060740"></th>
                        <th>NO</th>
                        <th>ID</th>
                        <th>PATIENT LIST <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                        <th>AGE <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                        <th>GENDER <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                        <th>LAST VISIT <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                        <th>NEXT APPOINTMENT <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                        <th>STATUS <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="dbPatientTableBody">
                    <tr><td colspan="10" style="text-align:center;padding:28px;color:var(--color-muted-foreground);font-size:13px">Loading patients...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    
    <div class="db-card db-fullrow">
        <div class="db-card-head">
            <div class="db-card-label"><i data-lucide="zap"></i> Quick Actions</div>
        </div>
        <div class="db-qa-row">
            <a href="<?php echo e(url('/patients')); ?>"              class="db-qa-btn"><i data-lucide="user-plus"></i> Register Patient</a>
            <a href="<?php echo e(url('/opd')); ?>"                   class="db-qa-btn"><i data-lucide="stethoscope"></i> Create OPD</a>
            <a href="<?php echo e(url('/ipd')); ?>"                   class="db-qa-btn"><i data-lucide="bed"></i> IPD Admission</a>
            <a href="<?php echo e(url('/emergency')); ?>"             class="db-qa-btn"><i data-lucide="activity"></i> Emergency</a>
            <a href="<?php echo e(url('/laboratory/test-orders')); ?>"class="db-qa-btn"><i data-lucide="flask-conical"></i> Order Lab</a>
            <a href="<?php echo e(url('/pharmacy/dispensing')); ?>"   class="db-qa-btn"><i data-lucide="pill"></i> Dispense Medicine</a>
        </div>
    </div>

</div>





<div id="financialDash" class="dash-panel" style="display:none">

    
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <div>
            <h2 style="font-size:20px;font-weight:700;color:var(--color-foreground);margin:0 0 2px" id="fin-welcome-msg">Finance &amp; Analytics</h2>
            <p style="font-size:13px;color:var(--color-muted-foreground);margin:0" id="fin-welcome-sub">Comprehensive revenue performance metrics &amp; insights</p>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid var(--color-border);border-radius:8px;background:var(--color-card);font-size:12px;font-weight:600;color:var(--color-muted-foreground)">
                <i data-lucide="calendar" style="width:13px;height:13px"></i>
                This Month
                <i data-lucide="chevron-down" style="width:12px;height:12px"></i>
            </div>
            <button class="db-table-btn" onclick="window.print()"><i data-lucide="printer"></i> Print</button>
            <a href="<?php echo e(url('/income-expense')); ?>" class="db-table-btn" style="text-decoration:none"><i data-lucide="download"></i> Export</a>
            <a href="<?php echo e(url('/billing')); ?>" class="db-qa-btn" style="background:#060740;color:#7FFFD4;border-color:#060740;text-decoration:none">
                <i data-lucide="plus" style="color:#7FFFD4"></i> Quick Action
            </a>
        </div>
    </div>

    
    <div class="fin2-stat-grid">

        
        <div class="fin2-stat-card">
            <div class="fin2-stat-top">
                <div class="fin2-stat-label">Total Revenue</div>
                <div class="fin2-stat-icon" style="background:rgba(6,7,64,.08)">
                    <i data-lucide="landmark" style="color:#060740"></i>
                </div>
            </div>
            <div class="fin2-stat-value" id="frc-total">—</div>
            <div class="fin2-stat-foot">
                <span class="fin2-change-badge fin2-up"><i data-lucide="trending-up"></i> <span id="fin2-total-pct">—</span></span>
                <span class="fin2-foot-label">Vs Last Period</span>
            </div>
        </div>

        
        <div class="fin2-stat-card">
            <div class="fin2-stat-top">
                <div class="fin2-stat-label">OPD Revenue</div>
                <div class="fin2-stat-icon" style="background:rgba(22,163,74,.08)">
                    <i data-lucide="stethoscope" style="color:#16A34A"></i>
                </div>
            </div>
            <div class="fin2-stat-value" id="frc-opd">—</div>
            <div class="fin2-stat-foot">
                <span class="fin2-change-badge fin2-up"><i data-lucide="trending-up"></i> This month</span>
                <span class="fin2-foot-label">OPD Billing</span>
            </div>
        </div>

        
        <div class="fin2-stat-card">
            <div class="fin2-stat-top">
                <div class="fin2-stat-label">Collection Rate</div>
                <div class="fin2-stat-icon" style="background:rgba(251,191,36,.1)">
                    <i data-lucide="percent" style="color:#B45309"></i>
                </div>
            </div>
            <div class="fin2-stat-value" id="fin2-col-rate">—%</div>
            <div class="fin2-stat-foot">
                <span class="fin2-change-badge fin2-down"><i data-lucide="trending-down"></i> <span id="fin2-overdue-pct">—</span> overdue</span>
                <span class="fin2-foot-label">Improvement</span>
            </div>
        </div>

        
        <div class="fin2-stat-card">
            <div class="fin2-stat-top">
                <div class="fin2-stat-label">Insurance Claims</div>
                <div class="fin2-stat-icon" style="background:rgba(127,255,212,.12)">
                    <i data-lucide="shield-check" style="color:#059669"></i>
                </div>
            </div>
            <div class="fin2-stat-value" id="panel-pending-count">—</div>
            <div class="fin2-stat-foot">
                <span class="fin2-change-badge fin2-up"><i data-lucide="trending-up"></i> <span id="fin2-claims-approved">—</span>% Approved</span>
                <span class="fin2-foot-label">Approval Rate</span>
            </div>
        </div>

        
        <div class="fin2-stat-card">
            <div class="fin2-stat-top">
                <div class="fin2-stat-label">Total Outstanding</div>
                <div class="fin2-stat-icon" style="background:rgba(220,53,69,.08)">
                    <i data-lucide="calendar-clock" style="color:#DC3545"></i>
                </div>
            </div>
            <div class="fin2-stat-value" id="out-total">—</div>
            <div class="fin2-stat-foot">
                <span class="fin2-change-badge fin2-neutral">Current Month</span>
            </div>
        </div>

    </div>

    
    <div class="fin2-tabs">
        <button class="fin2-tab active" data-tab="revenue" onclick="switchFinTab('revenue')">Revenue</button>
        <button class="fin2-tab" data-tab="collections" onclick="switchFinTab('collections')">Collections</button>
        <button class="fin2-tab" data-tab="payments" onclick="switchFinTab('payments')">Payments</button>
        <button class="fin2-tab" data-tab="claims" onclick="switchFinTab('claims')">Claims</button>
        <button class="fin2-tab" data-tab="actions" onclick="switchFinTab('actions')">Quick Actions</button>
    </div>

    
    <div class="fin2-tab-pane" id="finTab-revenue">

        
        <div class="fin2-chart-layout">

            
            <div class="db-card" style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
                    <div style="font-size:15px;font-weight:700;color:var(--color-foreground)">Revenue Trend Analysis</div>
                    <div style="display:flex;align-items:center;gap:14px">
                        <span class="db-legend-item"><span style="width:10px;height:10px;border-radius:50%;background:#059669;display:inline-block"></span>&nbsp;Revenue</span>
                        <span class="db-legend-item"><span style="width:10px;height:10px;border-radius:50%;background:#DC3545;display:inline-block"></span>&nbsp;Outstanding</span>
                        <span class="db-legend-item"><span style="width:10px;height:10px;border-radius:50%;background:#060740;display:inline-block"></span>&nbsp;Collected</span>
                    </div>
                </div>
                <div style="height:240px;position:relative">
                    <canvas id="revenueTrendChart"></canvas>
                </div>
                <div style="display:flex;gap:14px;margin-top:10px;flex-wrap:wrap">
                    <span class="db-legend-item" style="font-size:11px;color:var(--color-muted-foreground)"><span style="width:12px;height:2px;background:#7FFFD4;display:inline-block;border-radius:2px;vertical-align:middle"></span>&nbsp;OPD</span>
                    <span class="db-legend-item" style="font-size:11px;color:var(--color-muted-foreground)"><span style="width:12px;height:2px;background:#060740;display:inline-block;border-radius:2px;vertical-align:middle"></span>&nbsp;IPD</span>
                    <span class="db-legend-item" style="font-size:11px;color:var(--color-muted-foreground)"><span style="width:12px;height:2px;background:#6f42c1;display:inline-block;border-radius:2px;vertical-align:middle"></span>&nbsp;Pharmacy</span>
                    <span class="db-legend-item" style="font-size:11px;color:var(--color-muted-foreground)"><span style="width:12px;height:2px;background:#FFC107;display:inline-block;border-radius:2px;vertical-align:middle"></span>&nbsp;Lab</span>
                </div>
            </div>

            
            <div style="display:flex;flex-direction:column;gap:0;width:240px;flex-shrink:0">
                <div style="font-size:15px;font-weight:700;color:var(--color-foreground);margin-bottom:12px">Revenue Breakdown</div>

                <div class="fin2-breakdown-box" style="background:rgba(22,163,74,.05);border-color:rgba(22,163,74,.15)">
                    <div class="fin2-breakdown-label">Total Revenue (Month)</div>
                    <div class="fin2-breakdown-value" style="color:#16A34A" id="fin2-breakdown-total">—</div>
                </div>
                <div class="fin2-breakdown-box" style="background:rgba(220,53,69,.04);border-color:rgba(220,53,69,.12)">
                    <div class="fin2-breakdown-label">Outstanding Amount</div>
                    <div class="fin2-breakdown-value" style="color:#DC3545" id="fin2-breakdown-outstanding">—</div>
                </div>
                <div class="fin2-breakdown-box" style="background:rgba(6,7,64,.04);border-color:rgba(6,7,64,.1)">
                    <div class="fin2-breakdown-label">Total Collected</div>
                    <div class="fin2-breakdown-value" style="color:#060740" id="fin2-breakdown-collected">—</div>
                </div>
                <div class="fin2-breakdown-box" style="background:rgba(127,255,212,.05);border-color:rgba(127,255,212,.2)">
                    <div class="fin2-breakdown-label">Today's Revenue</div>
                    <div class="fin2-breakdown-value" style="color:#059669" id="fin-today-rev">—</div>
                </div>

                <div style="margin-top:14px">
                    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
                        <span style="color:var(--color-muted-foreground)">Collection Rate</span>
                        <span style="font-weight:700;color:var(--color-foreground)" id="fin2-col-rate2">—%</span>
                    </div>
                    <div style="height:6px;background:var(--color-border);border-radius:4px;overflow:hidden">
                        <div id="fin2-col-bar" style="height:100%;border-radius:4px;background:linear-gradient(90deg,#060740,#7FFFD4);width:0%;transition:width .6s ease"></div>
                    </div>
                </div>
            </div>
        </div>

        
        <div class="db-card" style="margin-top:16px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                <div style="font-size:15px;font-weight:700;color:var(--color-foreground)">Department Performance Details</div>
                <a href="<?php echo e(url('/income-expense')); ?>" class="db-see-details"><i data-lucide="chevron-right"></i> View All</a>
            </div>
            <div style="overflow-x:auto">
                <table class="db-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Revenue <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                            <th>Outstanding <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                            <th>Collected <i data-lucide="chevrons-up-down" style="width:11px;height:11px;vertical-align:middle"></i></th>
                            <th>Share</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody id="fin2-dept-tbody">
                        <tr><td colspan="6" style="text-align:center;padding:24px;color:var(--color-muted-foreground);font-size:13px">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
            
            <div id="deptRevenueList" style="display:none"></div>
        </div>

    </div>

    
    <div class="fin2-tab-pane" id="finTab-collections" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            <div class="db-card">
                <div class="db-card-head"><div class="db-card-label"><i data-lucide="pie-chart"></i> Collection Status</div></div>
                <div class="col-item" style="margin-bottom:14px"><div class="col-dot" style="background:#28A745"></div><div class="col-label">Collected</div><div class="col-bar-track"><div class="col-bar-fill" id="col-bar-collected" style="background:#28A745;width:0%"></div></div><div class="col-pct" id="col-pct-collected">—%</div></div>
                <div class="col-item" style="margin-bottom:14px"><div class="col-dot" style="background:#FFC107"></div><div class="col-label">Pending</div><div class="col-bar-track"><div class="col-bar-fill" id="col-bar-pending" style="background:#FFC107;width:0%"></div></div><div class="col-pct" id="col-pct-pending">—%</div></div>
                <div class="col-item" style="margin-bottom:14px"><div class="col-dot" style="background:#DC3545"></div><div class="col-label">Overdue</div><div class="col-bar-track"><div class="col-bar-fill" id="col-bar-overdue" style="background:#DC3545;width:0%"></div></div><div class="col-pct" id="col-pct-overdue">—%</div></div>
                <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--color-border)">
                    <div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:3px">Total Billed (Month)</div>
                    <div style="font-size:20px;font-weight:800;color:var(--color-foreground)" id="col-total-billed">—</div>
                </div>
            </div>
            <div class="db-card">
                <div class="db-card-head"><div class="db-card-label"><i data-lucide="alert-circle"></i> Outstanding by Type</div></div>
                <div class="out-item"><div><div class="lbl">OPD Pending</div><div style="font-size:11px;color:var(--color-muted-foreground)" id="out-opd-count">— bills</div></div><div class="amt" id="out-opd-amt">—</div></div>
                <div class="out-item"><div><div class="lbl">IPD Pending</div><div style="font-size:11px;color:var(--color-muted-foreground)" id="out-ipd-count">— patients</div></div><div class="amt" id="out-ipd-amt">—</div></div>
                <div class="out-item"><div><div class="lbl">Pharmacy Pending</div></div><div class="amt" id="out-pharm-amt">—</div></div>
                <div style="margin-top:12px;padding:12px;background:rgba(220,53,69,.05);border-radius:10px;border:1px dashed rgba(220,53,69,.2)">
                    <div style="font-size:11px;color:var(--color-muted-foreground);margin-bottom:3px">Total Outstanding</div>
                    <div style="font-size:20px;font-weight:800;color:#DC3545" id="out-total-2">—</div>
                </div>
            </div>
        </div>
        <div class="db-card">
            <div class="db-card-head"><div class="db-card-label"><i data-lucide="log-out"></i> Discharge Clearances</div></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="text-align:center;padding:16px;background:rgba(255,193,7,.06);border-radius:10px;border:1px solid rgba(255,193,7,.2)">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#B45309;margin-bottom:6px">Pending Clearance</div>
                    <div style="font-size:36px;font-weight:900;color:#FFC107" id="disc-pending">—</div>
                </div>
                <div style="text-align:center;padding:16px;background:rgba(40,167,69,.06);border-radius:10px;border:1px solid rgba(40,167,69,.2)">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#16A34A;margin-bottom:6px">Total Discharged</div>
                    <div style="font-size:36px;font-weight:900;color:#28A745" id="disc-done">—</div>
                </div>
            </div>
        </div>
    </div>

    
    <div class="fin2-tab-pane" id="finTab-payments" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="db-card">
                <div class="db-card-head"><div class="db-card-label"><i data-lucide="credit-card"></i> Payment Methods Distribution</div></div>
                <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
                    <div style="flex:0 0 180px;height:180px"><canvas id="paymentMethodsChart"></canvas></div>
                    <div style="flex:1;min-width:120px"><div id="payMethodLegend" style="display:flex;flex-direction:column;gap:10px"></div></div>
                </div>
            </div>
            <div class="db-card">
                <div class="db-card-head"><div class="db-card-label"><i data-lucide="receipt"></i> Today's Transactions</div></div>
                <div style="text-align:center;padding:20px 0">
                    <div style="font-size:48px;font-weight:900;color:var(--color-foreground)" id="today-txn-count">—</div>
                    <div style="font-size:12px;color:var(--color-muted-foreground);margin-bottom:14px">Bills Processed Today</div>
                    <div style="font-size:26px;font-weight:800;color:#7FFFD4" id="today-txn-amt">—</div>
                    <div style="font-size:12px;color:var(--color-muted-foreground)">Total Collected Today</div>
                </div>
            </div>
        </div>
    </div>

    
    <div class="fin2-tab-pane" id="finTab-claims" style="display:none">
        <div class="db-card">
            <div class="db-card-head">
                <div class="db-card-label"><i data-lucide="file-warning"></i> Panel &amp; Insurance Claims</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                <div style="background:rgba(255,193,7,.06);border:1px solid rgba(255,193,7,.2);border-radius:10px;padding:14px">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#B45309;margin-bottom:4px">Pending Claims</div>
                    <div style="font-size:28px;font-weight:800;color:var(--color-foreground)" id="fin2-panel-pending">—</div>
                    <div style="font-size:12px;color:var(--color-muted-foreground);margin-top:2px" id="fin2-panel-pending-amt-label">—</div>
                </div>
                <div style="background:rgba(22,163,74,.06);border:1px solid rgba(22,163,74,.2);border-radius:10px;padding:14px">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#16A34A;margin-bottom:4px">Approved (Unpaid)</div>
                    <div style="font-size:28px;font-weight:800;color:var(--color-foreground)" id="fin2-panel-approved">—</div>
                    <div style="font-size:12px;color:var(--color-muted-foreground);margin-top:2px" id="fin2-panel-approved-amt-label">—</div>
                </div>
            </div>
            <div id="panel-company-list"></div>
            
            <div style="display:none">
                <span id="panel-pending-amt">—</span>
                <span id="panel-approved-count">—</span>
                <span id="panel-approved-amt">—</span>
            </div>
        </div>
        
        <div style="display:none">
            <span id="frc-ipd">—</span>
            <span id="frc-pharm">—</span>
            <span id="frc-lab">—</span>
            <span id="fin-pending-count">—</span>
        </div>
    </div>

    
    <div class="fin2-tab-pane" id="finTab-actions" style="display:none">
        <div class="db-card">
            <div class="db-card-head"><div class="db-card-label"><i data-lucide="zap"></i> Quick Actions</div></div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
                <a href="<?php echo e(url('/billing')); ?>"            class="fin2-qa-tile"><i data-lucide="wallet"></i><span>Collect Payment</span></a>
                <a href="<?php echo e(url('/billing')); ?>"            class="fin2-qa-tile"><i data-lucide="file-text"></i><span>Generate Invoice</span></a>
                <a href="<?php echo e(url('/pharmacy/billing')); ?>"   class="fin2-qa-tile"><i data-lucide="pill"></i><span>Pharmacy Billing</span></a>
                <a href="<?php echo e(url('/laboratory/billing')); ?>" class="fin2-qa-tile"><i data-lucide="flask-conical"></i><span>Lab Billing</span></a>
                <a href="<?php echo e(url('/income-expense')); ?>"     class="fin2-qa-tile"><i data-lucide="bar-chart-2"></i><span>Income &amp; Expense</span></a>
                <a href="<?php echo e(url('/billing/ipd-discharge')); ?>" class="fin2-qa-tile"><i data-lucide="log-out"></i><span>IPD Discharge</span></a>
            </div>
        </div>
    </div>

</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script src="<?php echo e(asset('js/dashboard.js')); ?>?v=<?php echo e(filemtime(public_path('js/dashboard.js'))); ?>"></script>
<script>
// ── Patient table for dashboard ──────────────────────────────────────────────
(function() {
    function initDashPatientTable() {
        fetch('/api/patients?per_page=8&sort=created_at&dir=desc')
            .then(r => r.json())
            .then(function(data) {
                var rows = data.data || data || [];
                var tbody = document.getElementById('dbPatientTableBody');
                if (!tbody) return;
                if (!rows.length) {
                    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:28px;color:var(--color-muted-foreground);font-size:13px">No patients found.</td></tr>';
                    return;
                }
                function esc(s) { return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
                function statusBadge(s) {
                    if (!s) return '<span class="db-td-status-badge badge-flat">—</span>';
                    var sl = String(s).toLowerCase();
                    if (sl==='active'||sl==='admitted') return '<span class="db-td-status-badge st-active"><i data-lucide="check-circle" style="width:11px;height:11px"></i>'+esc(s)+'</span>';
                    if (sl==='completed'||sl==='discharged') return '<span class="db-td-status-badge st-completed"><i data-lucide="check-circle" style="width:11px;height:11px"></i>'+esc(s)+'</span>';
                    if (sl==='cancelled') return '<span class="db-td-status-badge st-cancelled"><i data-lucide="x-circle" style="width:11px;height:11px"></i>'+esc(s)+'</span>';
                    return '<span class="db-td-status-badge badge-flat">'+esc(s)+'</span>';
                }
                function fmtDate(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}); } catch(e){return d;} }
                function initials(fn,ln) { return ((fn||'')[0]||'')+''+((ln||'')[0]||''); }
                var html = '';
                rows.forEach(function(p, i) {
                    var fn = p.firstName||p.first_name||'', ln = p.lastName||p.last_name||'';
                    var name = (fn+' '+ln).trim() || 'Unknown';
                    var pid  = p.patientId || p.patient_id || p.id || '—';
                    var age  = p.age || (p.dateOfBirth ? (new Date().getFullYear()-new Date(p.dateOfBirth).getFullYear()) : '—');
                    var gender = p.gender || '—';
                    var last   = fmtDate(p.lastVisit || p.last_visit || p.created_at);
                    var next   = fmtDate(p.nextAppointment || p.next_appointment);
                    var status = p.status || 'Active';
                    html += '<tr>'
                        +'<td><input type="checkbox" style="accent-color:#060740"></td>'
                        +'<td class="db-td-no">'+(String(i+1).padStart(2,'0'))+'</td>'
                        +'<td class="db-td-id">#'+esc(pid)+'</td>'
                        +'<td><div class="db-pt-cell"><div class="db-pt-avatar">'+esc(initials(fn,ln).toUpperCase()||'P')+'</div><span class="db-pt-name">'+esc(name)+'</span></div></td>'
                        +'<td>'+esc(age)+'</td>'
                        +'<td>'+esc(gender)+'</td>'
                        +'<td>'+last+'</td>'
                        +'<td>'+(next||'—')+'</td>'
                        +'<td>'+statusBadge(status)+'</td>'
                        +'<td style="text-align:center"><span style="font-weight:700;color:var(--color-muted-foreground);cursor:pointer;font-size:16px;letter-spacing:2px">&hellip;</span></td>'
                        +'</tr>';
                });
                tbody.innerHTML = html;
                if (window.lucide) lucide.createIcons();
            })
            .catch(function() {
                var tbody = document.getElementById('dbPatientTableBody');
                if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:28px;color:var(--color-muted-foreground);font-size:13px">Could not load patients.</td></tr>';
            });
    }

    // Patient search filter
    var searchInput = document.getElementById('dbPatientSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var q = this.value.toLowerCase();
            document.querySelectorAll('#dbPatientTableBody tr').forEach(function(tr) {
                tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    // Orders bar strip
    function renderOrdersBar() {
        var strip = document.getElementById('ordersBarStrip');
        if (!strip) return;
        var colors = ['#7FFFD4','#059669','#FFC107','#e67e22','#6f42c1','#a78bfa','#DC3545','#f8a'];
        var segs = 20;
        var html = '';
        for (var i = 0; i < segs; i++) {
            html += '<div class="db-treat-bar" style="flex:1;background:'+colors[i % colors.length]+'"></div>';
        }
        strip.innerHTML = html;
    }

    // Populate pa-total-count from individual pa counts
    function updatePaTotalCount() {
        var ids = ['pa-discharges','pa-lab','pa-er','pa-ops'];
        var total = 0;
        ids.forEach(function(id) {
            var e = document.getElementById(id);
            if (e) { var n = parseInt(e.textContent)||0; total += n; }
        });
        var el = document.getElementById('pa-total-count');
        if (el) el.textContent = total || '—';
    }

    // Sync beds-avail2 with beds-avail
    function syncBedAvail() {
        var src = document.getElementById('beds-avail');
        var dst = document.getElementById('beds-avail2');
        if (src && dst) dst.textContent = src.textContent;
    }

    window.addEventListener('DOMContentLoaded', function() {
        initDashPatientTable();
        renderOrdersBar();
        // Poll for pa-total-count and bed-avail sync after data loads
        setTimeout(function() { updatePaTotalCount(); syncBedAvail(); }, 3000);
        setTimeout(function() { updatePaTotalCount(); syncBedAvail(); }, 6000);
    });
})();

// ── Financial Dashboard tab switching ────────────────────────────────────────
window.switchFinTab = function(tab) {
    var tabs = document.querySelectorAll('.fin2-tab');
    var panes = document.querySelectorAll('.fin2-tab-pane');
    tabs.forEach(function(t) {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    panes.forEach(function(p) {
        p.style.display = p.id === 'finTab-' + tab ? '' : 'none';
    });
    if (window.lucide) lucide.createIcons();
};

// ── Financial Dashboard v2: bridge data from legacy IDs to new fin2-* IDs ───
(function() {
    function txt(id) {
        var e = document.getElementById(id);
        return e ? e.textContent.trim() : '—';
    }
    function syncFin2() {
        // Breakdown sidebar mirrors
        var tot = document.getElementById('fin2-breakdown-total');
        if (tot) tot.textContent = txt('frc-total');

        var outEl = document.getElementById('fin2-breakdown-outstanding');
        if (outEl) outEl.textContent = txt('out-total');

        // "Total Collected" = Total Billed — Outstanding (approximate from col-total-billed if available)
        var colEl = document.getElementById('fin2-breakdown-collected');
        if (colEl) colEl.textContent = txt('col-total-billed');

        // Collection rate bars synced with second IDs
        var cr  = document.getElementById('fin2-col-rate');
        var cr2 = document.getElementById('fin2-col-rate2');
        var bar = document.getElementById('fin2-col-bar');
        var pct = txt('col-pct-collected').replace('%','').trim();
        var num = parseFloat(pct) || 0;
        if (cr)  cr.textContent  = (isNaN(num)||num===0) ? '—%' : num.toFixed(1)+'%';
        if (cr2) cr2.textContent = (isNaN(num)||num===0) ? '—%' : num.toFixed(1)+'%';
        if (bar) bar.style.width = num + '%';

        // Overdue pct badge
        var od  = document.getElementById('fin2-overdue-pct');
        if (od) od.textContent = txt('col-pct-overdue');

        // Claims tab mirrors
        var fp = document.getElementById('fin2-panel-pending');
        if (fp) fp.textContent = txt('panel-pending-count');
        var fpa = document.getElementById('fin2-panel-pending-amt-label');
        if (fpa) fpa.textContent = txt('panel-pending-amt');
        var fav = document.getElementById('fin2-panel-approved');
        if (fav) fav.textContent = txt('panel-approved-count');
        var faal = document.getElementById('fin2-panel-approved-amt-label');
        if (faal) faal.textContent = txt('panel-approved-amt');

        // Outstanding mirror for Collections tab
        var ot2 = document.getElementById('out-total-2');
        if (ot2) ot2.textContent = txt('out-total');

        // Dept performance table
        buildFin2DeptTable();
    }

    function buildFin2DeptTable() {
        var tbody = document.getElementById('fin2-dept-tbody');
        if (!tbody) return;
        var src = document.getElementById('deptRevenueList');
        if (!src) return;
        // Parse existing deptRevenueList items
        var items = src.querySelectorAll('[data-dept]');
        if (!items.length) {
            // Try to read rendered items (JS injects them)
            return;
        }
        var html = '';
        items.forEach(function(item) {
            var dept  = item.dataset.dept   || item.dataset.name  || '—';
            var rev   = item.dataset.rev    || '—';
            var out   = item.dataset.out    || '—';
            var col   = item.dataset.col    || '—';
            var share = item.dataset.share  || '—';
            var pct   = parseFloat(item.dataset.pct)||0;
            html += '<tr>'
                + '<td style="font-weight:600">'+dept+'</td>'
                + '<td style="color:#16A34A;font-weight:700">'+rev+'</td>'
                + '<td style="color:#DC3545">'+out+'</td>'
                + '<td style="color:#060740;font-weight:600">'+col+'</td>'
                + '<td>'+share+'%</td>'
                + '<td style="min-width:100px"><div style="height:5px;background:var(--color-border);border-radius:3px"><div style="height:100%;width:'+pct+'%;background:#060740;border-radius:3px"></div></div></td>'
                + '</tr>';
        });
        if (html) tbody.innerHTML = html;
    }

    // Run sync after financial data loads (dashboard.js fires loadFinancial)
    document.addEventListener('DOMContentLoaded', function() {
        // Poll a few times after expected data load
        [1500, 3000, 5000, 8000].forEach(function(ms) {
            setTimeout(syncFin2, ms);
        });
    });
})();
</script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\makosh\resources\views/pages/dashboard.blade.php ENDPATH**/ ?>