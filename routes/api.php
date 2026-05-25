<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\OpdController;
use App\Http\Controllers\Api\EmergencyController;
use App\Http\Controllers\Api\IpdController;
use App\Http\Controllers\Api\ClinicalController;
use App\Http\Controllers\Api\OtController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\BedManagementController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IncomeExpenseController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\StockAlertController;
use App\Http\Controllers\Api\PharmacyBillingController;
use App\Http\Controllers\Api\MedicationOrderController;
use App\Http\Controllers\Api\DispensingController;
use App\Http\Controllers\Api\ReturnsExpiryController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\LaboratoryController;
use App\Http\Controllers\Api\LaboratoryBillingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\LabInventoryController;
use App\Http\Controllers\Api\LabReportController;
use App\Http\Controllers\Api\TestMasterController;
use App\Http\Controllers\Api\HospitalInfoController;
use App\Http\Controllers\Api\HrConfigController;
use App\Http\Controllers\Api\HrNumberSeriesController;
use App\Http\Controllers\Api\FinanceConfigController;
use App\Http\Controllers\Api\FinanceNumberSeriesController;
use App\Http\Controllers\Api\OpdConfigController;
use App\Http\Controllers\Api\PharmacyConfigController;
use App\Http\Controllers\Api\PharmacyBulkImportController;
use App\Http\Controllers\Api\OpdNumberSeriesController;
use App\Http\Controllers\Api\IpdNumberSeriesController;
use App\Http\Controllers\Api\OpdVitalFieldController;
use App\Http\Controllers\Api\OpdFormSectionController;
use App\Http\Controllers\Api\FormGroupController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormSectionController;
use App\Http\Controllers\Api\FormComponentController;
use App\Http\Controllers\Api\FormSubmissionController;

Route::middleware(['web', 'auth.hms'])->group(function () {

Route::get('/patients', [PatientController::class, 'index']);
Route::post('/patients', [PatientController::class, 'store']);
Route::post('/patients/search-by-phone', [PatientController::class, 'searchByPhone']);
Route::post('/patients/validate-self', [PatientController::class, 'validateSelf']);
Route::get('/patients/search/phone/{phone}', [PatientController::class, 'findByPhone']);
Route::post('/patients/search/matches', [PatientController::class, 'findPotentialMatches']);
Route::get('/patients/{mrn}', [PatientController::class, 'show']);
Route::get('/patients/{mrn}/summary', [PatientController::class, 'summary']);
Route::get('/patients/{mrn}/activities', [PatientController::class, 'activities']);

Route::get('/doctors', [DoctorController::class, 'index']);
Route::post('/doctors', [DoctorController::class, 'store']);
Route::put('/doctors/{id}', [DoctorController::class, 'update']);

Route::get('/staff', [StaffController::class, 'index']);
Route::post('/staff', [StaffController::class, 'store']);
Route::put('/staff/{id}', [StaffController::class, 'update']);

Route::get('/opd/visits', [OpdController::class, 'visits']);
Route::post('/opd/visits', [OpdController::class, 'createVisitTransaction']);
Route::get('/opd/bills', [OpdController::class, 'bills']);
Route::get('/opd/vitals', [OpdController::class, 'allVitals']);
Route::get('/opd/vitals/{visitId}', [OpdController::class, 'vitals']);
Route::post('/opd/vitals', [OpdController::class, 'addVital']);
Route::get('/opd/consultations', [OpdController::class, 'consultations']);
Route::post('/opd/consultations', [OpdController::class, 'addConsultation']);
Route::put('/opd/consultations/{consultationId}', [OpdController::class, 'updateConsultation']);
Route::post('/opd/bills/{billId}/additional-charges', [OpdController::class, 'addAdditionalCharges']);
Route::get('/opd/payments/{billId}', [OpdController::class, 'payments']);
Route::post('/opd/payments', [OpdController::class, 'addPayment']);
Route::get('/opd/bills/{billId}/corrections', [OpdController::class, 'correctionLog']);
Route::post('/opd/bills/{billId}/corrections', [OpdController::class, 'saveCorrections']);

Route::get('/emergency/visits', [EmergencyController::class, 'visits']);
Route::post('/emergency/visits', [EmergencyController::class, 'createVisitTransaction']);
Route::get('/emergency/bills', [EmergencyController::class, 'bills']);
Route::get('/emergency/payments/{billId}', [EmergencyController::class, 'payments']);
Route::post('/emergency/payments', [EmergencyController::class, 'addPayment']);
Route::get('/er/discharge/{visitId}', [EmergencyController::class, 'getErDischargeInfo']);
Route::get('/er/discharge/{visitId}/clearance-dues', [EmergencyController::class, 'getErClearanceDues']);
Route::post('/er/discharge/{visitId}/initiate', [EmergencyController::class, 'initiateErDischarge']);
Route::post('/er/discharge/{visitId}/complete', [EmergencyController::class, 'completeErDischarge']);
Route::get('/er/clinical-orders/investigations', [ClinicalController::class, 'erInvestigationOrders']);
Route::post('/er/clinical-orders/pass-to-lab', [ClinicalController::class, 'erPassToLab']);
Route::get('/er/clinical-orders/{visitId}', [ClinicalController::class, 'orders']);
Route::post('/er/clinical-orders', [ClinicalController::class, 'addOrder']);
Route::patch('/er/clinical-orders/{orderId}/discontinue', [ClinicalController::class, 'discontinueOrder']);

Route::get('/er/form-sections', [\App\Http\Controllers\Api\ErFormSectionController::class, 'index']);
Route::patch('/er/visits/{visitId}/custom-order-data', [EmergencyController::class, 'saveCustomOrderData']);

Route::get('/ipd/admissions', [IpdController::class, 'admissions']);
Route::post('/ipd/admissions', [IpdController::class, 'createAdmissionTransaction']);
Route::get('/ipd/bills', [IpdController::class, 'bills']);
Route::post('/ipd/bills/{billId}/additional-charges', [IpdController::class, 'addAdditionalCharges']);
Route::get('/ipd/payments/{billId}', [IpdController::class, 'payments']);
Route::post('/ipd/payments', [IpdController::class, 'addPayment']);
Route::get('/ipd/bills/{billId}/corrections', [IpdController::class, 'correctionLog']);
Route::post('/ipd/bills/{billId}/corrections', [IpdController::class, 'saveCorrections']);
Route::get('/ipd/discharge/{admissionId}', [IpdController::class, 'getDischargeInfo']);
Route::get('/ipd/discharge/{admissionId}/hospital-dues', [IpdController::class, 'getHospitalDues']);
Route::get('/ipd/discharge/{admissionId}/clearance-dues', [IpdController::class, 'getClearanceDues']);
Route::post('/ipd/discharge/{admissionId}/initiate', [IpdController::class, 'initiateDischarge']);
Route::post('/ipd/discharge/{admissionId}/verify-dept', [IpdController::class, 'verifyDept']);
Route::post('/ipd/discharge/{admissionId}/pay-dept', [IpdController::class, 'payDept']);
Route::post('/ipd/discharge/{admissionId}/complete', [IpdController::class, 'completeDischarge']);
Route::get('/ipd/nursing-records', [IpdController::class, 'nursingRecords']);
Route::get('/ipd/nursing-records/by-admission/{admissionId}', [IpdController::class, 'getNursingRecordByAdmission']);
Route::get('/ipd/nursing-records/{id}', [IpdController::class, 'getNursingRecord']);
Route::post('/ipd/nursing-records/{id}/vitals', [IpdController::class, 'addNursingVitalEntry']);

Route::get('/ipd/clinical-orders', [ClinicalController::class, 'allOrders']);
Route::get('/ipd/clinical-orders/investigations', [ClinicalController::class, 'investigationOrders']);
Route::get('/ipd/clinical-orders/{admissionId}', [ClinicalController::class, 'orders']);
Route::post('/ipd/clinical-orders', [ClinicalController::class, 'addOrder']);
Route::patch('/ipd/clinical-orders/{orderId}/discontinue', [ClinicalController::class, 'discontinueOrder']);
Route::post('/ipd/clinical-orders/pass-to-lab', [ClinicalController::class, 'passToLab']);

Route::get('/ipd/form-sections', [\App\Http\Controllers\Api\IpdFormSectionController::class, 'index']);
Route::patch('/ipd/admissions/{admissionId}/custom-order-data', [IpdController::class, 'saveCustomOrderData']);
Route::get('/ipd/progress-notes/{admissionId}', [ClinicalController::class, 'progressNotes']);
Route::post('/ipd/progress-notes', [ClinicalController::class, 'addProgressNote']);

Route::get('/ot/operations', [OtController::class, 'operations']);
Route::post('/ot/operations', [OtController::class, 'createOperation']);

Route::post('/billing/mark-paid', [BillingController::class, 'markAsPaid']);
Route::post('/billing/refund', [BillingController::class, 'refund']);
Route::post('/billing/correct', [BillingController::class, 'correct']);

Route::get('/bed-management/floors', [BedManagementController::class, 'floors']);
Route::post('/bed-management/floors', [BedManagementController::class, 'addFloor']);
Route::put('/bed-management/floors/{id}', [BedManagementController::class, 'updateFloor']);
Route::delete('/bed-management/floors/{id}', [BedManagementController::class, 'deleteFloor']);
Route::get('/bed-management/wards', [BedManagementController::class, 'wards']);
Route::get('/bed-management/wards/floor/{floorId}', [BedManagementController::class, 'wardsByFloor']);
Route::post('/bed-management/wards', [BedManagementController::class, 'addWard']);
Route::put('/bed-management/wards/{id}', [BedManagementController::class, 'updateWard']);
Route::delete('/bed-management/wards/{id}', [BedManagementController::class, 'deleteWard']);
Route::get('/bed-management/beds', [BedManagementController::class, 'beds']);
Route::get('/bed-management/beds/available', [BedManagementController::class, 'availableBeds']);
Route::get('/bed-management/beds/ward/{wardId}', [BedManagementController::class, 'bedsByWard']);
Route::post('/bed-management/beds', [BedManagementController::class, 'addBed']);
Route::put('/bed-management/beds/{id}', [BedManagementController::class, 'updateBed']);
Route::delete('/bed-management/beds/{id}', [BedManagementController::class, 'deleteBed']);
Route::patch('/bed-management/beds/{id}/status', [BedManagementController::class, 'updateBedStatus']);

Route::get('/finance/postings', [FinanceController::class, 'postings']);
Route::post('/finance/postings', [FinanceController::class, 'addPosting']);
Route::get('/finance/transactions', [FinanceController::class, 'transactions']);
Route::post('/finance/transactions', [FinanceController::class, 'addTransaction']);
Route::get('/finance/ledger', [FinanceController::class, 'ledger']);

Route::get('/config/hospital-info', [ConfigController::class, 'hospitalInfo']);
Route::put('/config/hospital-info', [ConfigController::class, 'updateHospitalInfo']);
Route::get('/config/doctor-fees', [ConfigController::class, 'doctorFees']);
Route::get('/config/doctor-fees/lookup', [ConfigController::class, 'getFeeForDoctor']);
Route::post('/config/doctor-fees', [ConfigController::class, 'addDoctorFee']);
Route::put('/config/doctor-fees/{id}', [ConfigController::class, 'updateDoctorFee']);
Route::delete('/config/doctor-fees/{id}', [ConfigController::class, 'deleteDoctorFee']);
Route::get('/config/hospital-charges', [ConfigController::class, 'hospitalCharges']);
Route::get('/config/hospital-charges/module/{module}', [ConfigController::class, 'chargesByModule']);
Route::post('/config/hospital-charges', [ConfigController::class, 'addHospitalCharge']);
Route::put('/config/hospital-charges/{id}', [ConfigController::class, 'updateHospitalCharge']);
Route::delete('/config/hospital-charges/{id}', [ConfigController::class, 'deleteHospitalCharge']);
Route::get('/config/master-data', [DashboardController::class, 'masterData']);

Route::get('/account-heads', [IncomeExpenseController::class, 'accountHeads']);
Route::get('/account-heads/{id}', [IncomeExpenseController::class, 'showAccountHead']);
Route::post('/account-heads', [IncomeExpenseController::class, 'createAccountHead']);
Route::put('/account-heads/{id}', [IncomeExpenseController::class, 'updateAccountHead']);
Route::delete('/account-heads/{id}', [IncomeExpenseController::class, 'deleteAccountHead']);
Route::get('/income-expense/transactions', [IncomeExpenseController::class, 'transactions']);
Route::post('/income-expense/transactions', [IncomeExpenseController::class, 'createTransaction']);
Route::put('/income-expense/transactions/{id}', [IncomeExpenseController::class, 'updateTransaction']);
Route::post('/income-expense/transactions/{id}/post', [IncomeExpenseController::class, 'postTransaction']);
Route::delete('/income-expense/transactions/{id}', [IncomeExpenseController::class, 'deleteTransaction']);
Route::get('/income-expense/summary', [IncomeExpenseController::class, 'summary']);

Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/dashboard/clinical', [DashboardController::class, 'clinical']);
Route::get('/dashboard/financial', [DashboardController::class, 'financial']);
Route::post('/dashboard/save-preference', [DashboardController::class, 'savePreference']);

Route::get('/inventory/stats', [InventoryController::class, 'stats']);
Route::get('/inventory/filters', [InventoryController::class, 'filters']);
Route::get('/inventory/medicines', [InventoryController::class, 'index']);
Route::get('/inventory/medicines/{medicineId}', [InventoryController::class, 'show']);
Route::get('/inventory/batches/{medicineId}', [InventoryController::class, 'batches']);
Route::get('/inventory/transactions/{medicineId}', [InventoryController::class, 'transactions']);
Route::post('/inventory/adjust', [InventoryController::class, 'adjust']);
Route::post('/inventory/medicines', [InventoryController::class, 'store']);
Route::post('/inventory/medicines/{medicineId}/update', [InventoryController::class, 'update']);

Route::get('/stock-alerts/dashboard', [StockAlertController::class, 'dashboard']);
Route::get('/stock-alerts/out-of-stock', [StockAlertController::class, 'outOfStock']);
Route::get('/stock-alerts/low-stock', [StockAlertController::class, 'lowStock']);
Route::get('/stock-alerts/expiring-soon', [StockAlertController::class, 'expiringSoon']);
Route::get('/stock-alerts/expired', [StockAlertController::class, 'expired']);
Route::get('/stock-alerts/reorder-suggestions', [StockAlertController::class, 'reorderSuggestions']);
Route::get('/stock-alerts/suppliers', [StockAlertController::class, 'suppliers']);
Route::get('/stock-alerts/medicines-list', [StockAlertController::class, 'medicinesList']);
Route::get('/stock-alerts/purchase-orders', [StockAlertController::class, 'purchaseOrders']);
Route::get('/stock-alerts/purchase-orders/{poId}', [StockAlertController::class, 'getPurchaseOrder']);
Route::post('/stock-alerts/purchase-orders', [StockAlertController::class, 'createPurchaseOrder']);
Route::post('/stock-alerts/grn', [StockAlertController::class, 'createGRN']);
Route::post('/stock-alerts/dispose', [StockAlertController::class, 'dispose']);

Route::get('/vendors', [VendorController::class, 'index']);
Route::post('/vendors', [VendorController::class, 'store']);
Route::put('/vendors/{id}', [VendorController::class, 'update']);
Route::patch('/vendors/{id}/toggle', [VendorController::class, 'toggleStatus']);
Route::delete('/vendors/{id}', [VendorController::class, 'destroy']);

Route::get('/pharmacy-billing/dashboard', [PharmacyBillingController::class, 'dashboard']);
Route::get('/pharmacy-billing/revenue', [PharmacyBillingController::class, 'revenueBreakdown']);
Route::get('/pharmacy-billing/transactions', [PharmacyBillingController::class, 'transactions']);
Route::get('/pharmacy-billing/transactions/{txnId}', [PharmacyBillingController::class, 'transactionDetail']);
Route::post('/pharmacy-billing/create-transaction', [PharmacyBillingController::class, 'createTransaction']);
Route::get('/pharmacy-billing/pending-opd', [PharmacyBillingController::class, 'pendingOPD']);
Route::get('/pharmacy-billing/pending-ipd', [PharmacyBillingController::class, 'pendingIPD']);
Route::get('/pharmacy-billing/pending-er', [PharmacyBillingController::class, 'pendingER']);
Route::get('/pharmacy-billing/pending-panel', [PharmacyBillingController::class, 'pendingPanel']);
Route::get('/pharmacy-billing/ipd-order/{orderId}', [PharmacyBillingController::class, 'ipdOrderDetail']);
Route::get('/pharmacy-billing/er-order/{orderId}', [PharmacyBillingController::class, 'erOrderDetail']);
Route::post('/pharmacy-billing/collect-payment', [PharmacyBillingController::class, 'collectPayment']);
Route::post('/pharmacy-billing/void', [PharmacyBillingController::class, 'voidTransaction']);
Route::post('/pharmacy-billing/reconcile', [PharmacyBillingController::class, 'reconcile']);
Route::get('/pharmacy-billing/cash-reconciliation', [PharmacyBillingController::class, 'getReconciliation']);
Route::post('/pharmacy-billing/cash-reconciliation', [PharmacyBillingController::class, 'saveReconciliation']);

Route::get('/laboratory-billing/dashboard', [LaboratoryBillingController::class, 'dashboard']);
Route::get('/laboratory-billing/revenue', [LaboratoryBillingController::class, 'revenueBreakdown']);
Route::get('/laboratory-billing/transactions', [LaboratoryBillingController::class, 'transactions']);
Route::get('/laboratory-billing/transactions/{txnId}', [LaboratoryBillingController::class, 'transactionDetail']);
Route::get('/laboratory-billing/pending-opd', [LaboratoryBillingController::class, 'pendingOPD']);
Route::get('/laboratory-billing/pending-ipd', [LaboratoryBillingController::class, 'pendingIPD']);
Route::get('/laboratory-billing/ipd-order/{orderId}', [LaboratoryBillingController::class, 'ipdOrderDetail']);
Route::post('/laboratory-billing/collect-payment', [LaboratoryBillingController::class, 'collectPayment']);
Route::post('/laboratory-billing/void', [LaboratoryBillingController::class, 'voidTransaction']);
Route::post('/laboratory-billing/reconcile', [LaboratoryBillingController::class, 'reconcile']);

Route::get('/medication-orders/stats', [MedicationOrderController::class, 'stats']);
Route::get('/medication-orders', [MedicationOrderController::class, 'index']);
Route::get('/medication-orders/{orderId}', [MedicationOrderController::class, 'show']);
Route::post('/medication-orders/update-status', [MedicationOrderController::class, 'updateStatus']);
Route::post('/medication-orders/update-items',  [MedicationOrderController::class, 'updateItems']);
Route::post('/medication-orders/verify', [MedicationOrderController::class, 'verifyOrder']);
Route::post('/medication-orders/start-dispensing', [MedicationOrderController::class, 'startDispensing']);
Route::post('/medication-orders/hold', [MedicationOrderController::class, 'holdOrder']);
Route::post('/medication-orders/remove-item', [MedicationOrderController::class, 'removeItem']);

Route::get('/dispensing/stats', [DispensingController::class, 'stats']);
Route::get('/dispensing/queue', [DispensingController::class, 'queue']);
Route::get('/dispensing/workstation/{orderId}', [DispensingController::class, 'workstation']);
Route::post('/dispensing/save-progress', [DispensingController::class, 'saveProgress']);
Route::post('/dispensing/complete', [DispensingController::class, 'completeDispensing']);
Route::post('/dispensing/print-label', [DispensingController::class, 'printLabel']);
Route::post('/dispensing/cancel', [DispensingController::class, 'cancelDispensing']);

Route::get('/returns/dashboard', [ReturnsExpiryController::class, 'dashboard']);
Route::get('/returns/patient', [ReturnsExpiryController::class, 'patientReturns']);
Route::post('/returns/patient', [ReturnsExpiryController::class, 'createPatientReturn']);
Route::post('/returns/patient/process', [ReturnsExpiryController::class, 'processPatientReturn']);
Route::get('/returns/ward', [ReturnsExpiryController::class, 'wardReturns']);
Route::post('/returns/ward/process', [ReturnsExpiryController::class, 'processWardReturn']);
Route::get('/returns/supplier', [ReturnsExpiryController::class, 'supplierReturns']);
Route::post('/returns/supplier', [ReturnsExpiryController::class, 'createSupplierReturn']);
Route::post('/returns/supplier/submit', [ReturnsExpiryController::class, 'submitRtv']);
Route::post('/returns/supplier/status', [ReturnsExpiryController::class, 'updateRtvStatus']);
Route::get('/returns/expired', [ReturnsExpiryController::class, 'expiredStock']);
Route::get('/returns/near-expiry', [ReturnsExpiryController::class, 'nearExpiry']);
Route::get('/returns/disposals', [ReturnsExpiryController::class, 'disposals']);
Route::post('/returns/disposals', [ReturnsExpiryController::class, 'createDisposal']);

Route::get('/roles', [RoleController::class, 'index']);
Route::post('/roles', [RoleController::class, 'store']);
Route::get('/roles/{id}', [RoleController::class, 'show']);
Route::put('/roles/{id}', [RoleController::class, 'update']);
Route::delete('/roles/{id}', [RoleController::class, 'destroy']);
Route::get('/roles/{id}/permissions', [RoleController::class, 'permissions']);
Route::post('/roles/{id}/permissions', [RoleController::class, 'syncPermissions']);
Route::post('/roles/{id}/duplicate', [RoleController::class, 'duplicate']);

// User-management routes (covered by outer web+auth.hms group)
Route::get('/users/stats', [UserController::class, 'stats']);
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

Route::get('/lab/orders/stats', [LaboratoryController::class, 'stats']);
Route::get('/lab/orders', [LaboratoryController::class, 'index']);
Route::get('/lab/orders/{orderId}', [LaboratoryController::class, 'show']);
Route::post('/lab/orders/update-status', [LaboratoryController::class, 'updateStatus']);
Route::get('/lab/tests/catalog', [LaboratoryController::class, 'testCatalog']);
Route::get('/lab/tests/packages', [LaboratoryController::class, 'testPackages']);
Route::post('/lab/walk-in/register', [LaboratoryController::class, 'walkInRegister']);
Route::get('/lab/visit-investigations', [LaboratoryController::class, 'visitInvestigations']);
Route::get('/lab/collections/stats', [LaboratoryController::class, 'collectionStats']);
Route::get('/lab/collections/pending', [LaboratoryController::class, 'pendingCollections']);
Route::get('/lab/collections/today', [LaboratoryController::class, 'todayCollections']);
Route::post('/lab/collections/collect', [LaboratoryController::class, 'collectSample']);
Route::post('/lab/collections/reject', [LaboratoryController::class, 'rejectSample']);

Route::get('/lab/results/stats', [LaboratoryController::class, 'resultEntryStats']);
Route::get('/lab/results/samples', [LaboratoryController::class, 'samplesForResults']);
Route::get('/lab/tests/parameters/{testCode}', [LaboratoryController::class, 'testParameters']);
Route::post('/lab/results/enter', [LaboratoryController::class, 'enterResults']);
Route::post('/lab/results/verify', [LaboratoryController::class, 'verifyResults']);
Route::post('/lab/results/verify-all', [LaboratoryController::class, 'verifyAllResults']);

Route::get('/lab-inventory/stats', [LabInventoryController::class, 'stats']);
Route::get('/lab-inventory/storage-conditions', [LabInventoryController::class, 'storageConditions']);
Route::get('/lab-inventory/filters', [LabInventoryController::class, 'filters']);
Route::get('/lab-inventory/items', [LabInventoryController::class, 'index']);
Route::get('/lab-inventory/items/{id}', [LabInventoryController::class, 'show']);
Route::get('/lab-inventory/batches/{id}', [LabInventoryController::class, 'batches']);
Route::get('/lab-inventory/transactions/{id}', [LabInventoryController::class, 'transactions']);
Route::get('/lab-inventory/consumption/{id}', [LabInventoryController::class, 'consumption']);
Route::get('/lab-inventory/analyzer-status', [LabInventoryController::class, 'analyzerStatus']);
Route::post('/lab-inventory/adjust', [LabInventoryController::class, 'adjust']);

Route::get('/lab-reports/stats', [LabReportController::class, 'stats']);
Route::get('/lab-reports', [LabReportController::class, 'index']);
Route::get('/lab-reports/delivery-queue', [LabReportController::class, 'deliveryQueue']);
Route::get('/lab-reports/cumulative/{mrn}', [LabReportController::class, 'cumulativeReport']);
Route::get('/lab-reports/{reportId}', [LabReportController::class, 'show']);
Route::post('/lab-reports/generate', [LabReportController::class, 'generate']);
Route::post('/lab-reports/{reportId}/delivery', [LabReportController::class, 'updateDelivery']);
Route::post('/lab-reports/{reportId}/print', [LabReportController::class, 'markPrinted']);
Route::post('/lab-reports/{reportId}/archive', [LabReportController::class, 'archive']);

Route::get('/test-master/stats', [TestMasterController::class, 'stats']);
Route::get('/test-master/tests', [TestMasterController::class, 'index']);
Route::get('/test-master/tests/{testCode}', [TestMasterController::class, 'show']);
Route::post('/test-master/tests', [TestMasterController::class, 'store']);
Route::put('/test-master/tests/{testCode}', [TestMasterController::class, 'update']);
Route::post('/test-master/tests/{testCode}/toggle-status', [TestMasterController::class, 'toggleStatus']);
Route::post('/test-master/tests/{testCode}/duplicate', [TestMasterController::class, 'duplicate']);
Route::get('/test-master/packages', [TestMasterController::class, 'packages']);
Route::get('/test-master/packages/{packageCode}', [TestMasterController::class, 'showPackage']);
Route::post('/test-master/packages', [TestMasterController::class, 'storePackage']);
Route::put('/test-master/packages/{packageCode}', [TestMasterController::class, 'updatePackage']);
Route::get('/test-master/search', [TestMasterController::class, 'testSearch']);

Route::get('/hospital-info/settings/{group}', [HospitalInfoController::class, 'getSettings']);
Route::post('/hospital-info/settings/{group}', [HospitalInfoController::class, 'saveSettings']);
Route::post('/hospital-info/logo', [HospitalInfoController::class, 'uploadLogo']);
Route::delete('/hospital-info/logo', [HospitalInfoController::class, 'removeLogo']);
Route::get('/hospital-info/departments', [HospitalInfoController::class, 'departmentIndex']);
Route::post('/hospital-info/departments', [HospitalInfoController::class, 'departmentStore']);
Route::put('/hospital-info/departments/{id}', [HospitalInfoController::class, 'departmentUpdate']);
Route::delete('/hospital-info/departments/{id}', [HospitalInfoController::class, 'departmentDestroy']);
Route::get('/hospital-info/signatories', [HospitalInfoController::class, 'signatoryIndex']);
Route::post('/hospital-info/signatories', [HospitalInfoController::class, 'signatoryStore']);
Route::put('/hospital-info/signatories/{id}', [HospitalInfoController::class, 'signatoryUpdate']);
Route::delete('/hospital-info/signatories/{id}', [HospitalInfoController::class, 'signatoryDestroy']);
Route::get('/hospital-info/bank-accounts', [HospitalInfoController::class, 'bankAccountIndex']);
Route::post('/hospital-info/bank-accounts', [HospitalInfoController::class, 'bankAccountStore']);
Route::put('/hospital-info/bank-accounts/{id}', [HospitalInfoController::class, 'bankAccountUpdate']);
Route::delete('/hospital-info/bank-accounts/{id}', [HospitalInfoController::class, 'bankAccountDestroy']);
Route::get('/hospital-info/insurance-panels', [HospitalInfoController::class, 'insurancePanelIndex']);
Route::post('/hospital-info/insurance-panels', [HospitalInfoController::class, 'insurancePanelStore']);
Route::put('/hospital-info/insurance-panels/{id}', [HospitalInfoController::class, 'insurancePanelUpdate']);
Route::delete('/hospital-info/insurance-panels/{id}', [HospitalInfoController::class, 'insurancePanelDestroy']);

Route::get('/hr-config', [HrConfigController::class, 'index']);
Route::get('/hr-config/{category}', [HrConfigController::class, 'listByCategory']);
Route::post('/hr-config', [HrConfigController::class, 'store']);
Route::put('/hr-config/{id}', [HrConfigController::class, 'update']);
Route::delete('/hr-config/{id}', [HrConfigController::class, 'destroy']);

Route::get('/hr-number-series', [HrNumberSeriesController::class, 'index']);
Route::put('/hr-number-series/{seriesKey}', [HrNumberSeriesController::class, 'update']);

Route::get('/finance-config', [FinanceConfigController::class, 'index']);
Route::get('/finance-config/{category}', [FinanceConfigController::class, 'listByCategory']);
Route::post('/finance-config', [FinanceConfigController::class, 'store']);
Route::put('/finance-config/{id}', [FinanceConfigController::class, 'update']);
Route::delete('/finance-config/{id}', [FinanceConfigController::class, 'destroy']);

Route::get('/finance-number-series', [FinanceNumberSeriesController::class, 'index']);
Route::put('/finance-number-series/{seriesKey}', [FinanceNumberSeriesController::class, 'update']);

Route::get('/opd-config', [OpdConfigController::class, 'index']);
Route::get('/opd-config/{category}', [OpdConfigController::class, 'listByCategory']);
Route::post('/opd-config', [OpdConfigController::class, 'store']);
Route::put('/opd-config/{id}', [OpdConfigController::class, 'update']);
Route::delete('/opd-config/{id}', [OpdConfigController::class, 'destroy']);

Route::get('/opd/form-sections', [OpdFormSectionController::class, 'index']);

Route::get('/pharmacy-config', [PharmacyConfigController::class, 'index']);
Route::get('/pharmacy-config/department-routing', [PharmacyConfigController::class, 'getDeptRouting']);
Route::put('/pharmacy-config/department-routing', [PharmacyConfigController::class, 'updateDeptRouting']);
Route::get('/pharmacy-config/{category}', [PharmacyConfigController::class, 'listByCategory']);
Route::post('/pharmacy-config', [PharmacyConfigController::class, 'store']);
Route::put('/pharmacy-config/{id}', [PharmacyConfigController::class, 'update']);
Route::delete('/pharmacy-config/{id}', [PharmacyConfigController::class, 'destroy']);

Route::get('/pharmacy-bulk-import/template', [PharmacyBulkImportController::class, 'template']);
Route::post('/pharmacy-bulk-import/validate', [PharmacyBulkImportController::class, 'validate']);
Route::post('/pharmacy-bulk-import/import',   [PharmacyBulkImportController::class, 'import']);

Route::get('/opd-number-series', [OpdNumberSeriesController::class, 'index']);
Route::put('/opd-number-series/{seriesKey}', [OpdNumberSeriesController::class, 'update']);

Route::get('/ipd-number-series', [IpdNumberSeriesController::class, 'index']);
Route::put('/ipd-number-series/{seriesKey}', [IpdNumberSeriesController::class, 'update']);

Route::get('/opd-vital-fields', [OpdVitalFieldController::class, 'index']);
Route::put('/opd-vital-fields/{fieldKey}', [OpdVitalFieldController::class, 'update']);

// ── Form Builder ──────────────────────────────────────────────────────────────
Route::get('/form-groups',           [FormGroupController::class, 'index']);
Route::post('/form-groups',          [FormGroupController::class, 'store']);
Route::patch('/form-groups/reorder', [FormGroupController::class, 'reorder']); // MUST be before /{id}
Route::patch('/form-groups/{id}',    [FormGroupController::class, 'update']);
Route::delete('/form-groups/{id}',   [FormGroupController::class, 'destroy']);

Route::get('/form-groups/{groupId}/forms',  [FormController::class, 'index']);
Route::post('/form-groups/{groupId}/forms', [FormController::class, 'store']);
Route::patch('/forms/reorder',              [FormController::class, 'reorder']); // MUST be before /{id}
Route::patch('/forms/{id}',                 [FormController::class, 'update']);
Route::delete('/forms/{id}',                [FormController::class, 'destroy']);
Route::get('/forms/by-context/{context}',   [FormController::class, 'byContext']); // MUST be before /{id}/full
Route::get('/forms/{id}/full',              [FormController::class, 'full']);

Route::get('/forms/{formId}/sections',      [FormSectionController::class, 'index']);
Route::post('/forms/{formId}/sections',     [FormSectionController::class, 'store']);
Route::patch('/form-sections/reorder',      [FormSectionController::class, 'reorder']); // MUST be before /{id}
Route::patch('/form-sections/{id}',         [FormSectionController::class, 'update']);
Route::delete('/form-sections/{id}',        [FormSectionController::class, 'destroy']);

Route::get('/form-submissions',  [FormSubmissionController::class, 'index']);
Route::post('/form-submissions', [FormSubmissionController::class, 'store']);

Route::post('/form-sections/{sectionId}/components', [FormComponentController::class, 'store']);
Route::patch('/form-components/reorder',             [FormComponentController::class, 'reorder']); // MUST be before /{id}
Route::patch('/form-components/{id}',                [FormComponentController::class, 'update']);
Route::delete('/form-components/{id}',               [FormComponentController::class, 'destroy']);

}); // end Route::middleware(['web', 'auth.hms'])
