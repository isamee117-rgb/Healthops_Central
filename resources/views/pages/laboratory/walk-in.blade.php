@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="flask-conical" style="width:24px;height:24px;color:var(--aqua-mint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Walk-in Laboratory Services</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">Register and bill walk-in customers for lab tests</p>
        </div>
    </div>
    <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;background:rgba(127,255,212,0.12);color:var(--aqua-mint);font-size:13px;font-weight:600">
        <i data-lucide="clock" style="width:14px;height:14px"></i> Lab Open 24/7
    </span>
</div>

<div style="display:flex;gap:20px;align-items:flex-start" id="walkInLayout">
    <!-- LEFT SIDE: Patient & Test Selection (60%) -->
    <div style="flex:0 0 60%;min-width:0">
        <!-- Section 1: Patient Registration/Search -->
        <div class="card" style="border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;overflow:hidden">
            <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03)">
                <h5 style="margin:0;font-size:15px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">
                    <i data-lucide="user" style="width:16px;height:16px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Patient Information
                </h5>
            </div>
            <div style="padding:20px">
                <div style="display:flex;gap:12px;margin-bottom:16px">
                    <label style="display:flex;align-items:center;gap:8px;padding:10px 16px;border:2px solid var(--aqua-mint);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;background:rgba(127,255,212,0.08);flex:1" id="radioExisting">
                        <input type="radio" name="patientType" value="existing" checked style="accent-color:var(--aqua-mint)">
                        <i data-lucide="search" style="width:14px;height:14px;color:var(--aqua-mint)"></i>
                        Existing Patient
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;padding:10px 16px;border:2px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;flex:1" id="radioNewWalkin">
                        <input type="radio" name="patientType" value="new" style="accent-color:var(--aqua-mint)">
                        <i data-lucide="user-plus" style="width:14px;height:14px;color:var(--color-muted-foreground)"></i>
                        New Walk-in Patient
                    </label>
                </div>

                <!-- Existing Patient Search -->
                <div id="existingPatientPanel">
                    <!-- Step 1: Module Selection -->
                    <div id="moduleSelectionArea" style="margin-bottom:14px">
                        <label style="font-size:12px;font-weight:700;color:var(--midnight-blue);margin-bottom:8px;display:block">
                            <i data-lucide="building-2" style="width:13px;height:13px;display:inline;vertical-align:-2px;margin-right:4px"></i> Select Module
                        </label>
                        <div style="display:flex;gap:8px">
                            <button type="button" class="module-btn" data-module="OPD" style="flex:1;padding:10px 14px;border:2px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;background:var(--color-card);display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s">
                                <i data-lucide="stethoscope" style="width:15px;height:15px"></i> OPD
                            </button>
                            <button type="button" class="module-btn" data-module="ER" style="flex:1;padding:10px 14px;border:2px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;background:var(--color-card);display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s">
                                <i data-lucide="siren" style="width:15px;height:15px"></i> Emergency
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: Patient Search (shown after module selected) -->
                    <div id="patientSearchArea" style="display:none">
                        <div style="position:relative;margin-bottom:12px">
                            <i data-lucide="search" style="width:16px;height:16px;position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--color-muted-foreground)"></i>
                            <input type="text" id="patientSearch" placeholder="Search by MR Number / CNIC / Phone / Name..." style="width:100%;padding:10px 12px 10px 36px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card)">
                        </div>
                        <div id="patientSearchResults" style="display:none;border:1px solid var(--color-border);border-radius:8px;max-height:200px;overflow-y:auto;margin-bottom:12px"></div>
                    </div>

                    <!-- Step 3: Selected Patient Card -->
                    <div id="selectedPatientCard" style="display:none"></div>

                    <!-- Step 4: Visit Selection (shown after patient selected) -->
                    <div id="visitSelectionArea" style="display:none"></div>

                    <!-- Step 5: Investigation Orders (shown after visit selected) -->
                    <div id="investigationResults" style="display:none"></div>
                </div>

                <!-- New Walk-in Patient Form -->
                <div id="newPatientPanel" style="display:none">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                        <div style="grid-column:1/-1">
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Full Name <span style="color:#ef4444">*</span></label>
                            <input type="text" id="newPatientName" placeholder="Enter full name" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card)">
                        </div>
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Age <span style="color:#ef4444">*</span></label>
                            <div style="display:flex;gap:8px;align-items:center">
                                <input type="number" id="newPatientAge" placeholder="Age" min="0" max="120" style="width:80px;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card)">
                                <span style="font-size:13px;color:var(--color-muted-foreground)">Years</span>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Gender <span style="color:#ef4444">*</span></label>
                            <div style="display:flex;gap:8px">
                                <label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="radio" name="newGender" value="M" checked style="accent-color:var(--aqua-mint)"> Male</label>
                                <label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="radio" name="newGender" value="F" style="accent-color:var(--aqua-mint)"> Female</label>
                                <label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="radio" name="newGender" value="O" style="accent-color:var(--aqua-mint)"> Other</label>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Contact <span style="color:#ef4444">*</span></label>
                            <input type="tel" id="newPatientPhone" placeholder="03XX-XXXXXXX" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card)">
                        </div>
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">CNIC (optional)</label>
                            <input type="text" id="newPatientCnic" placeholder="XXXXX-XXXXXXX-X" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card)">
                        </div>
                        <div style="grid-column:1/-1">
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Email (for reports)</label>
                            <input type="email" id="newPatientEmail" placeholder="email@example.com" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card)">
                        </div>
                        <div style="grid-column:1/-1;display:flex;gap:16px;align-items:center">
                            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
                                <input type="radio" name="saveOption" value="generate" checked style="accent-color:var(--aqua-mint)">
                                Generate MR Number (saved in system)
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
                                <input type="radio" name="saveOption" value="onetime" style="accent-color:var(--aqua-mint)">
                                One-time (not saved)
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 2: Test Selection -->
        <div class="card" style="border:1px solid var(--color-border);border-radius:12px;overflow:hidden">
            <div style="padding:16px 20px;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03)">
                <h5 style="margin:0;font-size:15px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">
                    <i data-lucide="test-tubes" style="width:16px;height:16px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Test Selection
                </h5>
            </div>
            <div style="padding:20px">
                <!-- Search -->
                <div style="position:relative;margin-bottom:16px">
                    <i data-lucide="search" style="width:18px;height:18px;position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--color-muted-foreground)"></i>
                    <input type="text" id="testSearch" placeholder="Search tests by name, code, or category..." style="width:100%;padding:12px 14px 12px 42px;border:2px solid var(--color-border);border-radius:10px;font-size:15px;background:var(--color-card)">
                </div>

                <!-- Category Quick Buttons -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px" id="categoryButtons">
                    <button class="cat-btn active" data-cat="all" style="padding:8px 14px;border-radius:20px;border:1px solid var(--aqua-mint);background:rgba(127,255,212,0.15);color:var(--aqua-mint);font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px">
                        <i data-lucide="layout-grid" style="width:13px;height:13px"></i> All Tests
                    </button>
                    <button class="cat-btn" data-cat="Complete Checkup" style="padding:8px 14px;border-radius:20px;border:1px solid var(--color-border);background:transparent;font-size:12px;font-weight:600;cursor:pointer">Complete Checkup</button>
                    <button class="cat-btn" data-cat="Diabetes Panel" style="padding:8px 14px;border-radius:20px;border:1px solid var(--color-border);background:transparent;font-size:12px;font-weight:600;cursor:pointer">Diabetes Panel</button>
                    <button class="cat-btn" data-cat="Cardiac Panel" style="padding:8px 14px;border-radius:20px;border:1px solid var(--color-border);background:transparent;font-size:12px;font-weight:600;cursor:pointer">Cardiac Panel</button>
                    <button class="cat-btn" data-cat="Infection Screen" style="padding:8px 14px;border-radius:20px;border:1px solid var(--color-border);background:transparent;font-size:12px;font-weight:600;cursor:pointer">Infection Screen</button>
                    <button class="cat-btn" data-cat="Hormones" style="padding:8px 14px;border-radius:20px;border:1px solid var(--color-border);background:transparent;font-size:12px;font-weight:600;cursor:pointer">Hormones</button>
                    <button class="cat-btn" data-cat="Routine Tests" style="padding:8px 14px;border-radius:20px;border:1px solid var(--color-border);background:transparent;font-size:12px;font-weight:600;cursor:pointer">Routine Tests</button>
                    <button class="cat-btn" data-cat="Specialized Tests" style="padding:8px 14px;border-radius:20px;border:1px solid var(--color-border);background:transparent;font-size:12px;font-weight:600;cursor:pointer">Specialized Tests</button>
                </div>

                <!-- View Toggle: Packages / Individual -->
                <div style="display:flex;gap:0;margin-bottom:16px;border:1px solid var(--color-border);border-radius:8px;overflow:hidden;width:fit-content">
                    <button id="viewPackages" class="view-toggle active" style="padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:var(--midnight-blue);color:#fff">Packages</button>
                    <button id="viewIndividual" class="view-toggle" style="padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--color-foreground)">Individual Tests</button>
                </div>

                <!-- Packages View -->
                <div id="packagesView">
                    <div id="packagesGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px"></div>
                </div>

                <!-- Individual Tests View -->
                <div id="individualView" style="display:none">
                    <div id="testsGrid" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- RIGHT SIDE: Bill & Payment (40%, sticky) -->
    <div style="flex:0 0 38%;position:sticky;top:20px;max-height:calc(100vh - 100px);overflow-y:auto" id="rightPanel">
        <!-- Cart -->
        <div class="card" style="border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;overflow:hidden">
            <div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03);display:flex;justify-content:space-between;align-items:center">
                <h5 style="margin:0;font-size:15px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">
                    <i data-lucide="shopping-cart" style="width:16px;height:16px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Selected Tests (<span id="cartCount">0</span>)
                </h5>
                <button id="clearCart" style="padding:4px 10px;border:none;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:none">
                    <i data-lucide="trash-2" style="width:12px;height:12px;display:inline;vertical-align:-1px"></i> Clear
                </button>
            </div>
            <div id="cartItems" style="padding:16px 20px;min-height:80px">
                <div id="emptyCartMsg" style="text-align:center;padding:20px 0;color:var(--color-muted-foreground);font-size:13px">
                    <i data-lucide="flask-conical" style="width:32px;height:32px;margin-bottom:8px;opacity:0.3"></i>
                    <p style="margin:0">No tests selected. Add tests from the left panel.</p>
                </div>
                <table id="cartTable" style="width:100%;border-collapse:collapse;display:none">
                    <thead>
                        <tr style="border-bottom:1px solid var(--color-border)">
                            <th style="text-align:left;padding:6px 0;font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Test</th>
                            <th style="text-align:right;padding:6px 0;font-size:12px;font-weight:600;color:var(--color-muted-foreground)">Price</th>
                            <th style="text-align:center;padding:6px 0;font-size:12px;font-weight:600;color:var(--color-muted-foreground);width:40px"></th>
                        </tr>
                    </thead>
                    <tbody id="cartTableBody"></tbody>
                </table>
            </div>
        </div>

        <!-- Test Requirements Summary -->
        <div id="requirementsSummary" class="card" style="border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;overflow:hidden;display:none">
            <div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:rgba(245,158,11,0.06)">
                <h5 style="margin:0;font-size:14px;font-weight:700;color:#d97706;font-family:'Roobert',sans-serif">
                    <i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Important Preparation
                </h5>
            </div>
            <div id="requirementsContent" style="padding:14px 20px;font-size:13px"></div>
        </div>

        <!-- Bill Summary -->
        <div class="card" style="border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;overflow:hidden">
            <div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03)">
                <h5 style="margin:0;font-size:15px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">
                    <i data-lucide="receipt" style="width:16px;height:16px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Bill Summary
                </h5>
            </div>
            <div style="padding:16px 20px">
                <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px">
                    <span style="color:var(--color-muted-foreground)">Subtotal (<span id="billTestCount">0</span> tests):</span>
                    <span style="font-weight:600" id="billSubtotal">PKR 0</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:14px">
                    <span style="color:var(--color-muted-foreground)">Discount:</span>
                    <select id="discountType" style="padding:5px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;background:var(--color-card)">
                        <option value="0">None</option>
                        <option value="10">Senior Citizen 10%</option>
                        <option value="15">Student 15%</option>
                        <option value="20">Corporate 20%</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <div id="customDiscountRow" style="display:none;margin-bottom:10px">
                    <input type="number" id="customDiscount" placeholder="Enter %" min="0" max="100" style="width:80px;padding:5px 8px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px" id="discountAmountRow" style="display:none">
                    <span style="color:#ef4444">Discount:</span>
                    <span style="color:#ef4444;font-weight:600" id="discountAmount">- PKR 0</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-size:14px">
                    <label style="display:flex;align-items:center;gap:6px;color:var(--color-muted-foreground);cursor:pointer">
                        <input type="checkbox" id="homeCollection" style="accent-color:var(--aqua-mint)">
                        Home Sample Collection
                    </label>
                    <span style="font-size:12px;color:var(--color-muted-foreground)">+PKR 500</span>
                </div>
                <div style="border-top:2px solid var(--midnight-blue);padding-top:12px;display:flex;justify-content:space-between;align-items:center">
                    <span style="font-size:16px;font-weight:700;color:var(--midnight-blue)">TOTAL:</span>
                    <span style="font-size:22px;font-weight:800;color:var(--midnight-blue)" id="billTotal">PKR 0</span>
                </div>
            </div>
        </div>

        <!-- Doctor's Prescription -->
        <div class="card" style="border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;overflow:hidden">
            <div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03)">
                <h5 style="margin:0;font-size:14px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">
                    <i data-lucide="file-text" style="width:14px;height:14px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Doctor's Prescription (Optional)
                </h5>
            </div>
            <div style="padding:14px 20px">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Doctor Name</label>
                        <input type="text" id="rxDoctorName" placeholder="Dr." style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Registration #</label>
                        <input type="text" id="rxRegNo" placeholder="PMDC #" style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Options -->
        <div class="card" style="border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;overflow:hidden">
            <div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03)">
                <h5 style="margin:0;font-size:15px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">
                    <i data-lucide="wallet" style="width:16px;height:16px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Payment
                </h5>
            </div>
            <div style="padding:16px 20px">
                <div style="display:flex;gap:0;margin-bottom:16px;border:1px solid var(--color-border);border-radius:8px;overflow:hidden">
                    <button class="pay-tab active" data-method="cash" style="flex:1;padding:8px 6px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:var(--midnight-blue);color:#fff;display:flex;align-items:center;justify-content:center;gap:4px">
                        <i data-lucide="banknote" style="width:13px;height:13px"></i> Cash
                    </button>
                    <button class="pay-tab" data-method="card" style="flex:1;padding:8px 6px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--color-foreground);display:flex;align-items:center;justify-content:center;gap:4px">
                        <i data-lucide="credit-card" style="width:13px;height:13px"></i> Card
                    </button>
                    <button class="pay-tab" data-method="mobile" style="flex:1;padding:8px 6px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--color-foreground);display:flex;align-items:center;justify-content:center;gap:4px">
                        <i data-lucide="smartphone" style="width:13px;height:13px"></i> Mobile
                    </button>
                    <button class="pay-tab" data-method="corporate" style="flex:1;padding:8px 6px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--color-foreground);display:flex;align-items:center;justify-content:center;gap:4px">
                        <i data-lucide="building-2" style="width:13px;height:13px"></i> Corporate
                    </button>
                </div>

                <!-- Cash Panel -->
                <div class="pay-panel" id="panelCash">
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px">
                        <span>Total:</span><span style="font-weight:700" class="payTotal">PKR 0</span>
                    </div>
                    <div style="margin-bottom:10px">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Amount Received</label>
                        <input type="number" id="cashReceived" placeholder="0" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:15px;font-weight:600;background:var(--color-card)">
                    </div>
                    <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
                        <button class="quick-cash" data-amt="100" style="padding:5px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--color-card)">100</button>
                        <button class="quick-cash" data-amt="500" style="padding:5px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--color-card)">500</button>
                        <button class="quick-cash" data-amt="1000" style="padding:5px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--color-card)">1,000</button>
                        <button class="quick-cash" data-amt="5000" style="padding:5px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--color-card)">5,000</button>
                        <button class="quick-cash" data-amt="exact" style="padding:5px 12px;border:1px solid var(--aqua-mint);border-radius:6px;font-size:12px;cursor:pointer;background:rgba(127,255,212,0.1);color:var(--aqua-mint);font-weight:600">EXACT</button>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(127,255,212,0.08);border-radius:8px;font-size:14px">
                        <span style="font-weight:600">Change:</span>
                        <span style="font-weight:700;color:var(--aqua-mint)" id="cashChange">PKR 0</span>
                    </div>
                </div>

                <!-- Card Panel -->
                <div class="pay-panel" id="panelCard" style="display:none">
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px">
                        <span>Total:</span><span style="font-weight:700" class="payTotal">PKR 0</span>
                    </div>
                    <div style="display:flex;gap:12px;margin-bottom:12px">
                        <label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="radio" name="cardType" value="debit" checked style="accent-color:var(--aqua-mint)"> Debit</label>
                        <label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="radio" name="cardType" value="credit" style="accent-color:var(--aqua-mint)"> Credit</label>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Transaction ID</label>
                        <input type="text" id="cardTxnId" placeholder="Enter transaction ID" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card)">
                    </div>
                </div>

                <!-- Mobile Panel -->
                <div class="pay-panel" id="panelMobile" style="display:none">
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px">
                        <span>Total:</span><span style="font-weight:700" class="payTotal">PKR 0</span>
                    </div>
                    <div style="display:flex;gap:12px;margin-bottom:12px">
                        <label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="radio" name="mobileService" value="jazzcash" checked style="accent-color:var(--aqua-mint)"> JazzCash</label>
                        <label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer"><input type="radio" name="mobileService" value="easypaisa" style="accent-color:var(--aqua-mint)"> EasyPaisa</label>
                    </div>
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Phone Number</label>
                        <input type="text" id="mobilePhone" placeholder="03XX-XXXXXXX" style="width:100%;padding:9px 12px;border:1px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-card)">
                    </div>
                </div>

                <!-- Corporate Panel -->
                <div class="pay-panel" id="panelCorporate" style="display:none">
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px">
                        <span>Total:</span><span style="font-weight:700" class="payTotal">PKR 0</span>
                    </div>
                    <div style="margin-bottom:10px">
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Company</label>
                        <select id="corpCompany" style="width:100%;padding:8px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                            <option value="">Select Company</option>
                            <option>PTCL</option><option>Jazz</option><option>Telenor</option>
                            <option>Engro Corporation</option><option>Lucky Cement</option>
                            <option>National Foods</option><option>Fauji Foundation</option>
                        </select>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Employee ID</label>
                            <input type="text" id="corpEmpId" placeholder="ID" style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                        </div>
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Authorization</label>
                            <input type="text" id="corpAuth" placeholder="Auth #" style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sample Collection -->
        <div class="card" style="border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;overflow:hidden">
            <div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03)">
                <h5 style="margin:0;font-size:14px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">
                    <i data-lucide="syringe" style="width:14px;height:14px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Sample Collection
                </h5>
            </div>
            <div style="padding:14px 20px">
                <div style="display:flex;flex-direction:column;gap:8px">
                    <label style="display:flex;align-items:center;gap:8px;padding:10px 14px;border:2px solid var(--aqua-mint);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;background:rgba(127,255,212,0.08)">
                        <input type="radio" name="sampleCollection" value="now" checked style="accent-color:var(--aqua-mint)">
                        Now (Immediate - Patient waits)
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px">
                        <input type="radio" name="sampleCollection" value="schedule" style="accent-color:var(--aqua-mint)">
                        Schedule Appointment
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;font-size:13px">
                        <input type="radio" name="sampleCollection" value="home" style="accent-color:var(--aqua-mint)">
                        Home Collection (+PKR 500)
                    </label>
                </div>
                <div id="scheduleFields" style="display:none;margin-top:12px;padding:12px;background:rgba(0,51,102,0.03);border-radius:8px">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Date</label>
                            <input type="date" id="scheduleDate" style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                        </div>
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Time Slot</label>
                            <select id="scheduleTime" style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                                <option>07:00 - 08:00 AM</option>
                                <option>08:00 - 09:00 AM</option>
                                <option>09:00 - 10:00 AM</option>
                                <option>10:00 - 11:00 AM</option>
                                <option>11:00 - 12:00 PM</option>
                                <option>02:00 - 03:00 PM</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div id="homeFields" style="display:none;margin-top:12px;padding:12px;background:rgba(0,51,102,0.03);border-radius:8px">
                    <div>
                        <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Address</label>
                        <input type="text" id="homeAddress" placeholder="Full address" style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card);margin-bottom:10px">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Date</label>
                            <input type="date" id="homeDate" style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                        </div>
                        <div>
                            <label style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:4px;display:block">Time</label>
                            <select id="homeTime" style="width:100%;padding:7px 10px;border:1px solid var(--color-border);border-radius:6px;font-size:13px;background:var(--color-card)">
                                <option>07:00 - 09:00 AM</option>
                                <option>09:00 - 11:00 AM</option>
                                <option>04:00 - 06:00 PM</option>
                            </select>
                        </div>
                    </div>
                    <p style="font-size:11px;color:var(--color-muted-foreground);margin:8px 0 0">Phlebotomist will call 30 mins before arrival</p>
                </div>
            </div>
        </div>

        <!-- Report Delivery -->
        <div class="card" style="border:1px solid var(--color-border);border-radius:12px;margin-bottom:16px;overflow:hidden">
            <div style="padding:14px 20px;border-bottom:1px solid var(--color-border);background:rgba(0,51,102,0.03)">
                <h5 style="margin:0;font-size:14px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif">
                    <i data-lucide="send" style="width:14px;height:14px;display:inline;vertical-align:-2px;margin-right:6px"></i>
                    Report Delivery
                </h5>
            </div>
            <div style="padding:14px 20px">
                <div style="display:flex;flex-direction:column;gap:6px">
                    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" checked style="accent-color:var(--aqua-mint)"> SMS (Results ready notification)</label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" checked style="accent-color:var(--aqua-mint)"> Email (PDF report)</label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" checked style="accent-color:var(--aqua-mint)"> WhatsApp (PDF + notification)</label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" checked style="accent-color:var(--aqua-mint)"> Collect in person (Bring receipt)</label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" style="accent-color:var(--aqua-mint)"> Courier to address (+PKR 200)</label>
                </div>
            </div>
        </div>

        <!-- Complete Button -->
        <button id="btnCompleteRegistration" style="width:100%;padding:16px;border:none;border-radius:12px;background:var(--aqua-mint);color:var(--midnight-blue);font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;transition:all 0.2s;opacity:0.5" disabled>
            <i data-lucide="check-circle" style="width:20px;height:20px"></i>
            COMPLETE REGISTRATION & COLLECT SAMPLE
        </button>
    </div>
</div>

<!-- Test Detail Modal -->
<div class="modal fade" id="testDetailModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:1px solid var(--color-border);overflow:hidden">
            <div class="modal-header" style="background:rgba(0,51,102,0.03);border-bottom:1px solid var(--color-border);padding:16px 20px">
                <h5 class="modal-title" id="testDetailTitle" style="font-size:16px;font-weight:700;color:var(--midnight-blue);font-family:'Roobert',sans-serif;margin:0"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="testDetailBody" style="padding:20px"></div>
            <div class="modal-footer" style="border-top:1px solid var(--color-border);padding:12px 20px;display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:18px;font-weight:700;color:var(--midnight-blue)" id="testDetailPrice"></span>
                <button id="testDetailAddBtn" style="padding:10px 24px;border:none;border-radius:8px;background:var(--aqua-mint);color:var(--midnight-blue);font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px">
                    <i data-lucide="plus" style="width:16px;height:16px"></i> Add to Cart
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Success Modal -->
<div class="modal fade" id="successModal" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content" style="border-radius:16px;border:1px solid var(--color-border);overflow:hidden">
            <div class="modal-body" id="successBody" style="padding:30px;text-align:center"></div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/laboratory-walk-in.js') }}?v={{ filemtime(public_path('js/laboratory-walk-in.js')) }}"></script>
@endpush
