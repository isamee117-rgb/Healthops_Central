<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        return response()->json($this->toCamelCollection(Doctor::all()));
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'firstName' => 'required|string',
                'lastName'  => 'required|string',
            ]);

            $doctorId = $this->nextIdFromSeries(Doctor::class, 'doctor_id', 'doctor_id');
            $employeeId = $this->nextIdFromSeries(Doctor::class, 'employee_id', 'employee_id');

            $doctor = Doctor::create([
                'doctor_id' => $doctorId,
                'employee_id' => $employeeId,
                'role' => $request->input('role', 'Doctor'),
                'designation' => $request->input('designation') ?? '',
                'department' => $request->input('department') ?? '',
                'specialist' => $request->input('specialist') ?? '',
                'first_name' => $request->input('firstName'),
                'last_name' => $request->input('lastName'),
                'father_name' => $request->input('fatherName', ''),
                'mother_name' => $request->input('motherName', ''),
                'gender' => $request->input('gender', ''),
                'marital_status' => $request->input('maritalStatus', ''),
                'blood_group' => $request->input('bloodGroup', ''),
                'dob' => $request->input('dob'),
                'phone' => $request->input('phone', ''),
                'email' => $request->input('email', ''),
                'emergency_contact' => $request->input('emergencyContact', ''),
                'cnic' => $request->input('cnic', ''),
                'current_address' => $request->input('currentAddress', ''),
                'permanent_address' => $request->input('permanentAddress', ''),
                'qualification' => $request->input('qualification', ''),
                'work_experience' => $request->input('workExperience', ''),
                'specialization' => $request->input('specialization', ''),
                'notes' => $request->input('notes', ''),
                'basic_salary' => $request->input('basicSalary', 0),
                'contract_type' => $request->input('contractType', ''),
                'work_shift' => $request->input('workShift', ''),
                'work_location' => $request->input('workLocation', ''),
                'bank_account_number' => $request->input('bankAccountNumber', ''),
                'bank_name' => $request->input('bankName', ''),
                'bank_branch_name' => $request->input('bankBranchName', ''),
                'joining_date' => $request->input('joiningDate'),
                'relieving_date' => $request->input('relievingDate'),
                'duty_from' => $request->input('dutyFrom', ''),
                'duty_to' => $request->input('dutyTo', ''),
                'duty_days' => $request->input('dutyDays', []),
                'status' => $request->input('status', 'ACTIVE'),
            ]);

            return response()->json($this->toCamel($doctor), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function update($id, Request $request)
    {
        try {
            $doctor = Doctor::where('doctor_id', $id)->first();
            if (!$doctor) {
                return response()->json(['error' => 'Doctor not found'], 404);
            }

            $fields = [
                'role', 'designation', 'department', 'specialist', 'firstName' => 'first_name',
                'lastName' => 'last_name', 'fatherName' => 'father_name', 'motherName' => 'mother_name',
                'gender', 'maritalStatus' => 'marital_status', 'bloodGroup' => 'blood_group',
                'dob', 'phone', 'email', 'emergencyContact' => 'emergency_contact', 'cnic',
                'currentAddress' => 'current_address', 'permanentAddress' => 'permanent_address',
                'qualification', 'workExperience' => 'work_experience', 'specialization', 'notes',
                'basicSalary' => 'basic_salary', 'contractType' => 'contract_type',
                'workShift' => 'work_shift', 'workLocation' => 'work_location',
                'bankAccountNumber' => 'bank_account_number', 'bankName' => 'bank_name',
                'bankBranchName' => 'bank_branch_name', 'joiningDate' => 'joining_date',
                'relievingDate' => 'relieving_date', 'dutyFrom' => 'duty_from', 'dutyTo' => 'duty_to',
                'dutyDays' => 'duty_days', 'status',
            ];

            $nullableFields = ['dob', 'joiningDate', 'relievingDate', 'dutyDays'];
            $updateData = [];
            foreach ($fields as $camel => $snake) {
                if (is_int($camel)) {
                    $camel = $snake;
                }
                if ($request->has($camel)) {
                    $value = $request->input($camel);
                    if (!in_array($camel, $nullableFields) && $value === null) {
                        $value = '';
                    }
                    $updateData[$snake] = $value;
                }
            }

            $doctor->update($updateData);

            return response()->json($this->toCamel($doctor->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }
}
