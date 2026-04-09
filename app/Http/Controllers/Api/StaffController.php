<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        return response()->json($this->toCamelCollection(Staff::all()));
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'firstName' => 'required|string',
                'lastName' => 'required|string',
                'category' => 'required|string',
                'designation' => 'required|string',
                'department' => 'required|string',
            ]);

            $staffId = $this->nextId(Staff::class, 'staff_id', 'STF-');
            $employeeId = $this->nextId(Staff::class, 'employee_id', 'EMP-STF-');

            $staff = Staff::create([
                'staff_id' => $staffId,
                'employee_id' => $employeeId,
                'first_name' => $request->input('firstName'),
                'last_name' => $request->input('lastName'),
                'gender' => $request->input('gender', ''),
                'dob' => $request->input('dob'),
                'cnic' => $request->input('cnic', ''),
                'blood_group' => $request->input('bloodGroup', ''),
                'marital_status' => $request->input('maritalStatus', ''),
                'phone' => $request->input('phone', ''),
                'secondary_phone' => $request->input('secondaryPhone', ''),
                'email' => $request->input('email', ''),
                'current_address' => $request->input('currentAddress', ''),
                'permanent_address' => $request->input('permanentAddress', ''),
                'emergency_contact_name' => $request->input('emergencyContactName', ''),
                'emergency_contact_relationship' => $request->input('emergencyContactRelationship', ''),
                'emergency_contact_phone' => $request->input('emergencyContactPhone', ''),
                'category' => $request->input('category'),
                'designation' => $request->input('designation'),
                'department' => $request->input('department'),
                'shift' => $request->input('shift', ''),
                'employment_type' => $request->input('employmentType', ''),
                'employment_status' => $request->input('employmentStatus', 'ACTIVE'),
                'joining_date' => $request->input('joiningDate'),
                'contract_end_date' => $request->input('contractEndDate'),
                'education_level' => $request->input('educationLevel', ''),
                'qualification' => $request->input('qualification', ''),
                'registration_authority' => $request->input('registrationAuthority', ''),
                'registration_number' => $request->input('registrationNumber', ''),
                'registration_valid_until' => $request->input('registrationValidUntil'),
                'certifications' => $request->input('certifications', ''),
                'special_skills' => $request->input('specialSkills', ''),
                'work_experience' => $request->input('workExperience', ''),
                'notes' => $request->input('notes', ''),
                'internal_notes' => $request->input('internalNotes', ''),
            ]);

            return response()->json($this->toCamel($staff), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function update($id, Request $request)
    {
        try {
            $staff = Staff::where('staff_id', $id)->first();
            if (!$staff) {
                return response()->json(['error' => 'Staff not found'], 404);
            }

            $fields = [
                'firstName' => 'first_name', 'lastName' => 'last_name',
                'gender', 'dob', 'cnic', 'bloodGroup' => 'blood_group',
                'maritalStatus' => 'marital_status', 'phone',
                'secondaryPhone' => 'secondary_phone', 'email',
                'currentAddress' => 'current_address', 'permanentAddress' => 'permanent_address',
                'emergencyContactName' => 'emergency_contact_name',
                'emergencyContactRelationship' => 'emergency_contact_relationship',
                'emergencyContactPhone' => 'emergency_contact_phone',
                'category', 'designation', 'department', 'shift',
                'employmentType' => 'employment_type', 'employmentStatus' => 'employment_status',
                'joiningDate' => 'joining_date', 'contractEndDate' => 'contract_end_date',
                'educationLevel' => 'education_level', 'qualification',
                'registrationAuthority' => 'registration_authority',
                'registrationNumber' => 'registration_number',
                'registrationValidUntil' => 'registration_valid_until',
                'certifications', 'specialSkills' => 'special_skills',
                'workExperience' => 'work_experience',
                'notes', 'internalNotes' => 'internal_notes',
            ];

            $updateData = [];
            foreach ($fields as $camel => $snake) {
                if (is_int($camel)) $camel = $snake;
                if ($request->has($camel)) $updateData[$snake] = $request->input($camel);
            }

            $staff->update($updateData);
            return response()->json($this->toCamel($staff->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }
}
