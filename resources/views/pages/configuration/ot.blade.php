@extends('layouts.app')
@push('styles')
<style>
.vital-field-card { display:flex;align-items:center;gap:12px;background:var(--color-card);border:2px solid var(--color-border);border-radius:10px;padding:14px 16px;transition:border-color .2s,background .2s; }
.vital-field-card.is-visible { border-color:var(--aquamint); background:rgba(127,255,212,0.06); }
.vf-icon { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.vf-info { flex:1;min-width:0; }
.vf-label { font-size:13px;font-weight:600;color:var(--midnight-blue); }
.vf-unit  { font-size:11px;color:var(--color-muted-foreground);margin-top:1px; }
.vital-toggle { position:relative;display:inline-flex;align-items:center;cursor:pointer;margin:0; }
.vital-toggle input { opacity:0;width:0;height:0;position:absolute; }
.vital-toggle-track { width:36px;height:20px;background:#cbd5e1;border:2px solid #cbd5e1;border-radius:10px;display:inline-block;transition:.2s;position:relative;flex-shrink:0; }
.vital-toggle-track::after { content:'';position:absolute;top:1px;left:1px;width:14px;height:14px;background:#fff;border-radius:50%;transition:.2s; }
.vital-toggle input:checked + .vital-toggle-track::after { left:16px; }
</style>
@endpush
@section('content')
<div class="module-page">
    <div class="module-header">
        <div>
            <h1><i data-lucide="scissors"></i> OT Configuration</h1>
            <p class="module-subtitle">Manage configurable settings for the Operating Theatre module</p>
        </div>
    </div>

    {{-- PRE-OP CHECKLIST FORM SECTIONS --}}
    <div class="section-label">Pre-Op Checklist Sections</div>
    <p class="section-desc">Control which sections appear in the Pre-Operative Checklist for each scheduled operation. Toggle built-in clinical sections on or off, and create custom sections with your own fields.</p>

    {{-- Built-in Sections --}}
    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Built-in Sections</div>
    <div class="row g-3" id="otBuiltinSectionsContainer">
        <div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">Loading...</p></div>
    </div>

    {{-- Custom Sections --}}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Custom Sections</div>
        <button class="btn-add-item" id="btnAddOtCustomSection" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:7px 14px">
            <i data-lucide="plus" style="width:15px;height:15px"></i> Add Custom Section
        </button>
    </div>
    <div id="otCustomSectionsContainer">
        <p style="color:var(--color-muted-foreground);font-size:13px">No custom sections yet.</p>
    </div>

    {{-- INTRA-OP RECORD FORM SECTIONS --}}
    <div class="section-label" style="margin-top:36px">Intra-Op Record Sections</div>
    <p class="section-desc">Control which sections appear in the Intra-Operative Record sheet. Toggle any of the 15 built-in clinical record sections on or off, and add custom sections with your own fields.</p>

    {{-- Built-in Intraop Sections --}}
    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Built-in Sections</div>
    <div class="row g-3" id="otIntraopBuiltinSectionsContainer">
        <div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">Loading...</p></div>
    </div>

    {{-- Custom Intraop Sections --}}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Custom Sections</div>
        <button class="btn-add-item" id="btnAddOtIntraopCustomSection" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:7px 14px">
            <i data-lucide="plus" style="width:15px;height:15px"></i> Add Custom Section
        </button>
    </div>
    <div id="otIntraopCustomSectionsContainer">
        <p style="color:var(--color-muted-foreground);font-size:13px">No custom sections yet.</p>
    </div>

    {{-- POST-OP RECORD FORM SECTIONS --}}
    <div class="section-label" style="margin-top:36px">Post-Op Record Sections</div>
    <p class="section-desc">Control which sections appear in the Post-Operative Notes sheet. Toggle any of the 7 built-in clinical sections on or off, and add custom sections with your own fields.</p>

    {{-- Built-in Post-Op Sections --}}
    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Built-in Sections</div>
    <div class="row g-3" id="otPostopBuiltinSectionsContainer">
        <div class="col-12"><p style="color:var(--color-muted-foreground);font-size:13px">Loading...</p></div>
    </div>

    {{-- Custom Post-Op Sections --}}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.06em">Custom Sections</div>
        <button class="btn-add-item" id="btnAddOtPostopCustomSection" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:7px 14px">
            <i data-lucide="plus" style="width:15px;height:15px"></i> Add Custom Section
        </button>
    </div>
    <div id="otPostopCustomSectionsContainer">
        <p style="color:var(--color-muted-foreground);font-size:13px">No custom sections yet.</p>
    </div>
</div>

{{-- Add / Edit Custom Section Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="otSectionBuilderSheet" style="width:520px;max-width:95vw;border-left:4px solid var(--aquamint)">
    <div class="offcanvas-header" style="background:var(--midnight-blue)">
        <h5 class="offcanvas-title" style="color:var(--aquamint);font-weight:700;font-size:16px" id="otSectionBuilderTitle">Add Custom Section</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;background:var(--color-muted);overflow-y:auto">
        <input type="hidden" id="otSectionBuilderId" value="">

        <div style="display:flex;flex-direction:column;gap:18px">
            <div>
                <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px">Section Name <span style="color:var(--color-destructive)">*</span></label>
                <input type="text" id="otSectionBuilderLabel" class="form-control" placeholder="e.g. Implant Checklist, Special Equipment..." maxlength="80">
            </div>

            <div>
                <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px">Department <span style="font-weight:400;font-style:italic">(optional)</span></label>
                <select id="otSectionBuilderDept" class="form-select" style="font-size:13px">
                    <option value="">All Departments</option>
                </select>
                <div style="font-size:11px;color:var(--color-muted-foreground);margin-top:4px">Leave blank to show for all. Select a department to restrict it to matching staff.</div>
            </div>

            <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Fields <span style="color:var(--color-destructive)">*</span></label>
                    <button type="button" id="btnAddOtField" style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:5px 12px;background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:6px;cursor:pointer">
                        <i data-lucide="plus" style="width:13px;height:13px"></i> Add Field
                    </button>
                </div>
                <div id="otSectionFieldsList" style="display:flex;flex-direction:column;gap:10px">
                    <div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">
                        No fields yet. Click "Add Field" to begin.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="offcanvas-footer" style="padding:16px 24px;border-top:1px solid var(--color-border);background:var(--color-card);display:flex;justify-content:flex-end;gap:10px">
        <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
        <button type="button" id="btnSaveOtSectionBuilder" class="btn-save-series" style="padding:8px 24px">Save Section</button>
    </div>
</div>
{{-- Post-Op Add / Edit Custom Section Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="otPostopSectionBuilderSheet" style="width:520px;max-width:95vw;border-left:4px solid var(--aquamint)">
    <div class="offcanvas-header" style="background:var(--midnight-blue)">
        <h5 class="offcanvas-title" style="color:var(--aquamint);font-weight:700;font-size:16px" id="otPostopSectionBuilderTitle">Add Post-Op Custom Section</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;background:var(--color-muted);overflow-y:auto">
        <input type="hidden" id="otPostopSectionBuilderId" value="">

        <div style="display:flex;flex-direction:column;gap:18px">
            <div>
                <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px">Section Name <span style="color:var(--color-destructive)">*</span></label>
                <input type="text" id="otPostopSectionBuilderLabel" class="form-control" placeholder="e.g. Wound Care Protocol, Rehab Plan..." maxlength="80">
            </div>

            <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Fields <span style="color:var(--color-destructive)">*</span></label>
                    <button type="button" id="btnAddOtPostopField" style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:5px 12px;background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:6px;cursor:pointer">
                        <i data-lucide="plus" style="width:13px;height:13px"></i> Add Field
                    </button>
                </div>
                <div id="otPostopSectionFieldsList" style="display:flex;flex-direction:column;gap:10px">
                    <div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">
                        No fields yet. Click "Add Field" to begin.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="offcanvas-footer" style="padding:16px 24px;border-top:1px solid var(--color-border);background:var(--color-card);display:flex;justify-content:flex-end;gap:10px">
        <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
        <button type="button" id="btnSaveOtPostopSectionBuilder" class="btn-save-series" style="padding:8px 24px">Save Section</button>
    </div>
</div>

{{-- Intra-Op Add / Edit Custom Section Offcanvas --}}
<div class="offcanvas offcanvas-end" tabindex="-1" id="otIntraopSectionBuilderSheet" style="width:520px;max-width:95vw;border-left:4px solid var(--aquamint)">
    <div class="offcanvas-header" style="background:var(--midnight-blue)">
        <h5 class="offcanvas-title" style="color:var(--aquamint);font-weight:700;font-size:16px" id="otIntraopSectionBuilderTitle">Add Intra-Op Custom Section</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body" style="padding:24px;background:var(--color-muted);overflow-y:auto">
        <input type="hidden" id="otIntraopSectionBuilderId" value="">

        <div style="display:flex;flex-direction:column;gap:18px">
            <div>
                <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px">Section Name <span style="color:var(--color-destructive)">*</span></label>
                <input type="text" id="otIntraopSectionBuilderLabel" class="form-control" placeholder="e.g. Laser Equipment, Special Monitoring..." maxlength="80">
            </div>

            <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <label style="font-size:12px;font-weight:700;color:var(--color-muted-foreground);text-transform:uppercase;letter-spacing:0.05em;margin:0">Fields <span style="color:var(--color-destructive)">*</span></label>
                    <button type="button" id="btnAddOtIntraopField" style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:5px 12px;background:var(--aquamint);color:var(--midnight-blue);border:none;border-radius:6px;cursor:pointer">
                        <i data-lucide="plus" style="width:13px;height:13px"></i> Add Field
                    </button>
                </div>
                <div id="otIntraopSectionFieldsList" style="display:flex;flex-direction:column;gap:10px">
                    <div style="text-align:center;padding:20px;color:var(--color-muted-foreground);font-size:13px;border:1px dashed var(--color-border);border-radius:8px">
                        No fields yet. Click "Add Field" to begin.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="offcanvas-footer" style="padding:16px 24px;border-top:1px solid var(--color-border);background:var(--color-card);display:flex;justify-content:flex-end;gap:10px">
        <button type="button" class="btn-outline" data-bs-dismiss="offcanvas">Cancel</button>
        <button type="button" id="btnSaveOtIntraopSectionBuilder" class="btn-save-series" style="padding:8px 24px">Save Section</button>
    </div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/ot-config.js') }}?v={{ filemtime(public_path('js/ot-config.js')) }}"></script>
@endpush
