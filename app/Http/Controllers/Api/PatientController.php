<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\OpdVisit;
use App\Models\EmergencyVisit;
use App\Models\IpdAdmission;
use App\Models\Operation;
use App\Models\PatientActivity;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    use HmsHelpers;

    public function index()
    {
        return response()->json($this->toCamelCollection(Patient::all()));
    }

    public function show($mrn)
    {
        $patient = Patient::where('mrn', $mrn)->first();
        if (!$patient) {
            return response()->json(['error' => 'Patient not found'], 404);
        }
        return response()->json($this->toCamel($patient));
    }

    public function store(Request $request)
    {
        try {
            $contactType = $request->input('contactType', 'SELF');

            $rules = [
                'name' => 'required|string',
                'age' => 'required|integer',
                'gender' => 'required|string',
                'phone' => 'required|string',
                'cnic' => 'nullable|string',
                'contactType' => 'nullable|string|in:SELF,GUARDIAN',
            ];

            if ($contactType === 'GUARDIAN') {
                $rules['guardianName'] = 'nullable|string';
                $rules['relationshipToPatient'] = 'nullable|string';
            }

            $request->validate($rules);

            if ($contactType === 'SELF') {
                $existingSelf = Patient::where('phone', $request->input('phone'))
                    ->where('contact_type', 'SELF')
                    ->first();
                if ($existingSelf) {
                    return response()->json([
                        'error' => "Phone number {$request->input('phone')} is already registered as SELF for patient {$existingSelf->name} ({$existingSelf->mrn}). Please select that patient or use GUARDIAN contact type."
                    ], 422);
                }
            }

            $mrn = $this->generateYearId(Patient::class, 'mrn', 'MRN');

            $patient = Patient::create([
                'mrn' => $mrn,
                'name' => $request->input('name'),
                'age' => $request->input('age'),
                'gender' => $request->input('gender'),
                'phone' => $request->input('phone'),
                'cnic' => $request->input('cnic') ?? '',
                'visit_count' => 0,
                'is_locked' => false,
                'blood_group' => $request->input('bloodGroup'),
                'address' => $request->input('address'),
                'first_visit_date' => Carbon::now(),
                'last_visit_date' => Carbon::now(),
                'allergies' => $request->input('allergies', []),
                'contact_type' => $contactType,
                'guardian_name' => $request->input('guardianName'),
                'guardian_phone' => $request->input('guardianPhone'),
                'guardian_cnic' => $request->input('guardianCnic') ?? '',
                'relationship_to_patient' => $contactType === 'SELF' ? 'Self' : $request->input('relationshipToPatient'),
                'status' => 'ACTIVE',
            ]);

            $this->logActivity($mrn, 'Registered new patient profile', 'OPD');

            return response()->json($this->toCamel($patient), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function searchByPhone(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $phone = $request->input('phone');

        $patients = Patient::where('phone', $phone)
            ->orWhere('guardian_phone', $phone)
            ->orderByRaw("CASE WHEN contact_type = 'SELF' THEN 1 ELSE 2 END")
            ->orderBy('name')
            ->get();

        $self = [];
        $guardian = [];

        foreach ($patients as $p) {
            $item = $this->toCamel($p);
            if ($p->contact_type === 'SELF') {
                $self[] = $item;
            } else {
                $guardian[] = $item;
            }
        }

        $hasSelf = Patient::where('phone', $phone)
            ->where('contact_type', 'SELF')
            ->exists();

        return response()->json([
            'self' => $self,
            'guardian' => $guardian,
            'hasSelf' => $hasSelf,
            'phone' => $phone,
        ]);
    }

    public function validateSelf(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $phone = $request->input('phone');

        $existing = Patient::where('phone', $phone)
            ->where('contact_type', 'SELF')
            ->first();

        if ($existing) {
            return response()->json([
                'valid' => false,
                'message' => "Phone number {$phone} is already registered as SELF for patient {$existing->name} ({$existing->mrn}).",
                'existingPatient' => $this->toCamel($existing),
            ]);
        }

        return response()->json(['valid' => true]);
    }

    public function findByPhone($phone)
    {
        $patient = Patient::where('phone', $phone)->first();
        if (!$patient) {
            return response()->json(['error' => 'Patient not found'], 404);
        }
        return response()->json($this->toCamel($patient));
    }

    public function findPotentialMatches(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'cnic' => 'required|string',
            'age' => 'required|integer',
            'gender' => 'required|string',
        ]);

        $name = $request->input('name');
        $cnic = $request->input('cnic');
        $age = $request->input('age');
        $gender = $request->input('gender');

        $matches = Patient::where('is_locked', false)
            ->where(function ($q) use ($cnic, $name, $age, $gender) {
                $q->where('cnic', $cnic)
                  ->orWhere(function ($q2) use ($name, $age, $gender) {
                      $q2->whereRaw('LOWER(name) = ?', [strtolower($name)])
                         ->where('age', $age)
                         ->where('gender', $gender);
                  });
            })
            ->get();

        return response()->json($this->toCamelCollection($matches));
    }

    public function summary($mrn)
    {
        $patient = Patient::where('mrn', $mrn)->first();
        $visits = OpdVisit::where('mrn', $mrn)->get();
        $er = EmergencyVisit::where('mrn', $mrn)->get();
        $admissions = IpdAdmission::where('mrn', $mrn)->get();
        $ot = Operation::where('mrn', $mrn)->get();

        return response()->json([
            'patient' => $patient ? $this->toCamel($patient) : null,
            'visits' => $this->toCamelCollection($visits),
            'er' => $this->toCamelCollection($er),
            'admissions' => $this->toCamelCollection($admissions),
            'ot' => $this->toCamelCollection($ot),
        ]);
    }

    public function activities($mrn)
    {
        $activities = PatientActivity::where('mrn', $mrn)->get();
        return response()->json($this->toCamelCollection($activities));
    }
}
