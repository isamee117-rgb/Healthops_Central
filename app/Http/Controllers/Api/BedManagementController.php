<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Floor;
use App\Models\Ward;
use App\Models\Bed;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;

class BedManagementController extends Controller
{
    use HmsHelpers;

    public function floors()
    {
        return response()->json($this->toCamelCollection(Floor::all()));
    }

    public function addFloor(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
            ]);

            $floorId = $this->nextId(Floor::class, 'floor_id', 'FLR-');

            $floor = Floor::create([
                'floor_id' => $floorId,
                'name' => $request->input('name'),
                'code' => $request->input('code', ''),
            ]);

            return response()->json($this->toCamel($floor), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function updateFloor($id, Request $request)
    {
        try {
            $floor = Floor::where('floor_id', $id)->first();
            if (!$floor) {
                return response()->json(['error' => 'Floor not found'], 404);
            }

            $updateData = [];
            if ($request->has('name')) $updateData['name'] = $request->input('name');
            if ($request->has('code')) $updateData['code'] = $request->input('code');

            $floor->update($updateData);

            return response()->json($this->toCamel($floor->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function deleteFloor($id)
    {
        try {
            if (Ward::where('floor_id', $id)->exists()) {
                return response()->json(['error' => 'Cannot delete floor with linked wards.'], 422);
            }

            Floor::where('floor_id', $id)->delete();

            return response()->json(['message' => 'Floor deleted']);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete record');
        }
    }

    public function wards()
    {
        return response()->json($this->toCamelCollection(Ward::all()));
    }

    public function wardsByFloor($floorId)
    {
        $wards = Ward::where('floor_id', $floorId)->get();
        return response()->json($this->toCamelCollection($wards));
    }

    public function addWard(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'category' => 'required|string',
                'floorId' => 'required|string',
            ]);

            $wardId = $this->nextId(Ward::class, 'ward_id', 'WRD-');

            $ward = Ward::create([
                'ward_id' => $wardId,
                'name' => $request->input('name'),
                'category' => $request->input('category'),
                'floor_id' => $request->input('floorId'),
            ]);

            return response()->json($this->toCamel($ward), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function updateWard($id, Request $request)
    {
        try {
            $ward = Ward::where('ward_id', $id)->first();
            if (!$ward) {
                return response()->json(['error' => 'Ward not found'], 404);
            }

            $updateData = [];
            if ($request->has('name')) $updateData['name'] = $request->input('name');
            if ($request->has('category')) $updateData['category'] = $request->input('category');
            if ($request->has('floorId')) {
                $updateData['floor_id'] = $request->input('floorId');
                Bed::where('ward_id', $id)->update(['floor_id' => $request->input('floorId')]);
            }

            $ward->update($updateData);

            return response()->json($this->toCamel($ward->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function deleteWard($id)
    {
        try {
            if (Bed::where('ward_id', $id)->exists()) {
                return response()->json(['error' => 'Cannot delete ward with linked beds.'], 422);
            }

            Ward::where('ward_id', $id)->delete();

            return response()->json(['message' => 'Ward deleted']);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete record');
        }
    }

    public function beds()
    {
        return response()->json($this->toCamelCollection(Bed::all()));
    }

    public function bedsByWard($wardId)
    {
        $beds = Bed::where('ward_id', $wardId)->get();
        return response()->json($this->toCamelCollection($beds));
    }

    public function availableBeds()
    {
        $beds = Bed::where('status', 'Available')->get();
        return response()->json($this->toCamelCollection($beds));
    }

    public function addBed(Request $request)
    {
        try {
            $request->validate([
                'bedNumber' => 'required|string',
                'type' => 'required|string',
                'wardId' => 'required|string',
            ]);

            $ward = Ward::where('ward_id', $request->input('wardId'))->first();
            if (!$ward) {
                return response()->json(['error' => 'Invalid ward selection.'], 422);
            }

            $bedId = $this->nextId(Bed::class, 'bed_id', 'BED-');

            $bed = Bed::create([
                'bed_id' => $bedId,
                'bed_number' => $request->input('bedNumber'),
                'type' => $request->input('type'),
                'ward_id' => $request->input('wardId'),
                'floor_id' => $ward->floor_id,
                'status' => 'Available',
            ]);

            return response()->json($this->toCamel($bed), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function updateBed($id, Request $request)
    {
        try {
            $bed = Bed::where('bed_id', $id)->first();
            if (!$bed) {
                return response()->json(['error' => 'Bed not found'], 404);
            }

            $updateData = [];
            if ($request->has('bedNumber')) $updateData['bed_number'] = $request->input('bedNumber');
            if ($request->has('type')) $updateData['type'] = $request->input('type');
            if ($request->has('wardId')) {
                $ward = Ward::where('ward_id', $request->input('wardId'))->first();
                if ($ward) {
                    $updateData['ward_id'] = $request->input('wardId');
                    $updateData['floor_id'] = $ward->floor_id;
                }
            }

            $bed->update($updateData);

            return response()->json($this->toCamel($bed->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function deleteBed($id)
    {
        try {
            $bed = Bed::where('bed_id', $id)->first();
            if (!$bed) {
                return response()->json(['error' => 'Bed not found'], 404);
            }

            if ($bed->status === 'Occupied') {
                return response()->json(['error' => 'Cannot delete an occupied bed.'], 422);
            }

            $bed->delete();

            return response()->json(['message' => 'Bed deleted']);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete record');
        }
    }

    public function updateBedStatus($id, Request $request)
    {
        try {
            $request->validate([
                'status' => 'required|string',
            ]);

            $bed = Bed::where('bed_id', $id)->first();
            if (!$bed) {
                return response()->json(['error' => 'Bed not found'], 404);
            }

            $status = $request->input('status');
            $updateData = ['status' => $status];

            if ($status === 'Occupied') {
                $updateData['assigned_patient_name'] = $request->input('patientName');
                $updateData['assigned_patient_mrn'] = $request->input('patientMrn');
                $updateData['admission_date'] = $request->input('admissionDate');
            } else {
                $updateData['assigned_patient_name'] = null;
                $updateData['assigned_patient_mrn'] = null;
                $updateData['admission_date'] = null;
            }

            $bed->update($updateData);

            return response()->json($this->toCamel($bed->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }
}
