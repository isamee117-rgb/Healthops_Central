<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HospitalInfo;
use App\Models\DoctorFee;
use App\Models\HospitalCharge;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    use HmsHelpers;

    public function hospitalInfo()
    {
        $info = HospitalInfo::first();
        if (!$info) {
            return response()->json(null);
        }
        return response()->json($this->toCamel($info));
    }

    public function updateHospitalInfo(Request $request)
    {
        try {
            $info = HospitalInfo::first();
            $data = [
                'name' => $request->input('name'),
                'short_name' => $request->input('shortName'),
                'logo' => $request->input('logo', ''),
                'registration_number' => $request->input('registrationNumber'),
                'ntn' => $request->input('ntn'),
                'health_authority_reg' => $request->input('healthAuthorityReg'),
                'primary_phone' => $request->input('primaryPhone'),
                'secondary_phone' => $request->input('secondaryPhone'),
                'email' => $request->input('email'),
                'website' => $request->input('website'),
                'address' => $request->input('address'),
                'city' => $request->input('city'),
                'province' => $request->input('province'),
                'country' => $request->input('country'),
                'postal_code' => $request->input('postalCode'),
                'invoice_header' => $request->input('invoiceHeader'),
                'invoice_footer' => $request->input('invoiceFooter'),
                'currency' => $request->input('currency'),
                'tax_percentage' => $request->input('taxPercentage', 0),
                'invoice_prefix' => $request->input('invoicePrefix'),
            ];

            if ($info) {
                $info->update($data);
                $info->refresh();
            } else {
                $info = HospitalInfo::create($data);
            }

            return response()->json($this->toCamel($info));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function doctorFees()
    {
        return response()->json($this->toCamelCollection(DoctorFee::all()));
    }

    private function checkFeeDuplicate($doctorId, $serviceType, $visitType = null, $procedure = null, $excludeFeeId = null)
    {
        $query = DoctorFee::where('doctor_id', $doctorId)
            ->where('service_type', $serviceType);

        if ($excludeFeeId) {
            $query->where('fee_id', '!=', $excludeFeeId);
        }

        if ($serviceType === 'OPD') {
            $query->where('visit_type', $visitType);
            $exists = $query->exists();
            if ($exists) {
                return 'A fee for this doctor with the same visit type already exists in OPD.';
            }
        } elseif (in_array($serviceType, ['IPD', 'ER'])) {
            $exists = $query->exists();
            if ($exists) {
                $label = $serviceType === 'IPD' ? 'IPD' : 'ER';
                return "A fee for this doctor already exists in {$label}.";
            }
        } elseif (in_array($serviceType, ['OT_SURGEON', 'OT_ANAESTHETIST'])) {
            $query->where('procedure', $procedure);
            $exists = $query->exists();
            if ($exists) {
                $label = $serviceType === 'OT_SURGEON' ? 'OT Surgeon' : 'OT Anaesthetist';
                return "A fee for this doctor with the same procedure already exists in {$label}.";
            }
        }

        return null;
    }

    public function addDoctorFee(Request $request)
    {
        try {
            $request->validate([
                'doctorId' => 'required|string',
                'doctorName' => 'required|string',
                'serviceType' => 'required|string',
                'fee' => 'required|numeric',
            ]);

            $serviceType = $request->input('serviceType');
            $visitType = $request->input('visitType');
            $procedure = $request->input('procedure');

            $duplicate = $this->checkFeeDuplicate(
                $request->input('doctorId'),
                $serviceType,
                $visitType,
                $procedure
            );
            if ($duplicate) {
                return response()->json(['error' => $duplicate], 422);
            }

            $feeId = $this->nextIdFromSeries(DoctorFee::class, 'fee_id', 'fee_id', \App\Models\FinanceNumberSeries::class);

            $fee = DoctorFee::create([
                'fee_id' => $feeId,
                'doctor_id' => $request->input('doctorId'),
                'doctor_name' => $request->input('doctorName'),
                'service_type' => $serviceType,
                'visit_type' => $visitType,
                'procedure' => $procedure,
                'fee' => $request->input('fee'),
            ]);

            return response()->json($this->toCamel($fee), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function updateDoctorFee($id, Request $request)
    {
        try {
            $fee = DoctorFee::where('fee_id', $id)->first();
            if (!$fee) {
                return response()->json(['error' => 'Doctor fee not found'], 404);
            }

            $doctorId = $request->input('doctorId', $fee->doctor_id);
            $serviceType = $request->input('serviceType', $fee->service_type);
            $visitType = $request->input('visitType', $fee->visit_type);
            $procedure = $request->input('procedure', $fee->procedure);

            $duplicate = $this->checkFeeDuplicate($doctorId, $serviceType, $visitType, $procedure, $id);
            if ($duplicate) {
                return response()->json(['error' => $duplicate], 422);
            }

            $updateData = [];
            if ($request->has('doctorId')) $updateData['doctor_id'] = $request->input('doctorId');
            if ($request->has('doctorName')) $updateData['doctor_name'] = $request->input('doctorName');
            if ($request->has('serviceType')) $updateData['service_type'] = $request->input('serviceType');
            if ($request->has('visitType')) $updateData['visit_type'] = $request->input('visitType');
            if ($request->has('procedure')) $updateData['procedure'] = $request->input('procedure');
            if ($request->has('fee')) $updateData['fee'] = $request->input('fee');

            $fee->update($updateData);

            return response()->json($this->toCamel($fee->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function deleteDoctorFee($id)
    {
        try {
            DoctorFee::where('fee_id', $id)->delete();
            return response()->json(['message' => 'Doctor fee deleted']);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete record');
        }
    }

    public function hospitalCharges()
    {
        return response()->json($this->toCamelCollection(HospitalCharge::all()));
    }

    public function chargesByModule($module)
    {
        $charges = HospitalCharge::where('module', $module)->get();
        return response()->json($this->toCamelCollection($charges));
    }

    public function addHospitalCharge(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|min:3|max:100',
                'module' => 'required|string|in:OPD,IPD,OT,ER',
                'category' => 'required|string',
                'amount' => 'required|numeric|min:0',
            ]);

            $duplicate = HospitalCharge::where('module', $request->input('module'))
                ->whereRaw('LOWER(name) = ?', [strtolower($request->input('name'))])
                ->exists();
            if ($duplicate) {
                return response()->json(['error' => 'A charge with this name already exists for the selected module.'], 422);
            }

            $chargeId = $this->nextIdFromSeries(HospitalCharge::class, 'charge_id', 'charge_id', \App\Models\FinanceNumberSeries::class);

            $charge = HospitalCharge::create([
                'charge_id' => $chargeId,
                'name' => $request->input('name'),
                'module' => $request->input('module'),
                'category' => $request->input('category'),
                'amount' => $request->input('amount'),
                'is_mandatory' => $request->input('isMandatory', false),
                'is_active' => $request->input('isActive', true),
            ]);

            return response()->json($this->toCamel($charge), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function updateHospitalCharge($id, Request $request)
    {
        try {
            $charge = HospitalCharge::where('charge_id', $id)->first();
            if (!$charge) {
                return response()->json(['error' => 'Hospital charge not found'], 404);
            }

            $newName = $request->input('name', $charge->name);
            $newModule = $request->input('module', $charge->module);
            $duplicate = HospitalCharge::where('module', $newModule)
                ->whereRaw('LOWER(name) = ?', [strtolower($newName)])
                ->where('charge_id', '!=', $id)
                ->exists();
            if ($duplicate) {
                return response()->json(['error' => 'A charge with this name already exists for the selected module.'], 422);
            }

            $updateData = [];
            if ($request->has('name')) $updateData['name'] = $request->input('name');
            if ($request->has('module')) $updateData['module'] = $request->input('module');
            if ($request->has('category')) $updateData['category'] = $request->input('category');
            if ($request->has('amount')) $updateData['amount'] = $request->input('amount');
            if ($request->has('isMandatory')) $updateData['is_mandatory'] = $request->input('isMandatory');
            if ($request->has('isActive')) $updateData['is_active'] = $request->input('isActive');

            $charge->update($updateData);

            return response()->json($this->toCamel($charge->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function deleteHospitalCharge($id)
    {
        try {
            HospitalCharge::where('charge_id', $id)->delete();
            return response()->json(['message' => 'Hospital charge deleted']);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete record');
        }
    }

    public function getFeeForDoctor(Request $request)
    {
        $query = DoctorFee::query();

        if ($request->has('doctorId')) {
            $query->where('doctor_id', $request->input('doctorId'));
        }
        if ($request->has('serviceType')) {
            $query->where('service_type', $request->input('serviceType'));
        }
        if ($request->has('visitType')) {
            $query->where('visit_type', $request->input('visitType'));
        }
        if ($request->has('procedure')) {
            $query->where('procedure', $request->input('procedure'));
        }

        $fee = $query->first();
        if (!$fee) {
            return response()->json(null);
        }

        return response()->json($this->toCamel($fee));
    }
}
