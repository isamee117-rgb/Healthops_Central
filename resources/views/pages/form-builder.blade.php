@extends('layouts.app')

@section('content')
<div id="fb-container">
    <div id="fb-tree">
        <div class="fb-tree-header">
            <span>Form Groups</span>
            @if(auth()->user()->hasPermission('form-builder.manage'))
            <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-secondary" id="btnReorderForms" title="Save form sort order">
                    <i data-lucide="arrow-up-down" style="width:13px;height:13px"></i>
                </button>
                <button class="btn btn-sm btn-primary" id="btnNewGroup">
                    <i data-lucide="plus" style="width:14px;height:14px"></i> Group
                </button>
            </div>
            @endif
        </div>
        <div id="fb-tree-body"></div>
    </div>

    <div id="fb-editor">
        <div id="fb-editor-empty" class="fb-empty-state">
            <i data-lucide="mouse-pointer-click" style="width:48px;height:48px;color:#94a3b8"></i>
            <p class="mt-3 text-muted">Select a form from the left panel to start editing</p>
        </div>
        <div id="fb-editor-content" style="display:none">
            <div class="fb-editor-header">
                <div>
                    <h5 id="fb-editor-title" class="mb-0"></h5>
                    <small id="fb-editor-subtitle" class="text-muted"></small>
                </div>
                <div class="d-flex gap-2">
                    @if(auth()->user()->hasPermission('form-builder.manage'))
                    <button class="btn btn-sm btn-outline-secondary" id="btnReorderEditor" title="Save section & component order">
                        <i data-lucide="arrow-up-down" style="width:13px;height:13px"></i> Save Order
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" id="btnNewSection">
                        <i data-lucide="plus" style="width:14px;height:14px"></i> Section
                    </button>
                    @endif
                    <button class="btn btn-sm btn-outline-primary" id="btnPreview">
                        <i data-lucide="eye" style="width:14px;height:14px"></i> Preview
                    </button>
                </div>
            </div>
            <div id="fb-sections-list"></div>
        </div>
    </div>
</div>

{{-- Group Modal --}}
<div class="modal fade" id="groupModal" tabindex="-1" aria-labelledby="groupModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="groupModalLabel">Form Group</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="groupId">
                <div class="mb-3">
                    <label class="form-label">Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="groupName" placeholder="e.g. OPD Forms">
                </div>
                <div class="mb-3">
                    <label class="form-label">Context <span class="text-danger">*</span></label>
                    <select class="form-select" id="groupContext">
                        <option value="">Select context</option>
                        <option value="opd">OPD</option>
                        <option value="ipd">IPD</option>
                        <option value="emergency">Emergency</option>
                        <option value="ot">OT</option>
                        <option value="general">General</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="groupDescription" rows="2"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnSaveGroup">Save</button>
            </div>
        </div>
    </div>
</div>

{{-- Form Modal --}}
<div class="modal fade" id="formModal" tabindex="-1" aria-labelledby="formModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="formModalLabel">Form</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="formId">
                <input type="hidden" id="formGroupId">
                <div class="mb-3">
                    <label class="form-label">Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="formName" placeholder="e.g. Admission Form">
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="formDescription" rows="2"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Instructions <small class="text-muted">(shown at top of form)</small></label>
                    <textarea class="form-control" id="formInstructions" rows="3" placeholder="e.g. Please fill all fields in block letters. Incomplete forms will not be accepted."></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Declaration <small class="text-muted">(shown at bottom of form)</small></label>
                    <textarea class="form-control" id="formDeclaration" rows="3" placeholder="e.g. I hereby declare that the above information is true and correct to the best of my knowledge."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnSaveForm">Save</button>
            </div>
        </div>
    </div>
</div>

{{-- Section Modal --}}
<div class="modal fade" id="sectionModal" tabindex="-1" aria-labelledby="sectionModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="sectionModalLabel">Section</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="sectionId">
                <div class="mb-3">
                    <label class="form-label">Title <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="sectionTitle" placeholder="e.g. Chief Complaint">
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-control" id="sectionDescription">
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="sectionCollapsible">
                    <label class="form-check-label" for="sectionCollapsible">Collapsible</label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnSaveSection">Save</button>
            </div>
        </div>
    </div>
</div>

{{-- Component Config Modal --}}
<div class="modal fade" id="componentModal" tabindex="-1" aria-labelledby="componentModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="componentModalLabel">Configure Component</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="componentId">
                <input type="hidden" id="componentSectionId">
                <input type="hidden" id="componentType">
                <div class="mb-3">
                    <label class="form-label">Label <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="componentLabel" placeholder="Field label">
                </div>
                <div class="mb-3">
                    <label class="form-label">Key <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="componentKey" placeholder="field_key">
                    <small class="text-muted">Unique identifier within this form (snake_case)</small>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="componentRequired">
                    <label class="form-check-label" for="componentRequired">Required</label>
                </div>
                <div id="componentTypeConfig"></div>
                <hr class="my-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <label class="form-label mb-0 fw-semibold">Conditional Visibility</label>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="btnAddCondition">
                        <i data-lucide="plus" style="width:13px;height:13px"></i> Add Condition
                    </button>
                </div>
                <small class="text-muted d-block mb-2">Show this field only when another field matches a value</small>
                <div id="conditionsList"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnSaveComponent">Save</button>
            </div>
        </div>
    </div>
</div>

{{-- Preview Modal --}}
<div class="modal fade" id="previewModal" tabindex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="previewModalLabel">Form Preview</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="previewBody"></div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/pages/form-builder.js') }}"></script>
@endpush
