<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HospitalSetting;
use App\Models\HospitalDepartment;
use App\Models\HospitalSignatory;
use App\Models\HospitalBankAccount;
use App\Models\InsurancePanel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class HospitalInfoController extends Controller
{
    public function getSettings($group)
    {
        $settings = HospitalSetting::getGroup($group);

        // Resolve upload paths to full URLs
        if (isset($settings['logo_path']) && $settings['logo_path']) {
            $settings['logo_path'] = asset(ltrim($settings['logo_path'], '/'));
        }

        return response()->json(['settings' => $settings, 'group' => $group]);
    }

    public function saveSettings(Request $request, $group)
    {
        $data = $request->input('settings');
        if (!$data || !is_array($data)) {
            $data = $request->except(['_token', '_method']);
        }

        if (empty($data)) {
            return response()->json(['error' => 'No settings data provided'], 422);
        }

        HospitalSetting::setGroup($group, $data);

        return response()->json([
            'success' => true,
            'message' => 'Settings saved successfully',
        ]);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $uploadPath = public_path('uploads/hospital');
        if (!File::isDirectory($uploadPath)) {
            File::makeDirectory($uploadPath, 0755, true);
        }

        $file = $request->file('logo');
        $filename = 'logo_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move($uploadPath, $filename);

        $logoPath = '/uploads/hospital/' . $filename;
        HospitalSetting::setValue('logo', $logoPath, 'basic');

        return response()->json([
            'success' => true,
            'message' => 'Logo uploaded successfully',
            'logo_url' => asset('uploads/hospital/' . $filename),
        ]);
    }

    public function removeLogo()
    {
        $logoPath = HospitalSetting::getValue('logo');

        if ($logoPath) {
            $fullPath = public_path($logoPath);
            if (File::exists($fullPath)) {
                File::delete($fullPath);
            }
            HospitalSetting::setValue('logo', null, 'basic');
        }

        return response()->json([
            'success' => true,
            'message' => 'Logo removed successfully',
        ]);
    }

    public function departmentIndex()
    {
        $departments = HospitalDepartment::ordered()->get();
        return response()->json(['departments' => $departments]);
    }

    public function departmentStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'name_urdu' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'hod_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'extension' => 'nullable|string|max:50',
            'direct_line' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'services' => 'nullable|string',
            'opd_start' => 'nullable|string|max:10',
            'opd_end' => 'nullable|string|max:10',
            'is_emergency_24x7' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        $department = HospitalDepartment::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully',
            'department' => $department,
        ], 201);
    }

    public function departmentUpdate(Request $request, $id)
    {
        $department = HospitalDepartment::find($id);
        if (!$department) {
            return response()->json(['error' => 'Department not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_urdu' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'hod_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'extension' => 'nullable|string|max:50',
            'direct_line' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'services' => 'nullable|string',
            'opd_start' => 'nullable|string|max:10',
            'opd_end' => 'nullable|string|max:10',
            'is_emergency_24x7' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        $department->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully',
            'department' => $department,
        ]);
    }

    public function departmentDestroy($id)
    {
        $department = HospitalDepartment::find($id);
        if (!$department) {
            return response()->json(['error' => 'Department not found'], 404);
        }

        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully',
        ]);
    }

    public function signatoryIndex()
    {
        $signatories = HospitalSignatory::ordered()->get()->map(function ($s) {
            if ($s->photo_path)     $s->photo_path     = asset(ltrim($s->photo_path, '/'));
            if ($s->signature_path) $s->signature_path  = asset(ltrim($s->signature_path, '/'));
            if ($s->stamp_path)     $s->stamp_path      = asset(ltrim($s->stamp_path, '/'));
            return $s;
        });
        return response()->json(['signatories' => $signatories]);
    }

    public function signatoryStore(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'qualifications' => 'nullable|string|max:500',
            'designation' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:100',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
            'signature' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
            'stamp' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
            'use_on' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        $data = $request->except(['photo', 'signature', 'stamp']);
        $uploadPath = public_path('uploads/hospital');
        if (!File::isDirectory($uploadPath)) {
            File::makeDirectory($uploadPath, 0755, true);
        }

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = 'sig_photo_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $filename);
            $data['photo_path'] = '/uploads/hospital/' . $filename;
        }

        if ($request->hasFile('signature')) {
            $file = $request->file('signature');
            $filename = 'sig_sign_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $filename);
            $data['signature_path'] = '/uploads/hospital/' . $filename;
        }

        if ($request->hasFile('stamp')) {
            $file = $request->file('stamp');
            $filename = 'sig_stamp_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $filename);
            $data['stamp_path'] = '/uploads/hospital/' . $filename;
        }

        $signatory = HospitalSignatory::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Signatory created successfully',
            'signatory' => $signatory,
        ], 201);
    }

    public function signatoryUpdate(Request $request, $id)
    {
        $signatory = HospitalSignatory::find($id);
        if (!$signatory) {
            return response()->json(['error' => 'Signatory not found'], 404);
        }

        $request->validate([
            'title' => 'sometimes|string|max:50',
            'name' => 'sometimes|string|max:255',
            'qualifications' => 'nullable|string|max:500',
            'designation' => 'sometimes|string|max:255',
            'registration_number' => 'nullable|string|max:100',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
            'signature' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
            'stamp' => 'nullable|image|mimes:jpeg,png,jpg|max:1024',
            'use_on' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        $data = $request->except(['photo', 'signature', 'stamp']);
        $uploadPath = public_path('uploads/hospital');
        if (!File::isDirectory($uploadPath)) {
            File::makeDirectory($uploadPath, 0755, true);
        }

        if ($request->hasFile('photo')) {
            if ($signatory->photo_path) {
                $oldPath = public_path($signatory->photo_path);
                if (File::exists($oldPath)) {
                    File::delete($oldPath);
                }
            }
            $file = $request->file('photo');
            $filename = 'sig_photo_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $filename);
            $data['photo_path'] = '/uploads/hospital/' . $filename;
        }

        if ($request->hasFile('signature')) {
            if ($signatory->signature_path) {
                $oldPath = public_path($signatory->signature_path);
                if (File::exists($oldPath)) {
                    File::delete($oldPath);
                }
            }
            $file = $request->file('signature');
            $filename = 'sig_sign_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $filename);
            $data['signature_path'] = '/uploads/hospital/' . $filename;
        }

        if ($request->hasFile('stamp')) {
            if ($signatory->stamp_path) {
                $oldPath = public_path($signatory->stamp_path);
                if (File::exists($oldPath)) {
                    File::delete($oldPath);
                }
            }
            $file = $request->file('stamp');
            $filename = 'sig_stamp_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $filename);
            $data['stamp_path'] = '/uploads/hospital/' . $filename;
        }

        $signatory->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Signatory updated successfully',
            'signatory' => $signatory,
        ]);
    }

    public function signatoryDestroy($id)
    {
        $signatory = HospitalSignatory::find($id);
        if (!$signatory) {
            return response()->json(['error' => 'Signatory not found'], 404);
        }

        foreach (['photo_path', 'signature_path', 'stamp_path'] as $field) {
            if ($signatory->$field) {
                $fullPath = public_path($signatory->$field);
                if (File::exists($fullPath)) {
                    File::delete($fullPath);
                }
            }
        }

        $signatory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Signatory deleted successfully',
        ]);
    }

    public function bankAccountIndex()
    {
        $accounts = HospitalBankAccount::ordered()->get();
        return response()->json(['bank_accounts' => $accounts]);
    }

    public function bankAccountStore(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:100',
            'bank_name' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'branch_code' => 'nullable|string|max:50',
            'account_title' => 'required|string|max:255',
            'account_number' => 'required|string|max:100',
            'iban' => 'nullable|string|max:50',
            'account_type' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:20',
            'use_for' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        $account = HospitalBankAccount::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Bank account created successfully',
            'bank_account' => $account,
        ], 201);
    }

    public function bankAccountUpdate(Request $request, $id)
    {
        $account = HospitalBankAccount::find($id);
        if (!$account) {
            return response()->json(['error' => 'Bank account not found'], 404);
        }

        $request->validate([
            'label' => 'sometimes|string|max:100',
            'bank_name' => 'sometimes|string|max:255',
            'branch' => 'nullable|string|max:255',
            'branch_code' => 'nullable|string|max:50',
            'account_title' => 'sometimes|string|max:255',
            'account_number' => 'sometimes|string|max:100',
            'iban' => 'nullable|string|max:50',
            'account_type' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:20',
            'use_for' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        $account->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Bank account updated successfully',
            'bank_account' => $account,
        ]);
    }

    public function bankAccountDestroy($id)
    {
        $account = HospitalBankAccount::find($id);
        if (!$account) {
            return response()->json(['error' => 'Bank account not found'], 404);
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bank account deleted successfully',
        ]);
    }

    public function insurancePanelIndex()
    {
        $panels = InsurancePanel::ordered()->get();
        return response()->json(['insurance_panels' => $panels]);
    }

    public function insurancePanelStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'panel_code' => 'nullable|string|max:50',
            'company_type' => 'nullable|string|max:100',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'coverage' => 'nullable|array',
            'discount_rates' => 'nullable|array',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms' => 'nullable|string|max:255',
            'agreement_start' => 'nullable|date',
            'agreement_end' => 'nullable|date',
            'auto_renewable' => 'boolean',
            'document_path' => 'nullable|string|max:500',
            'status' => 'nullable|string|in:active,inactive,suspended',
            'display_order' => 'integer',
        ]);

        $panel = InsurancePanel::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Insurance panel created successfully',
            'insurance_panel' => $panel,
        ], 201);
    }

    public function insurancePanelUpdate(Request $request, $id)
    {
        $panel = InsurancePanel::find($id);
        if (!$panel) {
            return response()->json(['error' => 'Insurance panel not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'panel_code' => 'nullable|string|max:50',
            'company_type' => 'nullable|string|max:100',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'coverage' => 'nullable|array',
            'discount_rates' => 'nullable|array',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms' => 'nullable|string|max:255',
            'agreement_start' => 'nullable|date',
            'agreement_end' => 'nullable|date',
            'auto_renewable' => 'boolean',
            'document_path' => 'nullable|string|max:500',
            'status' => 'nullable|string|in:active,inactive,suspended',
            'display_order' => 'integer',
        ]);

        $panel->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Insurance panel updated successfully',
            'insurance_panel' => $panel,
        ]);
    }

    public function insurancePanelDestroy($id)
    {
        $panel = InsurancePanel::find($id);
        if (!$panel) {
            return response()->json(['error' => 'Insurance panel not found'], 404);
        }

        $panel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Insurance panel deleted successfully',
        ]);
    }
}
