<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/login',  [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout',[AuthController::class, 'logout'])->name('logout');

Route::middleware(['auth.hms'])->group(function () {

    // ── Redirects ────────────────────────────────────────────────────────────
    Route::get('/pharmacy',     fn() => redirect(url('/pharmacy/pos')));
    Route::get('/laboratory',   fn() => redirect(url('/laboratory/test-orders')));
    Route::get('/configuration',fn() => redirect(url('/configuration/opd')));

    // ── Dashboard ─────────────────────────────────────────────────────────────
    Route::get('/', fn() => view('pages.dashboard', ['pageTitle' => 'Dashboard']))
        ->middleware('permission:dashboard.access');

    // ── Clinical Modules ─────────────────────────────────────────────────────
    Route::get('/opd',            fn() => view('pages.opd',            ['pageTitle' => 'Outpatient Department']))
        ->middleware('permission:opd');
    Route::get('/ipd',            fn() => view('pages.ipd',            ['pageTitle' => 'Inpatient Department']))
        ->middleware('permission:ipd');
    Route::get('/emergency',      fn() => view('pages.emergency',      ['pageTitle' => 'Emergency']))
        ->middleware('permission:emergency');
    Route::get('/ot',             fn() => view('pages.ot',             ['pageTitle' => 'Operation Theater']))
        ->middleware('permission:ot');
    Route::get('/bed-management', fn() => view('pages.bed-management', ['pageTitle' => 'Bed Management']))
        ->middleware('role:superadmin,admin');

    // ── Patients ──────────────────────────────────────────────────────────────
    Route::get('/patients', fn() => view('pages.patients', ['pageTitle' => 'Patient Master']))
        ->middleware('permission:patients.access');

    // ── Pharmacy ──────────────────────────────────────────────────────────────
    Route::get('/pharmacy/medication-orders', fn() => view('pages.pharmacy.medication-orders', ['pageTitle' => 'Medication Orders']))
        ->middleware('permission:pharmacy.medication-orders.access');
    Route::get('/pharmacy/dispensing', fn() => view('pages.pharmacy.dispensing', ['pageTitle' => 'Dispensing & Fulfillment']))
        ->middleware('permission:pharmacy.dispensing.access');
    Route::get('/pharmacy/pos', fn() => view('pages.pharmacy.pos', ['pageTitle' => 'POS Terminal']))
        ->middleware('permission:pharmacy.pos.access');
    Route::get('/pharmacy/inventory', fn() => view('pages.pharmacy.inventory', ['pageTitle' => 'Inventory Management']))
        ->middleware('permission:pharmacy.inventory.access');
    Route::get('/pharmacy/stock-alerts', fn() => view('pages.pharmacy.stock-alerts', ['pageTitle' => 'Stock Alerts & Procurement']))
        ->middleware('permission:pharmacy.stock-alerts.access');
    Route::get('/pharmacy/billing', fn() => view('pages.pharmacy.billing', ['pageTitle' => 'Billing & Financial Reconciliation']))
        ->middleware('permission:pharmacy.billing.access');
    Route::get('/pharmacy/returns', fn() => view('pages.pharmacy.returns', ['pageTitle' => 'Returns & Expiry Management']))
        ->middleware('permission:pharmacy.returns.access');

    // ── Laboratory ────────────────────────────────────────────────────────────
    Route::get('/laboratory/test-orders', fn() => view('pages.laboratory.test-orders', ['pageTitle' => 'Test Orders Queue']))
        ->middleware('permission:laboratory.test-orders.access');
    Route::get('/laboratory/walk-in', fn() => view('pages.laboratory.walk-in', ['pageTitle' => 'Walk-in Registration']))
        ->middleware('permission:laboratory.walk-in.access');
    Route::get('/laboratory/test-master', fn() => view('pages.laboratory.test-master', ['pageTitle' => 'Test Master']))
        ->middleware('permission:laboratory.test-master.access');
    Route::get('/laboratory/sample-collection', fn() => view('pages.laboratory.sample-collection', ['pageTitle' => 'Sample Collection & Processing']))
        ->middleware('permission:laboratory.sample-collection.access');
    Route::get('/laboratory/results', fn() => view('pages.laboratory.results', ['pageTitle' => 'Result Entry & Verification']))
        ->middleware('permission:laboratory.results.access');
    Route::get('/laboratory/quality-control', fn() => view('pages.laboratory.quality-control', ['pageTitle' => 'Quality Control & Calibration']))
        ->middleware('permission:laboratory.quality-control.access');
    Route::get('/laboratory/inventory', fn() => view('pages.laboratory.inventory', ['pageTitle' => 'Inventory & Reagent Management']))
        ->middleware('permission:laboratory.inventory.access');
    Route::get('/laboratory/billing', fn() => view('pages.laboratory.billing', ['pageTitle' => 'Billing & Financial Reconciliation']))
        ->middleware('permission:laboratory.billing.access');
    Route::get('/laboratory/reports', fn() => view('pages.laboratory.reports', ['pageTitle' => 'Reports & Document Management']))
        ->middleware('permission:laboratory.reports.access');
    Route::get('/laboratory/analytics', fn() => view('pages.laboratory.analytics', ['pageTitle' => 'Analytics & Statistics']))
        ->middleware('permission:laboratory.analytics.access');

    // ── Management ────────────────────────────────────────────────────────────
    Route::get('/doctors',       fn() => view('pages.doctors',       ['pageTitle' => 'Doctor Management']))
        ->middleware('permission:doctors.access');
    Route::get('/staff',         fn() => view('pages.staff',         ['pageTitle' => 'Staff Management']))
        ->middleware('permission:staff.access');
    Route::get('/doctor-fees',   fn() => view('pages.doctor-fees',   ['pageTitle' => 'Doctor Fee Management']))
        ->middleware('permission:doctor-fees.access');
    Route::get('/charges',       fn() => view('pages.charges',       ['pageTitle' => 'Charges Management']))
        ->middleware('permission:charges.access');
    Route::get('/income-expense',fn() => view('pages.income-expense',['pageTitle' => 'Income & Expense']))
        ->middleware('permission:income-expense.access');
    Route::get('/billing/ipd-discharge', fn() => view('pages.billing.ipd-discharge', ['pageTitle' => 'IPD Discharge Clearance']))
        ->middleware('permission:ipd');

    // ── Admin — User & Hospital Management ────────────────────────────────────
    Route::get('/users',         fn() => view('pages.users',        ['pageTitle' => 'User Management']))
        ->middleware('permission:user-management.access');
    Route::get('/hospital-info', fn() => view('pages.hospital-info', ['pageTitle' => 'Hospital Information']))
        ->middleware('permission:hospital-info');

    // ── Superadmin — Role Management ─────────────────────────────────────────
    Route::get('/roles', fn() => view('pages.roles', ['pageTitle' => 'Role Management']))
        ->middleware('permission:role-management.access');

    // ── Configuration sub-pages ───────────────────────────────────────────────
    Route::get('/configuration/opd',             fn() => view('pages.configuration.opd',             ['pageTitle' => 'OPD Configuration']))
        ->middleware('permission:configuration.opd.access');
    Route::get('/configuration/ipd',             fn() => view('pages.configuration.ipd',             ['pageTitle' => 'IPD Configuration']))
        ->middleware('permission:configuration.ipd.access');
    Route::get('/configuration/er',              fn() => view('pages.configuration.er',              ['pageTitle' => 'ER Configuration']))
        ->middleware('permission:configuration.er.access');
    Route::get('/configuration/ot',              fn() => view('pages.configuration.ot',              ['pageTitle' => 'OT Configuration']))
        ->middleware('permission:configuration.ot.access');
    Route::get('/configuration/human-resources', fn() => view('pages.configuration.human-resources', ['pageTitle' => 'Human Resources Configuration']))
        ->middleware('permission:configuration.human-resources.access');
    Route::get('/configuration/financials',      fn() => view('pages.configuration.financials',      ['pageTitle' => 'Financials Configuration']))
        ->middleware('permission:configuration.financials.access');
    Route::get('/configuration/pharmacy',        fn() => view('pages.configuration.pharmacy',        ['pageTitle' => 'Pharmacy Configuration']))
        ->middleware('permission:configuration.pharmacy.access');
    Route::get('/configuration/laboratory',      fn() => view('pages.configuration.laboratory',      ['pageTitle' => 'Laboratory Configuration']))
        ->middleware('permission:configuration.laboratory.access');
});
