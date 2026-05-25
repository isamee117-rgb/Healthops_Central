<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <a href="<?php echo e(url('/')); ?>" class="sidebar-brand">
            
            <img src="<?php echo e(asset('images/nova-hms-logo.png')); ?>" alt="Nova HMS" class="sidebar-logo-full" style="height:46px;width:auto;object-fit:contain;max-width:190px">
            
            <img src="<?php echo e(asset('images/nova-hms-icon.png')); ?>" alt="+" class="sidebar-logo-icon" style="width:38px;height:38px;object-fit:contain">
        </a>
    </div>

    <div class="sidebar-content">
        <div class="sidebar-toggle-row">
            <button class="sidebar-toggle" id="sidebarToggle" title="Toggle sidebar">
                <i data-lucide="panel-left"></i>
            </button>
        </div>
        <ul class="sidebar-nav">
            <?php if(auth()->user()->hasPermission('dashboard.access')): ?>
            <li>
                <a href="<?php echo e(url('/')); ?>" class="<?php echo e(request()->is('/') ? 'active' : ''); ?>">
                    <i data-lucide="layout-dashboard"></i>
                    <span class="nav-label">Dashboard</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasModuleAccess('opd')): ?>
            <li>
                <a href="<?php echo e(url('/opd')); ?>" class="<?php echo e(request()->is('opd') ? 'active' : ''); ?>">
                    <i data-lucide="stethoscope"></i>
                    <span class="nav-label">Outpatient (OPD)</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasModuleAccess('ipd')): ?>
            <li>
                <a href="<?php echo e(url('/ipd')); ?>" class="<?php echo e(request()->is('ipd') ? 'active' : ''); ?>">
                    <i data-lucide="building-2"></i>
                    <span class="nav-label">Inpatient (IPD)</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasModuleAccess('emergency')): ?>
            <li>
                <a href="<?php echo e(url('/emergency')); ?>" class="<?php echo e(request()->is('emergency') ? 'active' : ''); ?>">
                    <i data-lucide="siren"></i>
                    <span class="nav-label">Emergency (ER)</span>
                </a>
            </li>
            <?php endif; ?>


            <?php if(auth()->user()->canManageUsers()): ?>
            <li>
                <a href="<?php echo e(url('/bed-management')); ?>" class="<?php echo e(request()->is('bed-management') ? 'active' : ''); ?>">
                    <i data-lucide="bed"></i>
                    <span class="nav-label">Bed Management</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasPermission('patients.access')): ?>
            <li>
                <a href="<?php echo e(url('/patients')); ?>" class="<?php echo e(request()->is('patients') ? 'active' : ''); ?>">
                    <i data-lucide="users"></i>
                    <span class="nav-label">Patients</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasModuleAccess('laboratory')): ?>
            <li class="sidebar-has-submenu <?php echo e(request()->is('laboratory*') ? 'open' : ''); ?>">
                <a href="javascript:void(0)" class="sidebar-submenu-toggle <?php echo e(request()->is('laboratory*') ? 'active' : ''); ?>">
                    <i data-lucide="microscope"></i>
                    <span class="nav-label">Laboratory</span>
                    <i data-lucide="chevron-down" class="submenu-arrow"></i>
                </a>
                <ul class="sidebar-submenu">
                    <?php if(auth()->user()->hasPermission('laboratory.test-orders.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/laboratory/test-orders')); ?>" class="<?php echo e(request()->is('laboratory/test-orders') ? 'active' : ''); ?>">
                            <span class="nav-label">Test Orders Queue</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('laboratory.walk-in.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/laboratory/walk-in')); ?>" class="<?php echo e(request()->is('laboratory/walk-in') ? 'active' : ''); ?>">
                            <span class="nav-label">Walk-in Registration</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('laboratory.test-master.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/laboratory/test-master')); ?>" class="<?php echo e(request()->is('laboratory/test-master') ? 'active' : ''); ?>">
                            <span class="nav-label">Test Master</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('laboratory.sample-collection.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/laboratory/sample-collection')); ?>" class="<?php echo e(request()->is('laboratory/sample-collection') ? 'active' : ''); ?>">
                            <span class="nav-label">Sample Collection & Processing</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('laboratory.results.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/laboratory/results')); ?>" class="<?php echo e(request()->is('laboratory/results') ? 'active' : ''); ?>">
                            <span class="nav-label">Result Entry & Verification</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('laboratory.billing.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/laboratory/billing')); ?>" class="<?php echo e(request()->is('laboratory/billing') ? 'active' : ''); ?>">
                            <span class="nav-label">Billing & Financial Reconciliation</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('laboratory.reports.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/laboratory/reports')); ?>" class="<?php echo e(request()->is('laboratory/reports') ? 'active' : ''); ?>">
                            <span class="nav-label">Reports & Document Management</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('laboratory.analytics.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/laboratory/analytics')); ?>" class="<?php echo e(request()->is('laboratory/analytics') ? 'active' : ''); ?>">
                            <span class="nav-label">Analytics & Statistics</span>
                        </a>
                    </li>
                    <?php endif; ?>
                </ul>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasModuleAccess('pharmacy')): ?>
            <li class="sidebar-has-submenu <?php echo e(request()->is('pharmacy*') ? 'open' : ''); ?>">
                <a href="javascript:void(0)" class="sidebar-submenu-toggle <?php echo e(request()->is('pharmacy*') ? 'active' : ''); ?>">
                    <i data-lucide="pill"></i>
                    <span class="nav-label">Pharmacy</span>
                    <i data-lucide="chevron-down" class="submenu-arrow"></i>
                </a>
                <ul class="sidebar-submenu">
                    <?php if(auth()->user()->hasPermission('pharmacy.medication-orders.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/pharmacy/medication-orders')); ?>" class="<?php echo e(request()->is('pharmacy/medication-orders') ? 'active' : ''); ?>">
                            <span class="nav-label">Medication Orders</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('pharmacy.dispensing.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/pharmacy/dispensing')); ?>" class="<?php echo e(request()->is('pharmacy/dispensing') ? 'active' : ''); ?>">
                            <span class="nav-label">Dispensing & Fulfillment</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('pharmacy.pos.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/pharmacy/pos')); ?>" class="<?php echo e(request()->is('pharmacy/pos') ? 'active' : ''); ?>">
                            <span class="nav-label">POS Terminal</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('pharmacy.inventory.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/pharmacy/inventory')); ?>" class="<?php echo e(request()->is('pharmacy/inventory') ? 'active' : ''); ?>">
                            <span class="nav-label">Inventory Management</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('pharmacy.stock-alerts.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/pharmacy/stock-alerts')); ?>" class="<?php echo e(request()->is('pharmacy/stock-alerts') ? 'active' : ''); ?>">
                            <span class="nav-label">Stock Alerts & Procurement</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('pharmacy.billing.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/pharmacy/billing')); ?>" class="<?php echo e(request()->is('pharmacy/billing') ? 'active' : ''); ?>">
                            <span class="nav-label">Billing & Financial Reconciliation</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if(auth()->user()->hasPermission('pharmacy.returns.access')): ?>
                    <li>
                        <a href="<?php echo e(url('/pharmacy/returns')); ?>" class="<?php echo e(request()->is('pharmacy/returns') ? 'active' : ''); ?>">
                            <span class="nav-label">Returns & Expiry Management</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <li>
                        <a href="<?php echo e(url('/pharmacy/vendors')); ?>" class="<?php echo e(request()->is('pharmacy/vendors') ? 'active' : ''); ?>">
                            <span class="nav-label">Vendors</span>
                        </a>
                    </li>
                </ul>
            </li>
            <?php endif; ?>
        </ul>

        <div class="sidebar-section-title">Management</div>
        <ul class="sidebar-nav">
            <?php if(auth()->user()->hasPermission('doctors.access')): ?>
            <li>
                <a href="<?php echo e(url('/doctors')); ?>" class="<?php echo e(request()->is('doctors') ? 'active' : ''); ?>">
                    <i data-lucide="user-cog"></i>
                    <span class="nav-label">Doctor Management</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasPermission('staff.access')): ?>
            <li>
                <a href="<?php echo e(url('/staff')); ?>" class="<?php echo e(request()->is('staff') ? 'active' : ''); ?>">
                    <i data-lucide="users"></i>
                    <span class="nav-label">Staff</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasPermission('doctor-fees.access')): ?>
            <li>
                <a href="<?php echo e(url('/doctor-fees')); ?>" class="<?php echo e(request()->is('doctor-fees') ? 'active' : ''); ?>">
                    <i data-lucide="receipt"></i>
                    <span class="nav-label">Doctor Fees</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasPermission('charges.access')): ?>
            <li>
                <a href="<?php echo e(url('/charges')); ?>" class="<?php echo e(request()->is('charges') ? 'active' : ''); ?>">
                    <i data-lucide="badge-dollar-sign"></i>
                    <span class="nav-label">Charges</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasPermission('income-expense.access')): ?>
            <li>
                <a href="<?php echo e(url('/income-expense')); ?>" class="<?php echo e(request()->is('income-expense') ? 'active' : ''); ?>">
                    <i data-lucide="wallet"></i>
                    <span class="nav-label">Income & Expense</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->canManageUsers()): ?>
            <li>
                <a href="#">
                    <i data-lucide="calendar"></i>
                    <span class="nav-label">Appointments</span>
                </a>
            </li>
            <li>
                <a href="<?php echo e(url('/hospital-info')); ?>" class="<?php echo e(request()->is('hospital-info') ? 'active' : ''); ?>">
                    <i data-lucide="building"></i>
                    <span class="nav-label">Hospital Information</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasPermission('user-management.access')): ?>
            <li>
                <a href="<?php echo e(url('/users')); ?>" class="<?php echo e(request()->is('users') ? 'active' : ''); ?>">
                    <i data-lucide="shield-check"></i>
                    <span class="nav-label">User Management</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if(auth()->user()->hasPermission('role-management.access')): ?>
            <li>
                <a href="<?php echo e(url('/roles')); ?>" class="<?php echo e(request()->is('roles') ? 'active' : ''); ?>">
                    <i data-lucide="shield"></i>
                    <span class="nav-label">Role Management</span>
                </a>
            </li>
            <?php endif; ?>
        </ul>

        <?php if(auth()->user()->canManageUsers()): ?>
        <div class="sidebar-section-title">Configuration Setup</div>
        <ul class="sidebar-nav">
            <li class="sidebar-has-submenu <?php echo e(request()->is('configuration*') ? 'open' : ''); ?>">
                <a href="javascript:void(0)" class="sidebar-submenu-toggle <?php echo e(request()->is('configuration*') ? 'active' : ''); ?>">
                    <i data-lucide="settings-2"></i>
                    <span class="nav-label">Configuration</span>
                    <i data-lucide="chevron-down" class="submenu-arrow"></i>
                </a>
                <ul class="sidebar-submenu">
                    <li>
                        <a href="<?php echo e(url('/configuration/opd')); ?>" class="<?php echo e(request()->is('configuration/opd') ? 'active' : ''); ?>">
                            <span class="nav-label">OPD</span>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo e(url('/configuration/ipd')); ?>" class="<?php echo e(request()->is('configuration/ipd') ? 'active' : ''); ?>">
                            <span class="nav-label">IPD</span>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo e(url('/configuration/er')); ?>" class="<?php echo e(request()->is('configuration/er') ? 'active' : ''); ?>">
                            <span class="nav-label">ER</span>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo e(url('/configuration/ot')); ?>" class="<?php echo e(request()->is('configuration/ot') ? 'active' : ''); ?>">
                            <span class="nav-label">OT</span>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo e(url('/configuration/human-resources')); ?>" class="<?php echo e(request()->is('configuration/human-resources') ? 'active' : ''); ?>">
                            <span class="nav-label">Human Resources</span>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo e(url('/configuration/financials')); ?>" class="<?php echo e(request()->is('configuration/financials') ? 'active' : ''); ?>">
                            <span class="nav-label">Financials</span>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo e(url('/configuration/pharmacy')); ?>" class="<?php echo e(request()->is('configuration/pharmacy') ? 'active' : ''); ?>">
                            <span class="nav-label">Pharmacy</span>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo e(url('/configuration/laboratory')); ?>" class="<?php echo e(request()->is('configuration/laboratory') ? 'active' : ''); ?>">
                            <span class="nav-label">Laboratory</span>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="<?php echo e(request()->is('form-builder') ? 'active' : ''); ?>">
                <a href="<?php echo e(url('/form-builder')); ?>" class="<?php echo e(request()->is('form-builder') ? 'active' : ''); ?>">
                    <i data-lucide="layout-template"></i>
                    <span class="nav-label">Form Builder</span>
                </a>
            </li>
        </ul>
        <?php endif; ?>
    </div>

    <div class="sidebar-footer">
        <div class="dropdown">
            <div class="sidebar-user" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="sidebar-user-avatar"><?php echo e(auth()->check() ? strtoupper(substr(auth()->user()->name, 0, 2)) : 'NA'); ?></div>
                <div class="user-info">
                    <div class="user-name"><?php echo e(auth()->check() ? auth()->user()->name : 'Guest'); ?></div>
                    <div class="user-role"><?php echo e(auth()->check() ? ucfirst(auth()->user()->role) : ''); ?></div>
                </div>
                <span class="settings-icon"><i data-lucide="settings"></i></span>
            </div>
            <ul class="dropdown-menu sidebar-dropdown-menu">
                <li>
                    <a class="dropdown-item" href="#">
                        <i data-lucide="settings"></i> Account Settings
                    </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <form method="POST" action="<?php echo e(url('/logout')); ?>">
                        <?php echo csrf_field(); ?>
                        <button type="submit" class="dropdown-item text-danger" style="border:none;background:none;width:100%;text-align:left;cursor:pointer">
                            <i data-lucide="log-out"></i> Log out
                        </button>
                    </form>
                </li>
            </ul>
        </div>
    </div>
</aside>
<?php /**PATH C:\xampp\htdocs\healthops\resources\views/partials/sidebar.blade.php ENDPATH**/ ?>