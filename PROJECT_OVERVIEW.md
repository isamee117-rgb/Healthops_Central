# HealthOps HMS — Project Overview

**Full Name:** HealthOps Hospital Management System (Nova HMS)  
**Type:** Multi-module Hospital Management System (HMS)  
**Local URL:** `http://localhost/healthops`  
**Database:** MySQL — `healthops`  
**Environment:** XAMPP (Apache + PHP 8.2+, Windows)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Database | MySQL via Eloquent ORM |
| Auth | Session-based (Cookie) + Middleware |
| Frontend | Vanilla JavaScript (no framework) + jQuery |
| UI | Bootstrap 5, Lucide Icons, custom CSS |
| Templates | Laravel Blade |
| HTTP Client | jQuery AJAX / Fetch API |
| Charts | ApexCharts |

---

## Directory Structure

```
healthops/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php              # Login / Logout (web)
│   │   │   └── Api/                            # All API Controllers (41 files)
│   │   │       ├── PatientController.php
│   │   │       ├── DoctorController.php
│   │   │       ├── StaffController.php
│   │   │       ├── OpdController.php
│   │   │       ├── IpdController.php
│   │   │       ├── EmergencyController.php
│   │   │       ├── OtController.php
│   │   │       ├── ClinicalController.php
│   │   │       ├── BillingController.php
│   │   │       ├── BedManagementController.php
│   │   │       ├── FinanceController.php
│   │   │       ├── ConfigController.php
│   │   │       ├── DashboardController.php
│   │   │       ├── IncomeExpenseController.php
│   │   │       ├── InventoryController.php
│   │   │       ├── StockAlertController.php
│   │   │       ├── PharmacyBillingController.php
│   │   │       ├── MedicationOrderController.php
│   │   │       ├── DispensingController.php
│   │   │       ├── ReturnsExpiryController.php
│   │   │       ├── LaboratoryController.php
│   │   │       ├── LaboratoryBillingController.php
│   │   │       ├── LabInventoryController.php
│   │   │       ├── LabReportController.php
│   │   │       ├── TestMasterController.php
│   │   │       ├── HospitalInfoController.php
│   │   │       ├── UserController.php
│   │   │       ├── RoleController.php
│   │   │       ├── HrConfigController.php
│   │   │       ├── HrNumberSeriesController.php
│   │   │       ├── FinanceConfigController.php
│   │   │       ├── FinanceNumberSeriesController.php
│   │   │       ├── OpdConfigController.php
│   │   │       ├── OpdNumberSeriesController.php
│   │   │       ├── IpdNumberSeriesController.php
│   │   │       ├── PharmacyConfigController.php
│   │   │       ├── OpdVitalFieldController.php
│   │   │       ├── OpdFormSectionController.php
│   │   │       ├── ErFormSectionController.php
│   │   │       ├── IpdFormSectionController.php
│   │   │       ├── OtFormSectionController.php
│   │   │       ├── OtIntraopFormSectionController.php
│   │   │       └── OtPostopFormSectionController.php
│   │   │
│   │   └── Middleware/
│   │       ├── AuthMiddleware.php              # Session check + is_active flag
│   │       ├── RoleMiddleware.php              # Role-based access (admin/superadmin)
│   │       └── PermissionMiddleware.php        # Slug-based permission check
│   │
│   ├── Models/                                 # 80+ Eloquent models
│   │   ├── Patient.php
│   │   ├── User.php
│   │   ├── Doctor.php
│   │   ├── Staff.php
│   │   ├── Role.php
│   │   ├── Permission.php
│   │   ├── OpdVisit.php
│   │   ├── OpdBill.php
│   │   ├── OpdPayment.php
│   │   ├── OpdConsultation.php
│   │   ├── OpdVital.php
│   │   ├── OpdVitalField.php
│   │   ├── OpdFormSection.php
│   │   ├── OpdNumberSeries.php
│   │   ├── OpdConfigItem.php
│   │   ├── IpdAdmission.php
│   │   ├── IpdBill.php
│   │   ├── IpdPayment.php
│   │   ├── IpdNumberSeries.php
│   │   ├── IpdFormSection.php
│   │   ├── EmergencyVisit.php
│   │   ├── EmergencyBill.php
│   │   ├── EmergencyPayment.php
│   │   ├── ErFormSection.php
│   │   ├── Operation.php
│   │   ├── OtBill.php
│   │   ├── OtFormSection.php
│   │   ├── OtIntraopFormSection.php
│   │   ├── OtPostopFormSection.php
│   │   ├── ClinicalOrder.php
│   │   ├── ProgressNote.php
│   │   ├── NursingRecord.php
│   │   ├── VitalEntry.php
│   │   ├── BillCorrection.php
│   │   ├── Floor.php
│   │   ├── Ward.php
│   │   ├── Bed.php
│   │   ├── HospitalInfo.php
│   │   ├── HospitalSetting.php
│   │   ├── HospitalDepartment.php
│   │   ├── HospitalSignatory.php
│   │   ├── HospitalBankAccount.php
│   │   ├── HospitalCharge.php
│   │   ├── InsurancePanel.php
│   │   ├── DoctorFee.php
│   │   ├── Medicine.php
│   │   ├── MedicineBatch.php
│   │   ├── StockTransaction.php
│   │   ├── MedicationOrder.php
│   │   ├── DispensingRecord.php
│   │   ├── PatientReturn.php
│   │   ├── WardReturn.php
│   │   ├── SupplierReturn.php
│   │   ├── DisposalRecord.php
│   │   ├── Supplier.php
│   │   ├── PurchaseOrder.php
│   │   ├── PurchaseOrderItem.php
│   │   ├── GoodsReceivedNote.php
│   │   ├── GrnItem.php
│   │   ├── PharmacyTransaction.php
│   │   ├── CashReconciliation.php
│   │   ├── PanelClaim.php
│   │   ├── LabTest.php
│   │   ├── LabTestPackage.php
│   │   ├── LabOrder.php
│   │   ├── LabOrderTest.php
│   │   ├── LabReport.php
│   │   ├── LabReagent.php
│   │   ├── LabReagentBatch.php
│   │   ├── LabStockTransaction.php
│   │   ├── LabTransaction.php
│   │   ├── FinanceLedger.php
│   │   ├── FinancePosting.php
│   │   ├── FinanceTransaction.php
│   │   ├── FinanceConfigItem.php
│   │   ├── FinanceNumberSeries.php
│   │   ├── HrConfigItem.php
│   │   ├── HrNumberSeries.php
│   │   ├── OpdVitalField.php
│   │   ├── PatientActivity.php
│   │   └── (+ sessions, role_permissions, user_roles pivot)
│   │
│   └── Traits/
│       ├── HmsHelpers.php                      # Core helpers (IDs, camelCase, ledger, charges)
│       └── PharmacyHelper.php                  # Pharmacy-specific enrichment helpers
│
├── bootstrap/
│   └── app.php
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   ├── mail.php
│   ├── queue.php
│   ├── services.php
│   └── session.php
│
├── database/
│   ├── migrations/                             # 57 migration files
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── (role/permission seeders)
│
├── routes/
│   ├── api.php                                 # 200+ API routes
│   └── web.php                                 # Blade page routes
│
├── resources/
│   └── views/
│       ├── auth/
│       │   └── login.blade.php
│       ├── errors/
│       │   └── 403.blade.php
│       ├── layouts/
│       │   └── app.blade.php                   # Main layout (sidebar + topnav)
│       ├── partials/
│       │   ├── sidebar.blade.php
│       │   └── topnav.blade.php
│       └── pages/
│           ├── dashboard.blade.php
│           ├── opd.blade.php
│           ├── ipd.blade.php
│           ├── emergency.blade.php
│           ├── ot.blade.php
│           ├── patients.blade.php
│           ├── doctors.blade.php
│           ├── staff.blade.php
│           ├── doctor-fees.blade.php
│           ├── charges.blade.php
│           ├── bed-management.blade.php
│           ├── hospital-info.blade.php
│           ├── income-expense.blade.php
│           ├── users.blade.php
│           ├── roles.blade.php
│           ├── billing/
│           │   └── ipd-discharge.blade.php
│           ├── pharmacy/
│           │   ├── medication-orders.blade.php
│           │   ├── dispensing.blade.php
│           │   ├── pos.blade.php
│           │   ├── inventory.blade.php
│           │   ├── stock-alerts.blade.php
│           │   ├── billing.blade.php
│           │   └── returns.blade.php
│           ├── laboratory/
│           │   ├── test-orders.blade.php
│           │   ├── walk-in.blade.php
│           │   ├── test-master.blade.php
│           │   ├── sample-collection.blade.php
│           │   ├── results.blade.php
│           │   ├── quality-control.blade.php
│           │   ├── inventory.blade.php
│           │   ├── billing.blade.php
│           │   ├── reports.blade.php
│           │   └── analytics.blade.php
│           └── configuration/
│               ├── opd.blade.php
│               ├── ipd.blade.php
│               ├── er.blade.php
│               ├── ot.blade.php
│               ├── human-resources.blade.php
│               ├── financials.blade.php
│               ├── pharmacy.blade.php
│               └── laboratory.blade.php
│
├── public/
│   ├── index.php
│   ├── css/
│   │   └── app.css                             # All custom styles
│   ├── js/                                     # 42 JS files (Vanilla JS + jQuery)
│   │   ├── app.js
│   │   ├── dashboard.js
│   │   ├── patients.js
│   │   ├── opd.js
│   │   ├── opd-config.js
│   │   ├── ipd.js
│   │   ├── ipd-config.js
│   │   ├── emergency.js
│   │   ├── er-config.js
│   │   ├── ot.js
│   │   ├── ot-config.js
│   │   ├── doctors.js
│   │   ├── staff.js
│   │   ├── doctor-fees.js
│   │   ├── charges.js
│   │   ├── hospital-info.js
│   │   ├── bed-management.js
│   │   ├── billing-ipd-discharge.js
│   │   ├── income-expense.js
│   │   ├── finance-config.js
│   │   ├── hr-config.js
│   │   ├── users.js
│   │   ├── roles.js
│   │   ├── pharmacy.js
│   │   ├── pharmacy-billing.js
│   │   ├── pharmacy-config.js
│   │   ├── pharmacy-dispensing.js
│   │   ├── pharmacy-inventory.js
│   │   ├── pharmacy-medication-orders.js
│   │   ├── pharmacy-returns.js
│   │   ├── pharmacy-stock-alerts.js
│   │   ├── laboratory-billing.js
│   │   ├── laboratory-inventory.js
│   │   ├── laboratory-reports.js
│   │   ├── laboratory-result-entry.js
│   │   ├── laboratory-sample-collection.js
│   │   ├── laboratory-test-master.js
│   │   ├── laboratory-test-orders.js
│   │   ├── laboratory-walk-in.js
│   │   ├── _vital_toolbar.js                   # Shared vital signs toolbar
│   │   ├── _vrows.js                           # Shared vital rows utility
│   │   └── _vt.js                              # Shared vital table utility
│   └── logos/                                  # Uploaded hospital logos
│
├── .claude/
│   ├── CLAUDE.md
│   └── rules/
│       ├── backend-rules.md
│       ├── code-style.md
│       ├── coding-rules.md
│       ├── cost-rules.md
│       ├── security-rules.md
│       └── frontend/
│           └── vanilla-js.md
│
├── .env
├── composer.json
├── phpunit.xml
└── PROJECT_OVERVIEW.md                         # This file
```

---

## Modules

### 1. Patient Management
**Route:** `/patients` | **JS:** `patients.js` | **API:** `PatientController`  
**Tables:** `patients`, `patient_activities`

| Feature | Detail |
|---------|--------|
| Registration | New patient form with MRN auto-generation (year-based: YY-YYYY-XXXX) |
| Search | By name, MRN, phone, CNIC |
| Phone-first | Duplicate detection via phone search |
| Profile | Demographics, guardian info, allergies, blood group |
| Activity log | Every clinical event logged per patient |
| Lock | Patients can be locked to prevent edit |

**Key Fields:** mrn, name, age, gender, phone, cnic, blood_group, address, allergies (JSON), contact_type, guardian info, visit_count

---

### 2. Outpatient Department (OPD)
**Route:** `/opd` | **JS:** `opd.js` | **API:** `OpdController`  
**Tables:** `opd_visits`, `opd_bills`, `opd_payments`, `opd_vitals`, `opd_consultations`, `opd_form_sections`, `bill_corrections`

| Feature | Detail |
|---------|--------|
| Registration | Multi-step: source select → patient lookup/new → charges breakdown |
| Doctor Fee | Editable per registration, override stored separately |
| Hospital Charges | Selectable from master, amounts editable (override pattern) |
| Billing | Full billing & payment offcanvas, Add Payment with charge checkboxes |
| Corrections | Billing correction log with field-level audit |
| Vitals | Per-visit vital signs recording |
| Consultations | Clinical notes per visit |
| Slips | A4 or Thermal (controlled by Document Template setting) |
| Additional Charges | Post-registration extra charges |
| Custom Form Sections | Dynamic form fields configurable per hospital |

**Override Pattern:** User edits amount → `overrideAmount` on grid row → sent as `consultationCharges` in payload → backend stores total; display reconciles master sum vs stored total.

**Document Format Key:** `doc_format_opd_registration`

---

### 3. Inpatient Department (IPD)
**Route:** `/ipd` | **JS:** `ipd.js` | **API:** `IpdController`  
**Tables:** `ipd_admissions`, `ipd_bills`, `ipd_payments`, `ipd_number_series`, `ipd_form_sections`, `nursing_records`, `vital_entries`, `bill_corrections`, `beds`

| Feature | Detail |
|---------|--------|
| Admission | Multi-step registration with bed assignment |
| Charges | Doctor fee + hospital charges (both editable, override pattern) |
| Billing | Billing & Payment tab with charge-level payment tracking |
| Nursing | Nursing records + vital entries per admission |
| Progress Notes | Clinical progress notes per admission |
| Correction | Billing correction view with audit log |
| Additional Charges | Post-admission add-on charges (doctor fees + hospital charges) |
| Discharge | Multi-step discharge with clearance from all departments |
| Slips | A4 + Thermal admission slips |
| Custom Form Sections | Dynamic clinical forms configurable per hospital |

**Field:** `room_charges` stores the hospital charges total (name is legacy — does not mean only room charges).  
**Document Format Key:** `doc_format_er_registration` *(uses same key pattern)*

---

### 4. Emergency Department (ER)
**Route:** `/emergency` | **JS:** `emergency.js` | **API:** `EmergencyController`  
**Tables:** `emergency_visits`, `emergency_bills`, `emergency_payments`, `er_form_sections`

| Feature | Detail |
|---------|--------|
| Triage | ESI level (1–5) with auto triage category (Red/Orange/Yellow/Green) |
| Registration | Patient lookup + charge selection + ESI/arrival mode |
| Billing & Payment | Same offcanvas pattern as OPD/IPD |
| Discharge | ER-specific discharge with clearance |
| Clinical Orders | Investigation orders passed to Lab |
| Slips | A4 + Thermal (doc_format_er_registration) |
| Custom Form Sections | Dynamic ER assessment forms |

**Tables:** `consultation_charges` stores hospital charges (same as OPD).

---

### 5. Operation Theater (OT)
**Route:** `/ot` | **JS:** `ot.js` | **API:** `OtController`  
**Tables:** `operations`, `ot_bills`, `ot_form_sections`, `ot_intraop_form_sections`, `ot_postop_form_sections`

| Feature | Detail |
|---------|--------|
| Scheduling | Operation scheduling with patient/doctor/procedure |
| Pre-op Checklist | Configurable checklist before operation |
| Intra-op | Intraoperative notes and data capture |
| Post-op | Post-operative recovery documentation |
| Billing | OT billing transaction |
| Discharge | OT patient discharge |
| Custom Forms | Separate custom forms for checklist, intraop, postop |

---

### 6. Pharmacy
**Routes:** `/pharmacy/*` | **JS:** `pharmacy*.js` | **Tables:** 15+ pharmacy tables

#### 6a. Medication Orders
**API:** `MedicationOrderController`  
- Receive orders from OPD/IPD/ER
- Verify, start dispensing, hold, remove items
- Status flow: Pending → Verified → Dispensing → Dispensed/Held

#### 6b. Dispensing
**API:** `DispensingController`  
- Dispensing queue and workstation
- Save progress, complete dispensing, print labels, cancel

#### 6c. Inventory
**API:** `InventoryController`  
- Medicine master with batches and stock transactions
- Filters by form/category/manufacturer/ABC class

#### 6d. Stock Alerts
**API:** `StockAlertController`  
- Dashboard, out-of-stock, low-stock, expiring-soon, expired
- Reorder suggestions, supplier management
- Purchase orders (PO) + Goods Received Notes (GRN)
- Disposal management

#### 6e. Billing
**API:** `PharmacyBillingController`  
- Revenue dashboard, transaction management
- Pending orders from OPD/IPD/ER/Panel
- Payment collection, void, reconciliation

#### 6f. Returns
**API:** `ReturnsExpiryController`  
- Patient returns, ward returns, supplier returns (RTV)
- Expired stock disposal

**Key Tables:** `medicines`, `medicine_batches`, `stock_transactions`, `medication_orders`, `dispensing_records`, `pharmacy_transactions`, `cash_reconciliations`, `patient_returns`, `ward_returns`, `supplier_returns`, `disposal_records`, `purchase_orders`, `purchase_order_items`, `goods_received_notes`, `grn_items`, `suppliers`, `panel_claims`

---

### 7. Laboratory
**Routes:** `/laboratory/*` | **JS:** `laboratory-*.js` | **Tables:** 10+ lab tables

#### 7a. Test Orders
**API:** `LaboratoryController`  
- Orders from OPD/IPD/ER or walk-in
- Status: Ordered → Collected → In Progress → Resulted → Verified → Reported

#### 7b. Test Master
**API:** `TestMasterController`  
- Full test catalog management (400+ fields per test)
- Test packages, toggle active/inactive, duplicate

#### 7c. Sample Collection
**API:** `LaboratoryController` (collectSample, rejectSample)  
- Queue-based sample collection
- Reject with reason

#### 7d. Results
**API:** `LaboratoryController` (enterResults, verifyResults)  
- Result entry with reference ranges
- Verify individual or all results

#### 7e. Reports
**API:** `LabReportController`  
- Generate, print, archive reports
- Delivery tracking, cumulative reports

#### 7f. Inventory
**API:** `LabInventoryController`  
- Lab reagent tracking with batches
- Consumption tracking, analyzer status

**Key Tables:** `lab_tests`, `lab_test_packages`, `lab_orders`, `lab_order_tests`, `lab_reports`, `lab_reagents`, `lab_reagent_batches`, `lab_stock_transactions`, `lab_transactions`

---

### 8. Finance
**Routes:** `/income-expense`, `/billing/ipd-discharge` | **JS:** `income-expense.js`, `billing-ipd-discharge.js`

| Feature | Detail |
|---------|--------|
| Account Heads | Chart of accounts (income/expense categories) |
| Transactions | Income/expense entry with account head |
| Finance Ledger | Automatic ledger entries from all clinical modules |
| Finance Postings | Manual journal postings |
| IPD Discharge Billing | Final billing at IPD discharge |

**Key Tables:** `finance_ledger`, `finance_postings`, `finance_transactions`, `account_heads`

---

### 9. Bed Management
**Route:** `/bed-management` | **JS:** `bed-management.js` | **API:** `BedManagementController`  
**Tables:** `floors`, `wards`, `beds`

- Floor → Ward → Bed hierarchy
- Bed status: Available / Occupied / Maintenance
- Auto-assign on IPD admission, auto-release on discharge

---

### 10. Dashboard
**Route:** `/` | **JS:** `dashboard.js` | **API:** `DashboardController`

- Stats: today's OPD/IPD/ER/OT counts, bed occupancy, revenue
- Clinical overview: recent admissions, active patients
- Financial overview: collections, pending dues
- ApexCharts for visual analytics
- Preference saving per user

---

### 11. User & Role Management
**Routes:** `/users`, `/roles` | **JS:** `users.js`, `roles.js`  
**Tables:** `users`, `roles`, `permissions`, `role_permissions`, `user_roles`

#### Users
- CRUD with role assignment
- Active/inactive toggle
- Stats: total, active, by role

#### Roles
- Custom roles with permission sets
- Duplicate role functionality
- System roles (superadmin, admin) vs custom roles

#### Permissions
- Slug-based: `module.action` (e.g. `opd.register`, `patients.access`)
- Module-level: checking `opd` grants access if any `opd.*` permission exists
- Superadmin bypasses all permission checks

---

### 12. Hospital Configuration
**Route:** `/hospital-info` | **JS:** `hospital-info.js` | **API:** `HospitalInfoController`

- **Basic Info:** Name, tagline, registration number
- **Letterhead:** Logo, colors, font, what to show (name/logo/address/phone/email/website)
- **Footer:** Footer lines, show page number / date / disclaimer
- **Document Templates:** Format per module (A4 or Thermal) — keys like `doc_format_opd_registration`, `doc_format_er_registration`
- **Departments:** Hospital department list
- **Signatories:** Authorized signatories for documents
- **Bank Accounts:** Hospital bank accounts
- **Insurance Panels:** Panel/TPA configurations

---

### 13. System Configuration
**Routes:** `/configuration/*`

| Module | Key | Tables |
|--------|-----|--------|
| OPD Config | `opd_config_items` | Visit types, charge categories, etc. |
| IPD Config | `opd_config_items` (IPD) | Admission types, ward types |
| ER Config | (shared config) | ESI levels, arrival modes |
| OT Config | (shared config) | Operation categories |
| HR Config | `hr_config_items` | Departments, designations, shifts |
| Finance Config | `finance_config_items` | Account categories, payment modes |
| Pharmacy Config | (pharmacy_config) | Drug categories, dosage forms |
| Number Series | `opd_number_series`, `ipd_number_series`, `hr_number_series`, `finance_number_series` | Auto-numbering sequences |
| Vital Fields | `opd_vital_fields` | Custom vital sign fields |
| Doctor Fees | `doctor_fees` | Per-doctor, per-visit-type fee schedule |
| Hospital Charges | `hospital_charges` | Per-module (OPD/IPD/ER/OT) charge master |

---

## Database Tables (78 Total)

### Patient & Auth
| Table | Purpose |
|-------|---------|
| `patients` | Patient master records |
| `patient_activities` | Audit log of all patient events |
| `users` | System users |
| `sessions` | Laravel sessions |
| `roles` | Custom and system roles |
| `permissions` | Permission definitions |
| `role_permissions` | Pivot: role ↔ permission |
| `user_roles` | Pivot: user ↔ role |

### Clinical — OPD
| Table | Purpose |
|-------|---------|
| `opd_visits` | OPD visit records |
| `opd_bills` | OPD billing records |
| `opd_payments` | OPD payment transactions |
| `opd_vitals` | Vital sign readings per visit |
| `opd_vital_fields` | Custom vital field config |
| `opd_consultations` | Clinical consultation notes |
| `opd_form_sections` | Custom form section definitions |
| `opd_number_series` | OPD ID auto-numbering config |
| `opd_config_items` | OPD configuration values |

### Clinical — IPD
| Table | Purpose |
|-------|---------|
| `ipd_admissions` | Inpatient admission records |
| `ipd_bills` | IPD billing records |
| `ipd_payments` | IPD payment transactions |
| `ipd_number_series` | IPD admission ID config |
| `ipd_form_sections` | Custom IPD form definitions |
| `nursing_records` | Nursing record master per admission |
| `vital_entries` | Vital signs per nursing record |
| `progress_notes` | Clinical progress notes |

### Clinical — Emergency
| Table | Purpose |
|-------|---------|
| `emergency_visits` | ER visit records |
| `emergency_bills` | ER billing records |
| `emergency_payments` | ER payment transactions |
| `er_form_sections` | Custom ER form definitions |

### Clinical — OT
| Table | Purpose |
|-------|---------|
| `operations` | Operation records |
| `ot_bills` | OT billing records |
| `ot_form_sections` | Pre-op checklist form definitions |
| `ot_intraop_form_sections` | Intraoperative form definitions |
| `ot_postop_form_sections` | Post-operative form definitions |

### Shared Clinical
| Table | Purpose |
|-------|---------|
| `clinical_orders` | Investigation orders (OPD/IPD/ER) |
| `bill_corrections` | Billing correction audit log |

### Bed Management
| Table | Purpose |
|-------|---------|
| `floors` | Hospital floor/building |
| `wards` | Ward definitions per floor |
| `beds` | Individual bed records |

### Hospital Config
| Table | Purpose |
|-------|---------|
| `hospital_info` | Legacy hospital info |
| `hospital_settings` | Key-value settings (letterhead, footer, etc.) |
| `hospital_departments` | Department list |
| `hospital_signatories` | Authorized signatories |
| `hospital_bank_accounts` | Bank account details |
| `hospital_charges` | Charge master per module |
| `doctor_fees` | Doctor fee schedule |
| `insurance_panels` | Insurance/TPA panel info |

### HR Config
| Table | Purpose |
|-------|---------|
| `doctors` | Doctor master data |
| `staff` | Non-doctor staff |
| `hr_config_items` | HR configuration values |
| `hr_number_series` | HR ID numbering config |

### Finance
| Table | Purpose |
|-------|---------|
| `finance_ledger` | Auto-posted ledger entries |
| `finance_postings` | Manual journal postings |
| `finance_transactions` | Income/expense transactions |
| `account_heads` | Chart of accounts |
| `finance_config_items` | Finance configuration |
| `finance_number_series` | Finance ID numbering config |

### Pharmacy
| Table | Purpose |
|-------|---------|
| `medicines` | Medicine master |
| `medicine_batches` | Stock batches per medicine |
| `stock_transactions` | Stock movement ledger |
| `medication_orders` | Prescription/orders from clinical |
| `dispensing_records` | Dispensing workflow records |
| `pharmacy_transactions` | Pharmacy billing transactions |
| `cash_reconciliations` | Cash reconciliation records |
| `panel_claims` | Insurance panel claims |
| `patient_returns` | Patient medicine returns |
| `ward_returns` | Ward/unit medicine returns |
| `supplier_returns` | Supplier RTV records |
| `disposal_records` | Expired/damaged disposal |
| `suppliers` | Supplier master |
| `purchase_orders` | Purchase order headers |
| `purchase_order_items` | PO line items |
| `goods_received_notes` | GRN records |
| `grn_items` | GRN line items |

### Laboratory
| Table | Purpose |
|-------|---------|
| `lab_tests` | Test catalog master |
| `lab_test_packages` | Test packages/panels |
| `lab_orders` | Lab order headers |
| `lab_order_tests` | Individual tests per order |
| `lab_reports` | Generated lab reports |
| `lab_reagents` | Reagent/consumable master |
| `lab_reagent_batches` | Reagent stock batches |
| `lab_stock_transactions` | Reagent stock movements |
| `lab_transactions` | Lab billing transactions |

---

## API Routes Reference

### Patients
| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/patients` | All patients |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/{mrn}` | Get by MRN |
| GET | `/api/patients/{mrn}/summary` | Clinical summary |
| GET | `/api/patients/{mrn}/activities` | Activity log |
| POST | `/api/patients/search-by-phone` | Phone search |
| POST | `/api/patients/validate-self` | Self-registration validate |

### OPD
| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/opd/visits` | All visits |
| POST | `/api/opd/visits` | Create visit + bill |
| GET | `/api/opd/bills` | All bills |
| GET | `/api/opd/vitals` | All vitals |
| POST | `/api/opd/vitals` | Add vital |
| POST | `/api/opd/consultations` | Add consultation |
| GET | `/api/opd/payments/{billId}` | Payments for bill |
| POST | `/api/opd/payments` | Record payment |
| POST | `/api/opd/bills/{billId}/additional-charges` | Add charges |
| GET | `/api/opd/correction-log/{billId}` | Correction history |
| POST | `/api/opd/save-corrections/{billId}` | Save corrections |

### IPD
| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/ipd/admissions` | All admissions |
| POST | `/api/ipd/admissions` | Create admission + bill |
| GET | `/api/ipd/bills` | All bills |
| GET | `/api/ipd/payments/{billId}` | Payments for bill |
| POST | `/api/ipd/payments` | Record payment |
| POST | `/api/ipd/bills/{billId}/additional-charges` | Add charges |
| GET | `/api/ipd/nursing-records` | All nursing records |
| GET | `/api/ipd/nursing-records/admission/{id}` | By admission |
| POST | `/api/ipd/nursing-records/{id}/vitals` | Add vital entry |
| GET | `/api/ipd/discharge/{admissionId}` | Discharge info |
| POST | `/api/ipd/discharge/{admissionId}/initiate` | Start discharge |
| POST | `/api/ipd/discharge/{admissionId}/complete` | Complete discharge |

### Emergency
| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/emergency/visits` | All ER visits |
| POST | `/api/emergency/visits` | Create ER visit + bill |
| GET | `/api/emergency/bills` | All ER bills |
| GET | `/api/emergency/payments/{billId}` | Payments for bill |
| POST | `/api/emergency/payments` | Record payment |
| GET | `/api/er/discharge/{visitId}` | Discharge info |
| POST | `/api/er/discharge/{visitId}/initiate` | Start discharge |
| POST | `/api/er/discharge/{visitId}/complete` | Complete discharge |

### Bed Management
| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/bed-management/floors` | All floors |
| POST | `/api/bed-management/floors` | Add floor |
| GET | `/api/bed-management/wards` | All wards |
| GET | `/api/bed-management/beds/available` | Available beds |
| PUT | `/api/bed-management/beds/{id}/status` | Update bed status |

### Hospital Config
| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/config/hospital-info` | Hospital basic info |
| GET | `/api/hospital-info/settings/{key}` | Get setting group |
| POST | `/api/hospital-info/settings/{key}` | Save setting group |
| POST | `/api/hospital-info/logo` | Upload logo |
| GET | `/api/config/hospital-charges/module/{module}` | Charges by module |
| GET | `/api/config/doctor-fees` | Doctor fee schedule |

### Users & Roles
| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/users` | All users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| GET | `/api/roles` | All roles |
| POST | `/api/roles` | Create role |
| GET | `/api/roles/{id}/permissions` | Role permissions |
| POST | `/api/roles/{id}/permissions` | Sync permissions |

---

## Authentication & Authorization

### Auth Flow
```
POST /login
  → Auth::attempt()
  → check is_active
  → session created
  → redirect to first accessible page

GET /* (web pages)
  → AuthMiddleware: Auth::check() + is_active
  → PermissionMiddleware: hasPermission(slug) or hasModuleAccess(module)
  → render Blade view

AJAX /api/*
  → AuthMiddleware: same check
  → Controller method executes
  → JSON response
```

### Roles
| Role | Access |
|------|--------|
| `superadmin` | All pages, bypasses all permission checks |
| `admin` | Full access within configured permissions |
| `user` | Permission-controlled via custom Role assignment |

### Permission Slugs (examples)
```
dashboard.access    opd.access          opd.register
ipd.access          ipd.admit           emergency.access
ot.access           patients.access     patients.edit
pharmacy.access     laboratory.access   finance.access
users.access        users.create        roles.access
hospital-info.access charges.access     bed-management.access
```

---

## Traits Reference

### HmsHelpers (app/Traits/HmsHelpers.php)

| Method | Purpose |
|--------|---------|
| `safeError($e, $msg)` | Catch exceptions, return safe JSON error |
| `postToLedger($data)` | Create `finance_ledger` entry automatically |
| `logActivity($mrn, $action, $module, $details)` | Log to `patient_activities` |
| `nextId($model, $col, $prefix)` | Generate next sequential ID (e.g. `OPD-001`) |
| `nextIdFromSeries($model, $col, $idCol, $seriesModel)` | Generate ID from number series config |
| `generateYearId($prefix, $count)` | Generate year-based ID (e.g. `PT-26-2026-0001`) |
| `toCamel($model)` | Convert Eloquent model to camelCase array |
| `toCamelCollection($collection)` | Convert collection to camelCase arrays |
| `calculateChargesFromMaster($module, $chargeIds)` | Sum charge amounts from `hospital_charges` by module + IDs |

### PharmacyHelper (app/Traits/PharmacyHelper.php)

| Method | Purpose |
|--------|---------|
| `findMedicineByItem($item)` | Look up medicine by ID or name |
| `enrichItemWithLiveData($item, $medicine)` | Attach current stock/price to order item |
| `enrichItemsAndCalcTotal($items)` | Process array of items, return enriched + total |

---

## Frontend Architecture

### Pattern: One JS file per page

Each page has a dedicated JS file loaded by the Blade template. Files follow this structure:

```js
$(document).ready(function() {
    // 1. State variables
    var patients = [], bills = [], ...;

    // 2. Load all data via parallel AJAX
    function loadAllData() {
        $.when(
            $.get('/api/...'),
            $.get('/api/...')
        ).done(function(r1, r2) {
            data = r1 || [];
            renderAll();
        });
    }

    // 3. Render functions — pure DOM manipulation
    function renderAll() { ... }

    // 4. Event bindings
    $(document).on('click', '#btnSave', function() { saveRecord(); });

    // 5. Init
    loadAllData();
});
```

### Slip Printing Pattern

All registration slips follow this pattern:

```js
function printXxxSlip(visit, patient, bill) {
    $.when(
        $.get('/api/hospital-info/settings/letterhead'),
        $.get('/api/hospital-info/settings/footer'),
        $.get('/api/hospital-info/settings/basic'),
        $.get('/api/hospital-info/settings/doc_format_xxx_registration')
    ).done(function(lhRes, ftRes, prRes, fmtRes) {
        var savedFormat = fmtRes[0].settings['doc_format_xxx_registration'] || 'a4';
        if (savedFormat === 'thermal') { _printThermal(...); return; }
        // build A4 HTML from settings
        var win = window.open('', '_blank');
        win.document.write(html);
        win.print();
    });
}
```

**Document Format Keys:**
| Module | Setting Key |
|--------|------------|
| OPD | `doc_format_opd_registration` |
| ER | `doc_format_er_registration` |
| IPD | *(uses IPD slip function directly)* |

### Amount Override Pattern

Used in OPD, IPD, and ER charge grids:

```js
// On charge grid row amount edit:
chargesGrid[idx].overrideAmount = newValue;

// Calculation:
function calcRowAmount(row) {
    if (row.overrideAmount !== undefined) return Number(row.overrideAmount);
    return Math.max(0, row.unitPrice * row.qty - Number(row.discount || 0));
}

// Payload to backend includes calculated total:
{ consultationCharges: calcChargesTotal() }

// Backend stores the total; display reconciles:
var masterSum = masterItems.reduce((s, c) => s + c.amount, 0);
if (Math.abs(masterSum - storedTotal) > 0.01) {
    // show stored total with consolidated label
} else {
    // show individual charge lines
}
```

---

## Key Business Rules

### Patient ID Generation
```
Format: PT-YY-YYYY-XXXX (e.g. PT-26-2026-0001)
YY    = 2-digit year
YYYY  = 4-digit year
XXXX  = sequential number padded to 4 digits
```

### Billing Flow (all modules)
```
1. Registration/Admission → Bill created with total_amount
2. Charges: doctor_fee + consultation_charges/room_charges
3. Payments tracked in separate payments table
4. Bill status: Pending → Partial → Paid
5. Finance ledger auto-posted on every bill/payment
```

### Discharge Flow (IPD)
```
1. Clinical team initiates discharge
2. Clearance required from: Pharmacy, Lab, Finance
3. Each department verifies/clears (payDept endpoint)
4. Once all cleared → completeDischarge()
5. Bed auto-released on discharge
```

### Correction Log
```
- Any billing field change creates a BillCorrection record
- Fields tracked: doctorFee, roomCharges, consultationCharges, charge_XXX
- Corrections marked as "Removed" or value changes
- Display layer shows corrected badge on affected fields
```

---

## Environment

```env
APP_NAME=Nova HMS
APP_ENV=local
APP_URL=http://localhost/healthops
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=healthops
DB_USERNAME=root
DB_PASSWORD=          # blank (XAMPP default)
```

### Commands
```bash
# Run with XAMPP PHP
/c/xampp/php/php artisan migrate
/c/xampp/php/php artisan migrate:fresh --seed
/c/xampp/php/php artisan route:list
/c/xampp/php/php artisan tinker

# MySQL
/c/xampp/mysql/bin/mysql -u root -h 127.0.0.1 -P 3306 healthops
```

### Dependencies
```json
{
    "php": "^8.2",
    "laravel/framework": "^12.0",
    "laravel/tinker": "^2.10.1"
}
```

---

*Last updated: 2026-04-11*
