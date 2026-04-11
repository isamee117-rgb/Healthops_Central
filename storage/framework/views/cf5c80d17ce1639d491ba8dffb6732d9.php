<?php $__env->startSection('content'); ?>
<div class="module-page">
    <nav class="module-tabs">
        <button class="module-tab active" data-tab="profile" data-permission="hospital-info.profile.access">
            <i data-lucide="building-2"></i>
            <span class="hide-mobile">Hospital Profile</span>
        </button>
        <button class="module-tab" data-tab="legal" data-permission="hospital-info.legal.access">
            <i data-lucide="scale"></i>
            <span class="hide-mobile">Legal Information</span>
        </button>
        <button class="module-tab" data-tab="signatories" data-permission="hospital-info.signatories.access">
            <i data-lucide="pen-tool"></i>
            <span class="hide-mobile">Signatories</span>
        </button>
        <button class="module-tab" data-tab="departments" data-permission="hospital-info.departments.access">
            <i data-lucide="layout-grid"></i>
            <span class="hide-mobile">Departments</span>
        </button>
        <button class="module-tab" data-tab="banking" data-permission="hospital-info.banking.access">
            <i data-lucide="landmark"></i>
            <span class="hide-mobile">Banking Details</span>
        </button>
        <button class="module-tab" data-tab="templates" data-permission="hospital-info.templates.access">
            <i data-lucide="file-text"></i>
            <span class="hide-mobile">Document Templates</span>
        </button>
        <button class="module-tab" data-tab="insurance" data-permission="hospital-info.insurance.access">
            <i data-lucide="shield-check"></i>
            <span class="hide-mobile">Insurance Panels</span>
        </button>
        <button class="module-tab" data-tab="hours" data-permission="hospital-info.hours.access">
            <i data-lucide="clock"></i>
            <span class="hide-mobile">Operating Hours</span>
        </button>
        <button class="module-tab" data-tab="system" data-permission="hospital-info.system.access">
            <i data-lucide="settings"></i>
            <span class="hide-mobile">System Settings</span>
        </button>
    </nav>

    
    <div class="tab-content" id="tab-profile">
        <div class="module-header">
            <div>
                <h1><i data-lucide="building-2"></i> Hospital Profile</h1>
                <p class="module-subtitle">Basic information, contact details, and address</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnSaveProfile"><i data-lucide="save"></i> Save Changes</button>
            </div>
        </div>

        <div class="hi-cards-grid">
            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="image"></i> Hospital Logo</h3>
                </div>
                <div class="hi-card-body">
                    <div class="hi-logo-upload">
                        <div class="hi-logo-preview" id="logoPreview">
                            <i data-lucide="building-2" style="width:48px;height:48px;color:var(--color-muted-foreground);opacity:0.3"></i>
                            <span style="font-size:12px;color:var(--color-muted-foreground)">No logo uploaded</span>
                        </div>
                        <div class="hi-logo-actions">
                            <label class="btn-outline btn-sm" style="cursor:pointer">
                                <i data-lucide="upload"></i> Upload Logo
                                <input type="file" id="logoFile" accept="image/*" style="display:none">
                            </label>
                            <button class="btn-ghost btn-sm" id="btnRemoveLogo" style="color:var(--color-destructive)">
                                <i data-lucide="trash-2"></i> Remove
                            </button>
                            <p style="font-size:11px;color:var(--color-muted-foreground);margin:4px 0 0">PNG, JPG. Max 2MB. Recommended 400x400px</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="info"></i> Basic Information</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>Hospital Name (English)</label>
                            <input type="text" class="form-control" id="basic_name" placeholder="e.g. Nova Medical Complex">
                        </div>
                        <div class="form-group">
                            <label>Short Name</label>
                            <input type="text" class="form-control" id="basic_short_name" placeholder="e.g. Medical Complex">
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Hospital Name (Urdu)</label>
                            <input type="text" class="form-control" id="basic_name_urdu" dir="rtl" placeholder="اردو نام">
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Tagline / Slogan</label>
                            <input type="text" class="form-control" id="basic_tagline" placeholder="e.g. Your Health, Our Priority">
                        </div>
                        <div class="form-group">
                            <label>Hospital Type</label>
                            <select class="form-select" id="basic_type">
                                <option value="">Select type</option>
                                <option value="general">General Hospital</option>
                                <option value="specialty">Specialty Hospital</option>
                                <option value="teaching">Teaching Hospital</option>
                                <option value="clinic">Clinic</option>
                                <option value="medical_complex">Medical Complex</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Established Year</label>
                            <input type="text" class="form-control" id="basic_established" placeholder="e.g. 2010">
                        </div>
                        <div class="form-group">
                            <label>Bed Capacity</label>
                            <input type="number" class="form-control" id="basic_bed_capacity" placeholder="e.g. 200">
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="phone"></i> Contact Information</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>Main Phone</label>
                            <input type="text" class="form-control" id="contact_phone" placeholder="+92-XXX-XXXXXXX">
                        </div>
                        <div class="form-group">
                            <label>Emergency Phone</label>
                            <input type="text" class="form-control" id="contact_emergency_phone" placeholder="+92-XXX-XXXXXXX">
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Fax Number</label>
                            <input type="text" class="form-control" id="contact_fax" placeholder="+92-XXX-XXXXXXX">
                        </div>
                        <div class="form-group">
                            <label>WhatsApp</label>
                            <input type="text" class="form-control" id="contact_whatsapp" placeholder="+92-XXX-XXXXXXX">
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" class="form-control" id="contact_email" placeholder="info@hospital.com">
                        </div>
                        <div class="form-group">
                            <label>Website</label>
                            <input type="url" class="form-control" id="contact_website" placeholder="https://www.hospital.com">
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="map-pin"></i> Address</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-group">
                        <label>Street Address</label>
                        <input type="text" class="form-control" id="address_street" placeholder="Street address">
                    </div>
                    <div class="form-grid form-grid-3" style="margin-top:12px">
                        <div class="form-group">
                            <label>City</label>
                            <input type="text" class="form-control" id="address_city" placeholder="City">
                        </div>
                        <div class="form-group">
                            <label>State / Province</label>
                            <input type="text" class="form-control" id="address_state" placeholder="Province">
                        </div>
                        <div class="form-group">
                            <label>Postal Code</label>
                            <input type="text" class="form-control" id="address_postal" placeholder="Postal code">
                        </div>
                    </div>
                    <div class="form-group" style="margin-top:12px">
                        <label>Country</label>
                        <input type="text" class="form-control" id="address_country" placeholder="Pakistan" value="Pakistan">
                    </div>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-legal" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="scale"></i> Legal Information</h1>
                <p class="module-subtitle">License, registration, and accreditation details</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnSaveLegal"><i data-lucide="save"></i> Save Changes</button>
            </div>
        </div>

        <div class="hi-cards-grid">
            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="file-badge"></i> License & Registration</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>Hospital License Number</label>
                            <input type="text" class="form-control" id="legal_license_number" placeholder="License number">
                        </div>
                        <div class="form-group">
                            <label>License Expiry Date</label>
                            <input type="date" class="form-control" id="legal_license_expiry">
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>PMDC Registration No.</label>
                            <input type="text" class="form-control" id="legal_pmdc_reg" placeholder="PMDC registration">
                        </div>
                        <div class="form-group">
                            <label>NTN Number</label>
                            <input type="text" class="form-control" id="legal_ntn" placeholder="National Tax Number">
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>STRN Number</label>
                            <input type="text" class="form-control" id="legal_strn" placeholder="Sales Tax Registration">
                        </div>
                        <div class="form-group">
                            <label>SECP Registration</label>
                            <input type="text" class="form-control" id="legal_secp" placeholder="SECP registration number">
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="award"></i> Accreditations</h3>
                </div>
                <div class="hi-card-body">
                    <div class="hi-checkbox-grid">
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="accred_jci" value="JCI">
                            <span>JCI Accredited</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="accred_iso" value="ISO">
                            <span>ISO 9001 Certified</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="accred_phc" value="PHC">
                            <span>PHC Approved</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="accred_hec" value="HEC">
                            <span>HEC Recognized (Teaching)</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="accred_who" value="WHO">
                            <span>WHO Compliant</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="accred_nabh" value="NABH">
                            <span>NABH Accredited</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="upload"></i> Legal Documents</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>License Certificate</label>
                            <div class="hi-file-upload">
                                <input type="file" id="doc_license" accept=".pdf,.jpg,.png">
                                <span class="hi-file-name" id="doc_license_name">No file selected</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Tax Certificate</label>
                            <div class="hi-file-upload">
                                <input type="file" id="doc_tax" accept=".pdf,.jpg,.png">
                                <span class="hi-file-name" id="doc_tax_name">No file selected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-signatories" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="pen-tool"></i> Authorized Signatories</h1>
                <p class="module-subtitle">Manage authorized signatories for official documents</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnAddSignatory"><i data-lucide="plus"></i> Add Signatory</button>
            </div>
        </div>

        <div class="hi-cards-list" id="signatoriesList">
            <div class="hi-empty-state">
                <i data-lucide="pen-tool" style="width:48px;height:48px;color:var(--color-muted-foreground);opacity:0.3"></i>
                <p>No signatories added yet</p>
                <span>Click "Add Signatory" to add authorized signatories</span>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-departments" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="layout-grid"></i> Departments</h1>
                <p class="module-subtitle">Manage hospital departments and services</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnAddDepartment"><i data-lucide="plus"></i> Add Department</button>
            </div>
        </div>

        <div class="search-filter-bar">
            <div class="search-wrapper">
                <i data-lucide="search"></i>
                <input type="text" class="search-input" id="deptSearch" placeholder="Search departments...">
            </div>
        </div>

        <div class="data-table-wrapper">
            <div style="overflow-x:auto">
                <table class="data-table" id="deptTable">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Code</th>
                            <th>HOD</th>
                            <th>Location</th>
                            <th>OPD Timing</th>
                            <th class="text-center">Emergency 24/7</th>
                            <th class="text-center">Status</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="deptTableBody">
                        <tr>
                            <td colspan="8">
                                <div class="empty-state">
                                    <i data-lucide="layout-grid"></i>
                                    <p>No departments added yet</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-banking" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="landmark"></i> Banking Details</h1>
                <p class="module-subtitle">Manage hospital bank accounts and payment details</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnAddBank"><i data-lucide="plus"></i> Add Bank Account</button>
            </div>
        </div>

        <div class="hi-cards-list" id="bankAccountsList">
            <div class="hi-empty-state">
                <i data-lucide="landmark" style="width:48px;height:48px;color:var(--color-muted-foreground);opacity:0.3"></i>
                <p>No bank accounts added yet</p>
                <span>Click "Add Bank Account" to add banking details</span>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-templates" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="file-text"></i> Document Templates</h1>
                <p class="module-subtitle">Configure letterhead, footer, and document templates</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnSaveTemplates"><i data-lucide="save"></i> Save Changes</button>
            </div>
        </div>

        <div class="hi-cards-grid">
            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="heading"></i> Letterhead Configuration</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>Logo Position</label>
                            <select class="form-select" id="lh_logo_position">
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Logo Size</label>
                            <select class="form-select" id="lh_logo_size">
                                <option value="small">Small</option>
                                <option value="medium" selected>Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Header Font</label>
                            <select class="form-select" id="lh_header_font">
                                <option value="Roobert">Roobert</option>
                                <option value="SF Pro">SF Pro</option>
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Primary Color</label>
                            <input type="color" class="form-control" id="lh_primary_color" value="#003366" style="height:38px;padding:4px">
                        </div>
                    </div>
                    <div style="margin-top:16px">
                        <p style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:8px;text-transform:uppercase">Show on Letterhead</p>
                        <div class="hi-checkbox-grid">
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="lh_show_logo" checked>
                                <span>Hospital Logo</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="lh_show_name" checked>
                                <span>Hospital Name</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="lh_show_tagline">
                                <span>Tagline</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="lh_show_address" checked>
                                <span>Address</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="lh_show_phone" checked>
                                <span>Phone Numbers</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="lh_show_email">
                                <span>Email</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="lh_show_website">
                                <span>Website</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="lh_show_license">
                                <span>License Number</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="align-justify"></i> Footer Configuration</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-group">
                        <label>Footer Line 1</label>
                        <input type="text" class="form-control" id="footer_line1" placeholder="e.g. Address line">
                    </div>
                    <div class="form-group" style="margin-top:12px">
                        <label>Footer Line 2</label>
                        <input type="text" class="form-control" id="footer_line2" placeholder="e.g. Phone / Email">
                    </div>
                    <div class="form-group" style="margin-top:12px">
                        <label>Footer Line 3</label>
                        <input type="text" class="form-control" id="footer_line3" placeholder="e.g. Website / Social">
                    </div>
                    <div style="margin-top:16px">
                        <p style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:8px;text-transform:uppercase">Show in Footer</p>
                        <div class="hi-checkbox-grid">
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="footer_show_page_number" checked>
                                <span>Page Numbers</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="footer_show_date" checked>
                                <span>Print Date</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="footer_show_disclaimer">
                                <span>Disclaimer Text</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="files"></i> Document Types</h3>
                </div>
                <div class="hi-card-body">
                    <div class="hi-doc-types-grid" id="docTypesGrid">
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="clipboard-plus"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>OPD Registration Slip</h4>
                                <p>Outpatient registration slip</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="opd_registration" data-doc-label="OPD Registration Slip" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="opd_registration" data-doc-label="OPD Registration Slip" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="file-pen"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Doctor Prescription</h4>
                                <p>Doctor issued prescriptions</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="doctor_prescription" data-doc-label="Doctor Prescription" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="doctor_prescription" data-doc-label="Doctor Prescription" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="bed"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>IPD Registration Slip</h4>
                                <p>Inpatient registration slip</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="ipd_registration" data-doc-label="IPD Registration Slip" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="ipd_registration" data-doc-label="IPD Registration Slip" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="tablets"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Patient Wise MAR</h4>
                                <p>Patient medication admin record</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="patient_mar" data-doc-label="Patient Wise MAR" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="patient_mar" data-doc-label="Patient Wise MAR" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="list-checks"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Complete MAR Slip</h4>
                                <p>Full medication admin record</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="complete_mar" data-doc-label="Complete MAR Slip" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="complete_mar" data-doc-label="Complete MAR Slip" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="log-out"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>IPD Discharge Slip</h4>
                                <p>Inpatient discharge document</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="ipd_discharge_slip" data-doc-label="IPD Discharge Slip" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="ipd_discharge_slip" data-doc-label="IPD Discharge Slip" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="zap"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Emergency Registration Slip</h4>
                                <p>ER patient registration slip</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="er_registration" data-doc-label="Emergency Registration Slip" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="er_registration" data-doc-label="Emergency Registration Slip" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="shield-off"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Emergency Discharge Slip</h4>
                                <p>ER patient discharge document</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="er_discharge_slip" data-doc-label="Emergency Discharge Slip" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="er_discharge_slip" data-doc-label="Emergency Discharge Slip" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="calendar-clock"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Scheduling Registration</h4>
                                <p>Appointment scheduling slip</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="scheduling_reg" data-doc-label="Scheduling Registration" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="scheduling_reg" data-doc-label="Scheduling Registration" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="clipboard-list"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Pre-ops Check List</h4>
                                <p>Pre-operative checklist</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="pre_ops" data-doc-label="Pre-ops Check List" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="pre_ops" data-doc-label="Pre-ops Check List" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="activity"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Intra-ops Check Notes</h4>
                                <p>Intra-operative check notes</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="intra_ops" data-doc-label="Intra-ops Check Notes" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="intra_ops" data-doc-label="Intra-ops Check Notes" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="clipboard-check"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Post-ops Notes</h4>
                                <p>Post-operative notes</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="post_ops" data-doc-label="Post-ops Notes" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="post_ops" data-doc-label="Post-ops Notes" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                        <div class="hi-doc-type-card">
                            <div class="hi-doc-type-icon"><i data-lucide="bed-double"></i></div>
                            <div class="hi-doc-type-info">
                                <h4>Bed</h4>
                                <p>Bed allocation document</p>
                            </div>
                            <div class="hi-doc-type-actions">
                                <button class="btn-ghost btn-sm doc-type-settings" data-doc-type="bed_doc" data-doc-label="Bed" title="Configure where to apply"><i data-lucide="settings"></i></button>
                                <button class="btn-ghost btn-sm doc-type-preview" data-doc-type="bed_doc" data-doc-label="Bed" title="Preview template"><i data-lucide="eye"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    
    <div class="offcanvas offcanvas-end" tabindex="-1" id="docTypeSheet" style="width:440px;max-width:95vw">
        <div class="offcanvas-header" style="border-bottom:1px solid var(--color-border);padding:20px 24px;flex-shrink:0">
            <div>
                <h5 class="offcanvas-title" id="docTypeSheetTitle" style="font-size:16px;font-weight:700;color:var(--color-foreground)">Configure Template</h5>
                <p style="font-size:12px;color:var(--color-muted-foreground);margin:2px 0 0">Select where this template is applied</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body" style="padding:24px;overflow-y:auto">
            <input type="hidden" id="docTypeKey">

            
            <div id="docFormatSection" style="display:none;margin-bottom:24px">
                <div class="section-label" style="margin-bottom:8px">Print Format</div>
                <p style="font-size:13px;color:var(--color-muted-foreground);margin-bottom:14px">Choose the paper size / format for this document.</p>
                <div style="display:flex;flex-direction:column;gap:8px" id="docFormatList"></div>
            </div>

            <div class="section-label" style="margin-bottom:12px">Print Locations</div>
            <p style="font-size:13px;color:var(--color-muted-foreground);margin-bottom:16px">Choose which print buttons in the system will use this template's letterhead and footer.</p>

            <div id="docTypeApplyList" style="display:flex;flex-direction:column;gap:8px"></div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid var(--color-border);display:flex;gap:10px;flex-shrink:0">
            <button class="btn-primary" id="btnSaveDocType" style="flex:1"><i data-lucide="save"></i> Save</button>
            <button class="btn-secondary" data-bs-dismiss="offcanvas" style="flex:1">Cancel</button>
        </div>
    </div>

    
    <div class="modal fade" id="docPreviewModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered" style="max-width:900px">
            <div class="modal-content" style="border-radius:16px;overflow:hidden;border:none;box-shadow:0 24px 64px rgba(0,0,0,0.2)">

                
                <div style="background:var(--midnight-blue);padding:14px 24px;display:flex;align-items:center;justify-content:space-between">
                    <div style="display:flex;align-items:center;gap:12px">
                        <div style="width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center">
                            <i data-lucide="file-text" style="width:16px;height:16px;color:#fff"></i>
                        </div>
                        <div>
                            <div id="docPreviewTitle" style="font-size:14px;font-weight:600;color:#fff">Template Preview</div>
                            <div style="font-size:11px;color:rgba(255,255,255,0.5)">Live preview based on your letterhead configuration</div>
                        </div>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>

                
                <div style="background:#cbd5e1;padding:28px 32px;overflow-y:auto;max-height:82vh">

                    
                    <div style="max-width:740px;margin:0 auto;background:#fff;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.08),0 16px 40px rgba(0,0,0,0.12);overflow:hidden;font-family:'SF Pro Text',sans-serif">

                        
                        <div id="previewLetterhead" style="padding:32px 40px 20px;position:relative">

                            
                            <div id="previewAccentBar" style="position:absolute;top:0;left:0;right:0;height:4px;background:#003366"></div>

                            <div id="previewLogoRow" style="display:flex;align-items:center;gap:20px">
                                
                                <div id="previewLogoBox" style="width:72px;height:72px;background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#94a3b8;flex-shrink:0;overflow:hidden;border:1px solid #e2e8f0">Logo</div>
                                
                                <div id="previewHospitalInfo" style="flex:1;min-width:0">
                                    <div id="previewHospitalName" style="font-size:17px;font-weight:800;color:#1e293b;font-family:Roobert,sans-serif;letter-spacing:-0.3px;line-height:1.1">Hospital Name</div>
                                    <div id="previewHospitalTagline" style="font-size:12px;color:#64748b;margin-top:4px;font-style:italic"></div>
                                    <div id="previewHospitalContact" style="font-size:11px;color:#475569;margin-top:6px;display:flex;gap:16px;flex-wrap:wrap"></div>
                                </div>
                            </div>

                            
                            <div id="previewDivider" style="margin-top:20px;height:1.5px;background:linear-gradient(to right,#003366,rgba(0,51,102,0.1));border-radius:2px"></div>
                        </div>

                        
                        <div id="previewDocTitle" style="padding:10px 40px;background:#003366;display:flex;align-items:center;justify-content:space-between">
                            <span style="color:#fff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Document Title</span>
                            <span style="background:rgba(255,255,255,0.15);color:#fff;font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;letter-spacing:0.5px">ORIGINAL</span>
                        </div>

                        
                        <div id="previewPatientMeta" style="padding:20px 40px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
                            <div>
                                <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:0.5px;margin-bottom:5px">Patient Name</div>
                                <div style="height:11px;background:#e2e8f0;border-radius:3px;margin-bottom:5px"></div>
                                <div style="height:9px;background:#eef2f7;border-radius:3px;width:65%"></div>
                            </div>
                            <div>
                                <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:0.5px;margin-bottom:5px">MRN</div>
                                <div style="height:11px;background:#e2e8f0;border-radius:3px;margin-bottom:5px;width:70%"></div>
                                <div style="height:9px;background:#eef2f7;border-radius:3px;width:45%"></div>
                            </div>
                            <div>
                                <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:0.5px;margin-bottom:5px">Doctor</div>
                                <div style="height:11px;background:#e2e8f0;border-radius:3px;margin-bottom:5px"></div>
                                <div style="height:9px;background:#eef2f7;border-radius:3px;width:55%"></div>
                            </div>
                            <div>
                                <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:0.5px;margin-bottom:5px">Department</div>
                                <div style="height:11px;background:#e2e8f0;border-radius:3px;margin-bottom:5px;width:80%"></div>
                                <div style="height:9px;background:#eef2f7;border-radius:3px;width:50%"></div>
                            </div>
                        </div>

                        
                        <div id="previewDocContent" style="padding:28px 40px 32px"></div>

                        
                        <div id="previewFooter" style="border-top:1px solid #e2e8f0">
                            <div id="previewAccentFooterBar" style="height:3px;background:linear-gradient(to right,#003366,rgba(0,51,102,0.1))"></div>
                            <div style="padding:12px 40px;background:#f8fafc;display:flex;align-items:center;justify-content:space-between;gap:16px">
                                <div id="previewFooterLines" style="font-size:9px;color:#64748b;line-height:1.6"></div>
                                <div id="previewFooterMeta" style="font-size:9px;color:#94a3b8;white-space:nowrap;display:flex;flex-direction:column;align-items:flex-end;gap:2px"></div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-insurance" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="shield-check"></i> Insurance Panels</h1>
                <p class="module-subtitle">Manage insurance company panels and agreements</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnAddInsurance"><i data-lucide="plus"></i> Add Panel</button>
            </div>
        </div>

        <div class="hi-cards-list" id="insurancePanelsList">
            <div class="hi-empty-state">
                <i data-lucide="shield-check" style="width:48px;height:48px;color:var(--color-muted-foreground);opacity:0.3"></i>
                <p>No insurance panels added yet</p>
                <span>Click "Add Panel" to add insurance company panels</span>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-hours" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="clock"></i> Operating Hours</h1>
                <p class="module-subtitle">Configure hospital operating hours and schedules</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnSaveHours"><i data-lucide="save"></i> Save Changes</button>
            </div>
        </div>

        <div class="hi-cards-grid">
            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="calendar"></i> Weekly Schedule</h3>
                </div>
                <div class="hi-card-body">
                    <div class="hi-hours-grid">
                        <div class="hi-hours-row">
                            <div class="hi-hours-day">Monday - Friday</div>
                            <div class="hi-hours-inputs">
                                <div class="form-group">
                                    <label>Opening</label>
                                    <input type="time" class="form-control" id="hours_weekday_open" value="08:00">
                                </div>
                                <span class="hi-hours-sep">to</span>
                                <div class="form-group">
                                    <label>Closing</label>
                                    <input type="time" class="form-control" id="hours_weekday_close" value="20:00">
                                </div>
                            </div>
                        </div>
                        <div class="hi-hours-row">
                            <div class="hi-hours-day">Saturday</div>
                            <div class="hi-hours-inputs">
                                <div class="form-group">
                                    <label>Opening</label>
                                    <input type="time" class="form-control" id="hours_saturday_open" value="09:00">
                                </div>
                                <span class="hi-hours-sep">to</span>
                                <div class="form-group">
                                    <label>Closing</label>
                                    <input type="time" class="form-control" id="hours_saturday_close" value="17:00">
                                </div>
                            </div>
                        </div>
                        <div class="hi-hours-row">
                            <div class="hi-hours-day">Sunday</div>
                            <div class="hi-hours-inputs">
                                <div class="form-group">
                                    <label>Opening</label>
                                    <input type="time" class="form-control" id="hours_sunday_open" value="10:00">
                                </div>
                                <span class="hi-hours-sep">to</span>
                                <div class="form-group">
                                    <label>Closing</label>
                                    <input type="time" class="form-control" id="hours_sunday_close" value="14:00">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="siren"></i> 24/7 Services</h3>
                </div>
                <div class="hi-card-body">
                    <p style="font-size:13px;color:var(--color-muted-foreground);margin-bottom:12px">Select departments that operate 24 hours, 7 days a week</p>
                    <div class="hi-checkbox-grid">
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="h24_emergency" checked>
                            <span>Emergency Department</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="h24_icu" checked>
                            <span>ICU / Critical Care</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="h24_pharmacy">
                            <span>Pharmacy</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="h24_laboratory">
                            <span>Laboratory</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="h24_radiology">
                            <span>Radiology</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="h24_blood_bank">
                            <span>Blood Bank</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="h24_ambulance" checked>
                            <span>Ambulance Service</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="h24_security" checked>
                            <span>Security</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    
    <div class="tab-content" id="tab-system" style="display:none">
        <div class="module-header">
            <div>
                <h1><i data-lucide="settings"></i> System Settings</h1>
                <p class="module-subtitle">Configure system-wide preferences and defaults</p>
            </div>
            <div class="module-header-actions">
                <button class="btn-primary" id="btnSaveSystem"><i data-lucide="save"></i> Save Changes</button>
            </div>
        </div>

        <div class="hi-cards-grid">
            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="file-text"></i> Document Settings</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>MRN Prefix</label>
                            <input type="text" class="form-control" id="sys_mrn_prefix" placeholder="e.g. MRN-">
                        </div>
                        <div class="form-group">
                            <label>MRN Starting Number</label>
                            <input type="number" class="form-control" id="sys_mrn_start" placeholder="e.g. 1001">
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Invoice Prefix</label>
                            <input type="text" class="form-control" id="sys_invoice_prefix" placeholder="e.g. INV-">
                        </div>
                        <div class="form-group">
                            <label>Receipt Prefix</label>
                            <input type="text" class="form-control" id="sys_receipt_prefix" placeholder="e.g. REC-">
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="globe"></i> Regional Settings</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>Date Format</label>
                            <select class="form-select" id="sys_date_format">
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Time Format</label>
                            <select class="form-select" id="sys_time_format">
                                <option value="12h">12 Hour (AM/PM)</option>
                                <option value="24h">24 Hour</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Currency</label>
                            <select class="form-select" id="sys_currency">
                                <option value="PKR">PKR - Pakistani Rupee</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="AED">AED - UAE Dirham</option>
                                <option value="SAR">SAR - Saudi Riyal</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Language</label>
                            <select class="form-select" id="sys_language">
                                <option value="en">English</option>
                                <option value="ur">Urdu</option>
                                <option value="both">Bilingual (English + Urdu)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="bell"></i> Notifications</h3>
                </div>
                <div class="hi-card-body">
                    <div class="hi-checkbox-grid">
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="notif_email" checked>
                            <span>Email Notifications</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="notif_sms">
                            <span>SMS Notifications</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="notif_whatsapp">
                            <span>WhatsApp Notifications</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="notif_appointment_reminder" checked>
                            <span>Appointment Reminders</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="notif_lab_ready" checked>
                            <span>Lab Results Ready</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="notif_billing_alerts" checked>
                            <span>Billing Alerts</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="hi-card">
                <div class="hi-card-header">
                    <h3><i data-lucide="printer"></i> Printing Defaults</h3>
                </div>
                <div class="hi-card-body">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>Default Paper Size</label>
                            <select class="form-select" id="sys_paper_size">
                                <option value="A4">A4</option>
                                <option value="A5">A5</option>
                                <option value="Letter">Letter</option>
                                <option value="Legal">Legal</option>
                                <option value="Thermal">Thermal (80mm)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Print Orientation</label>
                            <select class="form-select" id="sys_orientation">
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </div>
                    </div>
                    <div class="hi-checkbox-grid" style="margin-top:12px">
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="sys_auto_print" checked>
                            <span>Auto-print after save</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="sys_print_header" checked>
                            <span>Include letterhead on prints</span>
                        </label>
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="sys_print_footer" checked>
                            <span>Include footer on prints</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="deptSheet" style="width:600px;max-width:95vw">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="deptSheetTitle"><i data-lucide="layout-grid"></i> Add Department</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="deptSheetBody">
        <form id="deptForm" novalidate>
            <input type="hidden" id="deptId" value="">
            <div class="form-section">
                <div class="form-section-title">Department Details</div>
                <div class="form-grid form-grid-2">
                    <div class="form-group">
                        <label>Department Name <span style="color:var(--color-destructive)">*</span></label>
                        <input type="text" class="form-control" id="deptName" placeholder="e.g. Cardiology" required>
                    </div>
                    <div class="form-group">
                        <label>Name (Urdu)</label>
                        <input type="text" class="form-control" id="deptNameUrdu" dir="rtl" placeholder="اردو نام">
                    </div>
                </div>
                <div class="form-grid form-grid-2" style="margin-top:12px">
                    <div class="form-group">
                        <label>Department Code</label>
                        <input type="text" class="form-control" id="deptCode" placeholder="e.g. CARD">
                    </div>
                    <div class="form-group">
                        <label>Head of Department</label>
                        <input type="text" class="form-control" id="deptHod" placeholder="HOD name">
                    </div>
                </div>
            </div>
            <div class="form-section">
                <div class="form-section-title">Contact & Location</div>
                <div class="form-grid form-grid-2">
                    <div class="form-group">
                        <label>Location / Floor</label>
                        <input type="text" class="form-control" id="deptLocation" placeholder="e.g. 2nd Floor, Wing A">
                    </div>
                    <div class="form-group">
                        <label>Extension</label>
                        <input type="text" class="form-control" id="deptExtension" placeholder="e.g. 201">
                    </div>
                </div>
                <div class="form-grid form-grid-2" style="margin-top:12px">
                    <div class="form-group">
                        <label>Direct Line</label>
                        <input type="text" class="form-control" id="deptDirectLine" placeholder="Phone number">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" id="deptEmail" placeholder="dept@hospital.com">
                    </div>
                </div>
            </div>
            <div class="form-section">
                <div class="form-section-title">OPD Timing & Services</div>
                <div class="form-grid form-grid-2">
                    <div class="form-group">
                        <label>OPD Start Time</label>
                        <input type="time" class="form-control" id="deptOpdStart">
                    </div>
                    <div class="form-group">
                        <label>OPD End Time</label>
                        <input type="time" class="form-control" id="deptOpdEnd">
                    </div>
                </div>
                <div class="form-group" style="margin-top:12px">
                    <label>Services Offered</label>
                    <textarea class="form-control" id="deptServices" rows="3" placeholder="Comma-separated list of services" style="height:auto;padding:8px 12px"></textarea>
                </div>
                <div style="display:flex;gap:24px;margin-top:12px">
                    <label class="hi-checkbox-item">
                        <input type="checkbox" id="deptEmergency24">
                        <span>Emergency 24/7</span>
                    </label>
                    <label class="hi-checkbox-item">
                        <input type="checkbox" id="deptActive" checked>
                        <span>Active</span>
                    </label>
                </div>
            </div>
        </form>
    </div>
    <div class="offcanvas-footer">
        <button class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
        <button class="btn-primary" id="btnSaveDept"><i data-lucide="check"></i> Save Department</button>
    </div>
</div>


<div class="offcanvas offcanvas-end" tabindex="-1" id="signatorySheet" style="width:600px;max-width:95vw">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="signatorySheetTitle"><i data-lucide="pen-tool"></i> Add Signatory</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" id="signatorySheetBody">
        <form id="signatoryForm" novalidate>
            <input type="hidden" id="signatoryId" value="">
            <div class="form-section">
                <div class="form-section-title">Personal Details</div>
                <div class="form-grid form-grid-2">
                    <div class="form-group">
                        <label>Title <span style="color:var(--color-destructive)">*</span></label>
                        <select class="form-select" id="sigTitle">
                            <option value="">Select</option>
                            <option value="Dr.">Dr.</option>
                            <option value="Prof.">Prof.</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms.">Ms.</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Full Name <span style="color:var(--color-destructive)">*</span></label>
                        <input type="text" class="form-control" id="sigName" placeholder="Full name" required>
                    </div>
                </div>
                <div class="form-grid form-grid-2" style="margin-top:12px">
                    <div class="form-group">
                        <label>Qualifications</label>
                        <input type="text" class="form-control" id="sigQualifications" placeholder="e.g. MBBS, FCPS">
                    </div>
                    <div class="form-group">
                        <label>Designation <span style="color:var(--color-destructive)">*</span></label>
                        <input type="text" class="form-control" id="sigDesignation" placeholder="e.g. Medical Director" required>
                    </div>
                </div>
                <div class="form-group" style="margin-top:12px">
                    <label>Registration Number</label>
                    <input type="text" class="form-control" id="sigRegNumber" placeholder="PMDC / License number">
                </div>
            </div>
            <div class="form-section">
                <div class="form-section-title">Uploads</div>
                <div class="form-grid form-grid-3">
                    <div class="form-group">
                        <label>Photo</label>
                        <div class="hi-upload-box" id="sigPhotoPreview">
                            <i data-lucide="user" style="width:24px;height:24px;color:var(--color-muted-foreground)"></i>
                            <span>Upload</span>
                            <input type="file" id="sigPhoto" accept="image/*" style="display:none">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Signature</label>
                        <div class="hi-upload-box" id="sigSignaturePreview">
                            <i data-lucide="pen-tool" style="width:24px;height:24px;color:var(--color-muted-foreground)"></i>
                            <span>Upload</span>
                            <input type="file" id="sigSignature" accept="image/*" style="display:none">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Stamp</label>
                        <div class="hi-upload-box" id="sigStampPreview">
                            <i data-lucide="stamp" style="width:24px;height:24px;color:var(--color-muted-foreground)"></i>
                            <span>Upload</span>
                            <input type="file" id="sigStamp" accept="image/*" style="display:none">
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-section">
                <div class="form-section-title">Usage</div>
                <p style="font-size:13px;color:var(--color-muted-foreground);margin-bottom:8px">Select document types this signatory is authorized for</p>
                <div class="hi-checkbox-grid">
                    <label class="hi-checkbox-item">
                        <input type="checkbox" name="sig_use_on[]" value="prescription">
                        <span>Prescription</span>
                    </label>
                    <label class="hi-checkbox-item">
                        <input type="checkbox" name="sig_use_on[]" value="lab_report">
                        <span>Lab Report</span>
                    </label>
                    <label class="hi-checkbox-item">
                        <input type="checkbox" name="sig_use_on[]" value="discharge">
                        <span>Discharge Summary</span>
                    </label>
                    <label class="hi-checkbox-item">
                        <input type="checkbox" name="sig_use_on[]" value="certificate">
                        <span>Medical Certificate</span>
                    </label>
                    <label class="hi-checkbox-item">
                        <input type="checkbox" name="sig_use_on[]" value="invoice">
                        <span>Invoice / Bill</span>
                    </label>
                    <label class="hi-checkbox-item">
                        <input type="checkbox" name="sig_use_on[]" value="referral">
                        <span>Referral Letter</span>
                    </label>
                </div>
                <div style="margin-top:12px">
                    <label class="hi-checkbox-item">
                        <input type="checkbox" id="sigActive" checked>
                        <span>Active</span>
                    </label>
                </div>
            </div>
        </form>
    </div>
    <div class="offcanvas-footer">
        <button class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
        <button class="btn-primary" id="btnSaveSignatory"><i data-lucide="check"></i> Save Signatory</button>
    </div>
</div>


<div class="modal fade" id="bankModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="border:none;border-radius:12px;overflow:hidden">
            <div class="modal-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px">
                <h5 class="modal-title" id="bankModalTitle" style="font-size:18px;font-weight:700;color:var(--midnight-blue)">Add Bank Account</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:24px">
                <form id="bankForm" novalidate>
                    <input type="hidden" id="bankId" value="">
                    <div class="form-grid form-grid-2">
                        <div class="form-group">
                            <label>Label <span style="color:var(--color-destructive)">*</span></label>
                            <input type="text" class="form-control" id="bankLabel" placeholder="e.g. Primary Account" required>
                        </div>
                        <div class="form-group">
                            <label>Bank Name <span style="color:var(--color-destructive)">*</span></label>
                            <input type="text" class="form-control" id="bankName" placeholder="e.g. Habib Bank" required>
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Branch</label>
                            <input type="text" class="form-control" id="bankBranch" placeholder="Branch name">
                        </div>
                        <div class="form-group">
                            <label>Branch Code</label>
                            <input type="text" class="form-control" id="bankBranchCode" placeholder="Branch code">
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>Account Title <span style="color:var(--color-destructive)">*</span></label>
                            <input type="text" class="form-control" id="bankAccTitle" placeholder="Account title" required>
                        </div>
                        <div class="form-group">
                            <label>Account Number <span style="color:var(--color-destructive)">*</span></label>
                            <input type="text" class="form-control" id="bankAccNumber" placeholder="Account number" required>
                        </div>
                    </div>
                    <div class="form-grid form-grid-2" style="margin-top:12px">
                        <div class="form-group">
                            <label>IBAN</label>
                            <input type="text" class="form-control" id="bankIban" placeholder="PK00XXXX0000000000000000">
                        </div>
                        <div class="form-group">
                            <label>SWIFT Code</label>
                            <input type="text" class="form-control" id="bankSwift" placeholder="SWIFT/BIC code">
                        </div>
                    </div>
                    <div class="form-group" style="margin-top:12px">
                        <label>Account Type</label>
                        <select class="form-select" id="bankAccType">
                            <option value="current">Current Account</option>
                            <option value="savings">Savings Account</option>
                            <option value="deposit">Fixed Deposit</option>
                        </select>
                    </div>
                    <div style="margin-top:16px">
                        <p style="font-size:12px;font-weight:600;color:var(--color-muted-foreground);margin-bottom:8px;text-transform:uppercase">Use For</p>
                        <div class="hi-checkbox-grid">
                            <label class="hi-checkbox-item">
                                <input type="checkbox" name="bank_use_for[]" value="patient_payments">
                                <span>Patient Payments</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" name="bank_use_for[]" value="salary">
                                <span>Salary Disbursement</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" name="bank_use_for[]" value="vendor_payments">
                                <span>Vendor Payments</span>
                            </label>
                            <label class="hi-checkbox-item">
                                <input type="checkbox" name="bank_use_for[]" value="insurance_claims">
                                <span>Insurance Claims</span>
                            </label>
                        </div>
                    </div>
                    <div style="margin-top:12px">
                        <label class="hi-checkbox-item">
                            <input type="checkbox" id="bankActive" checked>
                            <span>Active</span>
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--color-border);padding:16px 24px;display:flex;justify-content:flex-end;gap:8px">
                <button class="btn-outline" data-bs-dismiss="modal">Cancel</button>
                <button class="btn-primary" id="btnSaveBank"><i data-lucide="check"></i> Save Account</button>
            </div>
        </div>
    </div>
</div>


<div class="modal fade" id="insuranceModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="border:none;border-radius:12px;overflow:hidden">
            <div class="modal-header" style="border-bottom:1px solid var(--color-border);padding:16px 24px">
                <h5 class="modal-title" id="insuranceModalTitle" style="font-size:18px;font-weight:700;color:var(--midnight-blue)">Add Insurance Panel</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:24px">
                <form id="insuranceForm" novalidate>
                    <input type="hidden" id="insuranceId" value="">
                    <div class="form-section">
                        <div class="form-section-title">Panel Information</div>
                        <div class="form-grid form-grid-2">
                            <div class="form-group">
                                <label>Panel Name <span style="color:var(--color-destructive)">*</span></label>
                                <input type="text" class="form-control" id="insName" placeholder="e.g. State Life Insurance" required>
                            </div>
                            <div class="form-group">
                                <label>Panel Code</label>
                                <input type="text" class="form-control" id="insCode" placeholder="e.g. SLI">
                            </div>
                        </div>
                        <div class="form-grid form-grid-2" style="margin-top:12px">
                            <div class="form-group">
                                <label>Company Type</label>
                                <select class="form-select" id="insCompanyType">
                                    <option value="">Select type</option>
                                    <option value="government">Government</option>
                                    <option value="private">Private</option>
                                    <option value="corporate">Corporate</option>
                                    <option value="ngo">NGO / Trust</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select class="form-select" id="insStatus">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending Approval</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="form-section">
                        <div class="form-section-title">Contact Details</div>
                        <div class="form-grid form-grid-2">
                            <div class="form-group">
                                <label>Contact Person</label>
                                <input type="text" class="form-control" id="insContact" placeholder="Contact name">
                            </div>
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="text" class="form-control" id="insPhone" placeholder="Phone number">
                            </div>
                        </div>
                        <div class="form-group" style="margin-top:12px">
                            <label>Email</label>
                            <input type="email" class="form-control" id="insEmail" placeholder="email@company.com">
                        </div>
                    </div>
                    <div class="form-section">
                        <div class="form-section-title">Agreement Details</div>
                        <div class="form-grid form-grid-2">
                            <div class="form-group">
                                <label>Credit Limit</label>
                                <input type="number" class="form-control" id="insCreditLimit" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label>Payment Terms</label>
                                <input type="text" class="form-control" id="insPaymentTerms" placeholder="e.g. Net 30">
                            </div>
                        </div>
                        <div class="form-grid form-grid-2" style="margin-top:12px">
                            <div class="form-group">
                                <label>Agreement Start</label>
                                <input type="date" class="form-control" id="insAgreementStart">
                            </div>
                            <div class="form-group">
                                <label>Agreement End</label>
                                <input type="date" class="form-control" id="insAgreementEnd">
                            </div>
                        </div>
                        <div style="margin-top:12px">
                            <label class="hi-checkbox-item">
                                <input type="checkbox" id="insAutoRenew">
                                <span>Auto-renewable agreement</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer" style="border-top:1px solid var(--color-border);padding:16px 24px;display:flex;justify-content:flex-end;gap:8px">
                <button class="btn-outline" data-bs-dismiss="modal">Cancel</button>
                <button class="btn-primary" id="btnSaveInsurance"><i data-lucide="check"></i> Save Panel</button>
            </div>
        </div>
    </div>
</div>


<div class="modal fade" id="hiDeleteModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content" style="border:none;border-radius:12px;overflow:hidden">
            <div class="modal-body" style="padding:32px;text-align:center">
                <div style="width:56px;height:56px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
                    <i data-lucide="alert-triangle" style="width:28px;height:28px;color:var(--color-destructive)"></i>
                </div>
                <h5 style="font-size:18px;font-weight:600;color:var(--color-foreground);margin-bottom:8px" id="hiDeleteTitle">Delete Item</h5>
                <p style="font-size:14px;color:var(--color-muted-foreground);margin-bottom:24px" id="hiDeleteMsg">Are you sure? This action cannot be undone.</p>
                <div style="display:flex;justify-content:center;gap:8px">
                    <button class="btn-outline" data-bs-dismiss="modal">Cancel</button>
                    <button class="btn-destructive" id="btnConfirmDelete">Delete</button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('styles'); ?>
<style>
.hi-cards-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.hi-card {
    border-radius: 12px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    overflow: hidden;
}

.hi-card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-muted);
}

.hi-card-header h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--midnight-blue);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.hi-card-header h3 i {
    width: 18px;
    height: 18px;
}

.hi-card-body {
    padding: 20px;
}

.hi-logo-upload {
    display: flex;
    align-items: center;
    gap: 24px;
}

.hi-logo-preview {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    border: 2px dashed var(--color-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--color-muted);
}

.hi-logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.hi-logo-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.hi-checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
}

.hi-checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 13px;
    color: var(--color-foreground);
}

.hi-checkbox-item:hover {
    background: var(--color-muted);
}

.hi-checkbox-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--aquamint);
    cursor: pointer;
    flex-shrink: 0;
}

.hi-file-upload {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hi-file-upload input[type="file"] {
    font-size: 13px;
    max-width: 200px;
}

.hi-file-name {
    font-size: 12px;
    color: var(--color-muted-foreground);
}

.hi-cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.hi-empty-state {
    text-align: center;
    padding: 48px 24px;
    background: var(--color-card);
    border-radius: 12px;
    border: 1px solid var(--color-border);
}

.hi-empty-state p {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-muted-foreground);
    margin: 12px 0 4px;
}

.hi-empty-state span {
    font-size: 13px;
    color: var(--color-muted-foreground);
    opacity: 0.7;
}

.hi-signatory-card,
.hi-bank-card,
.hi-insurance-card {
    border-radius: 12px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: all 0.15s;
}

.hi-signatory-card:hover,
.hi-bank-card:hover,
.hi-insurance-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.hi-signatory-photo {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--color-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}

.hi-signatory-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hi-signatory-photo i {
    width: 24px;
    height: 24px;
    color: var(--color-muted-foreground);
}

.hi-card-info {
    flex: 1;
    min-width: 0;
}

.hi-card-info h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-foreground);
    margin: 0 0 2px;
}

.hi-card-info .hi-card-subtitle {
    font-size: 13px;
    color: var(--color-muted-foreground);
    margin: 0 0 8px;
}

.hi-card-info .hi-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.hi-card-info .hi-card-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--color-muted-foreground);
    padding: 2px 8px;
    background: var(--color-muted);
    border-radius: 4px;
}

.hi-card-info .hi-card-meta-item i {
    width: 12px;
    height: 12px;
}

.hi-card-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}

.hi-hours-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.hi-hours-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-muted);
}

.hi-hours-day {
    font-size: 14px;
    font-weight: 600;
    color: var(--midnight-blue);
    min-width: 140px;
}

.hi-hours-inputs {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.hi-hours-sep {
    font-size: 13px;
    color: var(--color-muted-foreground);
}

.hi-doc-types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
}

.hi-doc-type-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    transition: all 0.15s;
}

.hi-doc-type-card:hover {
    border-color: var(--aquamint);
    background: rgba(127,255,212,0.03);
}

.hi-doc-type-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(127,255,212,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.hi-doc-type-icon i {
    width: 20px;
    height: 20px;
    color: var(--midnight-blue);
}

.hi-doc-type-info {
    flex: 1;
    min-width: 0;
}

.hi-doc-type-info h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-foreground);
    margin: 0 0 2px;
}

.hi-doc-type-info p {
    font-size: 12px;
    color: var(--color-muted-foreground);
    margin: 0;
}

.hi-doc-type-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}

.hi-upload-box {
    width: 100%;
    height: 80px;
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 12px;
    color: var(--color-muted-foreground);
    background: var(--color-muted);
    overflow: hidden;
}

.hi-upload-box:hover {
    border-color: var(--aquamint);
    background: rgba(127,255,212,0.05);
}

.hi-upload-box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

@media (max-width: 768px) {
    .hi-hours-row {
        flex-direction: column;
        align-items: flex-start;
    }
    .hi-logo-upload {
        flex-direction: column;
    }
    .hi-signatory-card,
    .hi-bank-card,
    .hi-insurance-card {
        flex-direction: column;
    }
}
</style>
<?php $__env->stopPush(); ?>

<?php $__env->startPush('scripts'); ?>
<script src="<?php echo e(asset('js/hospital-info.js')); ?>?v=<?php echo e(filemtime(public_path('js/hospital-info.js'))); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\healthops\resources\views/pages/hospital-info.blade.php ENDPATH**/ ?>