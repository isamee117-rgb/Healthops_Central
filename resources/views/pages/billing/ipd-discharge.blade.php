@extends('layouts.app')
@section('title', 'IPD Discharge Clearance')
@section('content')
<div class="module-container">

  <div class="module-header" style="margin-bottom:24px">
    <div>
      <h2 style="font-size:22px;font-weight:700;color:var(--midnight-blue);margin:0">IPD Discharge Clearance</h2>
      <p style="font-size:13px;color:var(--color-muted-foreground);margin:4px 0 0">Manage billing clearances for patients pending discharge</p>
    </div>
  </div>

  <!-- DASHBOARD -->
  <div id="billingDischDashboard">
    <div id="billingDischStats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px"></div>
    <div class="card">
      <div class="card-header" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px">
        <div class="card-title" style="margin:0">Pending Discharge Clearances</div>
        <div style="display:flex;gap:10px;align-items:center">
          <div class="search-wrapper" style="width:220px"><i data-lucide="search"></i><input type="text" class="search-input" id="billingDischSearch" placeholder="Search patient..."></div>
          <button class="btn-outline btn-sm" onclick="loadBillingDischData()" style="display:flex;align-items:center;gap:6px"><i data-lucide="refresh-cw" style="width:13px;height:13px"></i> Refresh</button>
        </div>
      </div>
      <div class="card-body" style="padding:0">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead><tr>
              <th>Patient</th><th>IPD No</th><th>Ward / Bed</th>
              <th>Requested</th><th>Dept Status</th>
              <th>Pending Amt</th><th>Status</th><th class="text-center">Action</th>
            </tr></thead>
            <tbody id="billingDischTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:20px;margin-top:10px;font-size:12px;color:var(--color-muted-foreground);padding:0 4px">
      <span><span style="color:#10B981;font-size:16px">●</span> Paid / Cleared</span>
      <span><span style="color:#3B82F6;font-size:16px">●</span> Verified (not paid)</span>
      <span><span style="color:#9CA3AF;font-size:16px">●</span> Pending</span>
    </div>
  </div>

  <!-- DETAIL VIEW -->
  <div id="billingDischDetail" style="display:none">
    <div style="margin-bottom:16px">
      <a href="#" onclick="showBillingDischDashboard();return false" style="display:inline-flex;align-items:center;gap:6px;color:var(--color-muted-foreground);font-size:13px;text-decoration:none;font-weight:500">
        <i data-lucide="arrow-left" style="width:14px;height:14px"></i> Back to Dashboard
      </a>
    </div>
    <div id="billingDischDetailHeader" style="background:var(--midnight-blue);border-radius:14px;padding:22px 28px;color:#fff;margin-bottom:20px"></div>
    <div id="billingDischAccordion" style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px"></div>
    <div id="billingDischSummaryFooter" style="background:var(--color-card);border:1px solid var(--color-border);border-radius:14px;padding:24px"></div>
  </div>

</div>

<!-- Verify Offcanvas (480px, slides right) -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="verifyDeptSheet" style="width:480px">
  <div class="offcanvas-header" style="padding:20px 24px">
    <h5 class="offcanvas-title" id="verifyDeptTitle">Verify Charges</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body" id="verifyDeptBody" style="padding:24px"></div>
</div>

<!-- Payment Modal -->
<div class="modal fade" id="deptPayModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered" style="max-width:480px">
    <div class="modal-content" style="border-radius:16px;overflow:hidden;border:none">
      <div id="deptPayModalBody"></div>
    </div>
  </div>
</div>

<style>
.bd-method-pill { padding:10px 16px;border-radius:20px;border:1.5px solid var(--color-border);background:var(--color-card);font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px; }
.bd-method-pill.active { border-color:var(--aquamint);background:rgba(127,255,212,0.12);color:var(--midnight-blue);font-weight:700; }
.bd-verify-check { display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);cursor:pointer;transition:all 0.2s; }
.bd-verify-check.checked { border-color:var(--aquamint);background:rgba(127,255,212,0.07); }
.bd-accordion-section { border-radius:12px;border:1px solid var(--color-border);background:var(--color-card);overflow:hidden; }
.bd-accordion-header { display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;user-select:none;transition:background 0.15s; }
.bd-accordion-header:hover { background:var(--color-muted); }
.bd-accordion-body { border-top:1px solid var(--color-border);padding:20px; }
</style>
@endsection
@push('scripts')
<script src="{{ asset('js/billing-ipd-discharge.js') }}?v={{ time() }}"></script>
@endpush
