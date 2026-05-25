<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <a href="{{ url('/') }}" class="sidebar-brand">
            {{-- Full logo — visible when expanded --}}
            <img src="{{ asset('images/nova-hms-logo.png') }}" alt="Nova HMS" class="sidebar-logo-full" style="height:46px;width:auto;object-fit:contain;max-width:190px">
            {{-- Plus icon only — visible when collapsed --}}
            <img src="{{ asset('images/nova-hms-icon.png') }}" alt="+" class="sidebar-logo-icon" style="width:38px;height:38px;object-fit:contain">
        </a>
    </div>

    <div class="sidebar-content">
        <div class="sidebar-toggle-row">
            <button class="sidebar-toggle" id="sidebarToggle" title="Toggle sidebar">
                <i data-lucide="panel-left"></i>
            </button>
        </div>
        <ul class="sidebar-nav">
            @if(auth()->user()->hasPermission('dashboard.access'))
            <li>
                <a href="{{ url('/') }}" class="{{ request()->is('/') ? 'active' : '' }}">
                    <i data-lucide="layout-dashboard"></i>
                    <span class="nav-label">Dashboard</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasModuleAccess('opd'))
            <li>
                <a href="{{ url('/opd') }}" class="{{ request()->is('opd') ? 'active' : '' }}">
                    <i data-lucide="stethoscope"></i>
                    <span class="nav-label">Outpatient (OPD)</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasModuleAccess('ipd'))
            <li>
                <a href="{{ url('/ipd') }}" class="{{ request()->is('ipd') ? 'active' : '' }}">
                    <i data-lucide="building-2"></i>
                    <span class="nav-label">Inpatient (IPD)</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasModuleAccess('emergency'))
            <li>
                <a href="{{ url('/emergency') }}" class="{{ request()->is('emergency') ? 'active' : '' }}">
                    <i data-lucide="siren"></i>
                    <span class="nav-label">Emergency (ER)</span>
                </a>
            </li>
            @endif


            @if(auth()->user()->canManageUsers())
            <li>
                <a href="{{ url('/bed-management') }}" class="{{ request()->is('bed-management') ? 'active' : '' }}">
                    <i data-lucide="bed"></i>
                    <span class="nav-label">Bed Management</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasPermission('patients.access'))
            <li>
                <a href="{{ url('/patients') }}" class="{{ request()->is('patients') ? 'active' : '' }}">
                    <i data-lucide="users"></i>
                    <span class="nav-label">Patients</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasModuleAccess('laboratory'))
            <li class="sidebar-has-submenu {{ request()->is('laboratory*') ? 'open' : '' }}">
                <a href="javascript:void(0)" class="sidebar-submenu-toggle {{ request()->is('laboratory*') ? 'active' : '' }}">
                    <i data-lucide="microscope"></i>
                    <span class="nav-label">Laboratory</span>
                    <i data-lucide="chevron-down" class="submenu-arrow"></i>
                </a>
                <ul class="sidebar-submenu">
                    @if(auth()->user()->hasPermission('laboratory.test-orders.access'))
                    <li>
                        <a href="{{ url('/laboratory/test-orders') }}" class="{{ request()->is('laboratory/test-orders') ? 'active' : '' }}">
                            <span class="nav-label">Test Orders Queue</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('laboratory.walk-in.access'))
                    <li>
                        <a href="{{ url('/laboratory/walk-in') }}" class="{{ request()->is('laboratory/walk-in') ? 'active' : '' }}">
                            <span class="nav-label">Walk-in Registration</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('laboratory.test-master.access'))
                    <li>
                        <a href="{{ url('/laboratory/test-master') }}" class="{{ request()->is('laboratory/test-master') ? 'active' : '' }}">
                            <span class="nav-label">Test Master</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('laboratory.sample-collection.access'))
                    <li>
                        <a href="{{ url('/laboratory/sample-collection') }}" class="{{ request()->is('laboratory/sample-collection') ? 'active' : '' }}">
                            <span class="nav-label">Sample Collection & Processing</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('laboratory.results.access'))
                    <li>
                        <a href="{{ url('/laboratory/results') }}" class="{{ request()->is('laboratory/results') ? 'active' : '' }}">
                            <span class="nav-label">Result Entry & Verification</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('laboratory.billing.access'))
                    <li>
                        <a href="{{ url('/laboratory/billing') }}" class="{{ request()->is('laboratory/billing') ? 'active' : '' }}">
                            <span class="nav-label">Billing & Financial Reconciliation</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('laboratory.reports.access'))
                    <li>
                        <a href="{{ url('/laboratory/reports') }}" class="{{ request()->is('laboratory/reports') ? 'active' : '' }}">
                            <span class="nav-label">Reports & Document Management</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('laboratory.analytics.access'))
                    <li>
                        <a href="{{ url('/laboratory/analytics') }}" class="{{ request()->is('laboratory/analytics') ? 'active' : '' }}">
                            <span class="nav-label">Analytics & Statistics</span>
                        </a>
                    </li>
                    @endif
                </ul>
            </li>
            @endif

            @if(auth()->user()->hasModuleAccess('pharmacy'))
            <li class="sidebar-has-submenu {{ request()->is('pharmacy*') ? 'open' : '' }}">
                <a href="javascript:void(0)" class="sidebar-submenu-toggle {{ request()->is('pharmacy*') ? 'active' : '' }}">
                    <i data-lucide="pill"></i>
                    <span class="nav-label">Pharmacy</span>
                    <i data-lucide="chevron-down" class="submenu-arrow"></i>
                </a>
                <ul class="sidebar-submenu">
                    @if(auth()->user()->hasPermission('pharmacy.medication-orders.access'))
                    <li>
                        <a href="{{ url('/pharmacy/medication-orders') }}" class="{{ request()->is('pharmacy/medication-orders') ? 'active' : '' }}">
                            <span class="nav-label">Medication Orders</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('pharmacy.dispensing.access'))
                    <li>
                        <a href="{{ url('/pharmacy/dispensing') }}" class="{{ request()->is('pharmacy/dispensing') ? 'active' : '' }}">
                            <span class="nav-label">Dispensing & Fulfillment</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('pharmacy.pos.access'))
                    <li>
                        <a href="{{ url('/pharmacy/pos') }}" class="{{ request()->is('pharmacy/pos') ? 'active' : '' }}">
                            <span class="nav-label">POS Terminal</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('pharmacy.inventory.access'))
                    <li>
                        <a href="{{ url('/pharmacy/inventory') }}" class="{{ request()->is('pharmacy/inventory') ? 'active' : '' }}">
                            <span class="nav-label">Inventory Management</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('pharmacy.stock-alerts.access'))
                    <li>
                        <a href="{{ url('/pharmacy/stock-alerts') }}" class="{{ request()->is('pharmacy/stock-alerts') ? 'active' : '' }}">
                            <span class="nav-label">Stock Alerts & Procurement</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('pharmacy.billing.access'))
                    <li>
                        <a href="{{ url('/pharmacy/billing') }}" class="{{ request()->is('pharmacy/billing') ? 'active' : '' }}">
                            <span class="nav-label">Billing & Financial Reconciliation</span>
                        </a>
                    </li>
                    @endif
                    @if(auth()->user()->hasPermission('pharmacy.returns.access'))
                    <li>
                        <a href="{{ url('/pharmacy/returns') }}" class="{{ request()->is('pharmacy/returns') ? 'active' : '' }}">
                            <span class="nav-label">Returns & Expiry Management</span>
                        </a>
                    </li>
                    @endif
                    <li>
                        <a href="{{ url('/pharmacy/vendors') }}" class="{{ request()->is('pharmacy/vendors') ? 'active' : '' }}">
                            <span class="nav-label">Vendors</span>
                        </a>
                    </li>
                </ul>
            </li>
            @endif
        </ul>

        <div class="sidebar-section-title">Management</div>
        <ul class="sidebar-nav">
            @if(auth()->user()->hasPermission('doctors.access'))
            <li>
                <a href="{{ url('/doctors') }}" class="{{ request()->is('doctors') ? 'active' : '' }}">
                    <i data-lucide="user-cog"></i>
                    <span class="nav-label">Doctor Management</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasPermission('staff.access'))
            <li>
                <a href="{{ url('/staff') }}" class="{{ request()->is('staff') ? 'active' : '' }}">
                    <i data-lucide="users"></i>
                    <span class="nav-label">Staff</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasPermission('doctor-fees.access'))
            <li>
                <a href="{{ url('/doctor-fees') }}" class="{{ request()->is('doctor-fees') ? 'active' : '' }}">
                    <i data-lucide="receipt"></i>
                    <span class="nav-label">Doctor Fees</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasPermission('charges.access'))
            <li>
                <a href="{{ url('/charges') }}" class="{{ request()->is('charges') ? 'active' : '' }}">
                    <i data-lucide="badge-dollar-sign"></i>
                    <span class="nav-label">Charges</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasPermission('income-expense.access'))
            <li>
                <a href="{{ url('/income-expense') }}" class="{{ request()->is('income-expense') ? 'active' : '' }}">
                    <i data-lucide="wallet"></i>
                    <span class="nav-label">Income & Expense</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->canManageUsers())
            <li>
                <a href="#">
                    <i data-lucide="calendar"></i>
                    <span class="nav-label">Appointments</span>
                </a>
            </li>
            <li>
                <a href="{{ url('/hospital-info') }}" class="{{ request()->is('hospital-info') ? 'active' : '' }}">
                    <i data-lucide="building"></i>
                    <span class="nav-label">Hospital Information</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasPermission('user-management.access'))
            <li>
                <a href="{{ url('/users') }}" class="{{ request()->is('users') ? 'active' : '' }}">
                    <i data-lucide="shield-check"></i>
                    <span class="nav-label">User Management</span>
                </a>
            </li>
            @endif

            @if(auth()->user()->hasPermission('role-management.access'))
            <li>
                <a href="{{ url('/roles') }}" class="{{ request()->is('roles') ? 'active' : '' }}">
                    <i data-lucide="shield"></i>
                    <span class="nav-label">Role Management</span>
                </a>
            </li>
            @endif
        </ul>

        @if(auth()->user()->canManageUsers())
        <div class="sidebar-section-title">Configuration Setup</div>
        <ul class="sidebar-nav">
            <li class="sidebar-has-submenu {{ request()->is('configuration*') ? 'open' : '' }}">
                <a href="javascript:void(0)" class="sidebar-submenu-toggle {{ request()->is('configuration*') ? 'active' : '' }}">
                    <i data-lucide="settings-2"></i>
                    <span class="nav-label">Configuration</span>
                    <i data-lucide="chevron-down" class="submenu-arrow"></i>
                </a>
                <ul class="sidebar-submenu">
                    <li>
                        <a href="{{ url('/configuration/opd') }}" class="{{ request()->is('configuration/opd') ? 'active' : '' }}">
                            <span class="nav-label">OPD</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ url('/configuration/ipd') }}" class="{{ request()->is('configuration/ipd') ? 'active' : '' }}">
                            <span class="nav-label">IPD</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ url('/configuration/er') }}" class="{{ request()->is('configuration/er') ? 'active' : '' }}">
                            <span class="nav-label">ER</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ url('/configuration/ot') }}" class="{{ request()->is('configuration/ot') ? 'active' : '' }}">
                            <span class="nav-label">OT</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ url('/configuration/human-resources') }}" class="{{ request()->is('configuration/human-resources') ? 'active' : '' }}">
                            <span class="nav-label">Human Resources</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ url('/configuration/financials') }}" class="{{ request()->is('configuration/financials') ? 'active' : '' }}">
                            <span class="nav-label">Financials</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ url('/configuration/pharmacy') }}" class="{{ request()->is('configuration/pharmacy') ? 'active' : '' }}">
                            <span class="nav-label">Pharmacy</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ url('/configuration/laboratory') }}" class="{{ request()->is('configuration/laboratory') ? 'active' : '' }}">
                            <span class="nav-label">Laboratory</span>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="{{ request()->is('form-builder') ? 'active' : '' }}">
                <a href="{{ url('/form-builder') }}" class="{{ request()->is('form-builder') ? 'active' : '' }}">
                    <i data-lucide="layout-template"></i>
                    <span class="nav-label">Form Builder</span>
                </a>
            </li>
        </ul>
        @endif
    </div>

    <div class="sidebar-footer">
        <div class="dropdown">
            <div class="sidebar-user" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="sidebar-user-avatar">{{ auth()->check() ? strtoupper(substr(auth()->user()->name, 0, 2)) : 'NA' }}</div>
                <div class="user-info">
                    <div class="user-name">{{ auth()->check() ? auth()->user()->name : 'Guest' }}</div>
                    <div class="user-role">{{ auth()->check() ? ucfirst(auth()->user()->role) : '' }}</div>
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
                    <form method="POST" action="{{ url('/logout') }}">
                        @csrf
                        <button type="submit" class="dropdown-item text-danger" style="border:none;background:none;width:100%;text-align:left;cursor:pointer">
                            <i data-lucide="log-out"></i> Log out
                        </button>
                    </form>
                </li>
            </ul>
        </div>
    </div>
</aside>
