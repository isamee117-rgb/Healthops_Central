<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            // ── Standalone pages (access only) ───────────────────────────────
            ['parent_module' => null, 'module' => 'dashboard',      'label' => 'Dashboard',         'actions' => []],
            ['parent_module' => null, 'module' => 'patients',        'label' => 'Patients',           'actions' => []],
            ['parent_module' => null, 'module' => 'doctors',         'label' => 'Doctor Management',  'actions' => []],
            ['parent_module' => null, 'module' => 'staff',           'label' => 'Staff',              'actions' => []],
            ['parent_module' => null, 'module' => 'doctor-fees',     'label' => 'Doctor Fees',        'actions' => []],
            ['parent_module' => null, 'module' => 'charges',         'label' => 'Charges',            'actions' => []],
            ['parent_module' => null, 'module' => 'income-expense',  'label' => 'Income & Expense',   'actions' => []],
            ['parent_module' => null, 'module' => 'user-management', 'label' => 'User Management',    'actions' => []],
            ['parent_module' => null, 'module' => 'role-management', 'label' => 'Role Management',    'actions' => []],

            // ── Hospital Information – tab access only ────────────────────────
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.profile',     'label' => 'Hospital Profile',        'actions' => []],
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.legal',       'label' => 'Legal & Licensing',       'actions' => []],
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.signatories', 'label' => 'Signatories',             'actions' => []],
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.departments', 'label' => 'Departments',             'actions' => []],
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.banking',     'label' => 'Banking',                 'actions' => []],
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.templates',   'label' => 'Templates',               'actions' => []],
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.insurance',   'label' => 'Insurance Panels',        'actions' => []],
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.hours',       'label' => 'Operating Hours',         'actions' => []],
            ['parent_module' => 'hospital-info', 'module' => 'hospital-info.system',      'label' => 'System Settings',         'actions' => []],

            // ── Configuration sub-pages (access only) ────────────────────────
            ['parent_module' => 'configuration', 'module' => 'configuration.opd',              'label' => 'OPD Configuration',              'actions' => []],
            ['parent_module' => 'configuration', 'module' => 'configuration.ipd',              'label' => 'IPD Configuration',              'actions' => []],
            ['parent_module' => 'configuration', 'module' => 'configuration.er',               'label' => 'ER Configuration',               'actions' => []],
            ['parent_module' => 'configuration', 'module' => 'configuration.ot',               'label' => 'OT Configuration',               'actions' => []],
            ['parent_module' => 'configuration', 'module' => 'configuration.human-resources',  'label' => 'HR Configuration',               'actions' => []],
            ['parent_module' => 'configuration', 'module' => 'configuration.financials',       'label' => 'Financials Configuration',       'actions' => []],
            ['parent_module' => 'configuration', 'module' => 'configuration.pharmacy',         'label' => 'Pharmacy Configuration',         'actions' => []],
            ['parent_module' => 'configuration', 'module' => 'configuration.laboratory',       'label' => 'Laboratory Configuration',       'actions' => []],

            // ── OPD – tab access only ─────────────────────────────────────────
            ['parent_module' => 'opd', 'module' => 'opd.registration',  'label' => 'OPD Registration',  'actions' => []],
            ['parent_module' => 'opd', 'module' => 'opd.billing',        'label' => 'OPD Billing',        'actions' => []],
            ['parent_module' => 'opd', 'module' => 'opd.vitals',         'label' => 'OPD Vitals',         'actions' => []],
            ['parent_module' => 'opd', 'module' => 'opd.consultation',   'label' => 'OPD Consultation',   'actions' => []],

            // ── IPD – tab access only ─────────────────────────────────────────
            ['parent_module' => 'ipd', 'module' => 'ipd.registration',   'label' => 'IPD Registration',   'actions' => []],
            ['parent_module' => 'ipd', 'module' => 'ipd.billing',         'label' => 'IPD Billing',         'actions' => []],
            ['parent_module' => 'ipd', 'module' => 'ipd.orders',          'label' => 'IPD Orders',          'actions' => []],
            ['parent_module' => 'ipd', 'module' => 'ipd.mar',             'label' => 'IPD MAR',             'actions' => []],
            ['parent_module' => 'ipd', 'module' => 'ipd.investigations',  'label' => 'IPD Investigations',  'actions' => []],
            ['parent_module' => 'ipd', 'module' => 'ipd.nursing',         'label' => 'IPD Nursing',         'actions' => []],
            ['parent_module' => 'ipd', 'module' => 'ipd.discharge',       'label' => 'IPD Discharge',       'actions' => []],

            // ── Emergency (ER) – tab access only ──────────────────────────────
            ['parent_module' => 'emergency', 'module' => 'emergency.triage',         'label' => 'ER Triage',            'actions' => []],
            ['parent_module' => 'emergency', 'module' => 'emergency.board',          'label' => 'ER Board',             'actions' => []],
            ['parent_module' => 'emergency', 'module' => 'emergency.treatment',      'label' => 'ER Treatment',         'actions' => []],
            ['parent_module' => 'emergency', 'module' => 'emergency.investigations', 'label' => 'ER Investigations',    'actions' => []],
            ['parent_module' => 'emergency', 'module' => 'emergency.disposition',    'label' => 'ER Disposition',       'actions' => []],
            ['parent_module' => 'emergency', 'module' => 'emergency.billing',        'label' => 'ER Billing & Payment', 'actions' => []],

            // ── Operation Theater – tab access only ───────────────────────────
            ['parent_module' => 'ot', 'module' => 'ot.scheduling', 'label' => 'OT Scheduling', 'actions' => []],
            ['parent_module' => 'ot', 'module' => 'ot.dashboard',  'label' => 'OT Dashboard',  'actions' => []],
            ['parent_module' => 'ot', 'module' => 'ot.checklist',  'label' => 'OT Checklist',  'actions' => []],
            ['parent_module' => 'ot', 'module' => 'ot.intraop',    'label' => 'OT Intra-Op',   'actions' => []],
            ['parent_module' => 'ot', 'module' => 'ot.postop',     'label' => 'OT Post-Op',    'actions' => []],
            ['parent_module' => 'ot', 'module' => 'ot.reports',    'label' => 'OT Reports',    'actions' => []],

            // ── Pharmacy – tab access only ────────────────────────────────────
            ['parent_module' => 'pharmacy', 'module' => 'pharmacy.medication-orders', 'label' => 'Medication Orders',                      'actions' => []],
            ['parent_module' => 'pharmacy', 'module' => 'pharmacy.dispensing',        'label' => 'Dispensing & Fulfillment',                'actions' => []],
            ['parent_module' => 'pharmacy', 'module' => 'pharmacy.pos',               'label' => 'POS Terminal',                            'actions' => []],
            ['parent_module' => 'pharmacy', 'module' => 'pharmacy.inventory',         'label' => 'Pharmacy Inventory Management',           'actions' => []],
            ['parent_module' => 'pharmacy', 'module' => 'pharmacy.stock-alerts',      'label' => 'Stock Alerts & Procurement',              'actions' => []],
            ['parent_module' => 'pharmacy', 'module' => 'pharmacy.billing',           'label' => 'Pharmacy Billing & Financial Reconciliation', 'actions' => []],
            ['parent_module' => 'pharmacy', 'module' => 'pharmacy.returns',           'label' => 'Returns & Expiry Management',             'actions' => []],

            // ── Laboratory – tab access only ──────────────────────────────────
            ['parent_module' => 'laboratory', 'module' => 'laboratory.test-orders',       'label' => 'Test Orders Queue',                    'actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.walk-in',           'label' => 'Walk-in Registration',                 'actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.test-master',       'label' => 'Test Master',                          'actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.sample-collection', 'label' => 'Sample Collection & Processing',       'actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.results',           'label' => 'Result Entry & Verification',          'actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.quality-control',   'label' => 'Quality Control & Calibration',        'actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.inventory',         'label' => 'Lab Inventory & Reagent Management',   'actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.billing',           'label' => 'Lab Billing & Financial Reconciliation','actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.reports',           'label' => 'Reports & Document Management',        'actions' => []],
            ['parent_module' => 'laboratory', 'module' => 'laboratory.analytics',         'label' => 'Analytics & Statistics',               'actions' => []],
        ];

        $order = 0;
        $allPermissionIds   = [];
        $adminPermissionIds = [];
        $userPermissionIds  = [];

        foreach ($modules as $mod) {
            $order++;
            $perm = Permission::create([
                'name'           => $mod['label'] . ' Access',
                'slug'           => $mod['module'] . '.access',
                'description'    => 'Access to ' . $mod['label'],
                'module'         => $mod['module'],
                'parent_module'  => $mod['parent_module'],
                'level'          => $mod['parent_module'] ? 'tab' : 'page',
                'action_type'    => null,
                'is_dangerous'   => false,
                'display_order'  => $order,
            ]);

            $allPermissionIds[] = $perm->id;

            // Admin gets everything except role-management
            if ($mod['module'] !== 'role-management') {
                $adminPermissionIds[] = $perm->id;
            }

            // Basic user gets dashboard only
            if ($mod['module'] === 'dashboard') {
                $userPermissionIds[] = $perm->id;
            }
        }

        $superadminRole = Role::create([
            'name' => 'Superadmin',
            'slug' => 'superadmin',
            'description' => 'Full system access with all permissions',
            'type' => 'system',
            'is_active' => true,
        ]);
        $superadminRole->permissions()->attach($allPermissionIds);

        $adminRole = Role::create([
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'Administrative access to most modules except role management',
            'type' => 'system',
            'is_active' => true,
        ]);
        $adminRole->permissions()->attach($adminPermissionIds);

        $userRole = Role::create([
            'name' => 'User',
            'slug' => 'user',
            'description' => 'Basic access to dashboard only',
            'type' => 'system',
            'is_active' => true,
        ]);
        $userRole->permissions()->attach($userPermissionIds);

        $superadminUser = User::where('role', 'superadmin')->first();
        if ($superadminUser) {
            $superadminUser->roles()->syncWithoutDetaching([$superadminRole->id]);
        }
    }
}
